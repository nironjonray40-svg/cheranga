# -*- coding: utf-8 -*-
import sys, sqlite3, json, re
sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect all places where toBnNum is called
with open('scratch/attendance_engine.js', 'r', encoding='utf-8') as f:
    js = f.read()

print("Occurrences of toBnNum in attendance_engine.js:", len(re.findall(r'\btoBnNum\b', js)))
print("Occurrences of function toBnNum in attendance_engine.js:", len(re.findall(r'function\s+toBnNum\b', js)))

print("\nOccurrences of toBnNum in seat-plan.html:")
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sph = f.read()
print("Occurrences of toBnNum in seat-plan.html:", len(re.findall(r'\btoBnNum\b', sph)))
print("Occurrences of function toBnNum in seat-plan.html:", len(re.findall(r'function\s+toBnNum\b', sph)))
