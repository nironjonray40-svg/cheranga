# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i in range(2540, 2600):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}")
