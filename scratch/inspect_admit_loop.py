import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Admit Card.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('students.forEach(student =>')
if idx == -1: idx = text.find('filteredStudents.forEach')
if idx == -1: idx = text.find('student =>')
print('=== Admit Card.html student loop ===')
print(text[max(0, idx-50):min(len(text), idx+2000)])
