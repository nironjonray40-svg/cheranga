import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('<script>')
if idx == -1: idx = text.find('<script')
print('=== Student Data Topsheet.html script ===')
print(text[idx:idx+2500])
