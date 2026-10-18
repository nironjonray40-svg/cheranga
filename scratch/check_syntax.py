import subprocess
import re

for filename in ['Marksheet.html', 'Marksheet1.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    scripts = re.findall(r'<script.*?>([\s\S]*?)</script>', html)
    print(f"{filename}: Total script tags: {len(scripts)}")

    with open('scratch/temp_check.js', 'w', encoding='utf-8') as out:
        for s in scripts:
            out.write(s + '\n;\n')

    res = subprocess.run(['node', '-c', 'scratch/temp_check.js'], capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[OK] {filename} syntax is completely valid!")
    else:
        print(f"[ERROR] {filename} syntax error:\n{res.stderr}")
