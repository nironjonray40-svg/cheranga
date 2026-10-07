import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.finditer(r'id="(subview-[^"]+)"', text)
for m in matches:
    line_no = text[:m.start()].count('\n') + 1
    print(f"Line {line_no}: {m.group(1)}")
