import re

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'<select[^>]*id=["\']([^"\']+)["\']', text, re.IGNORECASE)
print('Marksheet.html select IDs:', matches)

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    text1 = f.read()
matches1 = re.findall(r'<select[^>]*id=["\']([^"\']+)["\']', text1, re.IGNORECASE)
print('Marksheet1.html select IDs:', matches1)
