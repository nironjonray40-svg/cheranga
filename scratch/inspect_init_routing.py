import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

pos = sp.find('DOMContentLoaded')
while pos != -1:
    print("--- DOMContentLoaded handler ---")
    print(sp[pos:pos+1000])
    pos = sp.find('DOMContentLoaded', pos+10)

pos_url = sp.find('URLSearchParams')
while pos_url != -1:
    print("--- URLSearchParams usage ---")
    print(sp[pos_url-100:pos_url+300])
    pos_url = sp.find('URLSearchParams', pos_url+10)

