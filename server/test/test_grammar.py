import pytest
from api.grammar import Grammar

# test case used in the paper

G1 = Grammar("S", "aAC")
G1.add_rule("A", "bAB")
G1.add_rule("A", "aB")
G1.add_rule("B", "b")
G1.add_rule("C", "a")

G2 = Grammar("S", "aDE")
G2.add_rule("D", "bDF")
G2.add_rule("D", "a")
G2.add_rule("E", "bG")
G2.add_rule("F", "b")
G2.add_rule("G", "a")

def test_load_grammar():
    assert "S" in G1.rules.keys()
    assert G1.rules["S"] == {"aAC"}
    assert "A" in G1.rules.keys()
    assert G1.rules["A"] == {"bAB", "aB"}
    assert "B" in G1.rules.keys()
    assert G1.rules["B"] == {"b"}
    assert "C" in G1.rules.keys()
    assert G1.rules["C"] == {"a"}

    assert "a" not in G1.rules.keys()
    assert "b" not in G1.rules.keys()

    assert "S" in G2.rules.keys()
    assert G2.rules["S"] == {"aDE"}
    assert "D" in G2.rules.keys()
    assert G2.rules["D"] == {"bDF", "a"}
    assert "E" in G2.rules.keys()
    assert G2.rules["E"] == {"bG"}
    assert "F" in G2.rules.keys()
    assert G2.rules["F"] == {"b"}
    assert "G" in G2.rules.keys()
    assert G2.rules["G"] == {"a"}

    assert "a" not in G2.rules.keys()
    assert "b" not in G2.rules.keys()

def test_find_shortest_derivable():
    assert G1.find_shortest_derivable("C", None) == {"a"}
    assert G1.find_shortest_derivable("B", None) == {"b"}
    assert G1.find_shortest_derivable("A", None) == {"ab"}
    assert G1.find_shortest_derivable("S", None) == {"aaba"}

    assert G2.find_shortest_derivable("G", None) == {"a"}
    assert G2.find_shortest_derivable("F", None) == {"b"}
    assert G2.find_shortest_derivable("E", None) == {"ba"}
    assert G2.find_shortest_derivable("D", None) == {"a"}
    assert G2.find_shortest_derivable("S", None) == {"aaba"}

def test_get_leftmost_terminals_derivable():
    assert G1.get_leftmost_terminals_derivable("C") == {"a"}
    assert G1.get_leftmost_terminals_derivable("B") == {"b"}
    assert G1.get_leftmost_terminals_derivable("A") == {"a", "b"}
    assert G1.get_leftmost_terminals_derivable("S") == {"a"}
    
    assert G2.get_leftmost_terminals_derivable("G") == {"a"}
    assert G2.get_leftmost_terminals_derivable("F") == {"b"}
    assert G2.get_leftmost_terminals_derivable("E") == {"b"}
    assert G2.get_leftmost_terminals_derivable("D") == {"a", "b"}
    assert G2.get_leftmost_terminals_derivable("S") == {"a"}

def test_is_symbol_derivable_from_rule():
    assert G1.is_symbol_derivable_from_rule("C", "a")
    assert not G1.is_symbol_derivable_from_rule("C", "b")
    assert G1.is_symbol_derivable_from_rule("B", "b")
    assert not G1.is_symbol_derivable_from_rule("B", "a")
    assert G1.is_symbol_derivable_from_rule("A", "a")
    assert G1.is_symbol_derivable_from_rule("A", "b")
    assert G1.is_symbol_derivable_from_rule("S", "a")
    assert not G1.is_symbol_derivable_from_rule("S", "b")
    
    assert G2.is_symbol_derivable_from_rule("G", "a")
    assert not G2.is_symbol_derivable_from_rule("G", "b")
    assert G2.is_symbol_derivable_from_rule("F", "b")
    assert not G2.is_symbol_derivable_from_rule("F", "a")
    assert G2.is_symbol_derivable_from_rule("E", "b")
    assert not G2.is_symbol_derivable_from_rule("E", "a")
    assert G2.is_symbol_derivable_from_rule("S", "a")
    assert not G1.is_symbol_derivable_from_rule("S", "b")
    
