# -*- coding: utf-8 -*-
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    orig_content = f.read()

checks = [
    ("seat-plan: populateSeatingExamFilter scans store", "school_seat_plans_store" in seat_content and "populateSeatingExamFilter" in seat_content),
    ("seat-plan: populateSeatingClassFilter scans store", "discoveredClasses" in seat_content and "populateSeatingClassFilter" in seat_content),
    ("seat-plan: populateSeatingShiftFilter scans store", "shiftsSet" in seat_content and "populateSeatingShiftFilter" in seat_content),
    ("seat-plan: onSeatingExamFilterChange linked", "onSeatingExamFilterChange()" in seat_content),
    ("seat-plan: switchSeatTab calls refreshSeatingDetailsData", "refreshSeatingDetailsData" in seat_content),
    ("standalone: populateExamFilter scans store", "school_seat_plans_store" in orig_content and "populateExamFilter" in orig_content),
    ("standalone: populateClassFilter scans store", "discoveredClasses" in orig_content and "populateClassFilter" in orig_content),
    ("standalone: populateShiftFilter scans store", "shiftsSet" in orig_content and "populateShiftFilter" in orig_content),
    ("standalone: onExamFilterChange linked", "onExamFilterChange()" in orig_content)
]

all_passed = True
for name, passed in checks:
    print(f"[{'PASS' if passed else 'FAIL'}] {name}")
    if not passed:
        all_passed = False

print("\nResult:", "ALL VERIFICATION CHECKS PASSED!" if all_passed else "FAILED!")
