# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    att_content = f.read()

# Extract IDs from Student attendance sheet.html
att_ids = set(re.findall(r'id=["\']([^"\']+)["\']', att_content))
seat_ids = set(re.findall(r'id=["\']([^"\']+)["\']', seat_content))

common_ids = att_ids.intersection(seat_ids)
print("Common IDs between Student attendance sheet.html and seat-plan.html:")
for cid in common_ids:
    print("  ", cid)

# Extract functions from Student attendance sheet.html
att_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)', att_content))
seat_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)', seat_content))

common_funcs = att_funcs.intersection(seat_funcs)
print("\nCommon Functions:")
for cf in common_funcs:
    print("  ", cf)
