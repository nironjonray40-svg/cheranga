with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines, 1):
    if 'resolve_static_path' in l:
        print(f"{i}: {l.strip()[:100]}")
