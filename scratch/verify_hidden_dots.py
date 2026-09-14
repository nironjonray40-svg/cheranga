# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file .sig-line has display: none !important", 'display: none !important;' in room_c),
    ("Room file HTML sig-line hidden", '<div class="sig-line" style="display: none !important;"></div>' in room_c),
    ("Seat Plan #subview-room-topshet .sig-line has display: none !important", '#subview-room-topshet .sig-line {\n            display: none !important;' in seat_c),
    ("Seat Plan HTML sig-line hidden", '<div class="sig-line" style="display: none !important;"></div>' in seat_c),
    ("Room file prepSigImg present", '${prepSigImg}' in room_c),
    ("Room file hmSigImg present", '${hmSigImg}' in room_c),
    ("Seat Plan prepSigImg present", '${prepSigImg}' in seat_c),
    ("Seat Plan hmSigImg present", '${hmSigImg}' in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL HIDDEN DOTS/DASHES CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
