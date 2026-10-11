import urllib.request
import re

url = "http://127.0.0.1:8000/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='replace')

print("Loaded HTML length:", len(html))

# Find all external resources (scripts, links, img src, video, audio, object, embed, iframe)
for tag in re.findall(r'<[^>]+(?:src|href)=[^>]+>', html):
    if not tag.lower().startswith('<a ') and not tag.lower().startswith('<a>'):
        print(tag[:150].encode('ascii', errors='replace').decode('ascii'))
