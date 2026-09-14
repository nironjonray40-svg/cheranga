# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file CSS footer-signatures margin-top: 0.5in", "margin-top: 0.5in;" in room_c),
    ("Room file HTML footer-signatures margin-top: 0.5in", '<div class="footer-signatures" style="margin-top: 0.5in; margin-bottom: 0.5in;">' in room_c),
    ("Seat Plan CSS footer-signatures margin-top: 0.5in", "margin-top: 0.5in;" in seat_c),
    ("Seat Plan HTML footer-signatures margin-top: 0.5in", '<div class="footer-signatures" style="margin-top: 0.5in; margin-bottom: 0.5in;">' in seat_c),
    ("Room file has ROWS_PER_PAGE = 22", "const ROWS_PER_PAGE = 22;" in room_c),
    ("Seat Plan has ROWS_PER_PAGE = 22", "const ROWS_PER_PAGE = 22;" in seat_c),
    ("Room file has formatRoomTopshetSectionBn", "formatRoomTopshetSectionBn" in room_c),
    ("Seat Plan has formatRoomTopshetSectionBn", "formatRoomTopshetSectionBn" in seat_c),
    ("Room file has .sig-line hidden", 'display: none !important;' in room_c),
    ("Seat Plan has .sig-line hidden", 'display: none !important;' in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL CLEARANCE AND PAGINATION CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
