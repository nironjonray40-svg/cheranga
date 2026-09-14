# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/attendance_script_3.js', 'r', encoding='utf-8') as f:
    js_text = f.read()

# Print all functions and their line counts
matches = re.finditer(r'function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)', js_text)
print("Functions in attendance script:")
for m in matches:
    name = m.group(1)
    args = m.group(2)
    start = m.start()
    print(f"- {name}({args}) at pos {start}")

print("\nLet's check any event listeners or window onload / DOMContentLoaded in script:")
events = re.findall(r'(?:window|document)\.addEventListener\([^)]+\);?', js_text)
for ev in events:
    print("  ", ev)
