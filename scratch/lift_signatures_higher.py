# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

old_room_css_footer = """.footer-signatures {

            display: table;

            width: 100%;

            margin-top: 25px;

            padding-top: 10px;

        }"""

new_room_css_footer = """.footer-signatures {

            display: table;

            width: 100%;

            margin-top: 25px;

            margin-bottom: 0.5in;

            padding-top: 10px;

        }"""

if old_room_css_footer in room_text:
    room_text = room_text.replace(old_room_css_footer, new_room_css_footer, 1)
    print("[OK] Updated CSS footer-signatures in Room Seat Topshet.html")

old_room_html_footer = """                            <div class="footer-signatures">"""
new_room_html_footer = """                            <div class="footer-signatures" style="margin-bottom: 0.5in;">"""

if old_room_html_footer in room_text:
    room_text = room_text.replace(old_room_html_footer, new_room_html_footer, 1)
    print("[OK] Updated HTML footer-signatures in Room Seat Topshet.html")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_css_footer = """        #subview-room-topshet .footer-signatures {
            display: table;
            width: 100%;
            margin-top: 25px;
            padding-top: 10px;
        }"""

new_seat_css_footer = """        #subview-room-topshet .footer-signatures {
            display: table;
            width: 100%;
            margin-top: 25px;
            margin-bottom: 0.5in;
            padding-top: 10px;
        }"""

if old_seat_css_footer in seat_text:
    seat_text = seat_text.replace(old_seat_css_footer, new_seat_css_footer, 1)
    print("[OK] Updated CSS #subview-room-topshet .footer-signatures in seat-plan.html")

# In updateRoomTopshetLive inside seat-plan.html
target_seat_html_footer = """                            <!-- Footer Signatures Section -->
                            <div class="footer-signatures">
                                <div class="sig-col" style="display: none !important;">"""

replacement_seat_html_footer = """                            <!-- Footer Signatures Section -->
                            <div class="footer-signatures" style="margin-bottom: 0.5in;">
                                <div class="sig-col" style="display: none !important;">"""

if target_seat_html_footer in seat_text:
    seat_text = seat_text.replace(target_seat_html_footer, replacement_seat_html_footer, 1)
    print("[OK] Updated HTML footer-signatures in seat-plan.html")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
