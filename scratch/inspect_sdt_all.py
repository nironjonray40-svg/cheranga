import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

print("Length:", len(sdt))
scripts = re.findall(r'<script[^>]*>(.*?)</script>', sdt, re.DOTALL | re.I)
for i, sc in enumerate(scripts):
    print(f"--- Script {i} (length: {len(sc)}) ---")
    funcs = re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', sc)
    print("Functions:", funcs)
    vars = re.findall(r'(?:let|const|var)\s+([a-zA-Z0-9_$]+)\s*=', sc)
    print("Variables:", vars[:20])

print("\n--- Non-script HTML ---")
html_only = re.sub(r'<script[^>]*>.*?</script>', '', sdt, flags=re.DOTALL | re.I)
html_only = re.sub(r'<style[^>]*>.*?</style>', '', html_only, flags=re.DOTALL | re.I)
print(html_only)
