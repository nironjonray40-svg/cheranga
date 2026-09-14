# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has studentSectionMap", "studentSectionMap" in room_c),
    ("Room file has colspan 2", '<th colspan="2">${formatClassName(cls)}</th>' in room_c),
    ("Room file has আইডি (ID) header", 'শিক্ষার্থীর আইডি (ID)' in room_c),
    ("Room file has শাখা (Section): header", 'শাখা (Section):' in room_c),
    ("Room file has 2 td cells (studentId, secName)", '<tr><td>${studentId}</td><td>${secName}</td></tr>' in room_c),
    ("Seat Plan has studentSectionMap", "studentSectionMap" in seat_c),
    ("Seat Plan has colspan 2", '<th colspan="2">${formatRoomTopshetClassName(cls)}</th>' in seat_c),
    ("Seat Plan has আইডি (ID) header", 'শিক্ষার্থীর আইডি (ID)' in seat_c),
    ("Seat Plan has শাখা (Section): header", 'শাখা (Section):' in seat_c),
    ("Seat Plan has 2 td cells (studentId, secName)", '<tr><td>${studentId}</td><td>${secName}</td></tr>' in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL SECTION COLUMN CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
