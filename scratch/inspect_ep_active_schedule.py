import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('activeExamScheduleId')
while idx != -1:
    print("Match around activeExamScheduleId:")
    print(text[max(0, idx-100):min(len(text), idx+600)])
    print("="*40)
    idx = text.find('activeExamScheduleId', idx+1)
    if idx != -1 and idx > 150000: break
