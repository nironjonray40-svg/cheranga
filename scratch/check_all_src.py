import re

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

found = False
for i, line in enumerate(lines, 1):
    for m in re.finditer(r'src\s*=\s*["\']([^"\']*)["\']', line, re.IGNORECASE):
        src_val = m.group(1).strip()
        if not src_val or src_val == '#' or 'undefined' in src_val or 'null' in src_val:
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f'Line {i}: empty or invalid src: "{src_val}" -> {safe_line[:100]}')
            found = True

if not found:
    print("No empty/invalid src found!")
