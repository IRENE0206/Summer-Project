from flask import Blueprint
from flask_cors import CORS

from .db import Line, Answer, db, Exercise
from .grammar import NonTerminal, Terminal, Rule, Grammar

bp = Blueprint("parser", __name__)
CORS(bp)


def get_grammar(exercise_id: int, user_id: int) -> Grammar:
    """
    Fetch lines related to given exercise_id and user_id.
    """
    # Create the initial query
    lines_query = (
        db.select(Line)
        .join(Answer, Line.answer_id == Answer.answer_id)
        .join(Exercise, Exercise.exercise_id == Answer.exercise_id)
        .filter(Exercise.exercise_id == exercise_id, Answer.user_id == user_id)
        .order_by(Line.line_index)
    )

    # Execute the query and get ORM objects
    result = db.session.execute(lines_query).scalars().all()

    # Process the result
    return process_lines(result)


def process_lines(lines: [Line]) -> Grammar:
    non_terminal_strings = set([line.variable.strip() for line in lines])
    # map each distinct non_terminal string with a NonTerminal instance
    non_terminal_dict = {non_terminal_string: NonTerminal() for non_terminal_string in non_terminal_strings}
    # map each distinct terminal symbol string with a Terminal instance
    terminal_dict = {}

    # the list of all the NonTerminal instances, preserving the order to differentiate the starting symbol for later use
    non_terminals = []

    for line in lines:
        variable_string = line.variable.strip()
        # TODO: make sure the variable is a single Capital letter
        rule_strings_set = set([s.strip() for s in line.rules.strip().split("|")])
        # Instantiate a Rule instance for each distinct rule string
        rules_list = [process_rule_string(rule_string, non_terminal_dict, terminal_dict) for rule_string in
                      rule_strings_set]
        # Ensure the code does not redefine non_terminal if it already exists in the dictionary
        non_terminal = non_terminal_dict[variable_string]
        [non_terminal.add_rule(rule) for rule in rules_list]

        if non_terminal not in non_terminals:
            non_terminals.append(non_terminal)

    return Grammar(non_terminals)


def process_rule_string(rule_string: str, non_terminal_dict: dict[str, NonTerminal],
                        terminal_dict: dict[str, Terminal]) -> Rule:
    symbols_list = []
    for symbol_string in rule_string:
        if symbol_string in non_terminal_dict:
            # symbol_string is a non-terminal
            symbols_list.append(non_terminal_dict[symbol_string])
        else:
            # symbol_string is a terminal
            if symbol_string not in terminal_dict:
                terminal_dict[symbol_string] = Terminal(symbol_string)
            symbols_list.append(terminal_dict[symbol_string])
    return Rule(symbols_list)
