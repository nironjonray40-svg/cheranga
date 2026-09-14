import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

# search for class="sub-nav-tabs"
idx = 0
while True:
    m = text.find('class="sub-nav-tabs"', idx)
    if m == -1: break
    print(f"Found class=\"sub-nav-tabs\" at {m}:")
    print(text[m:m+2000])
    print("="*60)
    idx = m + 20
