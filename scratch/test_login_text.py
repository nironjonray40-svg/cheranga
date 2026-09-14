import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.urlopen('http://localhost:8000/cms.html')
html = req.read().decode('utf-8')
print("HTTP Status:", req.status)
print("Contains 'id=\"navLoginBtn\"':", 'id="navLoginBtn"' in html)
print("Contains 'id=\"topLoginCtaBtn\"':", 'id="topLoginCtaBtn"' in html)
print("Contains 'id=\"mobileLoginBtn\"':", 'id="mobileLoginBtn"' in html)

for line in html.splitlines():
    if 'id="topLoginCtaBtn"' in line or 'id="navLoginBtn"' in line or 'id="mobileLoginBtn"' in line:
        print("MATCH:", line.strip())
