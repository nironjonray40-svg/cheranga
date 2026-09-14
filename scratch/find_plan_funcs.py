import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

funcs = re.findall(r'function\s+([a-zA-Z0-9_$]*[Ss]eat[a-zA-Z0-9_$]*|[a-zA-Z0-9_$]*[Pp]lan[a-zA-Z0-9_$]*)\s*\(', c)
print('Seat/Plan Functions:', funcs)
