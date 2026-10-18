import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# search for table columns or headers in exam-entry
for m in re.finditer(r'<th[^>]*>.*?</th>', text, re.IGNORECASE):
    chunk = m.group(0)
    if 'Exam' in chunk or 'পরীক্ষা' in chunk or 'Class' in chunk or 'শ্রেণি' in chunk:
        print("TH:", chunk[:80])

idx = text.find('id="exam-entry"')
if idx == -1:
    idx = text.find('id="subview-exam-entry"')
if idx == -1:
    idx = text.find('exam-entry')
print("Index:", idx)
if idx != -1:
    print(text[idx-100:idx+800])
