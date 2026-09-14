with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(\.[a-zA-Z0-9_-]*speech[a-zA-Z0-9_-]*\s*\{[^}]*\})', text)
for m in matches:
    print(m)
    print('-'*40)
