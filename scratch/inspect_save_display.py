import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('saveCmsDisplaySettings')
print("Snippet around saveCmsDisplaySettings:")
print(text[idx-500:idx+2500])

# Let's also find where in HTML saveCmsDisplaySettings is called or where the checkboxes are
idx_html = text.find('cmsToggleTicker')
print("\nSnippet around cmsToggleTicker in HTML:")
print(text[idx_html-500:idx_html+2500])
