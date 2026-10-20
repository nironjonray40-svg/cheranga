import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Let's find where v-text is converted
for m in re.finditer(r'v-text', html):
    start = max(0, m.start() - 100)
    end = min(len(html), m.end() + 200)
    # print context
    # print(html[start:end])
    # print("="*40)

# Let's find script parts referencing v-text
scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html, re.I)
for s_idx, s in enumerate(scripts):
    if 'v-text' in s:
        print(f"Script {s_idx} has v-text:")
        for line in s.split('\n'):
            if 'v-text' in line or 'v-text-inner' in line or 'v-text-cell' in line:
                print("  ", line.strip())
