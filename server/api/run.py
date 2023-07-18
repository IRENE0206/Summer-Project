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


'''
def get_post(id, check_author=True):
    """Get a post and its author by id.

    Checks that the id exists and optionally that the current user is
    the author.

    :param id: id of post to get
    :param check_author: require the current user to be the author
    :return: the post with author information
    :raise 404: if a post with the given id doesn't exist
    :raise 403: if the current user isn't the author
    """
    post = (
        get_db()
        .execute(
            "SELECT p.id, title, body, created, author_id, username"
            " FROM post p JOIN user u ON p.author_id = u.id"
            " WHERE p.id = ?",
            (id,),
        )
        .fetchone()
    )

    if post is None:
        abort(404, f"Post id {id} doesn't exist.")

    if check_author and post["author_id"] != g.user["id"]:
        abort(403)

    return post


@bp.route("/create", methods=("GET", "POST"))
@login_required
def create():
    """Create a new post for the current user."""
    if request.method == "POST":
        title = request.form["title"]
        body = request.form["body"]
        error = None

        if not title:
            error = "Title is required."

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                "INSERT INTO post (title, body, author_id) VALUES (?, ?, ?)",
                (title, body, g.user["id"]),
            )
            db.commit()
            return redirect(url_for("blog.index"))

    return render_template("blog/create.html")


@bp.route("/<int:id>/update", methods=("GET", "POST"))
@login_required
def update(id):
    """Update a post if the current user is the author."""
    post = get_post(id)

    if request.method == "POST":
        title = request.form["title"]
        body = request.form["body"]
        error = None

        if not title:
            error = "Title is required."

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                "UPDATE post SET title = ?, body = ? WHERE id = ?", (title, body, id)
            )
            db.commit()
            return redirect(url_for("blog.index"))

    return render_template("blog/update.html", post=post)


@bp.route("/<int:id>/delete", methods=("POST",))
@login_required
def delete(id):
    """Delete a post.

    Ensures that the post exists and that the logged in user is the
    author of the post.
    """
    get_post(id)
    db = get_db()
    db.execute("DELETE FROM post WHERE id = ?", (id,))
    db.commit()
    return redirect(url_for("blog.index"))
'''
