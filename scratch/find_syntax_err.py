import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find("safeJsonParse('school_saved_seat_allocations', null);,")
if idx == -1:
    idx = text.find("null);,")
print("Found at:", idx)
if idx != -1:
    print(text[max(0, idx-200):min(len(text), idx+200)])
