# -*- coding: utf-8 -*-
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

s_start = text.find('<script id="omr-reader-script">')
s_end = text.find('</script>', s_start)
js_code = text[s_start + len('<script id="omr-reader-script">'):s_end]

with open('scratch/temp_omr_code.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Extracted JS lines:", len(js_code.splitlines()))

# Test with node
try:
    res = subprocess.run(['node', '--check', 'scratch/temp_omr_code.js'], capture_output=True, text=True)
    if res.returncode == 0:
        print("NODE SYNTAX CHECK PASSED! No JS syntax errors found.")
    else:
        print("NODE SYNTAX CHECK FAILED:")
        print(res.stderr)
except Exception as e:
    print("Could not run node:", e)
