# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect updateRoomTopshetLive implementation in seat-plan.html
room_match = re.search(r'function updateRoomTopshetLive\(\)\s*\{.*?\n        \}', content, re.DOTALL)
if room_match:
    print("--- updateRoomTopshetLive (first 100 lines) ---")
    lines = room_match.group(0).split('\n')
    for l in lines[:100]:
        print(l)

# Let's inspect updateSeatingDetailsLive in seat-plan.html
seat_match = re.search(r'function updateSeatingDetailsLive\(\)\s*\{.*?\n        \}', content, re.DOTALL)
if seat_match:
    print("\n--- updateSeatingDetailsLive (first 60 lines) ---")
    lines = seat_match.group(0).split('\n')
    for l in lines[:60]:
        print(l)

# Let's inspect switchSeatTab in seat-plan.html
switch_match = re.search(r'function switchSeatTab\([^)]*\)\s*\{.*?\n        \}', content, re.DOTALL)
if switch_match:
    print("\n--- switchSeatTab ---")
    lines = switch_match.group(0).split('\n')
    for l in lines:
        if 'student-attendance' in l or 'room-topshet' in l or 'seating-details' in l or 'tabName' in l:
            print(l)
