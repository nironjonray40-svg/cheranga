# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has ROWS_PER_PAGE pagination", "const ROWS_PER_PAGE = 22;" in room_c),
    ("Room file has totalRoomPages loop", "for (let pageNum = 1; pageNum <= totalRoomPages; pageNum++)" in room_c),
    ("Room file slices students for each page", "const pageSlice = fullList.slice(startRow, endRow);" in room_c),
    ("Room file has page indicator with pageNum", "পৃষ্ঠা ${pageNum}/${totalRoomPages}" in room_c),
    ("Seat Plan has ROWS_PER_PAGE pagination", "const ROWS_PER_PAGE = 22;" in seat_c),
    ("Seat Plan has totalRoomPages loop", "for (let pageNum = 1; pageNum <= totalRoomPages; pageNum++)" in seat_c),
    ("Seat Plan slices students for each page", "const pageSlice = fullList.slice(startRow, endRow);" in seat_c),
    ("Seat Plan has page indicator with pageNum", "পৃষ্ঠা ${pageNum}/${totalRoomPages}" in seat_c),
    ("Room file has section column in Bengali", "${secDisplay}" in room_c),
    ("Seat Plan has section column in Bengali", "${secDisplay}" in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL ROOM PAGINATION CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
