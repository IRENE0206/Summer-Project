from collections import defaultdict
from datetime import datetime

from flask import (
    request, Blueprint, session, jsonify, current_app
)
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from .auth import login_required, USER_ID, IS_ADMIN, ADMIN_USERNAME
from .db import db, Workbook, Exercise, Answer, Line, User
from .util import (
    unauthorized_handler, badrequest_handler, internal_server_error_handler, notfound_handler, succeed
)

ALLOWED_ORIGINS = ["*"]  # TODO: change it to my frontend domain
ALLOWED_METHODS = ["GET", "POST"]
ALLOWED_HEADERS = ["Content-Type"]

bp = Blueprint("app", __name__, url_prefix="/api")
CORS(bp, resources={r"/api/*": {
    "origins": ALLOWED_ORIGINS,
    "methods": ALLOWED_METHODS,
    "allow_headers": ALLOWED_HEADERS
}})

WORKBOOK_ID = "workbook_id"
WORKBOOK_NAME = "workbook_name"
RELEASE_DATE = "release_date"
EXERCISE = "exercise"
TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"


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


EXERCISE_ID = "exercise_id"
EXERCISE_INDEX = "exercise_index"
EXERCISE_NUMBER = "exercise_number"
EXERCISE_CONTENT = "exercise_content"
LINES = "lines"
FEEDBACK = "feedback"
EXERCISES = "exercises"


def upsert_model(model, primary_key, primary_key_value, update_values):
    existing_item = db.session.execute(db.select(model).where(primary_key == primary_key_value)).scalar()
    if existing_item:
        update_query = db.update(model).where(primary_key == primary_key_value).values(**update_values)
        db.session.execute(update_query)
        return existing_item  # Return the existing item
    else:
        new_item = model(**update_values)
        db.session.add(new_item)
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


@bp.route("/workbooks/update/<int:workbook_id>", methods=["POST"])
@login_required
def update_workbook(workbook_id: int):
    data = request.json
    if not data:
        return badrequest_handler("Invalid data format.")

    try:
        received_exercise_ids = []

        if session[IS_ADMIN]:
            validate_workbook_data(data)
            workbook_name = data[WORKBOOK_NAME]
            release_date = datetime.strptime(data[RELEASE_DATE], TIME_FORMAT)
            upsert_model(Workbook, Workbook.workbook_id, workbook_id,
                         {'workbook_id': workbook_id, 'workbook_name': workbook_name, 'release_date': release_date})

            exercises_data = data.get(EXERCISES, [])
            for exercise_data in exercises_data:
                validate_exercise_data(exercise_data)
                exercise_update_data = {k: v for k, v in exercise_data.items() if k != LINES}
                upsert_model(Exercise, Exercise.exercise_id, exercise_data[EXERCISE_ID], exercise_update_data)
                received_exercise_ids.append(exercise_data[EXERCISE_ID])

            delete_absent_exercises(workbook_id, received_exercise_ids)

        exercises_data = data.get(EXERCISES, [])
        for exercise_data in exercises_data:
            answer = upsert_model(Answer, Answer.exercise_id, exercise_data[EXERCISE_ID],
                                  {'exercise_id': exercise_data[EXERCISE_ID], 'feedback': ''})
            if not answer:
                raise ValueError("Unable to fetch or create an Answer for the given Exercise")

            received_line_ids = []
            for line_data in exercise_data[LINES]:
                line_data['answer_id'] = answer.answer_id
                upsert_model(Line, Line.line_id, line_data[LINE_INDEX], line_data)
                received_line_ids.append(line_data[LINE_INDEX])

            delete_absent_lines(answer.answer_id, received_line_ids)

        db.session.commit()
        return succeed("Workbook updated successfully.")
    except ValueError as ve:
        db.session.rollback()
        return badrequest_handler(f"Validation Error: {ve}")
    except SQLAlchemyError as se:
        db.session.rollback()
        return internal_server_error_handler(f"An error occurred while updating data: {str(se)}")
    except Exception as e:
        db.session.rollback()
        return internal_server_error_handler(f"An unexpected error occurred while updating data: {str(e)}")


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
            for line_data in exercise_data[LINES]:
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
        return internal_server_error_handler(f"An unexpected error occurred while creating new workbook: {str(e)}")


def create_workbook(workbook_data) -> Workbook:
    release_date = datetime.strptime(workbook_data[RELEASE_DATE], TIME_FORMAT)
    return Workbook(workbook_name=workbook_data[WORKBOOK_NAME], release_date=release_date)


INDEX = "index"


def create_exercise(exercise_data, workbook_id: int) -> Exercise:
    return Exercise(exercise_number=exercise_data[EXERCISE_NUMBER].strip(),
                    exercise_index=exercise_data[EXERCISE_INDEX],
                    exercise_content=exercise_data[EXERCISE_CONTENT].strip(),
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
    required_keys = [EXERCISE_NUMBER, EXERCISE_CONTENT, LINES]
    entity_name = EXERCISE
    validate_data(data, required_keys, entity_name)


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


from .parser import get_grammar
from .grammar import is_equivalent


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
