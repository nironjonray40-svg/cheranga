import glob, re

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    
    # check links to seat-plan or topsheet
    seat_links = re.findall(r'href=[\'"][^\'"]*seat[^\'"]*[\'"]', c, re.I)
    top_links = re.findall(r'href=[\'"][^\'"]*topshe[^\'"]*[\'"]', c, re.I)
    att_links = re.findall(r'href=[\'"][^\'"]*attend[^\'"]*[\'"]', c, re.I)
    
    if seat_links or top_links or att_links:
        print(f"=== {f} ===")
        for l in set(seat_links + top_links + att_links):
            print("  ", l)

