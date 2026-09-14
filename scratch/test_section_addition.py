# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect how updateRoomTopshetLive is structured in Room Seat Topshet.html and seat-plan.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

print("Room file length:", len(room_text))
print("Seat file length:", len(seat_text))
