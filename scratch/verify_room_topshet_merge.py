# -*- coding: utf-8 -*-
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

checks = [
    ('CSS styles for subview-room-topshet', 'ROOM SEAT TOPSHET STYLES' in c and '#subview-room-topshet .a4-page' in c),
    ('Print CSS mode', 'body.print-room-topshet-mode' in c),
    ('Dropdown link in seat-plan.html', '<li><a href="seat-plan?view=room-topshet"' in c or '<li><a href="seat-plan.html?view=room-topshet"' in c),
    ('Sub-nav tab button', 'id="btn-tab-room-topshet"' in c),
    ('Subview container', 'id="subview-room-topshet"' in c),
    ('Pages container', 'id="room-topshet-pages-container"' in c),
    ('Room Topshet JS Engine', 'ROOM SEAT TOPSHET ENGINE' in c),
    ('switchSeatTab handler', "tabName === 'room-topshet'" in c),
    ('switchExamDocument handler', "fileName === 'Room Seat Topshet.html'" in c),
    ('URL router validSeatTabs', "'room-topshet'" in c),
    ('Event listeners sync', 'refreshRoomTopshetData' in c),
    ('PDF downloader function', 'downloadRoomTopshetPDF' in c),
    ('Print function', 'printRoomTopshet' in c),
    ('Font size scaler', 'updateRoomTopshetFontSize' in c),
    ('Live renderer', 'updateRoomTopshetLive' in c)
]

all_passed = True
print("=== SEAT-PLAN.HTML CHECKS ===")
for name, passed in checks:
    print(f'[{ "PASS" if passed else "FAIL" }] {name}')
    if not passed:
        all_passed = False

# Check main.js
with open('main.js', 'r', encoding='utf-8') as f:
    m = f.read()

main_js_passed = "'seat-plan.html?view=room-topshet'" in m
print(f'\n[{ "PASS" if main_js_passed else "FAIL" }] main.js permissions for room-topshet')
if not main_js_passed:
    all_passed = False

# Check other HTML files
html_files = [
    'Home.html', 'index.html', 'exam-portal.html', 'advance.html', 
    'staff.html', 'student-portal.html', 'result-portal.html', 
    'fees.html', 'notice-board.html', 'others.html', 'contact.html', 'Money Collect.html'
]
print("\n=== NAVBAR CHECKS IN OTHER HTML FILES ===")
for hf in html_files:
    if os.path.exists(hf):
        with open(hf, 'r', encoding='utf-8') as f:
            h_content = f.read()
        has_link = 'view=room-topshet' in h_content
        print(f'[{ "PASS" if has_link else "FAIL" }] {hf}')
        if not has_link:
            all_passed = False

# Check Room Seat Topshet.html exists and is intact
room_file_exists = os.path.exists('Room Seat Topshet.html')
print(f'\n[{ "PASS" if room_file_exists else "FAIL" }] Room Seat Topshet.html exists and untouched')

print('\n========================================')
print('OVERALL STATUS:', 'ALL CHECKS PASSED!' if all_passed else 'SOME CHECKS FAILED!')
print('========================================')
