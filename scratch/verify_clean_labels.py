# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has 'শিক্ষার্থীর আইডি' subhead", ">শিক্ষার্থীর আইডি</th>" in room_c),
    ("Room file has 'শাখা' subhead", ">শাখা</th>" in room_c),
    ("Seat Plan has 'শিক্ষার্থীর আইডি' subhead", ">শিক্ষার্থীর আইডি</th>" in seat_c),
    ("Seat Plan has 'শাখা' subhead", ">শাখা</th>" in seat_c),
    ("Room file has no 'শিক্ষার্থীর আইডি (ID)' in tables", "শিক্ষার্থীর আইডি (ID)" not in room_c),
    ("Seat Plan has no 'শিক্ষার্থীর আইডি (ID)' in topsheet table", "formatRoomTopshetClassName" in seat_c and ">শিক্ষার্থীর আইডি</th>" in seat_c),
    ("Room file has Bengali section display", "${secDisplay}" in room_c),
    ("Seat Plan has Bengali section display", "${secDisplay}" in seat_c),
    ("Room file has 3.50in margin", "margin-bottom: 3.50in;" in room_c),
    ("Seat Plan has 3.50in margin", "margin-bottom: 3.50in;" in seat_c),
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL HEADER LABEL UPDATE CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
