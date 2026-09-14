# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines):
    if 'seating-details' in line or 'Seating arrangement details' in line:
        print(f"Line {i+1}: {line.strip()[:140]}")
