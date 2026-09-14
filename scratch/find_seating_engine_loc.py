# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, l in enumerate(lines):
    if 'function refreshSeatingDetailsData' in l or 'SEATING ARRANGEMENT DETAILS ENGINE' in l:
        print(f"Line {i+1}: {l}")
        for j in range(max(0, i-2), min(len(lines), i+30)):
            print(f"  {j+1}: {lines[j]}")
