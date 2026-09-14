import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

tabs = [
    'exam-routine',
    'building-mgmt',
    'seat-distribution',
    'seating-details',
    'room-topshet',
    'student-attendance',
    'student-data-topsheet',
    'admit-card'
]

print("=== CHECKING BUTTONS AND SUBVIEWS IN SEAT-PLAN.HTML ===")
for t in tabs:
    btn_id = f'id="btn-tab-{t}"'
    subview_id = f'id="subview-{t}"'
    has_btn = btn_id in text
    has_subview = subview_id in text
    print(f"Tab '{t:22s}' -> Button: {str(has_btn):5s} | Subview: {str(has_subview):5s}")
