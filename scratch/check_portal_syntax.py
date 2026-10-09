import re, subprocess

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<script id="omr-reader-script">(.*?)</script>', content, re.DOTALL)
if m:
    js_code = m.group(1)
    with open('scratch/temp_omr_syntax_check.js', 'w', encoding='utf-8') as jf:
        jf.write(js_code)
    res = subprocess.run(['node', '--check', 'scratch/temp_omr_syntax_check.js'], capture_output=True, text=True)
    if res.returncode == 0:
        print('Syntax check PASSED!')
    else:
        print('Syntax check FAILED:\n', res.stderr)
else:
    print('Script tag not found!')
