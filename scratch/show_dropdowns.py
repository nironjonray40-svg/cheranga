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
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    m = re.search(r'(<li[^>]*data-tab=["\']seat-plan["\'][^>]*>[\s\S]*?</li>\s*</ul>\s*</li>)', txt)
    if m:
        print(f"=== {fname} ===")
        print(m.group(1)[:300])
        print("...")
    else:
        print(f"=== {fname}: Pattern not matched! ===")
