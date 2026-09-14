import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

target = """                        <li><a href="student-portal.html?view=list">Student List</a></li>
                        <li><a href="student-portal.html?view=promote">Promotion & Demotion</a></li>"""

replacement = """                        <li><a href="student-portal.html?view=list">Student List</a></li>
                        <li><a href="student-portal.html?view=online-admissions">Online Admissions (অনলাইন ভর্তি আবেদন)</a></li>
                        <li><a href="student-portal.html?view=promote">Promotion & Demotion</a></li>"""

updated = []
for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if target in content and 'student-portal.html?view=online-admissions' not in content:
        content = content.replace(target, replacement)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        updated.append(file)

print('Updated files:', updated)
