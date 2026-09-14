import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('idDisplay =')
while idx != -1:
    print('=== Seating arrangement details.html idDisplay ===')
    print(text[max(0, idx-200):min(len(text), idx+500)])
    idx = text.find('idDisplay =', idx+1)

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f2:
    text2 = f2.read()
idx2 = text2.find('formatRange')
if idx2 == -1: idx2 = text2.find('idDisplay')
if idx2 == -1: idx2 = text2.find('formatRoll')
if idx2 == -1: idx2 = text2.find('students.map')
print('=== Room Seat Topshet.html ID/Roll logic ===')
print(text2[max(0, idx2-200):min(len(text2), idx2+1000)])
