import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
body_match = re.search(r'<body[^>]*>(.*?)<script', text, re.DOTALL)
if body_match:
    with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_body.html', 'w', encoding='utf-8') as out:
        out.write(body_match.group(1))
    print("Written UTF-8 omr_body.html successfully!")
