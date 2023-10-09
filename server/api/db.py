from enum import Enum

from flask_sqlalchemy import SQLAlchemy

# Create the extension
db = SQLAlchemy()


class UserRole(Enum):
    ADMIN = "admin"
    REGULAR = "regular"


USER = "User"
WORKBOOK = "Workbook"
EXERCISE = "Exercise"
ANSWER = "Answer"
LINE = "Line"
DYNAMIC = "dynamic"
CASCADE_OPTION = "all, delete-orphan"


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)

    # Relationships
    answers = db.relationship(ANSWER, back_populates="user", lazy=DYNAMIC)


class Workbook(db.Model):
    workbook_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    workbook_name = db.Column(db.String, unique=True, nullable=False)
    release_date = db.Column(db.DateTime)

    # Relationships
    exercises = db.relationship(EXERCISE, back_populates="workbook", cascade=CASCADE_OPTION)


class Exercise(db.Model):
    exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    exercise_index = db.Column(db.Integer, nullable=False)
    exercise_number = db.Column(db.String, nullable=False)
    exercise_content = db.Column(db.String, nullable=False)
    workbook_id = db.Column(db.Integer, db.ForeignKey("workbook.workbook_id"), nullable=False)

    # Relationships
    workbook = db.relationship(WORKBOOK, back_populates="exercises")
    answers = db.relationship(ANSWER, back_populates="exercise", lazy=DYNAMIC, cascade=CASCADE_OPTION)


class Answer(db.Model):
    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # feedback generated in the equivalence checking algorithm
    feedback = db.Column(db.String, nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercise.exercise_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    # Relationships
    user = db.relationship(USER, back_populates="answers")
    exercise = db.relationship(EXERCISE, back_populates="answers")
    lines = db.relationship(LINE, back_populates="answer", lazy=DYNAMIC, cascade=CASCADE_OPTION)


class Line(db.Model):
    line_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_index = db.Column(db.Integer, nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey("answer.answer_id"), nullable=False)
    # The user input before the "→" in a line of grammar
    variable = db.Column(db.String, nullable=False)
    # The user input after the "→" in a line of grammar
    rules = db.Column(db.String, nullable=False)

    # Relationships
    answer = db.relationship(ANSWER, back_populates="lines")
