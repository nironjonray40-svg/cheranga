import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if any(k in line for k in ['ERP লাইভ সিঙ্ক', 'syncStatusBadge', 'sync-indicator-pill', 'লাইভ']):
        print(f"L{idx}: {line.strip()[:140]}")
