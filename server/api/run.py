from datetime import datetime

from flask import (
    request, Blueprint, session, jsonify
)
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

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
        } for workbook in workbooks]), 200
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
    return jsonify(response), 200


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

    workbooks = db.session.execute(
        db.select(Workbook)
    ).scalars().all()
    # TODO: implementation


@login_required
@bp.route("/workbook/new", methods=["POST"])
def add_workbook():
    if not is_admin():
        return unauthorized_handler("Only admin user can add new workbooks")
    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    try:
        validate_workbook_data(data)
        workbook = create_workbook(data)
        db.session.add(workbook)
        db.session.flush()
        q_and_a_s = data.get("exercises", [])
        for q_and_a in q_and_a_s:
            validate_exercise_data(q_and_a)
            exercise = create_exercise(q_and_a, workbook.workbook_id)
            db.session.add(exercise)
            db.session.flush()
            # Storing answers for each exercise to the database
            answer = create_answer(exercise.exercise_id)
            db.session.add(answer)
            db.session.flush()
            for line_data in q_and_a["answer"]:
                validate_line_data(line_data)
                line = create_line(line_data, exercise.exercise_id)
                if line:
                    db.session.add(line)
                    db.session.flush()
        db.session.commit()
        return succeed("Created new workbooks successfully")
    except ValueError as ve:
        db.session.rollback()
        return badrequest_handler(f"Validation Error: {ve}")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(str(e))


def create_workbook(workbook_data) -> Workbook:
    # Convert input string to datetime object; assuming format "YYYY-MM-DDTHH:MM"
    release_date = datetime.strptime(workbook_data["release_date"], "%Y-%m-%dT%H:%M")
    return Workbook(workbook_name=workbook_data["workbook_name"], release_date=release_date, last_edit=datetime.now())


def create_exercise(exercise_data, workbook_id: int) -> Exercise:
    return Exercise(exercise_number=exercise_data["number"].strip(),
                    exercise_content=exercise_data["question"].strip(),
                    workbook_id=workbook_id)


def create_answer(exercise_id: int) -> Answer:
    return Answer(feedback="", exercise_id=exercise_id, user_id=session.get("user_id"))


def create_line(line_data, answer_id: int) -> Line | None:
    index = line_data["line_index"]
    variable_stripped = line_data["variable"].strip()
    rules_stripped = line_data["rules"].strip()
    if not (variable_stripped or rules_stripped):
        return None
    return Line(line_index=index,
                answer_id=answer_id,
                variable=variable_stripped,
                rules=rules_stripped)


def validate_workbook_data(data) -> None:
    required_keys = ["workbook_name", "release_date", "exercises"]
    entity_name = "workbooks"
    validate_data(data, required_keys, entity_name)


def validate_exercise_data(data) -> None:
    required_keys = ["number", "question", "answer"]
    entity_name = "exercise"
    validate_data(data, required_keys, entity_name)


def validate_line_data(data) -> None:
    required_keys = ["line_index", "variable", "rules"]
    entity_name = "line"
    validate_data(data, required_keys, entity_name)


def validate_data(data, required_keys: list[str], entity_name: str) -> None:
    if not all(key in data for key in required_keys):
        raise ValueError("Missing required fields in " + entity_name + " data")
