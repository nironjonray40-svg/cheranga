# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Let's search for URLSearchParams in seat-plan.html
lines = seat_content.split('\n')
for i, l in enumerate(lines):
    if 'URLSearchParams' in l or 'searchParams' in l or 'initSeatPortal' in l or 'viewParam' in l or 'DOMContentLoaded' in l:
        print(f"Line {i+1}: {l.strip()}")
