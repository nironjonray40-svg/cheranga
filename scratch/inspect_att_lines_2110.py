import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== Lines 2110 to 2150 ===')
print(''.join(lines[2110:2150]))
