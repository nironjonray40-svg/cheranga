# -*- coding: utf-8 -*-
import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

subviews = re.findall(r'id=["\'](subview-[^"\']+)["\']', text)
print('Subviews found:', subviews)

tabs = re.findall(r'id=["\'](btn-tab-[^"\']+)["\']', text)
print('Tabs found:', tabs)

# Find where switchSeatTab is defined
m = re.search(r'function switchSeatTab\s*\([^)]*\)\s*\{', text)
if m:
    start = m.start()
    print('switchSeatTab found at line:', text[:start].count('\n') + 1)
    print(text[start:start+1200])

# Find where seating-details CSS is
m2 = re.search(r'SEATING ARRANGEMENT DETAILS', text)
if m2:
    start = m2.start()
    print('\nSeating details CSS line:', text[:start].count('\n') + 1)

# Find where seating-details HTML is
m3 = re.search(r'<div[^>]+id=["\']subview-seating-details["\']', text)
if m3:
    start = m3.start()
    print('\nSeating details HTML line:', text[:start].count('\n') + 1)

# Find where seating-details JS engine is
m4 = re.search(r'SEATING ARRANGEMENT DETAILS ENGINE', text)
if m4:
    start = m4.start()
    print('\nSeating details JS Engine line:', text[:start].count('\n') + 1)
