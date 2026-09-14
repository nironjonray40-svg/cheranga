import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print("--- Matches in seat-plan.html ---")
for idx, line in enumerate(lines):
    if re.search(r'Student\s+Data\s+Topsheet|student-data-topsheet', line, re.I):
        print(f"Line {idx+1}: {line.strip()}")

with open('main.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines_main = f.readlines()

print("\n--- Matches in main.js ---")
for idx, line in enumerate(lines_main):
    if re.search(r'Student\s+Data\s+Topsheet|student-data-topsheet', line, re.I):
        print(f"Line {idx+1}: {line.strip()}")

