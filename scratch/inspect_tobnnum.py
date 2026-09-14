import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = 0
while True:
    m = text.find('toBnNum', idx)
    if m == -1: break
    print(f"Match at {m}:")
    print(text[max(0, m-50):min(len(text), m+100)])
    print("-"*40)
    idx = m + 7
