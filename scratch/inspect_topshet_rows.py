import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('rowsHtml +=')
if idx == -1: idx = text.find('rowsHtml')
while idx != -1:
    print('=== Room Seat Topshet.html rowsHtml ===')
    print(text[max(0, idx-200):min(len(text), idx+600)])
    idx = text.find('rowsHtml +=', idx+1)
