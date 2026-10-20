import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

theads = re.findall(r'<thead[\s\S]*?</thead>', html, re.I)
th6 = theads[5]
trs = re.findall(r'<tr[\s\S]*?</tr>', th6, re.I)

print("ROW 3 THs:")
for idx, th in enumerate(re.findall(r'<th[\s\S]*?</th>', trs[2])):
    clean = re.sub(r'\s+', ' ', th)
    print(f"  [{idx}] {clean}")

print("\nROW 4 THs:")
for idx, th in enumerate(re.findall(r'<th[\s\S]*?</th>', trs[3])):
    clean = re.sub(r'\s+', ' ', th)
    print(f"  [{idx}] {clean}")
