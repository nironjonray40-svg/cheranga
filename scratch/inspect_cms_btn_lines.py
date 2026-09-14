import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

lines = cms_text.splitlines()
for i in [3196, 3197, 3198, 3199, 3200, 3247, 3248, 3249, 3250, 3251, 3274, 3275, 3276, 3381, 3382, 3383, 3623, 3624, 3625]:
    if i < len(lines):
        print(f"Line {i+1}: {lines[i]}")
