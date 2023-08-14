from collections import OrderedDict
from itertools import product
from typing import Tuple


class Grammar:

    # initiate a "Grammar" object
    def __init__(self, content: OrderedDict):
        self._rules = OrderedDict()
        self.starting_symbol = first_variable
        self.add_rule(first_variable, first_string)

    @property
    def rules(self):
        return self._rules

    # add rules to the "Grammar" object
    def _add_rule(self, variable: str, string: str) -> None:
        if variable not in self.rules:
            self._rules[variable] = set()
        self._rules[variable].update([s.strip() for s in string.split("|")])

    def _eliminate_unit_rules(self) -> None:
        # eliminate all unit rules of the form A -> B
        check_unit_rules = True
        while check_unit_rules:
            check_unit_rules = False
            for variable, rules in self.rules:
                for rule in rules:
                    if len(rule) == 1 and variable in self.rules.keys():
                        check_unit_rules = True
                        self._rules[variable].remove(rule)
                        self._rules[variable].update(self.rules[rule])
    
    def _create_m_handles(self) -> None:
        create_handles = True
        while create_handles:
            create_handles = False
            for variable, rules in self.rules:
                for rule in rules:
                    first_symbol = rule[0]
                    if len(rule) > 1 and first_symbol in self.rules.keys():
                        create_handles = True
                        for r in self.rules[first_symbol]:
                            self._rules[variable].remove(rule)
                            self._rules[variable].add(r + rule[1:])

    def _formalize(self) -> None:
        self._eliminate_unit_rules()
        self._create_m_handles()
        
        # replace with set of rules


    def _generate_new_non_terminal(self) -> str:
        return ""

    def find_shortest_derivable(self, variable: str, memo: dict) -> set:
        if memo is None:
            memo = {}
        if variable in memo:
            return memo[variable]
        elif variable not in self.rules.keys():
            return {variable}

        memo[variable] = set()
        shortest_strings = set()
        shortest_length = float("inf")
        symbol_rules = self.rules[variable]
        for rule in symbol_rules:
            for symbol in rule:
                derived_sets = [self.find_shortest_derivable(v, memo) for v in rule]
                if any(not s for s in derived_sets):
                    continue
                combinations = product(*derived_sets)
                derived_strings = {"".join(combination) for combination in combinations}
                
                derived_length = len(next(iter(derived_strings)))
                if derived_length < shortest_length:
                    shortest_strings = derived_strings
                    shortest_length = derived_length
                elif derived_length == shortest_length:
                    shortest_strings.update(derived_strings)
        memo[variable] = shortest_strings
        return shortest_strings

    def get_leftmost_terminals_derivable(self, symbol: str) -> set:
        terminals = set()
        if symbol in self.rules.keys():
            terminals.update([r[0] for r in self.rules[symbol]])
        else:
            terminals.add(symbol)
        return terminals

    def is_symbol_derivable_from_rule(self, rule: str, symbol: str) -> bool:
        leftmost_symbol = rule[0]
        if leftmost_symbol == symbol:
            return True
        if leftmost_symbol not in self.rules.keys():
            return False
        for r in self.rules[leftmost_symbol]:
            if self.is_symbol_derivable_from_rule(r, symbol):
                return True
        return False

    def get_after_leftmost_derive(self, rule: str, symbol: str) -> str:
        leftmost_symbol = rule[0]
        rule_remain = rule[1:]
        if leftmost_symbol != symbol:
            for r in self.rules[leftmost_symbol]:
                if self.is_symbol_derivable_from_rule(r, symbol):
                    rule_remain = self.get_after_leftmost_derive(r, symbol) + rule_remain
                    break
        return rule_remain

    def is_string_derivable_from_rule(self, rule: str, string: str) -> bool:
        if len(rule) == 0 and len(string) > 0:
            return False
        first_terminal_symbol = string[0]
        if not self.is_symbol_derivable_from_rule(rule, first_terminal_symbol):
            return False
        elif len(string) == 1:
            return True
        return self.is_string_derivable_from_rule(self.get_after_leftmost_derive(rule, first_terminal_symbol), string[1:])

    def get_after_string_derive(self, rule: str, string: str) -> str:
        if len(string) == 1:
            return self.get_after_leftmost_derive(rule, string)
        return self.get_after_string_derive(self.get_after_leftmost_derive(rule, string[0]), string[1:])

    # l(k) = length of the shortest terminal string derivable from the kth non-terminal symbol of "Grammar" G
    # l = max{l(k)}
    def calculate_l(self) -> int:
        max_length = 0
        for variable in self.rules:
            shortest_derivable = self.find_shortest_derivable(variable, None)
            lk = len(next(iter(shortest_derivable)))
            if lk > max_length:
                max_length = lk
        return max_length

    # If S1 ≡ S2 then each leftmost terminal symbol,
    # derivable from S1 must also be a leftmost symbol derivable from S2, and vice-versa
    def replace_type_a(left: str, right: str, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
        # type A replacement
        leftmost_terminals_derivable_left = self.get_leftmost_terminals_derivable(left[0])
        leftmost_terminals_derivable_right = answer.get_leftmost_terminals_derivable(right[0])
        
        if leftmost_terminals_derivable_left != leftmost_terminals_derivable_right:
            left_feedback += next(iter(leftmost_terminals_derivable_left - leftmost_terminals_derivable_right))
            right_feedback += next(iter(leftmost_terminals_derivable_right - leftmost_terminals_derivable_left))
            return False, left_feedback, right_feedback
        
        for terminal in leftmost_terminals_derivable_left:
            left_feedback += terminal
            right_feedback += terminal
            left_new = self.get_after_leftmost_derive(left, terminal)
            right_new = answer.get_after_leftmost_derive(right, terminal)
            result, left_feedback, right_feedback = choose_type(left_new, right_new, left_feedback, right_feedback)
            if not result:
                return False, left_feedback, right_feedback
        return True, left_feedback, right_feedback

    def is_equivalent_to(self, answer: 'Grammar') -> str:
        feedback_string_in_left = ""
        feedback_string_in_right = ""
        l_max = max(self.calculate_l(), answer.calculate_l())

        def choose_type(left: str, right: str, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
            if left == "" and right == "":
                return True, left_feedback, right_feedback
            # equivalence pair generated has a left side of length greater than l_max + 2
            if left[0] in self.rules.keys() and len(left) > l_max + 2:
                return replace_type_b(left, right, left_feedback, right_feedback)
            return replace_type_a(left, right, left_feedback, right_feedback)


        def replace_type_b(left: str, right: str, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
            # type B replacement
            # t, the shortest terminal string derivable from the leftmost non terminal
            t_set = self.find_shortest_derivable(left[0], None)
            
            for t in t_set:
                left_feedback += t
                if not answer.is_string_derivable_from_rule(right, t):
                    return False, left_feedback, right_feedback
                left_new = left[1:]
                right_new = answer.get_after_string_derive(right, t)
                result, left_feedback, right_feedback = choose_type(left_new, right_new, left_feedback, right_feedback)
                if not result:
                    return False, left_feedback, right_feedback
            return True, left_feedback, right_feedback
                
        
        result, feedback_string_in_left, feedback_string_in_right = choose_type(
            self.starting_symbol,
            answer.starting_symbol,
            feedback_string_in_left,
            feedback_string_in_right
        )
        if result:
            return ""
        feedback = ""
        if feedback_string_in_left != "":
            feedback = "Here is a string derivable from correct Grammar but not from your Grammar " + feedback_string_in_left + "\n"
        if feedback_string_in_right != "":
            feedback += "Here is a string derivable from your Grammar but not from the correct Grammar " + feedback_string_in_right + "\n"
        return feedback


    # TODO: Additional short-cuts by the use of Lemmas 10-13 directly?
