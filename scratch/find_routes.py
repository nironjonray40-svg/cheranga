import re

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\server.py', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['def app(', 'async def app(', 'scope', 'parse_qs', 'request', 'do_GET', 'do_POST', 'start_hypercorn_server']):
        print(f"Line {i+1}: {line.strip()[:100]}")
