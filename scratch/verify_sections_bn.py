# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has formatRoomTopshetSectionBn function", "function formatRoomTopshetSectionBn" in room_c),
    ("Room file uses secDisplay", "${secDisplay}" in room_c),
    ("Seat Plan has formatRoomTopshetSectionBn function", "function formatRoomTopshetSectionBn" in seat_c),
    ("Seat Plan uses secDisplay", "${secDisplay}" in seat_c),
    ("Room file has letterMap with Bengali letters", "'a': 'ক', 'b': 'খ'" in room_c),
    ("Seat Plan has letterMap with Bengali letters", "'a': 'ক', 'b': 'খ'" in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL BENGALI SECTION FORMATTING CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
