import os
import re

files_to_check = [
    'index.html',
    'Home.html',
    'staff.html',
    'student-portal.html',
    'exam-portal.html',
    'result-portal.html',
    'advance.html',
    'notice-board.html',
    'fees.html',
    'contact.html',
    'others.html',
    'Money Collect.html'
]

for fname in files_to_check:
    if not os.path.exists(fname):
        print(f"Skipping {fname} (not found)")
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    # Check if seating-details is already in the file
    if 'view=seating-details' in txt or 'Seating arrangement details' in txt:
        print(f"{fname}: already has seating details reference")
    else:
        print(f"{fname}: needs dropdown update")
