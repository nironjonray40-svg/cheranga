import sys
import subprocess

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    cur_text = f.read()

# Read the full block from Marksheet.html.bak to extract the search helpers accurately
with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    bak_text = f.read()

print("Current length:", len(cur_text))
print("Bak length:", len(bak_text))
