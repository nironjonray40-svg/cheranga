import re
import subprocess

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script(?:\s+[^>]*)?>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks found: {len(scripts)}")

for idx, s in enumerate(scripts):
    js_filename = f'scratch/test_cms_syntax_{idx}.js'
    with open(js_filename, 'w', encoding='utf-8') as fjs:
        fjs.write(s)
    res = subprocess.run(['node', '--check', js_filename], capture_output=True, text=True)
    if res.returncode == 0:
        print(f"Script block {idx}: OK")
    else:
        print(f"Script block {idx} ERROR:\n{res.stderr}")
