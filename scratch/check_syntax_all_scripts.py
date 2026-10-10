import re, subprocess, json

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

script_pattern = re.compile(r'<script\b([^>]*)>([\s\S]*?)<\/script>', re.IGNORECASE)
matches = list(script_pattern.finditer(text))

print(f"Total script tags found: {len(matches)}")
for idx, m in enumerate(matches):
    attrs = m.group(1)
    code = m.group(2)
    line_num = text[:m.start()].count('\n') + 1
    if 'src=' in attrs:
        print(f"Script {idx} (Line {line_num}): External script ({attrs.strip()})")
    else:
        print(f"Script {idx} (Line {line_num}): Inline script (length: {len(code)})")
        # Save to temp js file and test syntax with node --check
        temp_file = f"scratch/temp_script_{idx}.js"
        with open(temp_file, 'w', encoding='utf-8') as tf:
            tf.write(code)
        
        res = subprocess.run(["node", "--check", temp_file], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"  -> Syntax check PASSED!")
        else:
            print(f"  -> Syntax check FAILED! Error:\n{res.stderr}")
