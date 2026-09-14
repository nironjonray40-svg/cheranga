import re

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.finditer(r'style=[\"\'][^\"\']*(?:margin|padding|gap|height|space)[^\"\']*[\"\']', text, re.IGNORECASE)
found = list(matches)
print(f"Total inline styles with spacing: {len(found)}")
for idx, m in enumerate(found[:40], 1):
    print(f"{idx}: {m.group(0)}")
