import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('formatRoomTopshetClassName')
if idx == -1: idx = text.find('formatClassName')
print('=== Room Seat Topshet.html ===')
print(text[max(0, idx-100):min(len(text), idx+1800)])

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    text2 = f.read()
idx2 = text2.find('col-head-rollrange')
print('\n=== Seating arrangement details.html ===')
print(text2[max(0, idx2-400):min(len(text2), idx2+1200)])
