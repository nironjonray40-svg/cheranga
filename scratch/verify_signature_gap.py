# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file .sig-line CSS margin 1px", "margin: 0 auto 1px auto;" in room_c),
    ("Room file sig-img-box margin-bottom -15px", "margin-bottom: -15px;" in room_c),
    ("Room file sig-label margin-top 1px", "margin-top: 1px;" in room_c),
    ("Seat Plan .sig-line CSS margin 1px", "#subview-room-topshet .sig-line" in seat_c and "margin: 0 auto 1px auto;" in seat_c),
    ("Seat Plan sig-img-box margin-bottom -15px", "margin-bottom: -15px;" in seat_c),
    ("Seat Plan sig-label margin-top 1px", "margin-top: 1px;" in seat_c),
    ("Staff Management sync intact", "getRoomTopshetHeadmasterSignature" in seat_c and "getRoomTopshetPreparerSignature" in seat_c)
]

all_passed = True
print("=== VERIFY 75% GAP REDUCTION BETWEEN SIGNATURES AND LABELS ===")
for name, passed in checks:
    print(f"[{ 'PASS' if passed else 'FAIL' }] {name}")
    if not passed:
        all_passed = False

print('\nOVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
