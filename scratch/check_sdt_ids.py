import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

print("Original SDT script length:", len(js))

# Let's check all document.getElementById calls in SDT script
ids = re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", js)
print("All element IDs referenced in SDT script:", set(ids))

