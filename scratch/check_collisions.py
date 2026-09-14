# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

room_ids = set(re.findall(r'id=["\']([^"\']+)["\']', room_text))
seat_ids = set(re.findall(r'id=["\']([^"\']+)["\']', seat_text))

common_ids = room_ids.intersection(seat_ids)
print("Common IDs between Room Seat Topshet.html and seat-plan.html:")
for cid in sorted(common_ids):
    print(" -", cid)

room_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', room_text))
seat_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', seat_text))

common_funcs = room_funcs.intersection(seat_funcs)
print("\nCommon Functions:")
for cf in sorted(common_funcs):
    print(" -", cf)
