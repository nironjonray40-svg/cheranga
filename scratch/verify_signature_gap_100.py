# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file sig-img-box margin-bottom -28px", "margin-bottom: -28px;" in room_c),
    ("Room file sig-line margin 0 auto 0 auto", "margin: 0 auto 0 auto;" in room_c),
    ("Room file sig-label margin-top 0", "margin-top: 0; padding-top: 0;" in room_c),
    ("Seat Plan sig-img-box margin-bottom -28px", "margin-bottom: -28px;" in seat_c),
    ("Seat Plan sig-line margin 0 auto 0 auto", "margin: 0 auto 0 auto;" in seat_c),
    ("Seat Plan sig-label margin-top 0", "margin-top: 0; padding-top: 0;" in seat_c),
    ("Room file size 0.86in retained", "height: 0.86in;" in room_c),
    ("Seat Plan size 0.86in retained", "height: 0.86in;" in seat_c),
    ("Room file max-width 245px retained", "max-width: 245px;" in room_c),
    ("Seat Plan max-width 245px retained", "max-width: 245px;" in seat_c)
]

all_passed = True
for label, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {label}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL 100% GAP REDUCTION CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)
