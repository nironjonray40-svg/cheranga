import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/temp_check_script_4.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = max(0, 600 - 20)
end = min(len(lines), 600 + 30)

for i in range(start, end):
    print(f"{i+1}: {lines[i]}", end='')

