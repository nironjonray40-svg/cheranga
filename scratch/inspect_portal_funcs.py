import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find autoGenerateIdShiftSequentialIds and other ID functions
funcs = ['autoGenerateIdShiftSequentialIds', 'generateStudentId', 'applyIdShiftAndSave', 'saveStudentForm', 'getClassPrefix', 'getClassRegPrefix', 'updateIdRegPreviews', 'id_reg_settings']
for fn in funcs:
    idx = text.find(fn)
    while idx != -1:
        print(f'=== Function/Term: {fn} ===')
        print(text[max(0, idx-50):min(len(text), idx+1000)])
        idx = text.find(fn, idx+len(fn)+1)
