import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines[1200:1500], start=1201):
    print(f"{i}: {l.rstrip()}")
