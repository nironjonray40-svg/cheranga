with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()[:1920]

for idx, l in enumerate(lines, 1):
    if '::before' in l or '::after' in l or ':before' in l or ':after' in l:
        print(f"Line {idx}: {l.strip()}")
