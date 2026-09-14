import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\(', text):
    fname = m.group(1)
    line_no = text[:m.start()].count('\n') + 1
    print(f"Line {line_no:4d}: function {fname}")
