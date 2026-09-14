# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file has HM signature helper", "getRoomTopshetHeadmasterSignature" in room_c),
    ("Room file has Preparer signature helper", "getRoomTopshetPreparerSignature" in room_c),
    ("Room file has 0.5in signature container", 'height: 0.5in;' in room_c),
    ("Room file has floating signature image template", '${prepSigImg}' in room_c and '${hmSigImg}' in room_c),
    ("Seat Plan has HM signature helper", "getRoomTopshetHeadmasterSignature" in seat_c),
    ("Seat Plan has Preparer signature helper", "getRoomTopshetPreparerSignature" in seat_c),
    ("Seat Plan has 0.5in signature container", 'height: 0.5in;' in seat_c),
    ("Seat Plan has floating signature image template", '${prepSigImg}' in seat_c and '${hmSigImg}' in seat_c),
    ("কক্ষ পরিদর্শক hidden in Room file", '<div class="sig-col" style="display: none !important;">' in room_c),
    ("কক্ষ পরিদর্শক hidden in Seat Plan file", '<div class="sig-col" style="display: none !important;">' in seat_c)
]

all_passed = True
print("=== VERIFY FLOATING SIGNATURES FROM STAFF MANAGEMENT ===")
for name, passed in checks:
    print(f"[{ 'PASS' if passed else 'FAIL' }] {name}")
    if not passed:
        all_passed = False

print('\nOVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
