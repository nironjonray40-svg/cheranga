import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

print("=== SDT Content Full Read ===")
print("SDT Length:", len(sdt))
print(sdt[:3000])
print("\n... MIDDLE ...\n")
print(sdt[3000:6000])
