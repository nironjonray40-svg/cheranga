import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks in cms.html: {len(scripts)}")
for i, s in enumerate(scripts):
    print(f"Script {i}: length {len(s)} chars, preview: {s[:100].strip()}...")

script_tags = re.findall(r'<script[^>]*>', html)
print("Script tags:", script_tags)
