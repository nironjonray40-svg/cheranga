import re

# Read complete modals
with open('scratch/prepare_fix.py', 'r', encoding='utf-8') as f:
    text = f.read()
idx1 = text.find('complete_modals_html = """') + len('complete_modals_html = """')
idx2 = text.find('"""\n\nprint("Complete modals')
modals_html = text[idx1:idx2]

# Read current exam-portal.html
with open('exam-portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()

# Combine portal with complete modals
m_start = portal.find('<!-- OMR READER MODALS -->')
m_end = portal.find('<!-- ADD ACADEMIC SUBJECT MODAL -->')

test_html = portal[:m_start] + modals_html + '\n\n    ' + portal[m_end:]
ids_in_html = set(re.findall(r'id=["\']([^"\']+)["\']', test_html))

# Read script_7_fixed.js
with open('scratch/script_7_fixed.js', 'r', encoding='utf-8') as f:
    js = f.read()

get_elem_calls = re.findall(r'document\.getElementById\(["\']([^"\']+)["\']\)', js)
missing = [gid for gid in get_elem_calls if gid not in ids_in_html]

print(f"Total getElementById calls: {len(get_elem_calls)}")
print(f"Missing IDs from HTML: {set(missing)}")
