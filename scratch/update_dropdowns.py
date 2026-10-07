import os
import re

files = [
    'advance.html', 'contact.html', 'exam-portal.html', 'fees.html',
    'Home.html', 'index.html', 'Money Collect.html', 'notice-board.html',
    'others.html', 'result-portal.html', 'seat-plan.html', 'staff.html',
    'student-portal.html'
]

base_dir = r'c:\Users\niron\OneDrive\Desktop\Cheranga'

for name in files:
    path = os.path.join(base_dir, name)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine whether the links use .html or not
    # Pattern looks for:
    # <li><a href="exam-portal(\.html)?\?view=sms">SMS</a></li>
    m = re.search(r'(<li><a href="exam-portal(\.html)?\?view=sms">SMS</a></li>)', content)
    if m:
        sms_line = m.group(1)
        ext = m.group(2) or ''
        omr_line = f'<li><a href="exam-portal{ext}?view=omr-reader">Omr Reder</a></li>'
        if omr_line not in content:
            new_block = sms_line + '\n                        ' + omr_line
            content = content.replace(sms_line, new_block, 1)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[+] Updated dropdown in {name}")
        else:
            print(f"[=] Already present in {name}")
    else:
        print(f"[!] SMS line not found in {name}")
