import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find("null);,")
if idx == -1: idx = text.find("null); ,")
if idx == -1: idx = text.find(", {});")
print("Found at:", idx)
if idx != -1:
    print(text[max(0, idx-100):min(len(text), idx+100)])
