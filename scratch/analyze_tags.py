import re

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line_num, line in enumerate(lines, 1):
    if '<img' in line.lower():
        # sanitize for console
        safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {line_num}: {safe_line[:120]}")
