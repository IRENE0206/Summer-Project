from flask import (
    request, Blueprint, session, jsonify
)
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from .auth import login_required, is_admin
from .db import db, Workbook, Exercise, Answer, Line
from .util import (
    succeed, unauthorized_handler, badrequest_handler, conflict_handler
)
from flask_cors import CORS

bp = Blueprint("app", __name__, url_prefix="/api")
CORS(bp)

@login_required
@bp.route("/workbooks", methods=["GET"])
def get_workbooks():
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

@login_required
@bp.route("/workbook/<int:workbook_id>/edit", methods=["POST"])
def edit_workbook():
    if not is_admin():
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
    release_date = data.get("release_date")
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
                    line_entry = Line(line_index=index, answer_id=answer.answer_id, variable=variable_stripped, rules=rules_stripped)
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


