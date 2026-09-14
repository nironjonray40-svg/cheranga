with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'ERP_SETTINGS', text)
for m in matches:
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 150)
    print(text[start:end])
    print('='*50)
