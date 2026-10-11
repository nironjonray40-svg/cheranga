with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines, 1):
    if 'loadCmsDataEngine' in l:
        print(f"{i}: {l.strip()[:100]}")
