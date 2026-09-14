import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('id="subview-general"')
print(text[idx:idx+2500])
