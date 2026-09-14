import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("--- Subviews in seat-plan.html ---")
subviews = re.findall(r'<div[^>]*id=["\'](subview-[^"\']+)["\']', sp)
for sv in subviews:
    print("Subview:", sv)

print("\n--- Sub-nav Tab Buttons in seat-plan.html ---")
tab_btns = re.findall(r'<button[^>]*id=["\'](btn-tab-[^"\']+)["\'][^>]*>(.*?)</button>', sp, re.DOTALL)
for btn_id, btn_text in tab_btns:
    print(f"Tab button: {btn_id} -> {btn_text.strip().replace(chr(10), ' ')}")

print("\n--- switchExamDocument function and usages ---")
doc_cards = re.findall(r'<div[^>]*class=["\'][^"\']*doc-icard[^"\']*["\'][^>]*>.*?</div>\s*</div>', sp, re.DOTALL)
for dc in doc_cards:
    print("Doc card:", dc.strip()[:200].replace('\n', ' '))

print("\n--- switchExamDocument definition ---")
match_fn = re.search(r'function\s+switchExamDocument\s*\(.*?\)\s*\{.*?\}', sp, re.DOTALL)
if match_fn:
    print(match_fn.group(0))
else:
    # Look for where switchExamDocument is defined
    pos = sp.find('switchExamDocument')
    if pos != -1:
        print(sp[pos-50:pos+800])
