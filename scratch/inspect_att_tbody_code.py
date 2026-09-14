import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== Lines 2140 to 2230 ===')
print(''.join(lines[2140:2230]))
