import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    seating_content = f.read()

seat_ids = set(re.findall(r'id=["\']([^"\']+)["\']', seat_content))
seating_ids = set(re.findall(r'id=["\']([^"\']+)["\']', seating_content))

common_ids = seat_ids.intersection(seating_ids)
print('Common IDs:', common_ids)
print('Seating Details IDs:', seating_ids)
