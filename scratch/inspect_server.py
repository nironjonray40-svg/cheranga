with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if 'def do_' in line or 'path' in line.lower() and ('api' in line.lower() or 'sync' in line.lower() or 'post' in line.lower()):
        print(f"L{idx}: {line.strip()[:100]}")
