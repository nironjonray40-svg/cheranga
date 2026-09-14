import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("Exam Document Report HTML in seat-plan.html:")
pos_report = sp.find('id="subview-exam-document-report"')
if pos_report != -1:
    print(sp[pos_report:pos_report+3000])

print("\n--- Checking all subviews in switchSeatTab ---")
pos_switch = sp.find('function switchSeatTab')
pos_switch_end = sp.find('function', pos_switch + 30)
print(sp[pos_switch:pos_switch_end])

