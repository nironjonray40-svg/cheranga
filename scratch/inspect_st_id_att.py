import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find all places where stId or studentId is used in Student attendance sheet.html
idx = 0
while True:
    m = text.find('stId', idx)
    if m == -1: break
    print(f"Match at {m}:")
    print(text[max(0, m-80):min(len(text), m+150)])
    print("-"*40)
    idx = m + 4
