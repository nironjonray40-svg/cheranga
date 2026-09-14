import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if any(k in line for k in ['topLoginCtaBtn', 'ERP লগইন', 'topAuthContainer', 'checkLoginState', 'renderAuth', 'auth']):
        print(f"L{idx}: {line.strip()[:120]}")
