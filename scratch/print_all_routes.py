with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\server.py', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
print("ASGI Routes:")
for m in re.finditer(r'path\s*(?:==|in|\.startswith)\s*([^\n:]+):', text):
    print(m.group(0))

print("\nFallback Routes:")
for m in re.finditer(r'parsed_url\.path\s*(?:==|in|\.startswith)\s*([^\n:]+):', text):
    print(m.group(0))
