with open('server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(1285, 1550):
    if 'print(' in lines[i]:
        print(f"{i+1}: {lines[i].strip()[:100]}")
