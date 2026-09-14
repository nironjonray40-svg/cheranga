import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

pos_update = js.find('function updateStudentDataTopsheetLive')
pos_end = js.find('const mainTitleText = getMainTitleByLang', pos_update)
print("=== updateStudentDataTopsheetLive data processing ===")
print(js[pos_update:pos_end])

