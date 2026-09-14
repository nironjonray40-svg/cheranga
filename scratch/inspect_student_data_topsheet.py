import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('updateStudentDataTopsheetLive')
if idx == -1: idx = text.find('renderStudentDataTopsheet')
if idx == -1: idx = text.find('function update')
print('=== Student Data Topsheet.html ===')
print(text[max(0, idx):min(len(text), idx+2500)])
