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
