from collections import Counter

NOT_IMPLEMENTED_ERROR_MSG = "Subclasses must implement this method."


class Symbol:
    def __init__(self):
        pass

    def is_terminal(self):
        raise NotImplementedError(NOT_IMPLEMENTED_ERROR_MSG)

    def get_shortest_string_derivable(self) -> str:
        raise NotImplementedError(NOT_IMPLEMENTED_ERROR_MSG)

    def get_all_leftmost_terminals_derivable(self) -> list[str]:
        raise NotImplementedError(NOT_IMPLEMENTED_ERROR_MSG)


class Terminal(Symbol):
    def __init__(self, string: str):
        super().__init__()
        self.string = string

    def is_terminal(self):
        return True

    # Can be used to determine if two terminal instances represent the same terminal symbol
    def is_equivalent_to(self, other_terminal: "Terminal") -> bool:
        return isinstance(other_terminal, Terminal) and (self.string == other_terminal.string)

    def get_shortest_string_derivable(self) -> str:
        return self.string

    def get_all_leftmost_terminals_derivable(self) -> [str]:
        return [self.string]


class NonTerminal(Symbol):
    def __init__(self, rules_list: ["Rule"] = None):
        super().__init__()
        self.rules_list = rules_list if rules_list else []

    def add_rule(self, rule: "Rule") -> None:
        if rule not in self.rules_list:
            self.rules_list.append(rule)

    def remove_rule(self, rule: "Rule") -> None:
        self.rules_list.remove(rule)

    def has_and_only_has_rule(self, rule_symbols: [Symbol]) -> bool:
        return len(self.rules_list) == 1 and self.rules_list[0].symbols_list == rule_symbols

    def get_all_leftmost_terminals_derivable(self) -> [Symbol]:
        return [rule.symbols_list[0].string for rule in self.rules_list]

    def get_shortest_string_derivable(self) -> str:
        shortest = ""
        min_length = float("inf")
        for rule in self.rules_list:
            shortest_from_rule = ""
            for symbol in rule.symbols_list:
                shortest_from_symbol = symbol.get_shortest_string_derivable()
                shortest_from_rule += shortest_from_symbol
            if len(shortest_from_rule) < min_length:
                shortest = shortest_from_rule
        return shortest

    def derive_terminal_symbol(self, terminal_symbol: str) -> tuple[bool, list | None]:
        # Only used after each rule is in standard form
        for rule in self.rules_list:
            first_symbol = rule.symbols_list[0]
            assert first_symbol.is_terminal()
            assert isinstance(first_symbol, Terminal)
            if first_symbol.string == terminal_symbol:
                return True, rule.symbols_list[1:]
        return False, None

    def is_terminal(self):
        return False


class Rule:
    def __init__(self, symbols_list: [Symbol] = None):
        self.symbols_list = symbols_list if symbols_list else []

    def is_unit_rule(self) -> tuple[bool, Symbol | None]:
        first_symbol = self.symbols_list[0]
        if len(self.symbols_list) != 1 or first_symbol.is_terminal():
            return False, None
        return True, first_symbol

    def has_m_handle(self) -> bool:
        return self.symbols_list[0].is_terminal()

    def has_standard_handle(self) -> tuple[bool, list[Symbol] | None]:
        if (not self.has_m_handle()) or ((len(self.symbols_list) > 1) and self.symbols_list[1].is_terminal()):
            return False, self.symbols_list[1:]
        return True, None

    def has_non_handle_terminal_symbols(self) -> tuple[bool, list[int]]:
        index_list = []
        for i in range(1, len(self.symbols_list)):
            if self.symbols_list[i].is_terminal:
                index_list.append(i)
        return (len(index_list) > 0), index_list

    def __eq__(self, other: "Rule") -> bool:
        # Only used to determine if the rule is duplicate in a given `Grammar` instance
        return isinstance(other, Rule) and (self.symbols_list == other.symbols_list)


