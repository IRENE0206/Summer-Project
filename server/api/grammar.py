class Symbol:
    def __init__(self):
        pass

    def is_terminal(self):
        raise NotImplementedError("Subclasses must implement this method.")
    
    def get_shortest_string_derivable(self) -> str:
        raise NotImplementedError("Subclasses must implement this method.")
    
    def get_all_leftmost_terminals_derivable(self) -> list[str]:
        raise NotImplementedError("Subclasses must implement this method.")


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

    def get_all_leftmost_terminals_derivable(self) -> list[str]:
        return [self.string]


class NonTerminal(Symbol):
    def __init__(self, rules_list: list["Rule"] = []):
        super().__init__()
        self.rules_list = rules_list if rules_list else []


    def add_rule(self, rule: "Rule"):
        if rule not in self.rules_list:
            self.rules_list.append(rule)


    def remove_rule(self, rule: "Rule"):
        self.rules_list.remove(rule)


    def has_and_only_has_rule(self, rule_symbols: list[Symbol]) -> bool:
        return len(self.rules_list) == 1 and self.rules_list[0].symbols_list == rule_symbols


    def get_all_leftmost_terminals_derivable(self) -> list[str]:
        # Only after converting to S-grammar
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


    def is_terminal(self):
        return False


class Rule:
    def __init__(self, symbols_list: list[Symbol] = []):
        self.symbols_list = symbols_list if symbols_list else []

    def is_unit_rule(self) -> tuple[bool, NonTerminal]:
        first_symbol = self.symbols_list[0]
        if len(self.symbols_list) != 1 or first_symbol.is_terminal():
            return False, None
        return True, first_symbol
    
    def has_m_handle(self) -> bool:
        return self.symbols_list[0].is_terminal

    def has_standard_handle(self) -> tuple[bool, list[Symbol]]:
        if (not self.has_m_handle()) or ((len(self.symbols_list) > 1) and self.symbols_list[1].is_terminal()):
            return False, self.symbols_list[1:]
        return  True, None
    
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
    def __init__(self, non_terminals: list[NonTerminal]):
        # before converting, the instance just represents an ε-free LL(1) grammar
        self.is_s_grammar = False
        self.non_terminals = non_terminals

    def _eliminate_unit_rules(self) -> None:
        """
        Unit rule: rule in the form A -> B
        """
        non_terminals_to_examine = self.non_terminals.copy()
        non_terminals_examined = []
        while len(non_terminals_examined) > 0:
            non_terminals_examined = []
            for non_terminal in non_terminals_to_examine:
                has_unit_rules = False
                for rule in non_terminal.rules_list:
                    is_unit_rule, unit_rule_non_terminal = rule.is_unit_rule()
                    if is_unit_rule:
                        has_unit_rules = True
                        non_terminal.remove_rule(rule)
                        [non_terminal.add_rule(r) for r in unit_rule_non_terminal.rules_list]
                if not has_unit_rules:
                    non_terminals_examined.append(non_terminal)
            [non_terminals_to_examine.remove(n) for n in non_terminals_examined]


    def _produce_m_handles(self) -> None:
        for non_terminal in self.non_terminals:
            rules_to_examine = non_terminal.rules_list.copy()
            rules_examined = []
            while len(rules_to_examine) > 0:
                rules_examined = []
                for rule in rules_to_examine:
                    if rule.has_m_handle():
                        rules_examined.append(rule)
                    else:
                        first_symbol = rule.symbols_list[0]
                        # first_symbol is a NonTerminal
                        rule.symbols_list[:0] = first_symbol.rules_list
                [rules_to_examine.remove(r) for r in rules_examined]


    def _produce_standard_handles(self) -> None:
        non_terminals_to_examine = self.non_terminals.copy()
        non_terminals_examined = []
        while len(non_terminals_to_examine) > 0:
            non_terminals_examined = []
            for non_terminal in non_terminals_to_examine:
                rules_to_examine = non_terminal.rules_list.copy()
                rules_examined = []
                while len(rules_to_examine) > 0:
                    rules_examined = []
                    for rule in rules_to_examine:
                        first_symbol = rule.symbols_list[0]
                        has_standard_handle, rule_symbols_remaining = rule.has_standard_handle()
                        if has_standard_handle:
                            rules_examined.append(rule)
                        else:
                            find_existing_non_terminal, existing_non_terminal = self._find_non_terminal_for_rule(rule_symbols_remaining)
                            if find_existing_non_terminal:
                                rule.symbols_list = [first_symbol, existing_non_terminal]
                            else:
                                new_non_terminal = NonTerminal([Rule(rule_symbols_remaining)])
                                rule.symbols_list = [first_symbol, new_non_terminal]
                                self.non_terminals.append(new_non_terminal)
                                non_terminals_to_examine.append(new_non_terminal)
            [non_terminals_to_examine.remove(n) for n in non_terminals_examined]


    def _find_non_terminal_for_rule(self, rule_symbols: list[Symbol]) -> tuple[bool, NonTerminal]:
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
                        terminal_symbol = rule.symbols_list[i]
                        find_existing_non_terminal, existing_non_terminal = self._find_non_terminal_for_rule([terminal_symbol])
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
        


    def _derive_terminal_symbol_from_non_terminal(self, non_terminal: Symbol, terminal: str) -> tuple[bool, list]:
        for rule in self.rules[non_terminal]:
            first_symbol = rule[0]
            if first_symbol.is_terminal:
                return (first_symbol.symbol == terminal), rule[1:]
            is_derivable, rule_after_derivation = self._derive_terminal_symbol_from_non_terminal(first_symbol, terminal)
            if is_derivable:
                return True, rule_after_derivation
        return False, [non_terminal]


    def _derive_terminal_symbol_from_rule(self, rule: list, terminal: str) -> tuple[bool, list]:
        first_symbol = rule[0]
        if first_symbol.is_terminal:
            if first_symbol.symbol == terminal:
                return True, rule[1:]
            return False, rule
        is_derivable, after_derivation = self._derive_terminal_symbol_from_non_terminal(first_symbol, terminal)
        return is_derivable, (after_derivation + rule[1:])


    def _derive_terminal_string_from_rule(self, rule: list, string: str) -> tuple[bool, list]:
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
    def _replace_type_a(self, answer: "Grammar", l_max: int, left: list[Symbol], right: list[Symbol], left_feedback: str, right_feedback: str) -> tuple[bool, str, str]:
        # type A replacement
        leftmost_terminals_derivable_left = left[0].get_all_leftmost_terminals_derivable()
        leftmost_terminals_derivable_right = right[0].get_all_leftmost_terminals_derivable()
        left_feedback_new = left_feedback
        right_feedback_new = right_feedback
        if leftmost_terminals_derivable_left != leftmost_terminals_derivable_right:
            left_feedback_new += [leftmost_terminals_derivable_left - leftmost_terminals_derivable_right][0]
            right_feedback_new += [leftmost_terminals_derivable_right - leftmost_terminals_derivable_left][0]
            return False, left_feedback_new, right_feedback_new
        
        for terminal in leftmost_terminals_derivable_left:
            left_feedback_new = left_feedback + terminal
            right_feedback_new = right_feedback + terminal
            left_is_derivable, left_after_derivation = self._derive_terminal_symbol_from_rule(left, terminal)
            right_is_derivable, right_after_derivation = answer._derive_terminal_symbol_from_rule(right, terminal)
            is_equivalent, left_feedback_new, right_feedback_new = self._choose_type(answer, l_max, left_new, right_rule_after_derivation, left_feedback_new, right_feedback_new)
            if not is_equivalent:
                return False, left_feedback_new, right_feedback_new
        return True, left_feedback_new, right_feedback_new


    def _replace_type_b(self, answer: "Grammar", l_max: int, left: list[Symbol], right: list[Symbol], left_feedback: str, right_feedback: str) -> tuple[bool, str, str]:
            # type B replacement
            # t, the shortest terminal string derivable from the leftmost non terminal
            t = self._find_shortest_string_derivable_from_symbol(left[0])
            
            new_left_feedback = left_feedback + t
            is_t_derivable, right_rule_after_derivation = answer._derive_terminal_string_from_rule(right, t)
            if not is_t_derivable:
                return False, new_left_feedback, right_feedback
            left_new = left[1:]
            
            new_right_feedback = right_feedback + t
            return self._choose_type(answer, l_max, left_new, right_rule_after_derivation, new_left_feedback, new_right_feedback)


    def _choose_type(self, answer: "Grammar", l_max: int, left: list[Symbol], right: list[Symbol], left_feedback: str, right_feedback: str) -> tuple[bool, str, str]:
            if not left and not right:
                return True, left_feedback, right_feedback
            # equivalence pair generated has a left side of length greater than l_max + 2
            left_leftmost = left[0]
            left_leftmost_is_terminal = left_leftmost.is_terminal()
            if not left_leftmost_is_terminal and len(left) > l_max + 2:
                return self._replace_type_b(answer, left, right, left_feedback, right_feedback)
            right_leftmost = right[0]
            if left_leftmost.is_terminal and right_leftmost.is_terminal:
                new_feedback_left = left_feedback + left_leftmost.symbol
                new_feedback_right = right_feedback + right_leftmost.symbol
                if left_leftmost.symbol == right_leftmost.symbol:
                    return self._choose_type(answer, l_max, left[1:], right[1:], new_feedback_left, new_feedback_right)
                return False, new_feedback_left, new_feedback_right
            return self._replace_type_a(answer, l_max, left, right, left_feedback, right_feedback)


    def is_equivalent_to(self, correct_grammar: "Grammar") -> tuple[bool, str]:
        self.convert_to_s_grammar()
        correct_grammar.convert_to_s_grammar()

        left_feedback = ""
        right_feedback = ""
        l_max = max(self.calculate_l(), correct_grammar.calculate_l())   
        
        is_equivalent, updated_left_feedback, updated_right_feedback = self._replace_type_a(
            correct_grammar,
            l_max,
            self.non_terminals[0].rules_list,
            correct_grammar.non_terminals[0].rules_list,
            left_feedback,
            right_feedback
        )

        if is_equivalent:
            return True, "Congratulations! Your answer is correct"
        feedback = "Here is a string derivable from "
        if len(updated_left_feedback) < len(updated_right_feedback):
            feedback += "correct Grammar but not from your Grammar: " + updated_left_feedback
        else:
            feedback += "your Grammar but not from the correct Grammar: " + updated_right_feedback
        return False, (feedback + "\n")


    # TODO: Additional short-cuts by the use of Lemmas 10-13 directly?
