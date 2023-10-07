from collections import defaultdict
from datetime import datetime

from flask import (
    request, Blueprint, session, jsonify, current_app
)
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from .auth import login_required, USER_ID, IS_ADMIN, ADMIN_USERNAME
from .db import db, Workbook, Exercise, Answer, Line, User
from .grammar import is_equivalent
from .parser import get_grammar
from .util import (
    unauthorized_handler, badrequest_handler, internal_server_error_handler, notfound_handler
)

# Constants
ALLOWED_ORIGINS = ["*"]  # TODO: Update to frontend domain
ALLOWED_METHODS = ["GET", "POST"]
ALLOWED_HEADERS = ["Content-Type"]
TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"

# Fields
WORKBOOK_ID = "workbook_id"
WORKBOOK_NAME = "workbook_name"
RELEASE_DATE = "release_date"
EXERCISE = "exercise"
EXERCISE_ID = "exercise_id"
EXERCISE_INDEX = "exercise_index"
EXERCISE_NUMBER = "exercise_number"
EXERCISE_CONTENT = "exercise_content"
LINE = "line"
LINES = "lines"
LINE_ID = "line_id"
FEEDBACK = "feedback"
EXERCISES = "exercises"
ANSWER_ID = "answer_id"
INDEX = "index"
LINE_INDEX = "line_index"
VARIABLE = "variable"
RULES = "rules"

bp = Blueprint("app", __name__, url_prefix="/api")
CORS(bp, resources={r"/api/*": {
    "origins": ALLOWED_ORIGINS,
    "methods": ALLOWED_METHODS,
    "allow_headers": ALLOWED_HEADERS
}})


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
        db.session.rollback()
        return internal_server_error_handler("An error occurred when fetching workbooks data")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred: {str(e)}")


@login_required
@bp.route("/workbooks/<int:workbook_id>", methods=["GET"])
def get_workbook(workbook_id: int):
    try:
        workbook = fetch_workbook_with_exercises(workbook_id)
        if not workbook:
            return notfound_handler("Workbook not found")
        response = format_workbook_response(workbook)
        return jsonify(response), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return internal_server_error_handler(f"Database error while fetching workbook: {str(e)}")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred when fetching workbook: {str(e)}")


def fetch_workbook_with_exercises(workbook_id: int):
    query = (
        db.select(Workbook)
        .options(db.joinedload(Workbook.exercises))  # Eagerly load exercises
        .filter_by(workbook_id=workbook_id)
    )
    if not session[IS_ADMIN]:
        query = query.filter(Workbook.release_date < datetime.utcnow())
    return db.session.execute(query).unique().scalar_one_or_none()


def fetch_user_answers_for_exercises(exercise_ids: list[int]):
    return db.session.execute(
        db.select(Answer)
        .filter(Answer.user_id == session[USER_ID], Answer.exercise_id.in_(exercise_ids))
    ).scalars().all()


def fetch_lines_for_answers(answer_ids: list[int]):
    return db.session.execute(
        db.select(Line)
        .filter(Line.answer_id.in_(answer_ids))
    ).scalars().all()


def format_workbook_response(workbook: Workbook):
    response = {
        WORKBOOK_NAME: workbook.workbook_name,
        RELEASE_DATE: workbook.release_date,
        EXERCISES: [],
    }
    sorted_exercises = sorted(workbook.exercises, key=lambda x: x.exercise_index)
    exercise_ids = [exercise.exercise_id for exercise in sorted_exercises]
    answers = fetch_user_answers_for_exercises(exercise_ids)
    answer_map = {answer.exercise_id: answer for answer in answers}

    answer_ids = [answer.answer_id if answer else None for answer in answers]
    lines = fetch_lines_for_answers(answer_ids)
    line_map = defaultdict(list)
    for line in lines:
        line_map[line.answer_id].append(line)

    for exercise in sorted_exercises:
        answer = answer_map.get(exercise.exercise_id)
        lines_data = [
            {
                LINE_ID: line.line_id,
                LINE_INDEX: line.line_index,
                VARIABLE: line.variable,
                RULES: line.rules
            }
            for line in line_map.get(answer.answer_id, [])
        ] if answer else [{LINE_INDEX: 0, VARIABLE: "", RULES: ""}]

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


