import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = 0
while True:
    m = text.find('sub-tab-btn', idx)
    if m == -1: break
    print(f"Found sub-tab-btn at {m}:")
    print(text[max(0, m-50):min(len(text), m+250)])
    print("="*60)
    idx = m + 12
