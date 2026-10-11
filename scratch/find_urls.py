import re

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    m = re.findall(r'https?://[^\s"\'<>]+', line)
    if m:
        for url in m:
            print(f"{i}: {url}")
