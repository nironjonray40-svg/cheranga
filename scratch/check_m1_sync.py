with open('scratch/m1_between.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find("function syncCascadingFilters(trigger = 'all') {")
print("syncCascadingFilters at:", idx)
print(text[idx:idx+800])
