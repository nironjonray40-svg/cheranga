import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

form_match = re.search(r'<form id="onlineAdmissionForm"[\s\S]*?</form>', html)
if form_match:
    form_html = form_match.group(0)
    ids = re.findall(r'id="([^"]+)"', form_html)
    print(f"Total IDs found in form: {len(ids)}")
    for i, id_name in enumerate(ids):
        print(f"{i+1:2d}. {id_name}")
else:
    print("onlineAdmissionForm not found")
