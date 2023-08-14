from .grammar import Grammar
class symbol:
    def __init__(self, s: str, g: Grammar):
        self.symbol = s
        self.grammar = g
    
    