import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function updateStudentDataTopsheetLive')
if idx != -1:
    print('=== Student Data Topsheet.html updateStudentDataTopsheetLive ===')
    print(text[idx:idx+3500])
