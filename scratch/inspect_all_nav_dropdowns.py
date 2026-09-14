import glob
import re

for fname in sorted(glob.glob('*.html')):
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'<li class="nav-item[^"]*dropdown[^"]*"[^>]*data-tab="advance".*?<ul class="dropdown-menu">(.*?)</ul>', content, re.DOTALL)
    if m:
        print(f"=== {fname} ===")
        print(m.group(0)[:200] + " ... " + m.group(0)[-100:])
