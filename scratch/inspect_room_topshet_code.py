# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/apply_room_topshet_merge.py', 'r', encoding='utf-8') as f:
    merge_script = f.read()

# Look at the sections and comments in apply_room_topshet_merge.py
print("apply_room_topshet_merge.py summary:")
sections = re.findall(r'(#\s*[0-9\.]+[^\n]+)', merge_script)
for s in sections[:30]:
    print("  ", s)

# Let's inspect how room topshet tab HTML was created in seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

room_tab = re.search(r'(<!-- TAB: ROOM SEAT TOPSHET.*?)(?=<!-- TAB:|$)', seat_content, re.DOTALL)
if room_tab:
    print("\nRoom Topshet Tab HTML structure length:", len(room_tab.group(1)))
    print("Snippet:\n", room_tab.group(1)[:1200])
