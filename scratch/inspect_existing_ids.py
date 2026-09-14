import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

ids_to_check = ['filter-shift', 'filter-lang', 'font-size-slider', 'font-size-val', 'filter-class', 'filter-exam', 'search-student']

for el_id in ids_to_check:
    matches = [m.start() for m in re.finditer(r'id=["\']' + el_id + r'["\']', sp)]
    print(f"ID '{el_id}' appears {len(matches)} times in seat-plan.html")
    for pos in matches:
        start = max(0, pos - 100)
        end = min(len(sp), pos + 150)
        print(f"  Context: {sp[start:end].strip().replace(chr(10), ' ')}")

