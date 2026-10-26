with open('Marksheet.html', 'r', encoding='utf-8') as f:
    cur_lines = f.readlines()

with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    bak_lines = f.readlines()

print("Current lines total:", len(cur_lines))
print("Bak lines total:", len(bak_lines))

# In current lines, find where renderMarksheetTable is and what follows
for i in range(2680, min(2785, len(cur_lines))):
    print(f"CUR {i+1}: {cur_lines[i][:100]}", end='')

