import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

pos_update = js.find('function updateStudentDataTopsheetLive')
print("=== updateStudentDataTopsheetLive function ===")
print(js[pos_update:pos_update+5000])

print("\n... Continuation ...\n")
print(js[pos_update+5000:pos_update+10000])

print("\n... Continuation 2 ...\n")
print(js[pos_update+10000:pos_update+17500])

