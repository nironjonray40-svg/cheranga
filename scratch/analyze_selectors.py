import re

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove comments
css_clean = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)

selectors = re.findall(r'([^{]+)\{', css_clean)
sel_list = []
for s in selectors:
    s_clean = s.strip()
    if s_clean and not s_clean.startswith('@'):
        sel_list.append(s_clean)

print("Total selectors:", len(sel_list))
for s in sel_list[:40]:
    print("  ", s)
