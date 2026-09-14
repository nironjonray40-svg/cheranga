# -*- coding: utf-8 -*-
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    orig_content = f.read()

checks = [
    ("seat-plan: studentSectionMap lookup present", "studentSectionMap" in seat_content),
    ("seat-plan: section grouping per class", "classGroup[c][sec]" in seat_content),
    ("seat-plan: totalRoomRows calculated", "totalRoomRows" in seat_content),
    ("seat-plan: secLabel rendered", "secLabel" in seat_content and "শাখা (Section):" in seat_content),
    ("standalone: studentSectionMap lookup present", "studentSectionMap" in orig_content),
    ("standalone: section grouping per class", "classGroup[c][sec]" in orig_content),
    ("standalone: totalRoomRows calculated", "totalRoomRows" in orig_content),
    ("standalone: secLabel rendered", "secLabel" in orig_content and "শাখা (Section):" in orig_content),
]

all_passed = True
for name, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {name}")
    if not passed:
        all_passed = False

print("\nResult:", "ALL CHECKS PASSED!" if all_passed else "FAILED!")
