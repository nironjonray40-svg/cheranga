import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Admit Card.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderAdmitCards()')
if idx != -1:
    print('=== Admit Card.html renderAdmitCards ===')
    print(text[idx:idx+2500])

with open('seat-plan.html', 'r', encoding='utf-8') as f2:
    text2 = f2.read()

idx2 = text2.find('function renderAdmitCards()')
if idx2 != -1:
    print('\n=== seat-plan.html renderAdmitCards ===')
    print(text2[idx2:idx2+2500])
