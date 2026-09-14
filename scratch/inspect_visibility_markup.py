import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('সেকশন দৃশ্যমানতা')
if idx == -1:
    idx = text.find('cmsToggle')

print("Snippet around Section Visibility in advance.html:")
print(text[idx-200:idx+3500])