class Grammar:

    # initiate a "Grammar" object
    def __init__(self, non_terminals: [NonTerminal]):
        # before converting, the instance just represents an ε-free LL(1) grammar
        self.is_s_grammar = False
        self.non_terminals = non_terminals

    def _eliminate_unit_rules(self) -> None:
        """
        Unit rule: rule in the form A -> B
        """
        changes_made = True  # Initialize to True to enter the loop at least once
        while changes_made:
            changes_made = False  # Reset for each iteration
            for non_terminal in self.non_terminals:
                new_rules = []  # To hold new rules that will replace unit rules
                for rule in non_terminal.rules_list:
                    is_unit_rule, unit_rule_non_terminal = rule.is_unit_rule()
                    if is_unit_rule:
                        assert isinstance(unit_rule_non_terminal, NonTerminal)
                        changes_made = True  # A change was made, so we'll need another iteration
                        new_rules.extend(unit_rule_non_terminal.rules_list)  # Replace with all Y-rules
                    else:
                        new_rules.append(rule)  # Keep the non-unit rule as is
                non_terminal.rules_list = new_rules  # Update the rules list for the non-terminal

    def _produce_m_handles(self) -> None:
        for non_terminal in self.non_terminals:
            new_rules = []  # To hold new rules that will replace existing rules
            for rule in non_terminal.rules_list:
                if rule.has_m_handle():
                    new_rules.append(rule)  # Keep the rule as is if it starts with a terminal
                else:
                    while not rule.has_m_handle():
                        first_symbol = rule.symbols_list[0]
                        assert isinstance(first_symbol, NonTerminal)
                        # Replace X with all X-rules
                        for x_rule in first_symbol.rules_list:
                            new_rules.append(Rule(x_rule.symbols_list + rule.symbols_list[1:]))
            non_terminal.rules_list = new_rules  # Update the rules list for the non-terminal

    def _produce_standard_handles(self) -> None:
        changes_made = True  # To keep track of whether any changes were made in each iteration
        while changes_made:
            changes_made = False  # Reset for each iteration
            for non_terminal in self.non_terminals:
                new_rules = []  # To hold new rules that will replace existing rules
                for rule in non_terminal.rules_list:
                    first_symbol = rule.symbols_list[0]
                    has_standard_handle, rule_symbols_remaining = rule.has_standard_handle()
                    if has_standard_handle:
                        new_rules.append(rule)  # Keep the rule as is if it has a standard handle
                    else:
                        changes_made = True  # A change is being made
                        # Check if a non-terminal already exists for the remaining symbols
                        found, existing_non_terminal = self._find_non_terminal_for_rule(rule_symbols_remaining)
                        if found:
                            new_rules.append(Rule([first_symbol, existing_non_terminal]))
                        else:
                            # Create a new non-terminal for the remaining symbols in the handle
                            new_non_terminal = NonTerminal([Rule(rule_symbols_remaining)])
                            self.non_terminals.append(new_non_terminal)
                            # Replace the rule with a new one that has a handle of length 1
                            new_rules.append(Rule([first_symbol, new_non_terminal]))
                non_terminal.rules_list = new_rules  # Update the rules list for the non-terminal

    def _find_non_terminal_for_rule(self, rule_symbols: list[Symbol]) -> tuple[bool, NonTerminal | None]:
        for non_terminal in self.non_terminals:
            if non_terminal.has_and_only_has_rule(rule_symbols):
                return True, non_terminal
        return False, None

    def _replace_non_handle_terminals(self):
        non_terminals_to_examine = self.non_terminals.copy()
        for non_terminal in non_terminals_to_examine:
            for rule in non_terminal.rules_list:
                rule_has_non_handle_terminal, index_list = rule.has_non_handle_terminal_symbols()
                if rule_has_non_handle_terminal:
                    for index in index_list:
                        terminal_symbol = rule.symbols_list[index]
                        find_existing_non_terminal, existing_non_terminal = self._find_non_terminal_for_rule(
                            [terminal_symbol])
                        if find_existing_non_terminal:
                            rule.symbols_list[index] = existing_non_terminal
                        else:
                            new_non_terminal = NonTerminal([Rule([terminal_symbol])])
                            self.non_terminals.append(new_non_terminal)
                            rule.symbols_list[index] = new_non_terminal

    def convert_to_s_grammar(self) -> None:
        if not self.is_s_grammar:
            self._eliminate_unit_rules()
            self._produce_m_handles()
            self._produce_standard_handles()
            self._eliminate_unit_rules()
            self.is_s_grammar = True

    def calculate_l(self) -> int:
        l = 0
        for non_terminal in self.non_terminals:
            l = max(l, len(non_terminal.get_shortest_string_derivable()))
        return l


def derive_terminal_symbol_from_rule(rule: list[Symbol], terminal: str) -> tuple[bool, int, list[Symbol] | None]:
    first_symbol = rule[0]
    if first_symbol.is_terminal():
        assert isinstance(first_symbol, Terminal)
        if first_symbol.string == terminal:
            return True, 0, rule[1:]
        return False, 0, None
    assert isinstance(first_symbol, NonTerminal)
    is_derivable, after_derivation = first_symbol.derive_terminal_symbol(terminal)
    return is_derivable, len(after_derivation), (after_derivation + rule[1:])


def derive_terminal_string_from_rule(rule: [Symbol], string: str) -> tuple[bool, int, list[Symbol] | None]:
    if len(rule) == 0 and len(string) > 0:
        return False, 0, None
    first_terminal_symbol = string[0]
    is_derivable, new_symbols_count, rule_after_derivation = derive_terminal_symbol_from_rule(rule,
                                                                                              first_terminal_symbol)
    if not is_derivable:
        return False, 0, None
    if len(string) == 1:
        return True, new_symbols_count, rule_after_derivation
    is_derivable, new_symbols_count_next, rule_after_derivation = derive_terminal_string_from_rule(
        rule_after_derivation, string[1:])
    return is_derivable, (new_symbols_count + new_symbols_count_next), rule_after_derivation


