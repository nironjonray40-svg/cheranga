import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

theads = re.findall(r'<thead[\s\S]*?</thead>', html, re.I)
print(f'Total theads in document: {len(theads)}')
for t_idx, thead in enumerate(theads):
    trs = re.findall(r'<tr[\s\S]*?</tr>', thead, re.I)
    print(f'\n=================== THEAD {t_idx + 1} (Rows: {len(trs)}) ===================')
    for i, tr in enumerate(trs):
        rid = re.search(r'id=["\'](.*?)["\']', tr)
        rid_str = f' id="{rid.group(1)}"' if rid else ''
        print(f'\n--- THEAD {t_idx + 1} ROW {i+1}{rid_str} ---')
        ths = re.findall(r'<th[\s\S]*?</th>', tr, re.I)
        for j, th in enumerate(ths):
            tag_match = re.search(r'<th([^>]*)>', th, re.I)
            attrs = tag_match.group(1).strip() if tag_match else ''
            text = re.sub(r'<[^>]+>', '', th).strip()[:25]
            attrs_clean = re.sub(r'(class|style)=["\'].*?["\']', '', attrs).strip()
            attrs_clean = re.sub(r'\s+', ' ', attrs_clean)
            print(f'  [{j}] "{text}" | {attrs_clean}')
