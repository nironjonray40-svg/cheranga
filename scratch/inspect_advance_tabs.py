import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's find navigation tabs or subview containers in advance.html
nav_items = re.findall(r'<li[^>]*class=["\'][^"\']*nav-item[^"\']*["\'][^>]*>(.*?)</li>', text, re.DOTALL)
print("Nav items in advance.html:", len(nav_items))

# Let's search for tab switching functions or subviews in advance.html
switch_funcs = re.findall(r'function\s+([a-zA-Z0-9_]*switch[a-zA-Z0-9_]*|[a-zA-Z0-9_]*tab[a-zA-Z0-9_]*)\s*\(', text, re.IGNORECASE)
print("Switch / tab functions in advance.html:", switch_funcs)

# Let's search for sub-views or card headers
headers = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', text)
print("\nHeaders in advance.html:")
for h in headers[:30]:
    clean = re.sub(r'<[^>]+>', '', h).strip()
    if clean:
        print(" -", clean)

# Let's see how school_cms_settings or school_settings is used in advance.html
cms_sett = re.findall(r'school_cms_settings[^\n]*', text)
print("\nschool_cms_settings occurrences in advance.html:", len(cms_sett))
for c in cms_sett[:10]:
    print("  ", c[:100])
