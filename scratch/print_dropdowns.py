import os
import glob
import re

files = [
    'advance.html', 'contact.html', 'exam-portal.html', 'fees.html',
    'Home.html', 'index.html', 'Money Collect.html', 'notice-board.html',
    'others.html', 'result-portal.html', 'seat-plan.html', 'staff.html',
    'student-portal.html'
]

for name in files:
    path = os.path.join(r'c:\Users\niron\OneDrive\Desktop\Cheranga', name)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    m = re.search(r'<li[^>]*data-tab="exam-portal"[^>]*>(.*?)</li>\s*<li', c, re.DOTALL)
    if m:
        print(f"=== {name} ===")
        print(m.group(0).strip())
