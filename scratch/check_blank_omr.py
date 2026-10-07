import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
m = re.findall(r'btnDownloadBlankOMR[^\n;]+[;\n]', text)
print(m)
for m2 in re.finditer(r'btnDownloadBlankOMR', text):
    start = max(0, m2.start() - 100)
    end = min(len(text), m2.start() + 200)
    print(text[start:end])
    print("=" * 40)
