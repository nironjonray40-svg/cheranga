import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('function switchExamDocument')
print("--- switchExamDocument implementation ---")
print(sp[pos:pos+2500])

pos2 = sp.find('function switchSeatTab')
print("\n--- switchSeatTab implementation ---")
print(sp[pos2:pos2+2000])