def test_get_after_leftmost_derive():
    assert G1.get_after_leftmost_derive("C", "a") == ""
    assert G1.get_after_leftmost_derive("B", "b") == ""
    assert G1.get_after_leftmost_derive("A", "a") == "B"
    assert G1.get_after_leftmost_derive("A", "b") == "AB"
    assert G1.get_after_leftmost_derive("S", "a") == "AC"
    
    assert G2.get_after_leftmost_derive("G", "a") == ""
    assert G2.get_after_leftmost_derive("F", "b") == ""
    assert G2.get_after_leftmost_derive("E", "b") == "G"
    assert G2.get_after_leftmost_derive("D", "a") == ""
    assert G2.get_after_leftmost_derive("D", "b") == "DF"
    assert G2.get_after_leftmost_derive("S", "a") == "DE"
    
def test_calculate_l():
    assert G1.calculate_l() == 4
    assert G2.calculate_l() == 4
    
def test_is_string_derivable_from_rule():
    assert G1.is_string_derivable_from_rule("C", "a")
    assert not G1.is_string_derivable_from_rule("C", "b")
    assert G1.is_string_derivable_from_rule("B", "b")
    assert not G1.is_string_derivable_from_rule("B", "a")
    assert G1.is_string_derivable_from_rule("A", "ab")
    assert G1.is_string_derivable_from_rule("A", "babb")
    assert not G1.is_string_derivable_from_rule("A", "abb")
    assert G1.is_string_derivable_from_rule("A", "ba")
    assert G1.is_string_derivable_from_rule("S", "a")
    assert G1.is_string_derivable_from_rule("S", "aa")
    assert G1.is_string_derivable_from_rule("S", "ab")
    assert not G1.is_string_derivable_from_rule("S", "aaa")
    assert G1.is_string_derivable_from_rule("S", "aaba")

    assert G2.is_string_derivable_from_rule("G", "a")
    assert not G2.is_string_derivable_from_rule("G", "b")
    assert G2.is_string_derivable_from_rule("F", "b")
    assert not G2.is_string_derivable_from_rule("F", "a")
    assert G2.is_string_derivable_from_rule("E", "ba")
    assert not G2.is_string_derivable_from_rule("E", "bb")
    assert G2.is_string_derivable_from_rule("D", "a")
    assert G2.is_string_derivable_from_rule("D", "bab")
    assert not G2.is_string_derivable_from_rule("D", "aab")
    assert G2.is_string_derivable_from_rule("D", "bbabb")
    assert G2.is_string_derivable_from_rule("S", "aa")
    assert G2.is_string_derivable_from_rule("S", "aaba")
    assert not G2.is_string_derivable_from_rule("S", "aaa")
    
def test_get_after_string_derive():
    assert G1.get_after_string_derive("C", "a") == ""
    assert G1.get_after_string_derive("B", "b") == ""
    assert G1.get_after_string_derive("A", "a") == "B"
    assert G1.get_after_string_derive("A", "b") == "AB"
    assert G1.get_after_string_derive("A", "ab") == ""
    assert G1.get_after_string_derive("A", "bab") == "B"
    assert G1.get_after_string_derive("A", "babb") == ""
    assert G1.get_after_string_derive("S", "a") == "AC"
    assert G1.get_after_string_derive("S", "aa") == "BC"
    assert G1.get_after_string_derive("S", "ab") == "ABC"
    assert G1.get_after_string_derive("S", "aba") == "BBC"

    assert G2.get_after_string_derive("G", "a") == ""
    assert G2.get_after_string_derive("F", "b") == ""
    assert G2.get_after_string_derive("E", "b") == "G"
    assert G2.get_after_string_derive("E", "ba") == ""
    assert G2.get_after_string_derive("D", "a") == ""
    assert G2.get_after_string_derive("D", "b") == "DF"
    assert G2.get_after_string_derive("D", "ba") == "F"
    assert G2.get_after_string_derive("D", "bab") == ""
    assert G2.get_after_string_derive("D", "bb") == "DFF"
    assert G2.get_after_string_derive("S", "a") == "DE"
    assert G2.get_after_string_derive("S", "aa") == "E"
    assert G2.get_after_string_derive("S", "ab") == "DFE"
    
def test_is_equivalent_to():
    assert G1.is_equivalent_to(G2) == ""

    
    
    
    
    
    
    

