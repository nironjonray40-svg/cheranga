with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if any(k in line for k in ['cms.html', 'index.html', 'route', 'path == "/"', "path == '/'", 'handle_static', 'open(']):
        if 'def ' in line or 'if ' in line or 'return' in line:
            print(f"{i}: {line.strip()[:100]}")
