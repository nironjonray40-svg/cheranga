import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

idx = cms_text.find('function renderAllCmsSections(')
if idx != -1:
    print("=== renderAllCmsSections in cms.html ===")
    print(cms_text[idx:idx+2500])

# Let's also search for section visibility or CMS_CONFIG.sections
idx2 = cms_text.find('CMS_CONFIG.sections')
if idx2 != -1:
    print("\n=== CMS_CONFIG.sections in cms.html ===")
    print(cms_text[idx2-50:idx2+1000])
