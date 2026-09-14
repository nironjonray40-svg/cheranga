import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('let tbodyHtml =')
if idx != -1:
    print('--- Student attendance sheet.html ---')
    print(text[idx:idx+1500])

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text2 = f.read()

idx2 = text2.find('let tbodyHtml =')
while idx2 != -1:
    snippet = text2[idx2:idx2+1200]
    if 'col-roll' in snippet or 'Student ID' in snippet or 'studentId' in snippet or 'toBnNum' in snippet:
        print('--- seat-plan.html ---')
        print(snippet)
    idx2 = text2.find('let tbodyHtml =', idx2+1)
