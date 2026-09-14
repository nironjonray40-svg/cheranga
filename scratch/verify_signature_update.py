# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_content = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

print("=== VERIFY ROOM SEAT TOPSHET.HTML ===")
r_hidden = '<div class="sig-col" style="display: none !important;">\n\n                                    <div class="sig-line"></div>\n\n                                    কক্ষ পরিদর্শক' in room_content or 'style="display: none !important;"' in room_content
r_headmaster = 'প্রধান শিক্ষক\n\n                                </div>\n\n                            </div>' in room_content
print(f"[{ 'PASS' if r_hidden else 'FAIL' }] 'কক্ষ পরিদর্শক' hidden in Room Seat Topshet.html")
print(f"[{ 'PASS' if r_headmaster else 'FAIL' }] 'প্রধান শিক্ষক' updated in Room Seat Topshet.html")

print("\n=== VERIFY SEAT-PLAN.HTML ===")
s_hidden = '<div class="sig-col" style="display: none !important;">\n                                    <div class="sig-line"></div>\n                                    কক্ষ পরিদর্শক' in seat_content
s_headmaster = 'প্রধান শিক্ষক\n                                </div>\n                            </div>' in seat_content
print(f"[{ 'PASS' if s_hidden else 'FAIL' }] 'কক্ষ পরিদর্শক' hidden in seat-plan.html")
print(f"[{ 'PASS' if s_headmaster else 'FAIL' }] 'প্রধান শিক্ষক' updated in seat-plan.html")
