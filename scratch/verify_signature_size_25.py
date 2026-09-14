# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has 25% larger signature (0.86in)", "0.86in" in room_c),
    ("Room file has 245px max-width", "max-width: 245px;" in room_c),
    ("Room file has 0.86in sig-img-box", "height: 0.86in;" in room_c),
    ("Seat Plan has 25% larger signature (0.86in)", "0.86in" in seat_c),
    ("Seat Plan has 245px max-width", "max-width: 245px;" in seat_c),
    ("Seat Plan has 0.86in sig-img-box", "height: 0.86in;" in seat_c),
    ("Staff Management sync intact", "getRoomTopshetHeadmasterSignature" in seat_c and "getRoomTopshetPreparerSignature" in seat_c)
]

all_passed = True
print("=== VERIFY ADDITIONAL 25% LARGER SIGNATURE SIZES ===")
for name, passed in checks:
    print(f"[{ 'PASS' if passed else 'FAIL' }] {name}")
    if not passed:
        all_passed = False

print('\nOVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
