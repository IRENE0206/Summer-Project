import secrets
from functools import wraps

from flask import (
    Blueprint, request, session, jsonify
)
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from .db import db, User, UserRole
from .util import notfound_handler, badrequest_handler, conflict_handler, unauthorized_handler, succeed

bp = Blueprint("auth", __name__, url_prefix="/api")
CORS(bp)  # TODO: Add CORS configurations for safety.


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return badrequest_handler("Invalid data format.")

    username = data.get("username")
    password = data.get("password")
    repeat_password = data.get("repeat_password")

    if not username:
        return badrequest_handler("Username is required.")
    if not password:
        return badrequest_handler("Password is required.")
    if password != repeat_password:
        return conflict_handler("Passwords do not match.")

    try:
        role = UserRole.REGULAR
        # TODO: change the code to external configuration or database-driven roles
        if username == "gn22297":
            role = UserRole.ADMIN
        new_user = User(username=username, password=generate_password_hash(password), role=role)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        return conflict_handler(f"User {username} is already registered.")

    session["user_id"] = new_user.user_id
    session["username"] = username
    session["user_role"] = role
    session["sessionIdentifier"] = generate_session_identifier()
    return succeed(
        "You have registered successfully",
        session_identifier=session["sessionIdentifier"]
    )


@bp.route("/login", methods=["POST"])
def login():
    session.clear()
    data = request.get_json()

    if not data:
        return badrequest_handler("Invalid data format.")

    if not all(key in data for key in ["username", "password"]):
        return badrequest_handler("Missing required fields for login")

    username = data.get("username")
    password = data.get("password")

    user = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()
    if user is None:
        return notfound_handler(f"No user named '{username}' found.")
    if not check_password_hash(user.password, password):
        return badrequest_handler("Invalid credentials.")

    session["user_id"] = user.user_id
    session["user_role"] = user.role
    session["username"] = user.username
    session["sessionIdentifier"] = generate_session_identifier()
    return succeed(
        "You have logged in successfully",
        session_identifier=session["sessionIdentifier"]
    )


def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            return unauthorized_handler("Login required")
        return f(*args, **kwargs)

    return wrapped_view


@login_required
@bp.route("/user", methods=["POST"])
def get_user():
    if "user_id" in session and "username" in session and "user_role" in session:
        user_data = {
            "user_id": session["user_id"],
            "user_name": session["username"],
            "user_role": str(session["user_role"]),
        }
        return jsonify(user_data), 200
    else:
        # Handle missing session information
        return badrequest_handler("Incomplete session information."), 401


@login_required
@bp.route("/is_admin", methods=["POST"])
def is_session_user_admin():
    if "user_role" in session and session["user_role"] is not None:
        is_admin_status = (session["user_role"] == UserRole.ADMIN)
        return jsonify({"is_admin": is_admin_status}), 200
    else:
        # Handle missing session information
        return badrequest_handler("Incomplete session information."), 401


@bp.route("/verify_session_identifier", methods=["POST"])
def verify_session_identifier():
    token = request.headers.get("Authorization")
    if not token:
        return badrequest_handler("Missing or invalid Authorization header")
    if token == session.get("sessionIdentifier"):
        return succeed("Successfully authenticated")
    return unauthorized_handler(
        "token" + token + "Given token failed to pass authentication " + session.get("sessionIdentifier"))


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return succeed("Log out successful")


def generate_session_identifier():
    return secrets.token_hex(16)


def is_admin() -> bool:
    return session.get("user_role") == UserRole.ADMIN
