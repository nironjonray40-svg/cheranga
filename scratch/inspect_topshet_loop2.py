import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('rowsHtml += `<tr><td>${studentId}</td>')
if idx != -1:
    print('=== Room Seat Topshet.html ===')
    print(text[max(0, idx-1500):idx+50])
