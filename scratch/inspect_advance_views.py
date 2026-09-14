import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's find all subviews in advance.html
subviews = re.findall(r'<div[^>]*id=["\'](subview-[^"\']+)["\'][^>]*>', text)
print("Subviews in advance.html:", subviews)

# Let's find the switchAdvanceView function
idx = text.find('function switchAdvanceView(')
if idx != -1:
    print("\nswitchAdvanceView definition:")
    print(text[idx:idx+1500])
