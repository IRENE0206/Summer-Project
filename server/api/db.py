from flask_sqlalchemy import SQLAlchemy
from .util import UserRole

# Create the extension
db = SQLAlchemy()


class User(db.Model):  
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    username = db.Column(db.String, unique=True, nullable=False)  
    password = db.Column(db.String, nullable=False)  
    role = db.Column(db.Enum(UserRole), nullable=False)

    # Relationships
    answers = db.relationship("Answer", back_populates="user")


class Workbook(db.Model): 
    workbook_id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    workbook_name = db.Column(db.String, unique=True, nullable=False)  
    release_date = db.Column(db.Date) 
    last_edit = db.Column(db.Date, nullable=False) 

    # Relationships
    exercises = db.relationship("Exercise", back_populates="workbook", lazy='dynamic')


class Exercise(db.Model): 
    exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    exercise_number = db.Column(db.String, nullable=False) 
    exercise_content = db.Column(db.String, nullable=False) 
    workbook_id = db.Column(db.Integer, db.ForeignKey("workbook.workbook_id"), nullable=False)

    # Relationships
    workbook = db.relationship("Workbook", back_populates="exercises")
    answers = db.relationship("Answer", back_populates="exercise", lazy='dynamic')


class Answer(db.Model): 
    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    feedback = db.Column(db.String, nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercise.exercise_id"), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="answers")
    exercise = db.relationship("Exercise", back_populates="answers")
    lines = db.relationship("Line", back_populates="answer", lazy='dynamic')


class Line(db.Model): 
    line_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_index = db.Column(db.Integer, nullable=False) 
    answer_id = db.Column(db.Integer, db.ForeignKey("answer.answer_id"), nullable=False)  
    variable = db.Column(db.String, nullable=False) 
    rules = db.Column(db.String, nullable=False)

    # Relationships
    answer = db.relationship("Answer", back_populates="lines")
