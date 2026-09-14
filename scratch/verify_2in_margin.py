# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file CSS tables-wrapper margin-bottom: 2.00in", "margin-bottom: 2.00in;" in room_c),
    ("Room file HTML tables-wrapper margin-bottom: 2.00in", '<div class="tables-wrapper" style="margin-bottom: 2.00in;">' in room_c),
    ("Seat Plan CSS tables-wrapper margin-bottom: 2.00in", "margin-bottom: 2.00in;" in seat_c),
    ("Seat Plan HTML tables-wrapper margin-bottom: 2.00in", '<div class="tables-wrapper" style="margin-bottom: 2.00in;">' in seat_c),
    ("Room file ROWS_PER_PAGE = 20", "const ROWS_PER_PAGE = 20;" in room_c),
    ("Seat Plan ROWS_PER_PAGE = 20", "const ROWS_PER_PAGE = 20;" in seat_c),
    ("Room file footer signatures fixed with margin-bottom: 0.5in", "margin-bottom: 0.5in;" in room_c),
    ("Seat Plan footer signatures fixed with margin-bottom: 0.5in", "margin-bottom: 0.5in;" in seat_c),
    ("Room file has Bengali sections", "${secDisplay}" in room_c),
    ("Seat Plan has Bengali sections", "${secDisplay}" in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL 2.00in BOTTOM MARGIN CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
