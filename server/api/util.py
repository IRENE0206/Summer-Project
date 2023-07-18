from flask import jsonify

def unauthorized(error):
    response = jsonify({"error": error})
    response.status_code = 401
    return response

def notfound(error):
    response = jsonify({"error": error})
    response.status_code = 404
    return response

def badrequest(error):
    response = jsonify({"error": error})
    response.status_code = 400
    return response

def conflict(error):
    response = jsonify({"error": error})
    response.status_code = 409
    return response

def succeed(message, session_identifier=None):
    response_data = {"message": message}
    if session_identifier is not None:
        response_data["session_identifier"] = session_identifier

    response = jsonify(response_data)
    response.status_code = 200
    return response
    