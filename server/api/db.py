from flask_sqlalchemy import SQLAlchemy
from .util import UserRole

# create the extension
db = SQLAlchemy()

class User(db.Model):  
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    username = db.Column(db.String, unique=True, nullable=False)  
    password = db.Column(db.String, nullable=False)  
    role = db.Column(db.Enum(UserRole), nullable=False)
    answers = db.relationship("Answer", back_populates="user")
    __table_args__ = (
        db.CheckConstraint(f"role IN ({', '.join([f'{repr(role.value)}' for role in UserRole])})"),  
    )

class Workbook(db.Model): 
    workbook_id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    workbook_name = db.Column(db.String, unique=True, nullable=False)  
    release_date = db.Column(db.Date) 
    last_edit = db.Column(db.Date, nullable=False) 
    exercises = db.relationship("Exercise", back_populates="workbook")

class Exercise(db.Model): 
    exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    exercise_number = db.Column(db.String, nullable=False) 
    exercise_content = db.Column(db.String, nullable=False) 
    workbook_id = db.Column(db.Integer, db.ForeignKey("workbook.workbook_id"), nullable=False)
    workbook = db.relationship("Workbook", back_populates="exercises")
    answers = db.relationship("Answer", back_populates="exercise")

class Answer(db.Model): 
    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    feedback = db.Column(db.String, nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercise.exercise_id"), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    user = db.relationship("User", back_populates="answers")
    exercise = db.relationship("Exercise", back_populates="answer")
    lines = db.relationship("Line", back_populates="answer")

class Line(db.Model): 
    line_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_index = db.Column(db.Integer, nullable=False) 
    answer_id = db.Column(db.Integer, db.ForeignKey("answer.answer_id"), nullable=False)  
    variable = db.Column(db.String, nullable=False) 
    rules = db.Column(db.String, nullable=False)
    answer = db.relationship("Answer", back_populates="lines")
