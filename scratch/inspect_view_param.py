import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

matches = [m.start() for m in re.finditer(r'viewParam', sp)]
for pos in matches:
    print("--- viewParam occurrence ---")
    print(sp[pos-50:pos+500])

