import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('benches.forEach')
while idx != -1:
    print('=== Student Data Topsheet.html benches loop ===')
    print(text[max(0, idx-100):min(len(text), idx+1500)])
    idx = text.find('benches.forEach', idx+1)
