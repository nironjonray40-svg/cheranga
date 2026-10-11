with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(fetch\([^)]+\)|EventSource\([^)]+\)|WebSocket\([^)]+\)|XMLHttpRequest|[a-zA-Z0-9_]+\.open\([^)]+\))', text)
for m in matches:
    print(m)
