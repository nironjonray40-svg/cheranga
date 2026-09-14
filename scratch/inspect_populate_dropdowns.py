import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

pos_pop = js.find('function populateFilterDropdowns')
pos_pop_end = js.find('function getRoomGenderSuffix', pos_pop)
print("=== populateFilterDropdowns ===")
print(js[pos_pop:pos_pop_end])

