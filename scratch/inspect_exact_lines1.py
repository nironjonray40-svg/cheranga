import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet1.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2420, 2495):
    print(f"{i+1}: {repr(lines[i])}")
