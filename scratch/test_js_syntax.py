import re, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Marksheet.html', 'Marksheet1.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        html = f.read()

    scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
    print(f"=== Checking {fname} ({len(scripts)} scripts) ===")
    for idx, s in enumerate(scripts):
        if not s.strip(): continue
        js_file = f"scratch/test_{fname}_{idx}.js"
        with open(js_file, 'w', encoding='utf-8') as out:
            out.write(s)
        res = subprocess.run(["node", "-c", js_file], capture_output=True, text=True, encoding='utf-8')
        if res.returncode == 0:
            print(f"  Script {idx}: SYNTAX OK")
        else:
            print(f"  Script {idx}: SYNTAX ERROR:\n{res.stderr}")
