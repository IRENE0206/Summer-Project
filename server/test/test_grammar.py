import os

os.environ['ADMIN_USERNAME'] = 'gn22297'

from server.api.grammar import Terminal, NonTerminal, Rule, Grammar, is_equivalent


def test_grammar():
    a1 = Terminal("a")
    r1 = Rule([a1])
    n1 = NonTerminal([r1])
    g1 = Grammar([n1])

    a2 = Terminal("a")
    r2 = Rule([a2])
    n2 = NonTerminal([r2])
    g2 = Grammar([n2])

    assert is_equivalent(g1, g2)


def test_convert_to_s_grammar():
    # Create Terminal objects
    a = Terminal("a")
    b = Terminal("b")
    c = Terminal("c")

    # Create Rules for NonTerminal C
    r_c = Rule([c])
    n_c = NonTerminal([r_c])

    # Create Rules for NonTerminal B
    r_b = Rule([n_c])
    n_b = NonTerminal([r_b])

    # Create Rules for NonTerminal A
    r_a1 = Rule([a, b, n_b])
    r_a2 = Rule([b])
    n_a = NonTerminal([r_a1, r_a2])

    # Create Rules for NonTerminal S
    r_s = Rule([n_a, a])
    n_s = NonTerminal([r_s])

    # Create Grammar 1
    g1 = Grammar([n_s, n_a, n_b, n_c])

    # Eliminate unit rules for Grammar 1
    g1._eliminate_unit_rules()

    # Verify if g1 has transformed into the desired format

    assert n_a.rules_list[0].symbols_list[0] == a
    assert n_a.rules_list[0].symbols_list[1] == b
    assert n_a.rules_list[0].symbols_list[2] == n_b
    assert n_a.rules_list[1].symbols_list[0] == b
    assert n_b.rules_list[0].symbols_list[0] == c
