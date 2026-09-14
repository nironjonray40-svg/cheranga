import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('function switchSeatTab')
# print lines around switchSeatTab
print(sp[pos:pos+1500])
