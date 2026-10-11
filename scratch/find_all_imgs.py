import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
imgs = re.findall(r'<img[^>]+>', text)
for i, img in enumerate(imgs, 1):
    print(f"{i}: {img}")
