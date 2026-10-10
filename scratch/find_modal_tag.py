with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'id=["\']exam-marks-entry-modal["\']', text)]
for pos in matches:
    line_num = text[:pos].count('\n') + 1
    print(f"Line {line_num}:")
    print(text[pos-40:pos+300])
