import subprocess
import json
import os

html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', sans-serif; margin: 0; }
.t18 { font-size: 18px; font-weight: 800; white-space: nowrap; display: inline-block; }
.t19 { font-size: 19px; font-weight: 800; white-space: nowrap; display: inline-block; }
.t20 { font-size: 20px; font-weight: 800; white-space: nowrap; display: inline-block; }
.t21 { font-size: 21px; font-weight: 800; white-space: nowrap; display: inline-block; }
.t22 { font-size: 22px; font-weight: 800; white-space: nowrap; display: inline-block; }
.t24 { font-size: 24px; font-weight: 800; white-space: nowrap; display: inline-block; }
</style>
</head>
<body>
<span id="s18" class="t18">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
<span id="s19" class="t19">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
<span id="s20" class="t20">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
<span id="s21" class="t21">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
<span id="s22" class="t22">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
<span id="s24" class="t24">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</span><br>
</body>
</html>"""

with open('scratch/measure.html', 'w', encoding='utf-8') as f:
    f.write(html)

chrome_paths = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]

browser = None
for p in chrome_paths:
    if os.path.exists(p):
        browser = p
        break

print("Found browser:", browser)
if browser:
    # Use headless browser to evaluate getBoundingClientRect
    script = """
    console.log(JSON.stringify({
        s18: document.getElementById('s18').offsetWidth,
        s19: document.getElementById('s19').offsetWidth,
        s20: document.getElementById('s20').offsetWidth,
        s21: document.getElementById('s21').offsetWidth,
        s22: document.getElementById('s22').offsetWidth,
        s24: document.getElementById('s24').offsetWidth
    }));
    """
    file_url = os.path.abspath('scratch/measure.html').replace('\\', '/')
    cmd = [browser, '--headless', '--disable-gpu', '--dump-dom', f'file:///{file_url}']
    # We can also run node to inspect if puppeteer or playwright exists, or just use python
    print("Testing width with browser...")
