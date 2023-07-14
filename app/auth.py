from functools import wraps
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for
)
from sqlalchemy.exc import IntegrityError

from app.db import db, Users

from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form["username"]
        password = request.form["password"]
        repeat_password = request.form["repeat_password"]
        error = None

        if not username:
            error = 'Username is required.'
            flash(error)
            return render_template('auth/register.html', username_error=error)
        elif not password:
            error = 'Password is required.'
        elif password != repeat_password:
            error = 'Passwords do not match'

        if error is not None:
            flash(error)
            return render_template('auth/register.html', password_match_error=error)

        try:
            role = "regular"
            if username == "gn22297":
                role = "admin"
            new = Users(username=username, password=generate_password_hash(password), role=role)
            db.session.add(new)
            db.session.commit()
        except IntegrityError:
            error = f"User {username} is already registered."
            flash(error)
            return render_template('auth/register.html', username_error=error)
        else:
            session["username"] = username
            session['user_role'] = role
            return redirect(url_for("index"))

    return render_template('auth/register.html')


@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form.get("username")
        password = request.form.get("password")

        user = db.session.execute(
            db.select(Users).filter_by(username=username)
        ).scalar()

        if user is None:
            error = 'Incorrect username.'
            flash(error)
            return render_template('auth/login.html', username_error=error)
        elif not check_password_hash(user.password, password):
            error = 'Incorrect password.'
            flash(error)
            return render_template('auth/login.html', password_error=error)

        session['user_id'] = user.user_id
        session['user_role'] = user.role
        return redirect(url_for('index'))

    return render_template("auth/login.html")


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))


def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('auth.login', next=request.url))

        return f(*args, **kwargs)

    return wrapped_view


@bp.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response
