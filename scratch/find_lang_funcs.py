import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'updateLanguage' in line or 'changeLanguage' in line or 'translationMap' in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")
