import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.urlopen('http://localhost:8000/cms.html')
html = req.read().decode('utf-8')
print("HTTP Status:", req.status)
print("Contains 'modalLoginSchoolLogo':", 'id="modalLoginSchoolLogo"' in html)
print("Contains 'modalLoginSchoolName':", 'id="modalLoginSchoolName"' in html)

for idx, line in enumerate(html.splitlines(), 1):
    if 'modalLoginSchoolLogo' in line or 'modalLoginSchoolName' in line:
        print(f"L{idx}: {line.strip()}")
