import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

theads = re.findall(r'<thead[\s\S]*?</thead>', html, re.I)
th6 = theads[5]
trs = re.findall(r'<tr[\s\S]*?</tr>', th6, re.I)
print("=== ROW 3 ===")
print(trs[2])
print("\n=== ROW 4 ===")
print(trs[3])
