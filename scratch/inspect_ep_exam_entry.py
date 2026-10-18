import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="subview-exam-entry"')
print(text[idx:idx+2500])
