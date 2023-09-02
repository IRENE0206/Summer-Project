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

USER_ID = "user_id"
USER_NAME = "user_name"
USER_ROLE = "user_role"
SESSION_IDENTIFIER = "session_identifier"
PASSWORD = "password"

ADMIN_USERNAME = "gn22297"


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return badrequest_handler("Invalid data format.")

    user_name = data.get(USER_NAME)
    password = data.get(PASSWORD)
    repeat_password = data.get("repeat_password")

    if not user_name:
        return badrequest_handler("Username is required.")
    if not password:
        return badrequest_handler("Password is required.")
    if password != repeat_password:
        return conflict_handler("Passwords do not match.")

    try:
        role = UserRole.REGULAR
        # TODO: change the code to external configuration or database-driven roles
        if user_name == ADMIN_USERNAME:
            role = UserRole.ADMIN
        new_user = User(user_name=user_name, password=generate_password_hash(password), role=role)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        return conflict_handler(f"User {user_name} is already registered.")

    session[USER_ID] = new_user.user_id
    session[USER_NAME] = user_name
    session[USER_ROLE] = role
    session[SESSION_IDENTIFIER] = generate_session_identifier()
    return succeed(
        "You have registered successfully",
        session_identifier=session[SESSION_IDENTIFIER]
    )


@bp.route("/login", methods=["POST"])
def login():
    session.clear()
    data = request.get_json()

    if not data:
        return badrequest_handler("Invalid data format.")

    if not all(key in data for key in [USER_NAME, PASSWORD]):
        return badrequest_handler("Missing required fields for login")

    user_name = data.get(USER_NAME)
    password = data.get(PASSWORD)

    user = db.session.execute(
        db.select(User).filter_by(user_name=user_name)
    ).scalar_one_or_none()
    if user is None:
        return notfound_handler(f"No user named '{user_name}' found.")
    if not check_password_hash(user.password, password):
        return badrequest_handler("Invalid credentials.")

    session[USER_ID] = user.user_id
    session[USER_ROLE] = user.role
    session[USER_NAME] = user.user_name
    session[SESSION_IDENTIFIER] = generate_session_identifier()
    return succeed(
        "You have logged in successfully",
        session_identifier=session[SESSION_IDENTIFIER]
    )


def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if USER_ID not in session:
            return unauthorized_handler("Login required")
        return f(*args, **kwargs)

    return wrapped_view


@login_required
@bp.route("/user", methods=["POST"])
def get_user():
    if USER_ID in session and USER_NAME in session and USER_ROLE in session:
        user_data = {
            USER_ID: session[USER_ID],
            USER_NAME: session[USER_NAME],
            USER_ROLE: session[USER_ROLE].value,
        }
        return jsonify(user_data), 200
    else:
        # Handle missing session information
        return badrequest_handler("Incomplete session information."), 401


@login_required
@bp.route("/is_admin", methods=["POST"])
def is_session_user_admin():
    if USER_ROLE in session and session[USER_ROLE] is not None:
        is_admin_status = (session[USER_ROLE] == UserRole.ADMIN)
        return jsonify({"is_admin": is_admin_status}), 200
    else:
        # Handle missing session information
        return badrequest_handler("Incomplete session information."), 401


@bp.route("/verify_session_identifier", methods=["POST"])
def verify_session_identifier():
    token = request.headers.get("Authorization")
    if not token:
        return badrequest_handler("Missing or invalid Authorization header")
    if token == session.get(SESSION_IDENTIFIER):
        return succeed("Successfully authenticated")
    return unauthorized_handler(
        "token" + token + "Given token failed to pass authentication " + session.get(SESSION_IDENTIFIER))


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return succeed("Log out successful")


def generate_session_identifier():
    return secrets.token_hex(16)


def is_admin() -> bool:
    return session.get(USER_ROLE) == UserRole.ADMIN
