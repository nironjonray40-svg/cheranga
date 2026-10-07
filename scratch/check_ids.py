import re

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

ids_in_html = set(re.findall(r'id=["\']([^"\']+)["\']', html))

with open('scratch/script_7.js', 'r', encoding='utf-8') as sf:
    js = sf.read()

get_elem_calls = re.findall(r'document\.getElementById\(["\']([^"\']+)["\']\)', js)
missing = []
for gid in get_elem_calls:
    if gid not in ids_in_html:
        missing.append(gid)

print(f"Total getElementById calls: {len(get_elem_calls)}")
print(f"Missing IDs from HTML: {set(missing)}")
