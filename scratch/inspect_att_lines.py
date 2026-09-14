import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== Lines 586 to 680 ===')
print(''.join(lines[585:680]))

print('\n=== Lines 2230 to 2290 ===')
print(''.join(lines[2230:2290]))
