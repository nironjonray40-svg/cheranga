# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

count = text.count('room-topshet')
print("Count of 'room-topshet' in seat-plan.html:", count)
count2 = text.count('updateRoomTopshetLive')
print("Count of 'updateRoomTopshetLive' in seat-plan.html:", count2)
