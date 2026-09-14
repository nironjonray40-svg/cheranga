import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('function switchSeatTab')
pos_end = sp.find('function switchExamDocument', pos)
switch_code = sp[pos:pos_end]

tabs = re.findall(r'tabName === [\'"]([^\'"]+)[\'"]', switch_code)
print("Tabs handled in switchSeatTab:", tabs)

for tab in tabs:
    m = re.search(r'tabName === [\'"]' + tab + r'[\'"](.*?)(?=else if|function|\Z)', switch_code, re.DOTALL)
    if m:
        print(f"\n--- Handler for {tab} ---")
        print(m.group(0)[:300])

