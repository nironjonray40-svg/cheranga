import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.finditer(r'([^{}]*(?:::?before|::?after)[^{}]*)\{([^{}]*)\}', text, re.IGNORECASE)
for m in matches:
    print('SELECTOR:', m.group(1).strip().replace('\n', ' '))
    print('BODY:', m.group(2).strip().replace('\n', ' '))
    print('-'*40)
