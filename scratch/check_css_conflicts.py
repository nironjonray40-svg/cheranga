import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\style.css', 'r', encoding='utf-8', errors='ignore') as f:
    css_main = f.read()

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_style.css', 'r', encoding='utf-8', errors='ignore') as f:
    css_omr = f.read()

classes_main = set(re.findall(r'\.([a-zA-Z0-9_-]+)', css_main))
classes_omr = set(re.findall(r'\.([a-zA-Z0-9_-]+)', css_omr))

common = classes_main.intersection(classes_omr)
print("Common classes count:", len(common))
print("Common classes:", sorted(list(common)))
