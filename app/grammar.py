from collections import OrderedDict


class Grammar:

    def __int__(self, first_variable: str, first_string: str):
        self._rules = OrderedDict()
        self.starting_symbol = first_variable
        self.add_rule(first_variable, first_string)

    @property
    def rules(self):
        return self._rules

    def add_rule(self, variable: str, string: str) -> None:
        if variable not in self.rules:
            self._rules[variable] = []
        self._rules[variable].extend([s.strip() for s in string.split("|")])

    def is_non_terminal_symbol(self, symbol: str) -> bool:
        return symbol in self.rules

    # l = max{l(k)}
    def calculate_l(self) -> int:
        max_length = 0
        for variable in self.rules:
            lk = len(self.find_shortest_derivable(variable))
            if max_length == 0 or lk > max_length:
                max_length = lk
        return max_length

    def find_shortest_derivable(self, variable: str) -> str:
        shortest_string = ""
        for rule in self.rules[variable]:
            string = ""
            shortest_length = len(shortest_string)
            for symbol in rule:
                if 0 < shortest_length <= len(string):
                    break
                elif self.is_non_terminal_symbol(symbol):
                    string += self.find_shortest_derivable(symbol)
                else:
                    string += symbol
            if shortest_length == 0 or len(string) < shortest_length:
                shortest_string = string
        return shortest_string

    def is_equivalent_to(self, answer: 'Grammar') -> bool:
        # Whenever an equivalence pair thus generated has a left side of length
        # greater than l+2, a type B replacement is made,

        l_max = max(self.calculate_l(), answer.calculate_l())

        def choose_type(left: str, right: str) -> bool:
            if len(left) > l_max + 2:
                return replace_type_b(left, right)
            return replace_type_a(left, right)

        # If S1 ≡ S2 then each terminal symbol,
        # the leftmost symbol derivable from S1 must also be a leftmost symbol derivable from S2, and vice-versa
        def replace_type_a(left: str, right: str) -> bool:
            # type A replacement
            leftmost_terminals_derivable_left = self.get_leftmost_terminals_derivable(left[0])
            leftmost_terminals_derivable_right = self.get_leftmost_terminals_derivable(right[0])
            if leftmost_terminals_derivable_left != leftmost_terminals_derivable_right:
                return False
            for terminal in leftmost_terminals_derivable_left:
                left_new = self.get_after_leftmost_derive(left, terminal)
                right_new = answer.get_after_leftmost_derive(right, terminal)
                if not choose_type(left_new, right_new):
                    return False
            return True

        def replace_type_b(left: str, right: str) -> bool:
            # type B replacement
            # t, the shortest terminal string derivable from X1
            t = self.find_shortest_derivable(left[0])
            if not answer.is_string_derivable_from_rule(right, t):
                return False
            left_new = left[1:]
            right_new = answer.get_after_string_derive(right, t)
            return choose_type(left_new, right_new)

        return choose_type(self.starting_symbol, answer.starting_symbol)

    def get_leftmost_terminals_derivable(self, symbol: str) -> set:
        terminals = set()
        if self.is_non_terminal_symbol(symbol):
            terminals.add([self.get_leftmost_terminals_derivable(s[0]) for s in self.rules[symbol]])
        else:
            terminals.add(symbol)
        return terminals

    def get_after_leftmost_derive(self, rule: str, symbol: str) -> str:
        leftmost_symbol = rule[0]
        rule_remain = rule[1:]
        if leftmost_symbol != symbol:
            for r in self.rules[leftmost_symbol]:
                if self.is_symbol_derivable_from_rule(r, symbol):
                    rule_remain = self.get_after_leftmost_derive(r, symbol) + rule_remain
                break
        return rule_remain

    def is_symbol_derivable_from_rule(self, rule: str, symbol: str) -> bool:
        leftmost_symbol = rule[0]
        if leftmost_symbol == symbol:
            return True
        for r in self.rules[leftmost_symbol]:
            if self.is_symbol_derivable_from_rule(r, symbol):
                return True
        return False

    def is_string_derivable_from_rule(self, rule: str, string: str) -> bool:
        first_terminal_symbol = string[0]
        if not self.is_symbol_derivable_from_rule(rule, first_terminal_symbol):
            return False
        return self.is_string_derivable_from_rule(self.get_after_leftmost_derive(rule, first_terminal_symbol), string[1:])

    def get_after_string_derive(self, rule: str, string: str) -> str:
        if len(string) == 1:
            return self.get_after_leftmost_derive(rule, string)
        return self.get_after_string_derive(self.get_after_leftmost_derive(rule, string[0]), string[1:])

    # TODO: Additional short-cuts by the use of Lemmas 10-13 directly?
