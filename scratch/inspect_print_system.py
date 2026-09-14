import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("--- Print Functions in seat-plan.html ---")
print_fns = re.findall(r'function\s+(print[a-zA-Z0-9_$]+)\s*\(', sp)
print(print_fns)

for fn in print_fns:
    m = re.search(r'function\s+' + fn + r'\s*\(.*?\)\s*\{.*?\}', sp, re.DOTALL)
    if m:
        print(f"\nFunction {fn}:")
        print(m.group(0))

print("\n--- Media print blocks in seat-plan.html ---")
media_prints = re.findall(r'@media\s+print\s*\{.*?\}\s*\}', sp, re.DOTALL)
for i, mp in enumerate(media_prints):
    print(f"Media print block {i} (len {len(mp)}):")
    print(mp[:300])

