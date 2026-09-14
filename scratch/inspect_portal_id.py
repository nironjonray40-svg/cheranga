import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()

# search for studentId generation / auto id / registration
for m in re.finditer(r'(autoGenerate|generateId|studentId|idShift|formatId|padId)', portal, re.I):
    start = max(0, m.start() - 100)
    end = min(len(portal), m.end() + 300)
    print('MATCH:', portal[start:end])
    print('-'*40)
