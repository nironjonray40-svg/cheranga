# -*- coding: utf-8 -*-
import os, sys, glob, re

sys.stdout.reconfigure(encoding='utf-8')

html_files = [
    'Home.html', 'index.html', 'notice-board.html', 'exam-portal.html',
    'student-portal.html', 'staff.html', 'result-portal.html', 'Money Collect.html',
    'advance.html', 'contact.html', 'fees.html', 'others.html'
]

for fname in html_files:
    if not os.path.exists(fname):
        continue
    
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Update relative seat-plan.html dropdowns
    # Look for student-attendance in dropdown
    if 'view=student-data-topsheet' not in content:
        # Pattern 1: with .html
        if 'seat-plan.html?view=student-attendance' in content:
            content = content.replace(
                '<li><a href="seat-plan.html?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>',
                '<li><a href="seat-plan.html?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>\n                        <li><a href="seat-plan.html?view=student-data-topsheet">Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)</a></li>'
            )
            modified = True
            print(f"✓ Updated dropdown in {fname} (type 1)")
        # Pattern 2: without .html
        elif 'seat-plan?view=student-attendance' in content:
            content = content.replace(
                '<li><a href="seat-plan?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>',
                '<li><a href="seat-plan?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>\n                        <li><a href="seat-plan?view=student-data-topsheet">Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)</a></li>'
            )
            modified = True
            print(f"✓ Updated dropdown in {fname} (type 2)")
        else:
            # Try regex on any student-attendance link in seat-plan dropdown
            new_content = re.sub(
                r'(<li><a\s+href=["\'](seat-plan(?:\.html)?\?view=student-attendance)["\'][^>]*>.*?</a></li>)',
                r'\1\n                        <li><a href="seat-plan.html?view=student-data-topsheet">Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)</a></li>',
                content
            )
            if new_content != content:
                content = new_content
                modified = True
                print(f"✓ Updated dropdown in {fname} via regex")

    if modified:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)

print("Navbar synchronization complete.")
