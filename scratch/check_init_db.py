with open('server.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'def init_db', text)]
for pos in matches:
    print(text[pos:pos+1500])
