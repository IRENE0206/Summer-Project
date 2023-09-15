import os

from flask import Flask
from flask_cors import CORS
from flask_session import Session

from . import util, auth, run, parser
from .db import db


def create_app(test_config=None):
    # Create and configure an instance of the app
    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources=r'/api/*')
    # Set up the database path
    database_path = os.path.join(app.instance_path, "app.sqlite")

    # Configure the app
    app.config.from_mapping(
        # Ensure the SECRET_KEY is set
        # If os.environ.get("SECRET_KEY") doesn't retrieve a key, it'll default to None
        SECRET_KEY=os.environ.get("SECRET_KEY"),
        SESSION_PERMANENT=False,
        SESSION_TYPE="filesystem",
        SQLALCHEMY_DATABASE_URI="sqlite:///" + database_path,
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
    app.register_blueprint(util.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(run.bp)
    app.register_blueprint(parser.bp)

    return app
