import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('.switch')
print(".switch found in advance.html:", idx != -1)

with open('style.css', 'r', encoding='utf-8', errors='ignore') as f:
    css_text = f.read()

idx_css = css_text.find('.switch')
print(".switch found in style.css:", idx_css != -1)
