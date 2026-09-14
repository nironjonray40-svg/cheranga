# -*- coding: utf-8 -*-
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

checks = [
    ('CSS styles', 'SEATING ARRANGEMENT DETAILS STYLES' in c),
    ('Dropdown link', '<li><a href="seat-plan?view=seating-details"' in c or '<li><a href="seat-plan.html?view=seating-details"' in c),
    ('Sub-nav tab button', 'id="btn-tab-seating-details"' in c),
    ('Subview container', 'id="subview-seating-details"' in c),
    ('Seating JS Engine', 'SEATING ARRANGEMENT DETAILS ENGINE' in c),
    ('switchSeatTab handler', "tabName === 'seating-details'" in c),
    ('switchExamDocument handler', "fileName === 'Seating arrangement details.html'" in c),
    ('URL router validSeatTabs', "'seating-details'" in c),
    ('Event listeners sync', 'refreshSeatingDetailsData' in c),
    ('PDF downloader function', 'downloadSeatingDetailsPDF' in c)
]

all_passed = True
for name, passed in checks:
    print(f'[{ "PASS" if passed else "FAIL" }] {name}')
    if not passed:
        all_passed = False

print('\nOverall Status:', 'ALL PASSED!' if all_passed else 'SOME CHECKS FAILED!')
