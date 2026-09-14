import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx_cms = text.find('id="subview-cms-portal"')
if idx_cms != -1:
    print("=== subview-cms-portal HTML ===")
    print(text[idx_cms:idx_cms+4000])

# Let's also find the JS functions for cms-portal
cms_fns = re.findall(r'function\s+([a-zA-Z0-9_]*cms[a-zA-Z0-9_]*|[a-zA-Z0-9_]*portal[a-zA-Z0-9_]*)\s*\(', text, re.IGNORECASE)
print("\nCMS / portal JS functions:", cms_fns)
