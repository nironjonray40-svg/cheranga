with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

funcs = []
for idx, line in enumerate(lines, 1):
    if line.strip().startswith('function ') or line.strip().startswith('let isCreateAllMode') or line.strip().startswith('let currentSearchQuery'):
        funcs.append((idx, line.strip()[:100]))

for idx, f in funcs:
    if idx >= 2400 and idx <= 3650:
        print(f"Line {idx}: {f}")
