import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

# search all function definitions related to rendering in seat-plan.html
for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\(', text):
    fname = m.group(1)
    if 'render' in fname.lower() or 'attendance' in fname.lower() or 'topshet' in fname.lower() or 'details' in fname.lower() or 'student' in fname.lower():
        print(f"Line approx {text[:m.start()].count('\n')+1}: function {fname}")
