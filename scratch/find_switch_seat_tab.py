# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

lines = seat_content.split('\n')
for i, line in enumerate(lines):
    if 'function switchSeatTab(' in line:
        print(f"Line {i+1}: {line}")
        for j in range(i, min(i+80, len(lines))):
            print(f"{j+1:5d}: {lines[j]}")
        break
