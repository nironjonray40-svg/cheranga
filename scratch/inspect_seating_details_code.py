# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

def show_range(start, end, label):
    print(f"=== {label} (Lines {start}-{end}) ===")
    for i in range(start-1, min(end, len(lines))):
        print(f"{i+1}: {lines[i]}")

# 1. CSS for seating-details
show_range(2205, 2385, "SEATING DETAILS CSS")

# 2. JS engine start for seating-details
show_range(12860, 12930, "SEATING DETAILS JS START")
