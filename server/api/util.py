from flask import jsonify, Blueprint
import secrets
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    REGULAR = "regular"

bp = Blueprint("util", __name__)

@bp.errorhandler(401)
def unauthorized_handler(error):
    return response_generator(401, str(error))

@bp.errorhandler(404)
def notfound_handler(error):
    return response_generator(404, str(error))

@bp.errorhandler(400)
def badrequest_handler(error):
    return response_generator(400, str(error))

@bp.errorhandler(409)
def conflict_handler(error):
    return response_generator(409, str(error))

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
    