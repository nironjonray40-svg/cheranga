import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'function normalizeClassString' in l or 'function formatClassNameDisplay' in l or 'function sortClassesSequential' in l:
        print(f"Line {idx+1}: {l.strip()}")
        for j in range(idx, min(idx+25, len(lines))):
            print(f"  {j+1}: {lines[j].rstrip()}")
        print("-" * 30)
