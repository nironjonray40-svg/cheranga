# Script to inspect lines 2680 to 2960 in Marksheet.html
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
for idx in range(2675, min(2700, len(lines))):
    print(f"{idx+1}: {lines[idx]}", end='')

print("...")
for idx in range(2950, min(2990, len(lines))):
    print(f"{idx+1}: {lines[idx]}", end='')
