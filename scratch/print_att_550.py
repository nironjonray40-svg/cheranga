import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(''.join(lines[550:620]))
