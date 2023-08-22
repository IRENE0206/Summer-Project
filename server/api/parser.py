from collections import OrderedDict
from .db import Line, Answer, db, Exercise
from flask import Blueprint
from flask_cors import CORS
from .grammar import Symbol, Rule, Grammar

bp = Blueprint("parser", __name__)
CORS(bp)


def get_lines_ordered_dict(exercise_id: int, user_id: int) -> OrderedDict[str, set[str]]:
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
        
        rule_set = ordered_dict.setdefault(variable, set())
        rule_set.update([s.strip() for s in line.rules.strip().split("|")])

    return ordered_dict


def process_rule(rule: str, non_terminals: set[str], terminals: dict[str, Symbol], non_terminal_symbol_instances: dict[str, Symbol]) -> Rule:
    symbols = rule.split()
    symbol_list = []
    for symbol in symbols:
        if symbol in non_terminals:
            # symbol is a non-terminal
            symbol_list.append(non_terminal_symbol_instances[symbol])
        else:
            # symbol is a terminal
            if symbol not in terminals:
                terminals[symbol] = Symbol(symbol, True)
            symbol_list.append(terminals[symbol])
    return Rule(symbol_list)


def transform_ordered_dict(ordered_dict: OrderedDict[str, set[str]]) -> OrderedDict[Symbol, set[Rule]]:
    """
    Convert the ordered dict keys into Symbol instances and the rules into a set of Rule instances.
    """
    new_ordered_dict = OrderedDict()
    non_terminals = ordered_dict.keys()
    non_terminal_symbol_instances = {non_terminal: Symbol(non_terminal, False) for non_terminal in non_terminals}
    terminals = {}

    for variable, rules_set in ordered_dict.items():
        rule_instances = {process_rule(rule, non_terminals, terminals, non_terminal_symbol_instances) for rule in rules_set}
        new_ordered_dict[non_terminal_symbol_instances[variable]] = rule_instances

    return new_ordered_dict

def get_grammar(transformed_ordered_dict: dict[Symbol, set[Rule]]) -> Grammar:
    """
    Convert the transformed ordered dict into a Grammar object.
    """
    return Grammar(transformed_ordered_dict)
