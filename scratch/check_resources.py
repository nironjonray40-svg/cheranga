import re

with open('cms.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("=== Scripts ===")
for m in re.finditer(r'<script[^>]*src=[\"\'](.*?)[\"\'][^>]*>', html, re.I):
    print("Script src:", m.group(1))

print("\n=== Links ===")
for m in re.finditer(r'<link[^>]*href=[\"\'](.*?)[\"\'][^>]*>', html, re.I):
    print("Link href:", m.group(1))

print("\n=== Iframes / Embeds ===")
for m in re.finditer(r'<(?:iframe|embed|object)[^>]*src=[\"\'](.*?)[\"\'][^>]*>', html, re.I):
    print("Iframe/Embed src:", m.group(1))