def upsert_model(model, primary_key, primary_key_value, update_values, preserve_fields: [str] = None):
    existing_item = db.session.execute(db.select(model).where(primary_key == primary_key_value)).scalar()
    if existing_item:
        for field in preserve_fields:
            if field in update_values:
                del update_values[field]  # Remove fields that should be preserved
        update_query = db.update(model).where(primary_key == primary_key_value).values(**update_values)
        db.session.execute(update_query)
        return existing_item  # Return the existing item
    else:
        new_item = model(**update_values)
        db.session.add(new_item)
        db.session.flush()
        return new_item  # Return the newly created item


def delete_absent_lines(answer_id, received_line_ids):
    existing_line_ids = [result.line_id for result in
                         db.session.execute(db.select(Line.line_id).where(Line.answer_id == answer_id))]
    lines_to_delete = set(existing_line_ids) - set(received_line_ids)
    for line_id in lines_to_delete:
        line = db.session.execute(db.select(Line).where(Line.line_id == line_id)).scalar()
        if line:
            db.session.delete(line)


def delete_absent_exercises(workbook_id, received_exercise_ids):
    existing_exercise_ids = [result.exercise_id for result in db.session.execute(
        db.select(Exercise.exercise_id).where(Exercise.workbook_id == workbook_id))]
    exercises_to_delete = set(existing_exercise_ids) - set(received_exercise_ids)
    for exercise_id in exercises_to_delete:
        exercise = db.session.execute(db.select(Exercise).where(Exercise.exercise_id == exercise_id)).scalar()
        if exercise:
            db.session.delete(exercise)


def handle_workbook_data(data, workbook_id: int = None):
    validate_workbook_data(data)
    return upsert_model(Workbook, Workbook.workbook_id, workbook_id, {
        WORKBOOK_NAME: data[WORKBOOK_NAME],
        RELEASE_DATE: datetime.strptime(data[RELEASE_DATE], TIME_FORMAT)
    })


def handle_exercise_data(workbook: Workbook, is_updating: bool, data) -> None:
    exercises_data = data.get(EXERCISES, [])
    received_exercise_ids = []
    for exercise_data in exercises_data:
        validate_exercise_data(exercise_data)
        exercise = upsert_model(Exercise, Exercise.exercise_id, exercise_data.get(EXERCISE_ID, None), {
            EXERCISE_NUMBER: exercise_data[EXERCISE_NUMBER],
            EXERCISE_INDEX: exercise_data[EXERCISE_INDEX],
            EXERCISE_CONTENT: exercise_data[EXERCISE_CONTENT],
            WORKBOOK_ID: workbook.workbook_id
        })
        received_exercise_ids.append(exercise.exercise_id)

    if is_updating:
        delete_absent_exercises(workbook.workbook_id, received_exercise_ids)


def handle_answer_and_line_data(data):
    exercises_data = data.get(EXERCISES, [])
    for exercise_data in exercises_data:
        exercise_id = exercise_data.get(EXERCISE_ID, None)
        answer_id = exercise_data.get(ANSWER_ID, None)  # Get answer_id from frontend if existing

        # Upsert answer while preserving the 'FEEDBACK' field
        answer = upsert_model(Answer, Answer.answer_id, answer_id, {
            FEEDBACK: "",  # This will be updated later if needed
            EXERCISE_ID: exercise_id,
            USER_ID: session[USER_ID]
        }, preserve_fields=[FEEDBACK])

        if not answer:
            raise ValueError("Unable to fetch or create an Answer for the given Exercise")
        received_line_ids = []
        for line_data in exercise_data[LINES]:
            validate_line_data(line_data)
            upsert_model(Line, Line.line_id, line_data.get(LINE_ID, None), {
                LINE_INDEX: line_data[LINE_INDEX],
                ANSWER_ID: answer.answer_id,
                VARIABLE: line_data[VARIABLE].strip(),
                RULES: line_data[RULES].strip()
            })
            received_line_ids.append(line_data[LINE_INDEX])

        delete_absent_lines(answer.answer_id, received_line_ids)


