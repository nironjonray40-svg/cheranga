import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# search form submission / student-form
for m in re.finditer(r'id=["\']student-form["\']', text):
    print("Found student-form around:", text[max(0, m.start()-100):min(len(text), m.end()+500)])

for m in re.finditer(r'addEventListener\(["\']submit["\']', text):
    print("Found submit listener around:", text[max(0, m.start()-100):min(len(text), m.end()+500)])
