from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, Text, CheckConstraint
from sqlalchemy.dialects.sqlite import DATE

# create the extension
db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = "users"
    user_id = db.Column(Integer, primary_key=True, autoincrement=True)
    username = db.Column(Text, unique=True, nullable=False)
    password = db.Column(Text, nullable=False)
    role = db.Column(Text, nullable=False)
    __table_args__ = (
        CheckConstraint("role IN ('admin', 'regular')"),
    )


class Workbooks(db.Model):
    __tablename__ = "workbooks"
    workbook_id = db.Column(Integer, primary_key=True, autoincrement=True)
    workbook_name = db.Column(Text, unique=True, nullable=False)
    release_date = db.Column(DATE)
    last_edit = db.Column(DATE, nullable=False)


class Exercises(db.Model):
    __tablename__ = "exercises"
    exercise_id = db.Column(Integer, primary_key=True, autoincrement=True)
    exercise_number = db.Column(Text, nullable=False)
    exercise_content = db.Column(Text, nullable=False)
    workbook_id = db.Column(Integer, db.ForeignKey("workbooks.workbook_id"), nullable=False)


class Answers(db.Model):
    __tablename__ = "answers"
    answer_id = db.Column(Integer, primary_key=True, autoincrement=True)
    feedback = db.Column(Text)
    exercise_id = db.Column(Integer, db.ForeignKey("exercises.exercise_id"), nullable=False)
    user_id = db.Column(Integer, db.ForeignKey("users.user_id"), nullable=False)

class Lines(db.Model):
    __tablename__ = "lines"
    line_id = db.Column(Integer, primary_key=True, autoincrement=True)
    line_index = db.Column(Integer)
    answer_id = db.Column(Integer, db.ForeignKey("answers.answer_id"), nullable=False)
    variable = db.Column(Text)
    rules = db.Column(Text)