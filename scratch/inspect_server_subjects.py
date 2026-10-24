with open('server.py', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'school_subjects' in line or 'subjects' in line.lower():
        print(f'{i+1}: {line.strip()[:120]}')
