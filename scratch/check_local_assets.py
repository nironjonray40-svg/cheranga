import urllib.request
import re

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check all local assets (images, css, js) referenced in cms.html
urls = set()
for m in re.finditer(r'(?:src|href)=[\"\']([^\"\']+)[\"\']', html):
    url = m.group(1).strip()
    if url and not url.startswith('http') and not url.startswith('#') and not url.startswith('data:') and not url.startswith('javascript:'):
        urls.add(url)

print("Referenced local URLs in cms.html:")
for u in sorted(urls):
    full_url = f"http://127.0.0.1:8000/{u.lstrip('/')}"
    try:
        req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as r:
            print(f"  [OK {r.status}] {u} ({len(r.read())} bytes, {r.headers.get('Content-Type')})")
    except Exception as e:
        print(f"  [FAIL] {u} -> {e}")
