import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function updateLivePreview')
if idx == -1: idx = text.find('updateLive')
if idx == -1: idx = text.find('renderSeating')
print('=== Seating arrangement details.html ===')
print(text[max(0, idx):min(len(text), idx+3000)])

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    text2 = f.read()
idx2 = text2.find('function updateLivePreview')
if idx2 == -1: idx2 = text2.find('updateLive')
if idx2 == -1: idx2 = text2.find('renderRoom')
print('=== Room Seat Topshet.html ===')
print(text2[max(0, idx2):min(len(text2), idx2+3000)])
