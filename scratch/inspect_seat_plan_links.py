import glob, re

for f in sorted(glob.glob('*.html')):
    content = open(f, 'r', encoding='utf-8', errors='ignore').read()
    seat_plan_links = re.findall(r'<li[^>]*data-tab="seat-plan"[^>]*>[\s\S]*?</li>', content)
    for spl in seat_plan_links:
        m = re.search(r'<a\s+[^>]*>Seat Plan</a>', spl)
        if m:
            print(f"{f:20}: {m.group(0)}")
