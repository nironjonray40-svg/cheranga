import re

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

srcs = re.findall(r'src=["\']([^"\']+)["\']', text)
links = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', text)
scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', text)

print("SRCS:")
for s in sorted(set(srcs)):
    print(" ", s)

print("\nLINKS:")
for l in sorted(set(links)):
    print(" ", l)

print("\nEXTERNAL SCRIPTS:")
for sc in sorted(set(scripts)):
    print(" ", sc)
