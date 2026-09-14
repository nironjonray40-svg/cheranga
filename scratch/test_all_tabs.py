import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

tabs = [
    'exam-routine', 'building-mgmt', 'seat-distribution', 'seating-details',
    'room-topshet', 'student-attendance', 'student-data-topsheet',
    'admit-card', 'exam-document-report'
]

print("=== Checking Tabs in seat-plan.html ===")
for t in tabs:
    btn_m = f'id="btn-tab-{t}"'
    sub_m = f'id="subview-{t}"'
    has_btn = btn_m in sp
    has_sub = sub_m in sp
    has_handler = f"tabName === '{t}'" in sp or f"tabName === \"{t}\"" in sp
    print(f"Tab '{t}': Button={has_btn}, Subview={has_sub}, Handler={has_handler}")
    assert has_btn, f"Missing button for {t}"
    assert has_sub, f"Missing subview for {t}"
    assert has_handler, f"Missing handler for {t}"

print("\n🎉 ALL 9 TABS ARE FULLY CONNECTED AND VERIFIED!")

