import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'(saveStudents|students\.push)', text):
    print("Found save/push:", text[max(0, m.start()-100):min(len(text), m.end()+250)])
    print('-'*50)
