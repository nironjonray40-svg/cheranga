import re

with open('scratch/live_rendered.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Check active class filter and exam filter
m_class = re.search(r'<select id="class-filter"[^>]*>([\s\S]*?)</select>', content)
if m_class:
    sel = re.findall(r'<option[^>]*selected[^>]*value="([^"]*)"', m_class.group(1))
    print('Selected class in dump:', sel)

m_exam = re.search(r'<select id="exam-filter"[^>]*>([\s\S]*?)</select>', content)
if m_exam:
    sel_exam = re.findall(r'<option[^>]*selected[^>]*value="([^"]*)"', m_exam.group(1))
    print('Selected exam in dump:', sel_exam)

rows = re.findall(r'<tr data-section=[^>]*>[\s\S]*?</tr>', content)
print('Total rows with data-section:', len(rows))
visible_rows = [r for r in rows if 'display: none' not in r and 'display:none' not in r]
print('Visible rows:', len(visible_rows))

target_rows = visible_rows if visible_rows else rows
if target_rows:
    row = target_rows[0]
    tds = re.findall(r'<td[^>]*>(.*?)</td>', row)
    print('Tds count in row:', len(tds))
    for i, td in enumerate(tds):
        clean = re.sub(r'<[^>]*>', '', td).strip()
        print(f'Cell[{i}]: {clean}')
