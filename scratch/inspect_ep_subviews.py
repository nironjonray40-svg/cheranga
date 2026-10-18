import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function renderExamNamesSubViewTable')
if idx != -1:
    print("=== renderExamNamesSubViewTable ===")
    print(text[idx:idx+1500])

idx2 = text.find("case 'exam-entry':")
if idx2 != -1:
    print("=== exam-entry ===")
    print(text[idx2:idx2+1000])
