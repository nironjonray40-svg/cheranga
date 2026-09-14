import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines[1340:1390], start=1341):
    print(f"{i}: {l.rstrip()}")
