import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'th.v-text' in line or 'v-text-inner' in line or 'v-text-cell' in line:
        start = max(0, idx - 5)
        end = min(len(lines), idx + 15)
        print(f"Around line {idx+1}:")
        for i in range(start, end):
            print(f"  {i+1}: {lines[i].rstrip()}")
        print("="*60)
