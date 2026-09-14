import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

idx = cms_text.find('if (s.admission === false)')
print("=== s.admission in cms.html ===")
print(cms_text[idx-50:idx+600])
