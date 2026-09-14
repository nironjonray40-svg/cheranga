import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

idx = cms_text.find('function applySectionVisibilities(')
if idx != -1:
    print("=== applySectionVisibilities in cms.html ===")
    print(cms_text[idx:idx+2500])
