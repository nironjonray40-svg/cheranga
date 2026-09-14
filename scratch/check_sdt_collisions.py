import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

sp_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', sp))
sdt_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', sdt))

sp_ids = set(re.findall(r'id=["\']([^"\']+)["\']', sp))
sdt_ids = set(re.findall(r'id=["\']([^"\']+)["\']', sdt))

common_funcs = sp_funcs.intersection(sdt_funcs)
common_ids = sp_ids.intersection(sdt_ids)

print("Common Functions:", common_funcs)
print("Common Element IDs:", common_ids)

