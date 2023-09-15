import os
import secrets
from functools import wraps

from cryptography.fernet import Fernet, InvalidToken
from flask import (
    Blueprint, request, session, jsonify, current_app
)
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from .db import db, User, UserRole
from .util import badrequest_handler, conflict_handler, unauthorized_handler, succeed

bp = Blueprint("auth", __name__, url_prefix="/api")
ALLOWED_ORIGINS = ["*"]  # TODO: change it to my frontend domain
ALLOWED_METHODS = ["GET", "POST"]
ALLOWED_HEADERS = ["Content-Type", "Authorization"]

CORS(bp, resources={r"/api/*": {
    "origins": ALLOWED_ORIGINS,
    "methods": ALLOWED_METHODS,
    "allow_headers": ALLOWED_HEADERS
}})

USER_ID = "user_id"
USER_NAME = "user_name"
IS_ADMIN = "is_admin"
SESSION_IDENTIFIER = "session_identifier"
PASSWORD = "password"
# Fetching the ADMIN_USERNAME from environment variable
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
if not ADMIN_USERNAME:
    raise ValueError("Missing ADMIN_USERNAME environment variable. This variable is required for the application.")


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
        if user_name == ADMIN_USERNAME:
            role = UserRole.ADMIN
        new_user = User(user_name=user_name, password=generate_password_hash(password), role=role)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        return conflict_handler("Username is already in use.")

    session[USER_ID] = new_user.user_id
    session[USER_NAME] = user_name
    session[IS_ADMIN] = (role == UserRole.ADMIN)
    session[SESSION_IDENTIFIER] = generate_session_identifier()
    return succeed(
        "Registration successful",
        encrypted_session_identifier=encrypt_session_identifier(session[SESSION_IDENTIFIER])
    )


@bp.route("/login", methods=["POST"])
def login():
    session.clear()
    data = request.get_json()

    if not data:
        return badrequest_handler("Invalid request data.")

    user_name = data.get(USER_NAME)
    password = data.get(PASSWORD)

    user = db.session.execute(
        db.select(User).filter_by(user_name=user_name)
    ).scalar_one_or_none()
    if user is None or not check_password_hash(user.password, password):
        return badrequest_handler("Invalid username or password.")

    session[USER_ID] = user.user_id
    session[IS_ADMIN] = (user.role == UserRole.ADMIN)
    session[USER_NAME] = user.user_name
    session[SESSION_IDENTIFIER] = generate_session_identifier()
    return succeed(
        "Login successful",
        encrypted_session_identifier=encrypt_session_identifier(session[SESSION_IDENTIFIER])
    )


def login_required(f):
    @wraps(f)
    def wrapped_view(*args, **kwargs):
        if USER_ID not in session:
            return unauthorized_handler("Login required")
        return f(*args, **kwargs)

    return wrapped_view


@login_required
@bp.route("/user", methods=["GET"])
def get_user():
    # Ensure session contains necessary keys
    if all(key in session for key in [USER_ID, USER_NAME, IS_ADMIN]):
        user_data = {
            USER_ID: session[USER_ID],
            USER_NAME: session[USER_NAME],
            IS_ADMIN: session[IS_ADMIN],
        }
        return jsonify(user_data), 200
    else:
        # Handle missing session information
        return badrequest_handler("Incomplete session information."), 401


@bp.route("/verify_session_identifier", methods=["POST"])
def verify_session_identifier():
    encrypted_token = request.headers.get("Authorization")
    if not encrypted_token:
        return badrequest_handler("Missing or invalid Authorization header")

    # Decrypt the token using the server's SECRET_KEY
    decrypted_token = decrypt_session_identifier(encrypted_token)

    if decrypted_token == session.get(SESSION_IDENTIFIER):
        return succeed("Authentication successful")

    return unauthorized_handler("Given token failed to pass authentication")


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return succeed("Log out successful")


def get_encryption_key() -> bytes:
    # Obtain a proper key for Fernet encryption.
    # If not found, generating a new one (not recommended for production)
    key = os.environ.get("FERNET_KEY")
    if not key:
        raise ValueError("Missing FERNET_KEY environment variable. A proper key is required for encryption.")
    return key.encode("utf-8")


def generate_session_identifier() -> str:
    return secrets.token_hex(16)


def encrypt_session_identifier(session_id: str) -> str:
    """
    Encrypts the session identifier.

    Args:
    - session_id (str): The session identifier to encrypt.
    - key (bytes): The encryption key.

    Returns:
    - str: Encrypted session identifier.
    """
    key = get_encryption_key()
    cipher = Fernet(key)
    encrypted_id = cipher.encrypt(session_id.encode())
    return encrypted_id.decode("utf-8")


def decrypt_session_identifier(encrypted_id: str) -> str:
    """
    Decrypts the encrypted session identifier.

    Args:
    - encrypted_id (str): The encrypted session identifier.
    - key (bytes): The decryption key.

    Returns:
    - str: Decrypted session identifier, or None if decryption fails.
    """
    key = get_encryption_key()
    cipher = Fernet(key)
    try:
        decrypted_id = cipher.decrypt(encrypted_id.encode())
        return decrypted_id.decode("utf-8")
    except InvalidToken:
        current_app.logger.error("Failed to decrypt the session identifier due to an invalid token.")
        return ""
