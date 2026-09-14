import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx1 = text.find('cmsToggleTicker')
idx2 = text.find('saveCmsDisplaySettings()')
print("=== All Checkboxes in advance.html ===")
print(text[idx1-200:idx2+400])

idx3 = text.find('function saveCmsDisplaySettings()')
print("\n=== saveCmsDisplaySettings implementation ===")
print(text[idx3:idx3+1500])
