from flask import (
    Blueprint, render_template, session, jsonify
)
from datetime import datetime

from .auth import login_required
from .db import db, Workbooks

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

@bp.route("/workbook/edit", methods=["POST"])
@login_required
def edit_workbook():
    data = request.get_json()
    workbook_id = data.get("workbook_id")
    workbooks = db.session.execute(
            db.select(Workbooks)
        ).scalars().all()
