import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

print("=== SDT Content Analysis ===")
print("Total length:", len(sdt))

# Find style tags
styles = re.findall(r'<style[^>]*>(.*?)</style>', sdt, re.DOTALL | re.I)
print(f"Number of <style> blocks: {len(styles)}")
for i, s in enumerate(styles):
    print(f"  Style block {i}: length {len(s)}")

# Find script tags
scripts = re.findall(r'<script[^>]*>(.*?)</script>', sdt, re.DOTALL | re.I)
print(f"Number of <script> blocks: {len(scripts)}")
for i, sc in enumerate(scripts):
    print(f"  Script block {i}: length {len(sc)}")

# Find HTML body / non-style/non-script content
body_match = re.search(r'<body[^>]*>(.*?)</body>', sdt, re.DOTALL | re.I)
if body_match:
    body_content = body_match.group(1)
    # strip scripts and styles
    clean_body = re.sub(r'<style[^>]*>.*?</style>', '', body_content, flags=re.DOTALL | re.I)
    clean_body = re.sub(r'<script[^>]*>.*?</script>', '', clean_body, flags=re.DOTALL | re.I)
    print(f"Clean body HTML length: {len(clean_body)}")
    print("\n--- Clean Body Preview (first 1000 chars) ---")
    print(clean_body[:1000])
else:
    print("No <body> tag found, raw HTML without style/script:")
    clean_sdt = re.sub(r'<style[^>]*>.*?</style>', '', sdt, flags=re.DOTALL | re.I)
    clean_sdt = re.sub(r'<script[^>]*>.*?</script>', '', clean_sdt, flags=re.DOTALL | re.I)
    print(clean_sdt[:1000])
