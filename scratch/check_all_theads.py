import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

theads = re.finditer(r'<thead\b([^>]*)>([\s\S]*?)</thead>', html, re.I)
for idx, m in enumerate(theads):
    attrs = m.group(1)
    content = m.group(2)
    has_bng = 'বহুনির্বাচনি' in content
    has_col_type = 'data-col-type' in content
    print(f"THEAD {idx+1}: attrs='{attrs}' | len={len(content)} | has_বহুনির্বাচনি={has_bng} | has_data_col_type={has_col_type}")
