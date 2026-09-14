import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx_cms = text.find('id="subview-cms-portal"')
idx_cms_end = text.find('</div>\n            <!-- SUB-VIEW 12', idx_cms)
if idx_cms_end == -1:
    idx_cms_end = text.find('id="subview-address-structure"', idx_cms)

print("=== subview-cms-portal Full HTML ===")
print(text[idx_cms:idx_cms_end])

print("\n=== CMS JavaScript in advance.html ===")
idx_js = text.find('function initCmsPortalSection')
idx_js_end = text.find('// --- ADDRESS MANAGEMENT ENGINE', idx_js)
if idx_js_end == -1:
    idx_js_end = idx_js + 6000
print(text[idx_js:idx_js_end])
