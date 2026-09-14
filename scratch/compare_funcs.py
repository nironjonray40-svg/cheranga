import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

m1 = re.search(r'function\s+toBengaliNumerals\s*\(.*?\)\s*\{.*?\}', sp, re.DOTALL)
m2 = re.search(r'function\s+toBengaliNumerals\s*\(.*?\)\s*\{.*?\}', sdt, re.DOTALL)

print("=== toBengaliNumerals in seat-plan.html ===")
if m1: print(m1.group(0))
else: print("Not found in seat-plan.html")

print("\n=== toBengaliNumerals in SDT ===")
if m2: print(m2.group(0))
else: print("Not found in SDT")

