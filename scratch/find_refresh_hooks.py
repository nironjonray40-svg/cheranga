# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Find all places where refreshRoomTopshetData or refreshSeatingDetails is called
lines = seat_content.split('\n')
for i, line in enumerate(lines):
    if 'refreshRoomTopshetData' in line or 'refreshSeatingDetails' in line:
        print(f"Line {i+1}: {line.strip()}")
