import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines[1700:2000], start=1701):
    print(f"{i}: {l.rstrip()}")
