import glob
import re

for fname in ['Home.html', 'index.html', 'notice-board.html', 'staff.html', 'exam-portal.html', 'result-portal.html', 'student-portal.html', 'seat-plan.html', 'fees.html', 'others.html', 'Money Collect.html', 'contact.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r'data-tab="advance"[^>]*>.*?<ul class="dropdown-menu">(.*?)</ul>', content, re.DOTALL)
    if match:
        print(f"=== {fname} ===")
        items = re.findall(r'<li><a href="([^"]+)">([^<]+)</a></li>', match.group(1))
        for href, text in items:
            print(f"  {href} -> {text}")
