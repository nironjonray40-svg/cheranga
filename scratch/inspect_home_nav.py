# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Home.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, l in enumerate(lines):
    if 'seat-plan' in l and 'dropdown' in l:
        for j in range(max(0, i-2), min(len(lines), i+15)):
            print(f"{j+1}: {lines[j]}")
        break
