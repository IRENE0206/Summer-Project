from functools import wraps
from flask import (
    Blueprint, request, session, jsonify
)
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS

from .db import db, Users
from .util import unauthorized, notfound, badrequest, conflict, succeed
import secrets

from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint("auth", __name__, url_prefix="/api")
CORS(bp)


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    repeat_password = data.get("repeat_password")
    error = None

    if not username:
        error = "Username is required."
    elif not password:
        error = "Password is required."
    elif password != repeat_password:
        error = "Passwords do not match."

    if error is not None:
        return badrequest(error)

    try:
        role = "regular"
        if username == "gn22297":
            role = "admin"
        new_user = Users(username=username, password=generate_password_hash(password), role=role)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        error = f"User {username} is already registered."
        print("what?")
        return conflict(error)
    
    session["username"] = username
    session["user_role"] = role
    session["sessionIdentifier"] = generate_session_identifier()
    return succeed("You have registered sucessfully", session_identifier=session["sessionIdentifier"])


@bp.route("/login", methods=["POST"])
def login():
    session.clear()
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = db.session.execute(
        db.select(Users).filter_by(username=username)
    ).scalar()

    if user is None:
        error = "Incorrect username"
        return notfound(error)
    if not check_password_hash(user.password, password):
        error = "Incorrect password"
        return conflict(error)
        
    session["user_id"] = user.user_id
    session["user_role"] = user.role
    session["username"] = user.username
    return succeed("You have logged in sucessfully")

def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            return badrequest("Login required")

        return f(*args, **kwargs)

    return wrapped_view

@bp.route("/user", methods=["POST"])
@login_required
def get_user():
    return get_session_user()

def get_session_user():
    user_data = {
        "user_id": session.get("user_id"),
        "user_name": session.get("username"),
        "user_role": session.get("user_role"),
    }
    return jsonify(user_data)

@bp.route("/logout")
def logout():
    session.clear()
    return succeed("Log out successful")

@bp.errorhandler(401)
def unauthorized_handler(error):
    return unauthorized(error)

@bp.errorhandler(404)
def notfound_handler(error):
    return notfound(error)

@bp.errorhandler(400)
def badrequest_handler(error):
    return badrequest(error)

@bp.errorhandler(409)
def conflict_handler(error):
    return conflict(error)


@bp.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

def generate_session_identifier():
    return secrets.token_hex(16)