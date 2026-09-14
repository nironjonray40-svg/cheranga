# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all subviews and their IDs
subview_matches = re.findall(r'(<div[^>]*id=["\'](subview-[^"\']+)["\'][^>]*>)', content)
print("Subviews found:")
for sm, sid in subview_matches:
    print(f"ID: {sid} -> {sm[:120]}")

# Let's find the navigation bar items (the top tabs)
nav_match = re.search(r'(<ul[^>]*class=["\'][^"\']*nav[^"\']*["\'][^>]*>.*?</ul>)', content, re.DOTALL)
if nav_match:
    print("\nNav list found:\n", nav_match.group(1)[:1500])

# Let's find the dropdown menu or other navigation menus for tabs
menu_matches = re.findall(r'<a[^>]*onclick=["\']switchSeatTab\([^)]+\)[^>]*>.*?</a>', content, re.DOTALL)
print(f"\nTotal switchSeatTab links: {len(menu_matches)}")
for m in menu_matches[:15]:
    print(m.strip())

# Let's see switchSeatTab implementation
tab_func = re.search(r'function switchSeatTab\([^)]*\)\s*\{.*?\n        \}', content, re.DOTALL)
if tab_func:
    print("\nswitchSeatTab implementation:\n", tab_func.group(0)[:2000])

# Let's see how switchExamDocument is implemented
doc_func = re.search(r'function switchExamDocument\([^)]*\)\s*\{.*?\n        \}', content, re.DOTALL)
if doc_func:
    print("\nswitchExamDocument implementation:\n", doc_func.group(0)[:2000])
