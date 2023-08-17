from collections import OrderedDict
from itertools import product
from typing import Tuple

class Symbol:
    def __init__(self, symbol: str, is_terminal: bool):
        self.symbol = symbol
        self.is_terminal = is_terminal


class Grammar:

    # initiate a "Grammar" object
    def __init__(self, content: OrderedDict):
        self.is_s_grammar = False
        self._rules = content
        self.starting_symbol = next(iter(content))

    @property
    def rules(self) -> OrderedDict:
        return self._rules
    
    @rules.setter
    def rules(self, content: OrderedDict) -> None:
        self._rules = content
    

    def _eliminate_unit_rules(self) -> None:
        """
        Eliminate all unit rules of the form A -> B
        """
        check_unit_rules = True
        while check_unit_rules:
            check_unit_rules = False
            for variable, rules_set in self.rules.items():
                for rule in list(rules_set):
                    if len(rule) == 1:
                        unit_rule = rule[0]
                        if not unit_rule.is_terminal:
                            check_unit_rules = True
                            self._rules[variable].remove(rule)
                            self._rules[variable].update(self.rules[unit_rule])
    

    def _create_m_handles(self) -> None:
        create_handles = True
        while create_handles:
            create_handles = False
            for variable, rules_set in list(self.rules.items()):
                for rule in list(rules_set):
                    first_symbol = rule[0]
                    if not first_symbol.is_terminal:
                        create_handles = True
                        self._rules[variable].remove(rule)
                        for r in self.rules[first_symbol]:
                            self._rules[variable][:0] = self.rules[first_symbol]

    def _get_min_length_handle(self) -> int:
        """Get the minimum length of the terminal string t_i on the right side of the rules."""
        min_len = float('inf')
        for rules_set in self.rules.values():
            for rule in rules_set:
                terminal_string_length = 0
                for symbol in rule:
                    # Stop counting if encounter a non-terminal
                    if not symbol.is_terminal:
                        break
                terminal_string_length += 1
                if terminal_string_length < min_len:
                    min_len = terminal_string_length 
        return min_len

    def _replace_m_handles(self) -> None:
        replace_m_handles = True
        while replace_m_handles:
            replace_m_handles = False
            for variable, rules_set in list(self.rules.items()):
                for rule in rules_set:
                    first_symbol = rule[0]
                    if len(rule) > 1 and first_symbol.is_terminal and not rule[1].is_terminal:
                        replace_m_handles = True
                        self._rules.remove(rule)
                        remaining_rule = rule[1:]
                        is_duplicate_rule, existing_rule = self._is_duplicate_rule(remaining_rule)
                        if not is_duplicate_rule:
                            self._rules[Symbol(variable.symbol + "-" + first_symbol.symbol)] = set(remaining_rule)
                        else:
                            self._rules[variable].add([first_symbol, existing_rule])
    
    def _is_duplicate_rule(self, rule: list) -> Tuple[bool, Symbol]:
        for variable, rules_set in self.rules.items():
            if len(rules_set) == 1 and rule == next(iter(rules_set)):
                return True, variable
        return False, None


    def _replace_non_handle_terminal(self):
        replace_non_handle_terminal = True
        while replace_non_handle_terminal:
            replace_non_handle_terminal = False
            for variable, rules_set in self.rules.items():
                for rule in rules_set:
                    if len(rule) > 1:
                        remaining_rule = rule[1:]
                        for i in range(len(remaining_rule)):
                            s = remaining_rule[i]
                            if not s.is_terminal:
                                replace_non_handle_terminal = True
                                is_duplicate_rule, existing_rule = self._is_duplicate_rule([s])
                                if is_duplicate_rule:
                                    rule[i] = existing_rule
                                else:
                                    rules_set[Symbol(s.symbol, False)] = symbol


    def _convert_to_s_grammar(self) -> None:
        self._eliminate_unit_rules()
        self._create_m_handles()
        self._replace_m_handles()
        self._replace_non_handle_terminal()
        self.is_s_grammar = True
        

    def _find_shortest_string_derivable_from_symbol(self, symbol: Symbol) -> str:
        if symbol.is_terminal:
            return symbol.symbol
        
        shortest = ""
        min_length = float(inf)
        for rule in self.rules[symbol]:
            shortest_from_rule = ""
            for s in rule:
                shortest_from_s = self._find_shortest_string_derivable_from_symbol(s)
                shortest_from_rule += shortest_from_s
            if len(shortest_from_rule) < min_length:
                shortest = shortest_from_rule
        return shortest


    def _derive_terminal_symbol_from_non_terminal(self, non_terminal: Symbol, terminal: str) -> Tuple(bool, list):
        for rule in self.rules[non_terminal]:
            first_symbol = rule[0]
            if first_symbol.is_terminal:
                return (first_symbol.symbol == terminal), rule[1:]
            is_derivable, rule_after_derivation = self._derive_terminal_symbol_from_non_terminal(first_symbol, terminal)
            if is_derivable:
                return True, rule_after_derivation
        return False, [non_terminal]


    def _derive_terminal_symbol_from_rule(self, rule: list, terminal: str) -> Tuple(bool, list):
        first_symbol = rule[0]
        if first_symbol.is_terminal:
            if first_symbol.symbol == terminal_symbol:
                return True, rule[1:]
            return False, rule
        return self._derive_terminal_symbol_from_non_terminal(first_symbol, terminal) + rule[1:]


    def _derive_terminal_string_from_rule(self, rule: list, string: str) -> Tuple(bool, list):
        if len(rule) == 0 and len(string) > 0:
            return False, []
        first_terminal_symbol = string[0]
        is_derivable, rule_after_derivation = self._derive_terminal_symbol_from_rule(rule, first_terminal_symbol)
        if not is_derivable:
            return False, rule_after_derivation
        elif len(string) == 1:
            return True, rule_after_derivation
        return self._derive_terminal_string_from_rule(rule_after_derivation, string[1:])


    # l(k) = length of the shortest terminal string derivable from the kth non-terminal symbol of "Grammar" G
    # l = max{l(k)}
    def calculate_l(self) -> int:
        max_length = 0
        for variable in self.rules.keys():
            shortest_derivable = self._find_shortest_string_derivable_from_symbol(variable)
            lk = len(shortest_derivable)
            if lk > max_length:
                max_length = lk
        return max_length

    # If S1 ≡ S2 then each leftmost terminal symbol,
    # derivable from S1 must also be a leftmost symbol derivable from S2, and vice-versa
    def replace_type_a(self, answer: "Grammar", left: str, right: str, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
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


    def _replace_type_b(self, answer: "Grammar", left: list, right: list, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
            # type B replacement
            # t, the shortest terminal string derivable from the leftmost non terminal
            t = self._find_shortest_string_derivable_from_symbol(left[0])
            
            new_left_feedback = left_feedback + t
            is_t_derivable, right_rule_after_derivation = answer._derive_terminal_string_from_rule(right, t)
            if not is_t_derivable:
                return False, new_left_feedback, right_feedback
            left_new = left[1:]
            right_new = right_rule_after_derivation
            new_right_feedback = right_feedback + t
            return self.choose_type(answer, left_new, right_new, new_left_feedback, new_right_feedback)


    def _choose_type(self, answer: "Grammar", left: list, right: list, left_feedback: str, right_feedback: str) -> Tuple[bool, str, str]:
            if not left and not right:
                return True, left_feedback, right_feedback
            # equivalence pair generated has a left side of length greater than l_max + 2
            left_leftmost = left[0]
            if not left_leftmost.is_terminal and len(left) > l_max + 2:
                return self._replace_type_b(answer, left, right, left_feedback, right_feedback)
            right_leftmost = right[0]
            if left_leftmost.is_terminal and right_leftmost.is_terminal:
                new_feedback_left = left_feedback + left_leftmost.symbol
                new_feedback_right = right_feedback + right_leftmost.symbol
                if left_leftmost.symbol == right_leftmost.symbol:
                    return self._choose_type(answer, left[1:], right[1:], new_feedback_left, new_feedback_right)
                return False, new_feedback_left, new_feedback_right
            return self._replace_type_a(answer, left, right, left_feedback, right_feedback)

    def is_equivalent_to(self, answer: "Grammar") -> str:
        feedback_left = ""
        feedback_right = ""
        l_max = max(self.calculate_l(), answer.calculate_l())   
        
        is_equivalent, new_feedback_left, new_feedback_right = self._choose_type(
            answer,
            self.starting_symbol,
            answer.starting_symbol,
            feedback_left,
            feedback_right
        )
        if is_equivalent:
            return ""
        feedback = ""
        if len(new_feedback_left) < len(new_feedback_right):
            feedback = "Here is a string derivable from correct Grammar but not from your Grammar " + new_feedback_left + "\n"
        else:
            feedback = "Here is a string derivable from your Grammar but not from the correct Grammar " + feedback_right + "\n"
        return feedback


    # TODO: Additional short-cuts by the use of Lemmas 10-13 directly?
