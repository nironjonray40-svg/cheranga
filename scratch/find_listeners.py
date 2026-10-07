import re

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the script block id="omr-reader-script"
m = re.search(r'<script id="omr-reader-script">(.*?)</script>', text, re.DOTALL)
if not m:
    print("omr-reader-script not found")
    exit(1)

js = m.group(1)

# Find all pattern: xxx.addEventListener
lines = js.split('\n')
for i, line in enumerate(lines):
    if '.addEventListener' in line:
        print(f"Line {i+1}: {line.strip()}")
