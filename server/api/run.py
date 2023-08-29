from datetime import datetime, date

from flask import (
    request, Blueprint, session, jsonify
)
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .auth import login_required, is_admin
from .db import db, Workbook, Exercise, Answer, Line, UserRole
from .util import (
    succeed, unauthorized_handler, badrequest_handler, conflict_handler, internal_server_error_handler, notfound_handler
)

bp = Blueprint("app", __name__, url_prefix="/api")
CORS(bp)


@login_required
@bp.route("/workbooks", methods=["GET"])
def get_workbooks():
    try:
        if is_admin():
            workbooks = db.session.execute(
                db.select(Workbook)
            ).scalars().all()
        else:
            workbooks = db.session.execute(
                db.select(Workbook).filter(Workbook.release_date < datetime.now())
            ).scalars().all()

        return jsonify([{
            "workbook_id": workbook.workbook_id,
            "workbook_name": workbook.workbook_name,
            "release_date": workbook.release_date,
            "last_edit": workbook.last_edit
        } for workbook in workbooks])
    except SQLAlchemyError:
        return internal_server_error_handler()


@login_required
@bp.route("/workbook/<string:user_role>/<int:workbook_id>", methods=["POST"])
def get_workbook(user_role, workbook_id):
    try:
        role = UserRole(user_role)
    except ValueError:
        return badrequest_handler("Invalid user_role")

    if role.value != session.get("user_role"):
        return conflict_handler("'user_role' does not match with current session user's role")

    is_user_admin = is_admin()
    workbook = fetch_workbook_with_exercises(workbook_id, is_user_admin)
    if not workbook:
        return notfound_handler("Workbook not found")
    response = format_workbook_response(workbook, is_user_admin)
    return jsonify(response)


def fetch_workbook_with_exercises(workbook_id: int, is_user_admin: bool = False):
    workbook_exercises = db.select(Workbook).options(db.joinedload(Workbook.exercises))
    if is_user_admin:
        query = workbook_exercises.filter_by(workbook_id=workbook_id)
    else:
        query = workbook_exercises.filter(
            db.and_(Workbook.workbook_id == workbook_id, Workbook.release_date < datetime.now())
        )
    return db.session.execute(query).scalar_one_or_none()


def fetch_user_answer(exercise_id: int):
    return db.session.execute(
        db.select(Answer).filter_by(exercise_id=exercise_id, user_id=session["user_id"])
    ).scalar_one_or_none()


def fetch_answer_lines(answer_id: int):
    return db.session.execute(
        db.select(Line).filter_by(answer_id=answer_id)
    ).scalars().all()


def format_workbook_response(workbook, exclude_feedback=False):
    response = {
        "workbook_name": workbook.workbook_name,
        "release_date": workbook.workbook.release_date,
        "last_edit": workbook.last_edit,
        "exercises": [],
    }
    for exercise in workbook.exercises:
        answer = fetch_user_answer(exercise.exercise_id)
        lines_data = []
        if answer:
            lines_data = [{
                "line_index": line.line_index,
                "variable": line.variable,
                "rules": line.rules
            } for line in fetch_answer_lines(answer.answer_id)]

        exercise_data = {
            "exercise_id": exercise.exercise_id,
            "exercise_number": exercise.exercise_number,
            "exercise_content": exercise.exercise_content,
            "lines": lines_data,
        }
        if (not exclude_feedback) and answer:
            exercise_data["feedback"] = answer.feedback
        response["exercises"].append(exercise_data)

    return response


@login_required
@bp.route("/workbook/<string:user_role>/<int:workbook_id>/edit", methods=["POST"])
def edit_workbook(user_role, workbook_id):
    try:
        role = UserRole(user_role)
    except ValueError:
        return badrequest_handler("Invalid UserRole")
    if role.value != db.session["user_role"] or db.session["user_role"] != UserRole.ADMIN:
        return unauthorized_handler("Only admin user can edit workbooks")

    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    workbook_id = data.get("workbook_id")

    workbooks = db.session.execute(
        db.select(Workbook)
    ).scalars().all()
    # TODO: implementation


@login_required
@bp.route("/workbook/new", methods=["POST"])
def add_workbook():
    if not is_admin():
        return unauthorized_handler("Only admin user can add new workbook")
    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    if not all(key in data for key in ["workbook_name", "release_date", "exercises"]):
        return badrequest_handler("Missing required fields for the workbook information")
    workbook_name = data.get("workbook_name")
    release_date_str = data.get("release_date")
    try:
        # The format is assumed to be 'YYYY-MM-DD' coming from HTML date input
        year, month, day = map(int, release_date_str.split('-'))
        release_date = date(year, month, day)  # Convert string to date object
    except Exception as e:
        return badrequest_handler(f"Invalid date format: {e}")

    last_edit = datetime.now()
    q_and_a_s = data.get("exercises", [])
    try:
        workbook = Workbook(workbook_name=workbook_name, release_date=release_date, last_edit=last_edit)
        db.session.add(workbook)
        db.session.flush()
        # TODO: extract exercises data and add them to database
        for q_and_a in q_and_a_s:
            if not all(key in q_and_a for key in ['number', 'question', 'answer']):
                raise ValueError("Missing required fields in exercise data")
            number_stripped = q_and_a['number'].strip()
            question_stripped = q_and_a['question'].strip()
            if not number_stripped and not question_stripped:
                continue
            exercise = Exercise(exercise_number=number_stripped,
                                exercise_content=question_stripped,
                                workbook_id=workbook.workbook_id)
            db.session.add(exercise)
            db.session.flush()

            # Storing answers for each exercise to the database
            answer = Answer(feedback="", exercise_id=exercise.exercise_id, user_id=session.get("user_id"))
            db.session.add(answer)
            db.session.flush()
            for line in q_and_a['answer']:
                if not all(key in line for key in ["line_index", "variable", "rules"]):
                    raise ValueError("Missing required fields in answer data")
                index = line["line_index"]
                variable_stripped = line["variable"].strip()
                rules_stripped = line["rules"].strip()
                if index or variable_stripped or rules_stripped:
                    line_entry = Line(line_index=index, answer_id=answer.answer_id, variable=variable_stripped,
                                      rules=rules_stripped)
                    db.session.add(line_entry)
        db.session.commit()
        return succeed("Created new workbook successfully")
    except IntegrityError:
        db.session.rollback()
        error = f"Workbook name {workbook_name} has already existed"
        return conflict_handler(error)
    except Exception as e:
        db.session.rollback()
        return badrequest_handler(str(e))