def calculate_l_max(g1: Grammar, g2: Grammar) -> int:
    # l_max = max{l_1, l_2}
    return max(g1.calculate_l(), g2.calculate_l())


def choose_type(l_max: int, left: list[Symbol], right: list[Symbol], prev_left_feedback: str,
                prev_right_feedback: str) -> tuple[bool, str, str]:
    if (not left) and (not right):
        return True, prev_left_feedback, prev_right_feedback

    # choose type B when equivalence pair generated has a left side of length greater than l_max + 2
    if len(left) > l_max + 2:
        return replace_type_b(l_max, left, right, prev_left_feedback, prev_right_feedback)
    return replace_type_a(l_max, left, right, prev_left_feedback, prev_right_feedback)


# type A replacement
def replace_type_a(l_max: int, left: list[Symbol], right: list[Symbol], prev_left_feedback: str,
                   prev_right_feedback: str) -> tuple[bool, str | None, str | None]:
    leftmost_terminals_derivable_left = left[0].get_all_leftmost_terminals_derivable()
    leftmost_terminals_derivable_right = right[0].get_all_leftmost_terminals_derivable()
    left_feedback = prev_left_feedback
    right_feedback = prev_right_feedback
    if Counter(leftmost_terminals_derivable_left) != Counter(leftmost_terminals_derivable_right):
        left_feedback += ([terminal_symbol for terminal_symbol in leftmost_terminals_derivable_left if
                           terminal_symbol not in leftmost_terminals_derivable_right][0])
        right_feedback += ([terminal_symbol for terminal_symbol in leftmost_terminals_derivable_right if
                            terminal_symbol not in leftmost_terminals_derivable_left][0])
        return False, left_feedback, right_feedback

    for terminal in leftmost_terminals_derivable_left:
        left_feedback = left_feedback + terminal
        right_feedback = right_feedback + terminal
        _, _, left_after_derivation = derive_terminal_symbol_from_rule(left, terminal)
        _, _, right_after_derivation = derive_terminal_symbol_from_rule(right, terminal)
        left_right_is_equivalent, left_feedback_new, right_feedback_new = choose_type(l_max=l_max,
                                                                                      left=left_after_derivation,
                                                                                      right=right_after_derivation,
                                                                                      prev_left_feedback=left_feedback,
                                                                                      prev_right_feedback=right_feedback)
        if not left_right_is_equivalent:
            return False, left_feedback_new, right_feedback_new
    return True, None, None


# type B replacement
def replace_type_b(l_max: int, left: list[Symbol], right: list[Symbol], prev_left_feedback: str,
                   prev_right_feedback: str) -> tuple[bool, str | None, str | None]:
    # t, the shortest terminal string derivable from the leftmost symbol of left side
    t = left[0].get_shortest_string_derivable()

    left_feedback = prev_left_feedback + t
    is_t_derivable_from_right, added_symbols_count, right_rule_after_derivation = derive_terminal_string_from_rule(
        right, t)
    if not is_t_derivable_from_right:
        return False, left_feedback, prev_right_feedback
    added_symbols = right_rule_after_derivation[:added_symbols_count]
    consumed_symbols = right[: max(1, len(t) - added_symbols)]
    left_1 = [left[0]] + added_symbols
    right_1 = consumed_symbols

    left_2 = left[1:]
    right_2 = right_rule_after_derivation

    is_pair_1_equivalent = choose_type(l_max, left_1, right_1, "", "")[0]
    if not is_pair_1_equivalent:
        return False, left_feedback, prev_right_feedback
    return choose_type(l_max, left_2, right_2, left_feedback, left_feedback)


def is_equivalent(g1: Grammar, g2: Grammar) -> tuple[bool, str]:
    for g in [g1, g2]:
        g.convert_to_s_grammar()
        assert g.is_s_grammar

    l_max = calculate_l_max(g1, g2)
    left_feedback = ""
    right_feedback = ""
    g1_is_equivalent_to_g2, left_feedback, right_feedback = replace_type_a(l_max, [g1.non_terminals[0]],
                                                                           [g2.non_terminals[0]], left_feedback,
                                                                           right_feedback)
    if g1_is_equivalent_to_g2:
        return True, "Congratulations! Your answer is correct"
    feedback = "Here is a string derivable from "
    if len(left_feedback) < len(right_feedback):
        feedback += "correct Grammar but not from your Grammar: " + left_feedback
    else:
        feedback += "your Grammar but not from the correct Grammar: " + right_feedback
    return False, (feedback + "\n")
