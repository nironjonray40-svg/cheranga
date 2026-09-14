import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

idx = cms_text.find('function renderHeroSliders(')
idx_end = cms_text.find('function startHeroSliderTimer(', idx)
print(cms_text[idx:idx_end])
