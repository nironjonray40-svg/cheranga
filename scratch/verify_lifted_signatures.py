# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_c = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_c = f.read()

checks = [
    ("Room file CSS margin-bottom: 0.5in", "margin-bottom: 0.5in;" in room_c),
    ("Room file HTML style='margin-bottom: 0.5in;'", '<div class="footer-signatures" style="margin-bottom: 0.5in;">' in room_c),
    ("Seat Plan CSS margin-bottom: 0.5in", "#subview-room-topshet .footer-signatures" in seat_c and "margin-bottom: 0.5in;" in seat_c),
    ("Seat Plan HTML style='margin-bottom: 0.5in;'", '<div class="footer-signatures" style="margin-bottom: 0.5in;">' in seat_c),
    ("0.5in signature image containers intact", "height: 0.5in;" in room_c and "height: 0.5in;" in seat_c),
    ("Staff Management sync intact", "getRoomTopshetHeadmasterSignature" in seat_c and "getRoomTopshetPreparerSignature" in seat_c)
]

all_passed = True
print("=== VERIFY 0.5 INCH LIFTED SIGNATURES ===")
for name, passed in checks:
    print(f"[{ 'PASS' if passed else 'FAIL' }] {name}")
    if not passed:
        all_passed = False

print('\nOVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
