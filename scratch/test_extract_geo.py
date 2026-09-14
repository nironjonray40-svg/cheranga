import os
import re

# Read advance.html
with open('advance.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Read BD_GEO_DATA from cms.html to ensure default data is complete and shared
with open('cms.html', 'r', encoding='utf-8') as f:
    cms_content = f.read()

geo_start = cms_content.find('const BD_GEO_DATA = {')
geo_end = cms_content.find('// Complete 64 District fallback mapping', geo_start)
if geo_start != -1 and geo_end != -1:
    geo_js_snippet = cms_content[geo_start:geo_end].strip()
    print("Found BD_GEO_DATA snippet, length:", len(geo_js_snippet))
else:
    print("Could not find BD_GEO_DATA snippet")
