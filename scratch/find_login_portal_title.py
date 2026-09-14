with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'স্কুল ERP লগইন পোর্টাল', text)]
print("Count of matches:", len(matches))
for pos in matches:
    print(text[max(0, pos-50):min(len(text), pos+100)])
