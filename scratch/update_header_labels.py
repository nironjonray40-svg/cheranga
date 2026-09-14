# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

old_room_subhead = """                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>
                                        </tr>"""

new_room_subhead = """                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা</th>
                                        </tr>"""

if old_room_subhead in room_text:
    room_text = room_text.replace(old_room_subhead, new_room_subhead, 1)
    print("[OK] Updated table subheaders in Room Seat Topshet.html")
else:
    print("[WARN] Could not find exact subhead in Room Seat Topshet.html, replacing individual terms")
    room_text = room_text.replace("শিক্ষার্থীর আইডি (ID)", "শিক্ষার্থীর আইডি")
    room_text = room_text.replace("শাখা (Section):", "শাখা")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

if old_room_subhead in seat_text:
    seat_text = seat_text.replace(old_room_subhead, new_room_subhead, 1)
    print("[OK] Updated table subheaders in seat-plan.html")
else:
    print("[WARN] Could not find exact subhead in seat-plan.html, replacing within room-topshet area")
    # replace specifically in topshet area
    old_topshet_frag = """                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>
                                        </tr>"""
    seat_text = seat_text.replace(old_topshet_frag, new_room_subhead)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
