import os
import glob
import re

files = glob.glob(r'c:\Users\niron\OneDrive\Desktop\Cheranga\*.html')
matching_files = []

for f in files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    if 'data-tab="exam-portal"' in content or 'Exam Portal' in content:
        # Check if it has the dropdown menu
        m = re.search(r'<li[^>]*data-tab="exam-portal"[^>]*>.*?</ul>\s*</li>', content, re.DOTALL)
        if m:
            matching_files.append((os.path.basename(f), m.group(0)[:150]))

print(f"Total files with exam-portal dropdown: {len(matching_files)}")
for name, snippet in matching_files:
    print(f"- {name}")
