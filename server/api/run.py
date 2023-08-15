from flask import (
    request, Blueprint, session, jsonify
)
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from .auth import login_required
from .db import db, Workbooks, Exercises, Answers, Lines
from .util import unauthorized, notfound, badrequest, conflict, succeed
from flask_cors import CORS

bp = Blueprint('app', __name__, url_prefix="/api")
CORS(bp)

@bp.route("/workbooks", methods=["POST"])
@login_required
def get_workbooks():
    role = session.get("user_role")

    if role == "admin":
        workbooks = db.session.execute(
            db.select(Workbooks)
        ).scalars().all()
    else:
        workbooks = db.session.execute(
            db.select(Workbooks).filter(Workbooks.release_date < datetime.now())
        ).scalars().all()
# TODO: implementation
    '''
    workbooks = db.session.execute(
            db.select(Workbooks)
        ).scalars().all()
        '''
    
    '''
    workbooks_data = []
    for workbook in workbooks:
        workbook_data = {
            "workbook_id": workbook.workbook_id,
            "workbook_name": workbook.workbook_name,
            "release_date": workbook.release_date,
            "last_edit": workbook.last_edit,
        }
        workbooks_data.append(workbook_data)
        '''
    return jsonify(workbooks)

@bp.route("/workbook/<int:workbook_id>/edit", methods=["POST"])
@login_required
def edit_workbook():
    data = request.get_json()
    workbook_id = data.get("workbook_id")
    
    workbooks = db.session.execute(
            db.select(Workbooks)
        ).scalars().all()
    # TODO: implementation


@bp.route("/workbook/new", methods=["POST"])
@login_required
def add_workbook():
    data = request.get_json()
    if not all(key in data for key in ["workbook_name", "release_date", "exercises"]):
        return badrequest("Missing required fields for the workbook information")
    workbook_name = data.get("workbook_name")
    release_date = data.get("release_date")
    last_edit = datetime.now()
    qandas = data.get("exercises", [])
    try:
        workbook = Workbooks(workbook_name=workbook_name, release_date=release_date, last_edit=last_edit)
        db.session.add(workbook)
        db.session.flush()
        # TODO: extract exercises data and add them to database
        for qanda in qandas:
            if not all(key in qanda for key in ['number', 'question', 'answer']):
                raise ValueError("Missing required fields in exercise data")
            number_stripped = qanda['number'].strip()
            question_stripped = qanda['question'].strip()
            if not number_stripped and not question_stripped:
                continue
            exercise = Exercises(exercise_number=number_stripped, 
                                 exercise_content=question_stripped,
                                 workbook_id=workbook.workbook_id)
            db.session.add(exercise)
            db.session.flush()
            
            # Storing answers for each exercise to the database
            answer = Answers(feedback="", exercise_id=exercise.exercise_id, user_id=session.get("user_id"))
            db.session.add(answer)
            db.session.flush()
            for line in qanda['answer']:
                if not all(key in line for key in ["line_index", "variable", "rules"]):
                    raise ValueError("Missing required fields in answer data")
                index_stripped = line["line_index"].strip()
                variable_stripped = line["variable"].strip()
                rules_stripped = line["rules"].strip()
                if index_stripped or variable_stripped or rules_stripped:  
                    line_entry = Lines(line_index=index_stripped, answer_id=answer.answer_id, variable=variable_stripped, rules=rules_stripped)
                    db.session.add(line_entry)
        db.session.commit()
        return succeed("Created new workbook successfully")
    except IntegrityError:
        db.session.rollback()
        error = f"Workbook name {workbook_name} has already existed"
        return conflict(error)
    except Exception as e:
        db.session.rollback()
        return badrequest(str(e))
   