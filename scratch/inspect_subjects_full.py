import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('function getSubjectsForClass')
idx2 = text.find('function renderMarksheetTable')

print(text[idx1:idx2])
