import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

subviews = ['subview-seating-details', 'subview-room-topshet', 'subview-student-attendance', 'subview-admit-card']

for sv in subviews:
    pos = sp.find(f'id="{sv}"')
    if pos != -1:
        print(f"\n==================== {sv} ====================")
        print(sp[pos:pos+1200])

