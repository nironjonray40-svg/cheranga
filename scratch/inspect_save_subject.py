with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find the section for Academic Subject Management HTML
idx1 = text.find('Academic Subject Management')
print(f'HTML pos: {idx1}')

# Find saveSubject and surrounding functions
idx2 = text.find('function saveSubject')
print(f'saveSubject pos: {idx2}')

if idx2 != -1:
    print('=== JS around saveSubject ===')
    print(text[idx2:idx2+4000])
