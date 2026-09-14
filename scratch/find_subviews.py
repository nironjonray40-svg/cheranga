import re

with open('advance.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'subview-' in line and ('id=' in line or 'class=' in line or 'data-view=' in line):
        print(f"Line {i+1}: {line.strip()[:100]}")
