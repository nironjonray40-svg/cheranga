import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
print("Length:", len(text))
scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL)
print("Scripts count:", len(scripts))
for i, s in enumerate(scripts):
    print(f"Script {i}: length {len(s)}")
    # print first few lines of script
    lines = [l.strip() for l in s.split('\n') if l.strip()]
    print("  First lines:", lines[:5])

# Find form elements or inputs
inputs = re.findall(r'<input[^>]+>', text)
print("Inputs count:", len(inputs))
for inp in inputs[:10]:
    print("  ", inp)
