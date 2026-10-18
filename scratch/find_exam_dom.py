import re, sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Marksheet.html', 'Marksheet1.html']:
    print(f"=== {fname} ===")
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, l in enumerate(lines[:1000]):
        if 'exam' in l.lower() and ('id=' in l or 'class=' in l):
            print(f"Line {idx+1}: {l.strip()[:100]}")
