import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
# Print all cards, sections, headers, and buttons inside the main content of index.html
main_match = re.search(r'<main[^>]*>(.*?)</main>', text, re.DOTALL)
if main_match:
    main_content = main_match.group(1)
    print("Main content length:", len(main_content))
    # print headers and descriptions inside main
    for m in re.finditer(r'<(h[1-6]|button|input|select|div\s+class="[^"]*card[^"]*")[^>]*>(.*?)(?:</\1>|$)', main_content, re.DOTALL):
        tag = m.group(1).split()[0]
        inner = re.sub(r'<[^>]+>', ' ', m.group(2)).strip()
        if len(inner) > 0 and len(inner) < 120:
            print(f"[{tag}] {inner}")

# Also check modals outside main
modals = re.findall(r'<div[^>]*class="modal-overlay"[^>]*>.*?</div>\s*</div>\s*</div>', text, re.DOTALL)
print("\nModals count:", len(modals))
for i, m in enumerate(modals):
    title = re.search(r'<(h[1-6])[^>]*>(.*?)</\1>', m)
    print(f"Modal {i}:", title.group(2) if title else "No title")
