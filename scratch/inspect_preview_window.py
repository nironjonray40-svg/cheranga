# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, l in enumerate(lines):
    if 'Preview Window' in l or 'inline-admit-card' in l or 'admit-card-iframe' in l:
        print(f"Line {i+1}: {l.strip()[:140]}")
