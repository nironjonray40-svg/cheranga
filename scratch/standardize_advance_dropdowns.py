import glob
import re

advance_with_ext = """                    <ul class="dropdown-menu">
                        <li><a href="advance.html?view=fee-structure">Class Fee Structure</a></li>
                        <li><a href="advance.html?view=id-reg-structure">Student ID & Registration Structure</a></li>
                        <li><a href="advance.html?view=class-section-structure">Class & Section Structure</a></li>
                        <li><a href="advance.html?view=slider-management">Headline & Slider Management</a></li>
                        <li><a href="advance.html?view=designation-structure">Staff Designation Structure</a></li>
                        <li><a href="advance.html?view=speeches-management">সভাপতির বাণী ও প্রধান শিক্ষকের বাণী</a></li>
                        <li><a href="advance.html?view=chat">💬 Active Users & Live Chat</a></li>
                        <li><a href="advance.html?view=user-management">👥 শিক্ষক-স্টাফ ইউজার ও পাসওয়ার্ড</a></li>
                        <li><a href="advance.html?view=sms-settings">📱 SMS Gateway & API Settings</a></li>
                        <li><a href="advance.html?view=cms-portal">🌐 CMS Website & Data Import</a></li>
                        <li><a href="advance.html?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>
                    </ul>"""

advance_without_ext = """                    <ul class="dropdown-menu">
                        <li><a href="advance?view=fee-structure">Class Fee Structure</a></li>
                        <li><a href="advance?view=id-reg-structure">Student ID & Registration Structure</a></li>
                        <li><a href="advance?view=class-section-structure">Class & Section Structure</a></li>
                        <li><a href="advance?view=slider-management">Headline & Slider Management</a></li>
                        <li><a href="advance?view=designation-structure">Staff Designation Structure</a></li>
                        <li><a href="advance?view=speeches-management">সভাপতির বাণী ও প্রধান শিক্ষকের বাণী</a></li>
                        <li><a href="advance?view=chat">💬 Active Users & Live Chat</a></li>
                        <li><a href="advance?view=user-management">👥 শিক্ষক-স্টাফ ইউজার ও পাসওয়ার্ড</a></li>
                        <li><a href="advance?view=sms-settings">📱 SMS Gateway & API Settings</a></li>
                        <li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>
                        <li><a href="advance?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>
                    </ul>"""

updated = []
for fname in glob.glob('*.html'):
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if this file has advance dropdown
    pattern = r'(<li\s+class="nav-item[^"]*dropdown[^"]*"[^>]*data-tab="advance"[^>]*>\s*<a\s+href="([^"]+)">Advance</a>\s*)<ul class="dropdown-menu">.*?</ul>'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        href_main = m.group(2)
        replacement_menu = advance_with_ext if '.html' in href_main else advance_without_ext
        new_content = content[:m.start()] + m.group(1) + replacement_menu + content[m.end():]
        if new_content != content:
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated.append(fname)

print(f"Updated {len(updated)} files:")
for u in updated:
    print(" - " + u)
