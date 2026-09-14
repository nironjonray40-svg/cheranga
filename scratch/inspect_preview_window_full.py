import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('id="subview-exam-document-report"')
print(sp[pos:pos+5000])