@bp.route("/workbooks/update", methods=["POST"])
@bp.route("/workbooks/update/<int:workbook_id>", methods=["POST"])
@login_required
def update_workbook(workbook_id: int = None):
    # Check if the user is trying to create a new workbook without admin privileges
    if workbook_id is None and not session[IS_ADMIN]:
        return unauthorized_handler("Only admin users can create new workbooks.")

    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    try:
        workbook = None
        if session[IS_ADMIN]:
            workbook = handle_workbook_data(data=data, workbook_id=workbook_id)  # Admin-only operation
            handle_exercise_data(workbook=workbook, is_updating=(workbook_id is not None),
                                 data=data)  # Admin-only operation

        handle_answer_and_line_data(data)  # All users can update their answers and lines

        db.session.commit()
        return jsonify({WORKBOOK_ID: workbook.workbook_id if workbook else "Not updated by non-admin user"}), 200
    except ValueError as ve:
        db.session.rollback()
        return badrequest_handler(f"Validation Error: {ve}")
    except SQLAlchemyError as se:
        db.session.rollback()
        return internal_server_error_handler(f"An error occurred while updating data: {str(se)}")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred while updating data: {str(e)}")


def validate_workbook_data(data) -> None:
    required_keys = [WORKBOOK_NAME, RELEASE_DATE, EXERCISES]
    entity_name = "workbooks"
    validate_data(data, required_keys, entity_name)


def validate_exercise_data(data) -> None:
    required_keys = [EXERCISE_NUMBER, EXERCISE_CONTENT, LINES]
    entity_name = EXERCISE
    validate_data(data, required_keys, entity_name)


def validate_line_data(data) -> None:
    required_keys = [LINE_INDEX, VARIABLE, RULES]
    entity_name = LINE
    validate_data(data, required_keys, entity_name)


def validate_data(data, required_keys: list[str], entity_name: str) -> None:
    if not all(key in data for key in required_keys):
        raise ValueError("Missing required fields in " + entity_name + " data")


@bp.route("/workbooks/check/<int:workbook_id>", methods=["POST"])
def check_workbook(workbook_id: int):
    user_id = session[USER_ID]
    admin_username = session[ADMIN_USERNAME]
    try:
        # Fetch the admin ID using the admin username
        admin = db.session.execute(
            db.select(User).filter_by(user_name=admin_username)
        ).scalar_one_or_none()

        if not admin:
            return notfound_handler("Admin not found. No correct answers to use")
    except SQLAlchemyError as e:
        current_app.logger.error(e)
        db.session.rollback()
        return internal_server_error_handler("An error occurred when fetching admin")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred while fetching admin: {str(e)}")

    admin_id = admin.user_id

    try:
        # Fetch all exercises in the workbook
        exercise_ids = db.session.execute(
            db.select(Exercise.exercise_id).filter_by(Exercise.workbook_id == workbook_id)
        ).scalars().all()
    except SQLAlchemyError as e:
        current_app.logger.error(e)
        db.session.rollback()
        return internal_server_error_handler("An error occurred when fetching exercises")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred while fetching exercises: {str(e)}")

    results = {}
    for exercise_id in exercise_ids:
        try:
            user_grammar = get_grammar(exercise_id, user_id)
            admin_grammar = get_grammar(exercise_id, admin_id)
            # Check equivalence
            result = is_equivalent(user_grammar, admin_grammar)
            results[exercise_id] = result
        except SQLAlchemyError as e:
            current_app.logger.error(e)
            db.session.rollback()
            return internal_server_error_handler("An error occurred when fetching answers")
        except Exception as e:
            db.session.rollback()
            return internal_server_error_handler(f"An unexpected error occurred while getting feedback: {str(e)}")
    return jsonify(results), 200
