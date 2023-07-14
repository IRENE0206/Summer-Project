from os.path import join, dirname, abspath
from secrets import token_hex

SECRET_KEY = token_hex(16)

