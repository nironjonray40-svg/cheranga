# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

# Update CSS .sig-line in Room Seat Topshet.html
old_room_css = """.sig-line {

            border-top: 1px dashed #718096;

            width: 80%;

            margin: 0 auto 0 auto;

        }"""

new_room_css = """.sig-line {

            display: none !important;

            border-top: none !important;

            width: 80%;

            margin: 0 auto 0 auto;

        }"""

if old_room_css in room_text:
    room_text = room_text.replace(old_room_css, new_room_css, 1)
    print("[OK] Updated CSS .sig-line in Room Seat Topshet.html")
else:
    print("[WARN] Could not find exact old_room_css, attempting regex/flexible match")
    room_text = room_text.replace("border-top: 1px dashed #718096;", "display: none !important;\n            border-top: none !important;")

old_room_sig_lines = """                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>"""
new_room_sig_lines = """                                    <div class="sig-line" style="display: none !important;"></div>"""

if old_room_sig_lines in room_text:
    room_text = room_text.replace(old_room_sig_lines, new_room_sig_lines)
    print("[OK] Updated inline sig-line HTML in Room Seat Topshet.html")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_css = """        #subview-room-topshet .sig-line {
            border-top: 1px dashed #718096;
            width: 80%;
            margin: 0 auto 0 auto;
        }"""

new_seat_css = """        #subview-room-topshet .sig-line {
            display: none !important;
            border-top: none !important;
            width: 80%;
            margin: 0 auto 0 auto;
        }"""

if old_seat_css in seat_text:
    seat_text = seat_text.replace(old_seat_css, new_seat_css, 1)
    print("[OK] Updated CSS #subview-room-topshet .sig-line in seat-plan.html")

old_seat_sig_lines = """                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>"""
new_seat_sig_lines = """                                    <div class="sig-line" style="display: none !important;"></div>"""

if old_seat_sig_lines in seat_text:
    seat_text = seat_text.replace(old_seat_sig_lines, new_seat_sig_lines)
    print("[OK] Updated inline sig-line HTML in seat-plan.html")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
