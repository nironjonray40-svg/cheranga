# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

print("Starting router and cross-file dropdown updates...")

# 1. Update seat-plan.html router and interceptor
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Update validSeatTabs
seat_content = seat_content.replace(
    "const validSeatTabs = ['exam-routine', 'building-mgmt', 'seat-distribution', 'seating-details', 'seating-arrangement-details', 'room-topshet', 'room-seat-topshet', 'room_topsheet', 'room-topsheet', 'admit-card', 'find-seat', 'exam-document-report', 'report'];",
    "const validSeatTabs = ['exam-routine', 'building-mgmt', 'seat-distribution', 'seating-details', 'seating-arrangement-details', 'room-topshet', 'room-seat-topshet', 'room_topsheet', 'room-topsheet', 'student-attendance', 'attendance-sheet', 'student-attendance-sheet', 'student_attendance', 'attendance', 'admit-card', 'find-seat', 'exam-document-report', 'report'];"
)

# Update mappedTab in interceptor
old_interceptor_mapping = '''                        if (viewName === 'room-seat-topshet' || viewName === 'room_topsheet' || viewName === 'room-topsheet') mappedTab = 'room-topshet';
                        switchSeatTab(mappedTab, true);'''
new_interceptor_mapping = '''                        if (viewName === 'room-seat-topshet' || viewName === 'room_topsheet' || viewName === 'room-topsheet') mappedTab = 'room-topshet';
                        if (viewName === 'student-attendance' || viewName === 'attendance-sheet' || viewName === 'student-attendance-sheet' || viewName === 'student_attendance' || viewName === 'attendance') mappedTab = 'student-attendance';
                        switchSeatTab(mappedTab, true);'''
seat_content = seat_content.replace(old_interceptor_mapping, new_interceptor_mapping)

# Update popstate and DOMContentLoaded
old_popstate_mapping = '''            if (viewParam === 'room-seat-topshet' || viewParam === 'room_topsheet' || viewParam === 'room-topsheet') targetTab = 'room-topshet';
            switchSeatTab(targetTab, false);'''
new_popstate_mapping = '''            if (viewParam === 'room-seat-topshet' || viewParam === 'room_topsheet' || viewParam === 'room-topsheet') targetTab = 'room-topshet';
            if (viewParam === 'student-attendance' || viewParam === 'attendance-sheet' || viewParam === 'student-attendance-sheet' || viewParam === 'student_attendance' || viewParam === 'attendance') targetTab = 'student-attendance';
            switchSeatTab(targetTab, false);'''
seat_content = seat_content.replace(old_popstate_mapping, new_popstate_mapping)

old_dom_mapping = '''                } else if (viewParam === 'room-seat-topshet' || viewParam === 'room_topsheet' || viewParam === 'room-topsheet') {
                    targetTab = 'room-topshet';
                } else {'''
new_dom_mapping = '''                } else if (viewParam === 'room-seat-topshet' || viewParam === 'room_topsheet' || viewParam === 'room-topsheet') {
                    targetTab = 'room-topshet';
                } else if (viewParam === 'student-attendance' || viewParam === 'attendance-sheet' || viewParam === 'student-attendance-sheet' || viewParam === 'student_attendance' || viewParam === 'attendance') {
                    targetTab = 'student-attendance';
                } else {'''
seat_content = seat_content.replace(old_dom_mapping, new_dom_mapping)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_content)
print("Updated seat-plan.html routing and interceptor.")

# 2. Update dropdowns in other HTML files
html_files = [
    'Home.html', 'index.html', 'student-portal.html', 'staff.html',
    'exam-portal.html', 'result-portal.html', 'Money Collect.html',
    'Tabulation Sheet.html', 'Marksheet.html', 'Marksheet1.html',
    'advance.html', 'notice-board.html', 'others.html', 'contact.html'
]

attendance_nav_item = '<li><a href="seat-plan?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>'

for fname in html_files:
    if not os.path.exists(fname):
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'seat-plan?view=student-attendance' in content:
        print(f"Skipping {fname}: already contains link.")
        continue

    # Find room-topshet link
    pattern = r'(<li><a\s+href=["\']seat-plan\?view=room-topshet["\'][^>]*>.*?</a></li>)'
    match = re.search(pattern, content)
    if match:
        original_tag = match.group(1)
        # Determine indentation
        indent_match = re.search(r'(\s*)' + re.escape(original_tag), content)
        indent = indent_match.group(1) if indent_match else '                        '
        new_tag = original_tag + '\n' + indent + attendance_nav_item
        content = content.replace(original_tag, new_tag, 1)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fname} successfully.")
    else:
        # Check seating-details or seat-distribution as fallback
        fallback_pattern = r'(<li><a\s+href=["\']seat-plan\?view=seating-details["\'][^>]*>.*?</a></li>)'
        fb_match = re.search(fallback_pattern, content)
        if fb_match:
            original_tag = fb_match.group(1)
            indent_match = re.search(r'(\s*)' + re.escape(original_tag), content)
            indent = indent_match.group(1) if indent_match else '                        '
            new_tag = original_tag + '\n' + indent + '<li><a href="seat-plan?view=room-topshet">Room Seat Topshet (কক্ষের আসন টপশীট)</a></li>\n' + indent + attendance_nav_item
            content = content.replace(original_tag, new_tag, 1)
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {fname} (with fallback).")
        else:
            print(f"Could not find seat-plan dropdown in {fname}.")

# 3. Update main.js
if os.path.exists('main.js'):
    with open('main.js', 'r', encoding='utf-8') as f:
        main_js_content = f.read()
    if "'seat-plan?view=student-attendance'" not in main_js_content:
        # Add to view permissions if exists
        target_perm = "'seat-plan?view=room-topshet': ['seat_print', 'seat_topsheet'],"
        if target_perm in main_js_content:
            new_perm = target_perm + "\n        'seat-plan?view=student-attendance': ['seat_attendance', 'seat_print', 'seat_plan'],"
            main_js_content = main_js_content.replace(target_perm, new_perm)
            with open('main.js', 'w', encoding='utf-8') as f:
                f.write(main_js_content)
            print("Updated main.js permissions.")
        else:
            print("main.js permission pattern not found directly, checking other patterns...")
