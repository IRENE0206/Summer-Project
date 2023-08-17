from collections import OrderedDict
from .db import Line, Answer, db, Exercise
from flask_cors import CORS
from .grammar import Symbol, Grammar

bp = Blueprint("parser", __name__)
CORS(bp)


def get_lines_ordered_dict(exercise_id: int, user_id: int) -> OrderedDict[str, set]:
    """
    Fetch lines related to given exercise_id and user_id.
    Organize them in an ordered dict where each key is a variable and the value is a set of rules.
    """
    # Create the initial query
    lines_query = (
        db.select(Line.variable, Line.rules, Line.line_index)
        .join(Answer, Line.answer_id == Answer.answer_id)
        .join(Exercise, Exercise.exercise_id == Answer.exercise_id)
        .where(
            db.and_(
                Exercise.exercise_id == exercise_id,
                Answer.user_id == user_id
            )
        )
        .order_by(Line.line_index)
    )

    # Execute the query and get ORM objects
    result = db.session.execute(lines_query).scalars().all()

    # Process the result
    ordered_dict = OrderedDict()
    for line in result:
        variable = line.variable.strip()
        # TODO: make sure the variable is a single Capital letter
        
        if line.variable not in ordered_dict:
            ordered_dict[variable] = set()
        ordered_dict[variable].update([s.strip() for s in line.rules.split("|")])

    return ordered_dict

def transform_ordered_dict(ordered_dict: OrderedDict) -> OrderedDict:
    """
    Convert the ordered dict keys into Symbol instances and the rules into lists of Symbol instances.
    """
    new_ordered_dict = OrderedDict()
    non_terminals = ordered_dict.keys()

    for variable, rules_set in ordered_dict.items():
        rules = set()
        rules.update([ [Symbol(symbol, (symbol not in non_terminals)) for symbol in rule] for rule in rules_set])
        new_ordered_dict[Symbol(variable, False)] = rules

    return new_ordered_dict

def get_grammar(transformed_ordered_dict: OrderedDict) -> Grammar:
    """
    Convert the transformed ordered dict into a Grammar object.
    """
    return Grammar(transformed_ordered_dict)
