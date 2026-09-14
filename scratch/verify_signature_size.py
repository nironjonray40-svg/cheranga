# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has 15% larger signature (0.575in)", "0.575in" in room_c),
    ("Room file has 160px max-width", "max-width: 160px;" in room_c),
    ("Room file has 0.575in sig-img-box", "height: 0.575in;" in room_c),
    ("Seat Plan has 15% larger signature (0.575in)", "0.575in" in seat_c),
    ("Seat Plan has 160px max-width", "max-width: 160px;" in seat_c),
    ("Seat Plan has 0.575in sig-img-box", "height: 0.575in;" in seat_c),
    ("Staff Management sync intact", "getRoomTopshetHeadmasterSignature" in seat_c and "getRoomTopshetPreparerSignature" in seat_c)
]

all_passed = True
print("=== VERIFY 15% LARGER SIGNATURE SIZES ===")
for name, passed in checks:
    print(f"[{ 'PASS' if passed else 'FAIL' }] {name}")
    if not passed:
        all_passed = False

print('\nOVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
