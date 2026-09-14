import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('rowsHtml += `<tr><td>${studentId}</td>')
if idx != -1:
    print('=== Room Seat Topshet.html ===')
    print(text[max(0, idx-600):min(len(text), idx+200)])

with open('seat-plan.html', 'r', encoding='utf-8') as f2:
    text2 = f2.read()

idx2 = text2.find('rowsHtml += `<tr><td>${studentId}</td>')
if idx2 != -1:
    print('=== seat-plan.html ===')
    print(text2[max(0, idx2-600):min(len(text2), idx2+200)])
