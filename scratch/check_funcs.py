import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    seating_content = f.read()

seat_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', seat_content))
seating_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', seating_content))

common_funcs = seat_funcs.intersection(seating_funcs)
print('Common Functions:', common_funcs)
print('Seating Details Functions:', seating_funcs)
