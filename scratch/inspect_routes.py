import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('server.py', 'r', encoding='utf-8') as f:
    text = f.read()

endpoints = re.findall(r'path\s*==\s*[\'"]([^\'"]+)[\'"]|path\.startswith\([\'"]([^\'"]+)[\'"]\)', text)
for e in endpoints:
    print(e[0] or e[1])
