import re
import subprocess
import sys

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks found: {len(scripts)}")

for i, s in enumerate(scripts):
    s_clean = s.strip()
    if not s_clean:
        continue
    test_path = rf'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\test_script_{i}.js'
    with open(test_path, 'w', encoding='utf-8') as out:
        out.write(s_clean)
    res = subprocess.run(['node', '--check', test_path], capture_output=True, text=True)
    if res.returncode == 0:
        print(f"Script {i} (length {len(s_clean)}): VALID Syntax OK")
    else:
        print(f"Script {i} (length {len(s_clean)}): ERROR:")
        print(res.stderr[:500])
