import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

fetches = re.findall(r'fetch\([^\)]+\)', html)
print(f"Total fetches in cms.html: {len(fetches)}")
for f_call in fetches[:20]:
    print(" ", f_call)

sync_matches = re.findall(r'function\s+([a-zA-Z0-9_]*sync[a-zA-Z0-9_]*|[a-zA-Z0-9_]*push[a-zA-Z0-9_]*|[a-zA-Z0-9_]*pull[a-zA-Z0-9_]*)\s*\(', html, re.I)
print("\nSync functions in cms.html:", sync_matches)
