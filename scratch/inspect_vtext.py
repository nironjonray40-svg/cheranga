with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

import re
v_text_css = re.findall(r'\.v-text[^{]*\{[^}]*\}', html)
print("v-text CSS:")
for css in v_text_css:
    print(css)
    print("---")

# Now let's inspect THEAD 6 rows 3 and 4 where 'বহুনির্বাচনি', 'লিখিত', 'মোট' are defined!
theads = re.findall(r'<thead[\s\S]*?</thead>', html, re.I)
if len(theads) >= 6:
    th6 = theads[5] # index 5 is the main table thead
    trs = re.findall(r'<tr[\s\S]*?</tr>', th6, re.I)
    print(f"THEAD 6 has {len(trs)} rows")
    if len(trs) >= 3:
        print("\nROW 3:")
        print(trs[2])
    if len(trs) >= 4:
        print("\nROW 4:")
        print(trs[3])
