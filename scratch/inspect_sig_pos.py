# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, l in enumerate(lines):
    if 'footer-signatures' in l or '.a4-page' in l or '.container' in l or 'sig-col' in l or 'sig-line' in l:
        print(f"Line {i+1}: {l}")
