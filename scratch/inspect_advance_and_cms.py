import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    adv_text = f.read()

print("Length of advance.html:", len(adv_text))

# Find sidebar tabs or sections in advance.html
tabs = re.findall(r'<button[^>]*data-tab=["\']([^"\']+)["\'][^>]*>(.*?)</button>', adv_text, re.DOTALL)
print("\nTabs in advance.html:")
for t in tabs[:20]:
    clean_label = re.sub(r'<[^>]+>', '', t[1]).strip()
    print(f"- Tab: {t[0]} -> {clean_label}")

# Find section IDs
sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\']', adv_text)
print("\nSections in advance.html:", sections)

# Find localStorage keys in advance.html
adv_keys = re.findall(r'[\'"](school_[a-zA-Z0-9_]+)[\'"]', adv_text)
print("\nschool_* keys in advance.html:", sorted(list(set(adv_keys))))

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

# Find all occurrences of openAdmissionModal or admission buttons in cms.html
buttons = re.findall(r'<[^>]*openAdmissionModal[^>]*>.*?<', cms_text, re.DOTALL)
print("\nAdmission buttons in cms.html:")
for b in buttons:
    print(b)
