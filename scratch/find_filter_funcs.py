import re

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if any(k in line for k in ['function syncCascadingFilters', 'function updateMarksheetExam', 'function updateMarksheetClass', 'function populateExam']):
        print(f"Line {idx}: {line.strip()}")
