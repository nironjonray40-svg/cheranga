import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    adv_text = f.read()

# Find toggles in advance.html
toggles = re.findall(r'<input[^>]*type=["\']checkbox["\'][^>]*id=["\'](cmsToggle[^"\']+)["\'][^>]*>.*?<label[^>]*for=["\']\1["\'][^>]*>(.*?)</label>', adv_text, re.DOTALL)
print("CMS Toggles in advance.html:")
for t in toggles:
    clean_label = re.sub(r'<[^>]+>', '', t[1]).strip()
    print(f" - ID: {t[0]} -> Label: {clean_label}")

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

# Let's see how cms.html uses school_cms_settings
idx_cms_set = cms_text.find('school_cms_settings')
while idx_cms_set != -1:
    print("\n--- cms.html school_cms_settings snippet ---")
    print(cms_text[idx_cms_set-50:idx_cms_set+500])
    idx_cms_set = cms_text.find('school_cms_settings', idx_cms_set+20)
