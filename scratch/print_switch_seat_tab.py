import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function switchSeatTab(')
print('=== switchSeatTab full definition ===')
print(text[idx:idx+4000])
