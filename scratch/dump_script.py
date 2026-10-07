with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL)
# The third script has all the application logic
app_script = scripts[2]
with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_script.js', 'w', encoding='utf-8') as out:
    out.write(app_script)

print("Saved omr_script.js! Total length:", len(app_script))
