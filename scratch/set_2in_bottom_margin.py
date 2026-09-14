# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

# Update CSS .tables-wrapper
old_room_css_tw = """.tables-wrapper {

            display: flex;

            justify-content: flex-start;

            align-items: flex-start;

            gap: 12px;

            margin-bottom: auto;

            flex-wrap: wrap;

        }"""

new_room_css_tw = """.tables-wrapper {

            display: flex;

            justify-content: flex-start;

            align-items: flex-start;

            gap: 12px;

            margin-bottom: 2.00in;

            flex-wrap: wrap;

        }"""

if old_room_css_tw in room_text:
    room_text = room_text.replace(old_room_css_tw, new_room_css_tw, 1)
    print("[OK] Updated CSS .tables-wrapper in Room Seat Topshet.html")

# Update ROWS_PER_PAGE = 20
old_room_rpp = "const ROWS_PER_PAGE = 22;"
new_room_rpp = "const ROWS_PER_PAGE = 20;"
if old_room_rpp in room_text:
    room_text = room_text.replace(old_room_rpp, new_room_rpp, 1)
    print("[OK] Updated ROWS_PER_PAGE = 20 in Room Seat Topshet.html")

# Update HTML template
old_room_html_tw = """<!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper">"""
new_room_html_tw = """<!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper" style="margin-bottom: 2.00in;">"""
if old_room_html_tw in room_text:
    room_text = room_text.replace(old_room_html_tw, new_room_html_tw, 1)
    print("[OK] Updated HTML .tables-wrapper margin-bottom: 2.00in in Room Seat Topshet.html")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_css_tw = """        #subview-room-topshet .tables-wrapper {
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: auto;
            flex-wrap: wrap;
        }"""

new_seat_css_tw = """        #subview-room-topshet .tables-wrapper {
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 2.00in;
            flex-wrap: wrap;
        }"""

if old_seat_css_tw in seat_text:
    seat_text = seat_text.replace(old_seat_css_tw, new_seat_css_tw, 1)
    print("[OK] Updated CSS #subview-room-topshet .tables-wrapper in seat-plan.html")

if old_room_rpp in seat_text:
    seat_text = seat_text.replace(old_room_rpp, new_room_rpp, 1)
    print("[OK] Updated ROWS_PER_PAGE = 20 in seat-plan.html")

old_seat_html_tw = """<!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper">"""
new_seat_html_tw = """<!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper" style="margin-bottom: 2.00in;">"""
if old_seat_html_tw in seat_text:
    seat_text = seat_text.replace(old_seat_html_tw, new_seat_html_tw, 1)
    print("[OK] Updated HTML .tables-wrapper margin-bottom: 2.00in in seat-plan.html")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
