# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/attendance_script_3.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Let's inspect how it fetches data (localStorage, school.db, sqlite, window.studentsData, etc.)
lines = js_content.split('\n')
for i, line in enumerate(lines[:120]):
    print(f"{i+1:3d}: {line}")

print("\n--- Searching for localStorage / DB calls ---")
storage_matches = [l for l in lines if 'localStorage' in l or 'fetch' in l or 'IndexedDB' in l or 'data' in l.lower()]
for l in storage_matches[:30]:
    print("  ", l.strip())

print("\n--- Functions in JS ---")
funcs = re.findall(r'(function\s+[a-zA-Z0-9_$]+\s*\([^)]*\))', js_content)
for fn in funcs:
    print("  ", fn)
