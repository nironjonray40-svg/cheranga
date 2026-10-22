import re

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for lines containing isAbsent
lines = text.split('\n')
for i, line in enumerate(lines):
    if 'isAbsent' in line:
        print(f"Line {i+1}: {line.strip()[:140]}")
