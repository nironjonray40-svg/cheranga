import sys, re

sys.stdout.reconfigure(encoding='utf-8')

for fn in ['seat-plan.html', 'Home.html']:
    with open(fn, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    m = re.search(r'(<li[^>]*data-tab=[\'"]seat-plan[\'"][^>]*>.*?</ul>\s*</li>)', c, re.DOTALL | re.I)
    if m:
        print(f"=== {fn} Seat Plan Dropdown ===")
        print(m.group(0))

