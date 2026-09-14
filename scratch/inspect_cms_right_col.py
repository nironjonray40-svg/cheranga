import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('RIGHT COLUMN: SECTION VISIBILITY')
if idx == -1:
    idx = text.find('সেকশন দৃশ্যমানতা ও লেআউট')

print("Snippet for Right Column:")
print(text[idx-50:idx+3500])
