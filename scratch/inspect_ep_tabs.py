import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find subviews or tabs or headings
matches = re.findall(r'(exam[_\-\s]list|exam[_\-\s]types|exam[_\-\s]schedules|exam[_\-\s]names|পরীক্ষার নাম)', text, re.IGNORECASE)
print('Hits count:', len(matches))
print('Distinct hits:', set(matches))

# find tab titles
for m in re.finditer(r'<li[^>]*>.*?</li>|<button[^>]*>.*?</button>', text, re.IGNORECASE):
    chunk = m.group(0)
    if 'Exam' in chunk or 'পরীক্ষা' in chunk or 'রুটিন' in chunk or 'তালিকা' in chunk:
        print(chunk[:100])
