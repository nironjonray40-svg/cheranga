import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2133, 2205):
    print(f"{i+1}: {repr(lines[i])}")
