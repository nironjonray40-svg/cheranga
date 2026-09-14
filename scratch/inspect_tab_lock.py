import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Inspect sub-nav buttons
idx_tabs = text.find('sub-nav-tabs')
print("=== SUB-NAV-TABS HTML ===")
print(text[idx_tabs:idx_tabs+2000])

# 2. Inspect switchSeatTab
idx_switch = text.find('function switchSeatTab')
print("\n=== switchSeatTab FUNCTION ===")
print(text[idx_switch:idx_switch+2500])
