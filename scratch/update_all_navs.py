import glob
import re

files_updated = []
for fname in glob.glob('*.html'):
    if fname == 'advance.html':
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Pattern 1: advance.html?view=cms-portal
    if '<li><a href="advance.html?view=cms-portal">🌐 CMS Website & Data Import</a></li>' in new_content:
        if 'address-structure' not in new_content:
            new_content = new_content.replace(
                '<li><a href="advance.html?view=cms-portal">🌐 CMS Website & Data Import</a></li>',
                '<li><a href="advance.html?view=cms-portal">🌐 CMS Website & Data Import</a></li>\n                        <li><a href="advance.html?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>'
            )
    # Pattern 2: advance?view=cms-portal
    elif '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>' in new_content:
        if 'address-structure' not in new_content:
            new_content = new_content.replace(
                '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>',
                '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>\n                        <li><a href="advance?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>'
            )
    
    if new_content != content:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_updated.append(fname)

print("Updated files:", len(files_updated), files_updated)
