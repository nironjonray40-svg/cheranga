import re

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.findall(r'fetch\([\'"`]([^\'"`]+)[\'"`]', text)
print('Fetch URLs in cms.html:', set(matches))
