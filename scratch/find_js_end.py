# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, l in enumerate(lines):
    if 'downloadSeatingDetailsPDF' in l or 'printSeatingDetails' in l or 'window.downloadSeatingDetailsPDF' in l:
        for j in range(max(0, i-5), min(len(lines), i+45)):
            print(f"{j+1}: {lines[j]}")
        break
