import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find rollHeaderLabel usage
idx = text.find('rollHeaderLabel')
while idx != -1:
    print(text[max(0, idx-100):min(len(text), idx+1200)])
    print('='*50)
    idx = text.find('rollHeaderLabel', idx+1)
