import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if any(k in line.lower() for k in ['chairman', 'headmaster', 'speech', 'সভাপতি', 'প্রধান শিক্ষক', 'বাণী', 'বানী']):
        print(f"Line {idx}: {line.strip()[:110]}")
