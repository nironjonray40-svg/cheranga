import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('// Find schedules for this')
if idx != -1:
    print(text[idx:idx+3000])
