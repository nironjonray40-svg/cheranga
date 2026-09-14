import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

pos = sp.find('function switchExamDocument')
print(sp[pos:pos+2000])

