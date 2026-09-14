# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

match = re.search(r'function updateRoomTopshetLive\(\)\s*\{.*?\n        \}', seat_content, re.DOTALL)
if match:
    print("=== updateRoomTopshetLive ===")
    print(match.group(0))
