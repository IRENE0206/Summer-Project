from flask_sqlalchemy import SQLAlchemy

# create the extension
db = SQLAlchemy()

class Users(db.Model):  
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    username = db.Column(db.String, unique=True, nullable=False)  
    password = db.Column(db.String, nullable=False)  
    role = db.Column(db.String, nullable=False)  
    __table_args__ = (
        db.CheckConstraint("role IN ('admin', 'regular')"),  
    )


class Workbooks(db.Model): 
    workbook_id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    workbook_name = db.Column(db.String, unique=True)  
    release_date = db.Column(db.Date) 
    last_edit = db.Column(db.Date, nullable=False) 


class Exercises(db.Model): 
    exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    exercise_number = db.Column(db.String) 
    exercise_content = db.Column(db.String) 
    workbook_id = db.Column(db.Integer, db.ForeignKey("workbooks.workbook_id"), nullable=False) 


class Answers(db.Model): 
    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    feedback = db.Column(db.String)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.exercise_id"), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)  

class Lines(db.Model): 
    line_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_index = db.Column(db.Integer, nullable=False) 
    answer_id = db.Column(db.Integer, db.ForeignKey("answers.answer_id"), nullable=False)  
    variable = db.Column(db.String) 
    rules = db.Column(db.String)