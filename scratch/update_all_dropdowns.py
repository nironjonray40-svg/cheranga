import os
import re

files_with_html_ext = ['index.html', 'Home.html', 'notice-board.html']
files_with_clean_url = ['staff.html', 'student-portal.html', 'exam-portal.html', 'result-portal.html', 'advance.html', 'fees.html', 'contact.html', 'others.html', 'Money Collect.html']

for fname in files_with_html_ext:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    if 'view=seating-details' in txt:
        print(f'{fname} already updated.')
        continue

    # Look for seat-distribution line in seat-plan dropdown
    target = '<li><a href="seat-plan.html?view=seat-distribution">Seat Distribution</a></li>'
    replacement = '<li><a href="seat-plan.html?view=seat-distribution">Seat Distribution</a></li>\n                        <li><a href="seat-plan.html?view=seating-details">Seating Details (সামারি ও আসন বিন্যাস)</a></li>'
    
    if target in txt:
        txt = txt.replace(target, replacement)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(txt)
        print(f'{fname} updated successfully.')
    else:
        print(f'{fname}: target string not found!')

for fname in files_with_clean_url:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    if 'view=seating-details' in txt:
        print(f'{fname} already updated.')
        continue

    target = '<li><a href="seat-plan?view=seat-distribution">Seat Distribution</a></li>'
    replacement = '<li><a href="seat-plan?view=seat-distribution">Seat Distribution</a></li>\n                        <li><a href="seat-plan?view=seating-details">Seating Details (সামারি ও আসন বিন্যাস)</a></li>'
    
    if target in txt:
        txt = txt.replace(target, replacement)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(txt)
        print(f'{fname} updated successfully.')
    else:
        print(f'{fname}: target string not found!')
