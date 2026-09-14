import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('id="subview-exam-document-report"')
# find preview container
pos2 = sp.find('id="admit-card-preview-title"', pos)
print(sp[pos2-200:pos2+2500])

