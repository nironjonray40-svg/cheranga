# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
print(f"Total lines in seat-plan.html: {len(lines)}")
for i in range(len(lines)-60, len(lines)):
    print(f"{i+1}: {lines[i]}")
