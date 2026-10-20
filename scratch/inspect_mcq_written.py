import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'function changeMCQWritten' in line:
        for i in range(max(0, idx - 2), min(len(lines), idx + 40)):
            print(f"{i+1}: {lines[i].rstrip()}")
        break
