import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('tbodyHtml +=')
while idx != -1:
    print('=== Seating arrangement details.html tbodyHtml ===')
    print(text[max(0, idx-400):min(len(text), idx+600)])
    idx = text.find('tbodyHtml +=', idx+1)
