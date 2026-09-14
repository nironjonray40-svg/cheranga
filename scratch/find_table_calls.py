import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

matches = [m.start() for m in re.finditer(r'renderSavedSeatPlansTable\(\)', c)]
print(f"renderSavedSeatPlansTable called {len(matches)} times.")
