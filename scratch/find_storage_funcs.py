with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'(function\s+[a-zA-Z0-9_]*store[a-zA-Z0-9_]*|function\s+[a-zA-Z0-9_]*sync[a-zA-Z0-9_]*|fetch\([^\)]*\))', text, re.IGNORECASE)
for m in matches:
    print(m.group(0)[:120])
