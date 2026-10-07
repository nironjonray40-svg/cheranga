with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\test_script_7.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'([a-zA-Z0-9_]+)\.addEventListener', text)
print("Elements with addEventListener:")
for m in sorted(set(matches)):
    print("  ", m)
