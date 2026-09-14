# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Home.html', 'index.html', 'notice-board.html']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'seat-plan.html?view=student-attendance' in content:
        print(f"Skipping {fname}: already has link.")
        continue

    target = r'(<li><a\s+href=["\']seat-plan\.html\?view=room-topshet["\'][^>]*>.*?</a></li>)'
    match = re.search(target, content)
    if match:
        orig = match.group(1)
        indent_m = re.search(r'(\s*)' + re.escape(orig), content)
        indent = indent_m.group(1) if indent_m else '                        '
        replacement = orig + '\n' + indent + '<li><a href="seat-plan.html?view=student-attendance">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>'
        content = content.replace(orig, replacement, 1)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fname} with attendance link.")
    else:
        print(f"Target not found in {fname}")
