import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

page_rules = re.findall(r'(@page[^{]*\{[^}]*\})', sp)
print("=== All @page rules in seat-plan.html ===")
for p in page_rules:
    print(p)

print("\n=== Print rules around Student Data Topsheet ===")
pos = sp.find('print-student-data-topsheet-mode')
while pos != -1:
    start = max(0, pos - 100)
    end = min(len(sp), pos + 600)
    print("Snippet:\n", sp[start:end])
    print("-" * 50)
    pos = sp.find('print-student-data-topsheet-mode', pos + 30)

