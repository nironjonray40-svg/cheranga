with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines, 1):
    if 'sse' in l.lower():
        print(f"{i}: {l.strip()[:100]}")
