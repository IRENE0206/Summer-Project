from flask import jsonify, Blueprint
import secrets
from .db import UserRole

bp = Blueprint("util", __name__)

@bp.errorhandler(401)
def unauthorized_handler(message: str):
    return response_generator(401, message)

@bp.errorhandler(404)
def notfound_handler(message: str):
    return response_generator(404, message)

@bp.errorhandler(400)
def badrequest_handler(message: str):
    return response_generator(400, message)

@bp.errorhandler(409)
def conflict_handler(message: str):
    return response_generator(409, message)

@bp.after_request
def after_request(response):
    # Ensure responses aren't cached
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

def response_generator(status_code, message=None, **kwargs):
    data = {"message": message} if message else {}
    data.update(kwargs)
    response = jsonify(data)
    response.status_code = status_code
    return response

def succeed(message, session_identifier=None):
    response_data = {"message": message}
    if session_identifier is not None:
        response_data["session_identifier"] = session_identifier

    response = jsonify(response_data)
    response.status_code = 200
    return response
    