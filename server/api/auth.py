from functools import wraps
from flask import (
    Blueprint, request, session, jsonify
)
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS

from .db import db, User
from .util import unauthorized_handler, notfound_handler, badrequest_handler, conflict_handler, after_request, UserRole, succeed
import secrets

from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint("auth", __name__, url_prefix="/api")
CORS(bp)


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not data:
        return badrequest_handler("Invalid data format.")
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
        return badrequest_handler(error)

    try:
        role = UserRole.REGULAR.value
        # TODO: change the code to external configuration or database-driven roles
        if username == "gn22297":
            role = UserRole.ADMIN.value
        new_user = User(username=username, password=generate_password_hash(password), role=role)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        error = f"User {username} is already registered."
        return conflict_handler(error)
    except Exception as e:
        return badrequest_handler("An unexpected error occurred.")
    session["user_id"] = new_user.user_id
    session["username"] = username
    session["user_role"] = role
    session["sessionIdentifier"] = generate_session_identifier()
    return succeed("You have registered successfully", session_identifier=session["sessionIdentifier"], user_id=session["user_id"], user_name=session["username"], user_role=session["user_role"])


@bp.route("/login", methods=["POST"])
def login():
    session.clear()
    data = request.get_json()
    if not data:
        return badrequest_handler("Invalid data format.")

    username = data.get("username")
    password = data.get("password")

    user = db.one_or_404(
        db.select(User).filter_by(username=username),
        description=f"No user named '{username}'."
    )
    if not check_password_hash(user.password, password):
        return badrequest_handler("Invalid credentials.")
        
    session["user_id"] = user.user_id
    session["user_role"] = user.role
    session["username"] = user.username
    session["sessionIdentifier"] = generate_session_identifier()
    return succeed("You have logged in successfully", session_identifier=session["sessionIdentifier"], user_id=session["user_id"], user_name=session["username"], user_role=session["user_role"])

def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            return badrequest_handler("Login required")

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

@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return succeed("Log out successful")

def generate_session_identifier():
    return secrets.token_hex(16)

@login_required
def is_admin():
    return session.get("user_role") == UserRole.ADMIN.value