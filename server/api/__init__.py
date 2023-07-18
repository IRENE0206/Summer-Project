import os
from secrets import token_hex

from flask import Flask
from flask_session import Session
from flask_cors import CORS
from . import auth


from . import run
from .db import db


def create_app(test_config=None):
    # Create and configure an instance of the app
    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources=r'/api/*')
    # Set up the database path
    database_path = os.path.join(app.instance_path, "app.sqlite")

    # Configure the app
    app.config.from_mapping(
        SECRET_KEY=token_hex(16),
        SESSION_PERMANENT=False,
        SESSION_TYPE="filesystem",
        SQLALCHEMY_DATABASE_URI="sqlite:///"+database_path,
    )

    # Initialize the session
    Session(app)

    if test_config is None:
        app.config.from_pyfile("app/config.py", silent=True)
    else:
        app.config.update(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize the database
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # Register blueprints
    app.register_blueprint(auth.bp)

    app.register_blueprint(run.bp)

    app.add_url_rule("/", endpoint="api")

    return app