from datetime import datetime

from flask import (
    request, Blueprint, session, jsonify
)
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from .auth import login_required, USER_ID, IS_ADMIN
from .db import db, Workbook, Exercise, Answer, Line
from .util import (
    unauthorized_handler, badrequest_handler, internal_server_error_handler, notfound_handler
)

bp = Blueprint("app", __name__, url_prefix="/api")
CORS(bp)

WORKBOOK_ID = "workbook_id"
WORKBOOK_NAME = "workbook_name"
RELEASE_DATE = "release_date"
EXERCISE = "exercise"


@login_required
@bp.route("/workbooks", methods=["GET"])
def get_workbooks():
    try:
        if session[IS_ADMIN]:
            workbooks = db.session.execute(
                db.select(Workbook)
            ).scalars().all()
        else:
            workbooks = db.session.execute(
                db.select(Workbook).filter(Workbook.release_date < datetime.utcnow())
            ).scalars().all()

        return jsonify([{
            WORKBOOK_ID: workbook.workbook_id,
            WORKBOOK_NAME: workbook.workbook_name,
            RELEASE_DATE: workbook.release_date,
        } for workbook in workbooks]), 200
    except SQLAlchemyError:
        return internal_server_error_handler("An error occurred when fetching workbooks data")


@login_required
@bp.route("/workbooks/<int:workbook_id>", methods=["GET"])
def get_workbook(workbook_id: int):
    workbook = fetch_workbook_with_exercises(workbook_id)
    if not workbook:
        return notfound_handler("Workbook not found")
    response = format_workbook_response(workbook)
    return jsonify(response), 200


def fetch_workbook_with_exercises(workbook_id: int):
    query = db.select(Workbook).filter_by(workbook_id=workbook_id)
    if not session[IS_ADMIN]:
        query = query.filter(Workbook.release_date < datetime.utcnow())
    return db.session.execute(query).scalar_one_or_none()


def fetch_user_answer(exercise_id: int):
    return db.session.execute(
        db.select(Answer).filter_by(exercise_id=exercise_id, user_id=session[USER_ID])
    ).scalar_one_or_none()


def fetch_answer_lines(answer_id: int):
    return db.session.execute(
        db.select(Line).filter_by(answer_id=answer_id)
    ).scalars().all()


def format_workbook_response(workbook: Workbook):
    response = {
        WORKBOOK_NAME: workbook.workbook_name,
        RELEASE_DATE: workbook.release_date,
        EXERCISES: [],
    }
    sorted_exercises = sorted(workbook.exercises, key=lambda x: x.exercise_index)
    for exercise in sorted_exercises:
        answer = fetch_user_answer(exercise.exercise_id)
        lines_data = []
        if answer:
            lines_data = [{
                LINE_INDEX: line.line_index,
                VARIABLE: line.variable,
                RULES: line.rules
            } for line in fetch_answer_lines(answer.answer_id)]

        exercise_data = {
            EXERCISE_ID: exercise.exercise_id,
            EXERCISE_INDEX: exercise.exercise_index,
            EXERCISE_NUMBER: exercise.exercise_number,
            EXERCISE_CONTENT: exercise.exercise_content,
            LINES: lines_data,
        }
        if not session[IS_ADMIN] and answer:
            exercise_data[FEEDBACK] = answer.feedback
        response[EXERCISES].append(exercise_data)

    return response


EXERCISE_ID = "exercise_id"
EXERCISE_INDEX = "exercise_index"
EXERCISE_NUMBER = "exercise_number"
EXERCISE_CONTENT = "exercise_content"
LINES = "lines"
FEEDBACK = "feedback"
EXERCISES = "exercises"


@login_required
@bp.route("/workbooks/<int:workbook_id>/edit", methods=["POST"])
def edit_workbook(workbook_id):
    if not session[IS_ADMIN]:
        return unauthorized_handler("Only admin user can edit workbooks")

    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    workbooks = db.session.execute(
        db.select(Workbook)
    ).scalars().all()
    # TODO: implementation


@login_required
@bp.route("/workbooks/new", methods=["POST"])
def add_workbook():
    if not session[IS_ADMIN]:
        return unauthorized_handler("Only admin user can add new workbooks")
    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    try:
        validate_workbook_data(data)
        workbook = create_workbook(data)
        db.session.add(workbook)
        db.session.flush()
        exercises_data = data.get(EXERCISES, [])
        for exercise_data in exercises_data:
            validate_exercise_data(exercise_data)
            exercise = create_exercise(exercise_data, workbook.workbook_id)
            db.session.add(exercise)
            db.session.flush()
            # Storing answers for each exercise to the database
            answer = create_answer(exercise.exercise_id)
            db.session.add(answer)
            db.session.flush()
            for line_data in exercise_data[ANSWER]:
                validate_line_data(line_data)
                line = create_line(line_data, exercise.exercise_id)
                if line:
                    db.session.add(line)
                    db.session.flush()
        db.session.commit()
        return jsonify({WORKBOOK_ID: workbook.workbook_id}), 200
    except ValueError as ve:
        db.session.rollback()
        return badrequest_handler(f"Validation Error: {ve}")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(str(e))


def create_workbook(workbook_data) -> Workbook:
    release_date = datetime.strptime(workbook_data[RELEASE_DATE], "%Y-%m-%dT%H:%M:%S")
    return Workbook(workbook_name=workbook_data[WORKBOOK_NAME], release_date=release_date)


INDEX = "index"


def create_exercise(exercise_data, workbook_id: int) -> Exercise:
    return Exercise(exercise_number=exercise_data[NUMBER].strip(),
                    exercise_index=exercise_data[INDEX],
                    exercise_content=exercise_data[QUESTION].strip(),
                    workbook_id=workbook_id)


def create_answer(exercise_id: int) -> Answer:
    return Answer(feedback="", exercise_id=exercise_id, user_id=session.get(USER_ID))


def create_line(line_data, answer_id: int) -> Line | None:
    index = line_data[LINE_INDEX]
    variable_stripped = line_data[VARIABLE].strip()
    rules_stripped = line_data[RULES].strip()
    if not (variable_stripped or rules_stripped):
        return None
    return Line(line_index=index,
                answer_id=answer_id,
                variable=variable_stripped,
                rules=rules_stripped)


def validate_workbook_data(data) -> None:
    required_keys = [WORKBOOK_NAME, RELEASE_DATE, EXERCISES]
    entity_name = "workbooks"
    validate_data(data, required_keys, entity_name)


def validate_exercise_data(data) -> None:
    required_keys = [NUMBER, QUESTION, ANSWER]
    entity_name = EXERCISE
    validate_data(data, required_keys, entity_name)


NUMBER = "number"
QUESTION = "question"
ANSWER = "answer"
LINE = "line"
LINE_INDEX = "line_index"
VARIABLE = "variable"
RULES = "rules"


def validate_line_data(data) -> None:
    required_keys = [LINE_INDEX, VARIABLE, RULES]
    entity_name = LINE
    validate_data(data, required_keys, entity_name)


def validate_data(data, required_keys: list[str], entity_name: str) -> None:
    if not all(key in data for key in required_keys):
        raise ValueError("Missing required fields in " + entity_name + " data")
