import glob

html_files = glob.glob('*.html')

for fname in html_files:
    if fname == 'advance.html':
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Check for advance?view=cms-portal
    if '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>' in content:
        if '<li><a href="advance?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>' not in content:
            content = content.replace(
                '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>',
                '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>\n                        <li><a href="advance?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>'
            )
            modified = True
    elif 'href="advance?view=cms-portal"' in content:
        print(f"Check format in {fname}")
    
    if modified:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated dropdown in {fname}")
