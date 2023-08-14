from flask import (
    Blueprint, render_template, session, jsonify
)
from datetime import datetime

from .auth import login_required
from .db import db, Workbooks
from .util import unauthorized, notfound, badrequest, conflict, succeed

bp = Blueprint('app', __name__, url_prefix="/api")


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


@bp.route("/workbook/new", methods=["POST"])
@login_required
def add_workbook():
    data = request.get_json()
    workbook_name = data.get("workbook_name")
    release_date = data.get("release_date")
    last_edit = data.get("last_edit")
    
    try:
        workbook = Workbooks(workbook_name=workbook_name, release_date=release_date, last_edit=last_edit)
        db.session.add(workbook)
        db.session.commit()
    except IntegrityError:
        error = f"Workbook name {workbook_name} has already existed"
        return conflict(error)
    return succeed("Created new workbook successfully")


