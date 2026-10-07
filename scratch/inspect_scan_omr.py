import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

pos = 0
while True:
    idx = text.find('/api/scan_omr', pos)
    if idx == -1:
        break
    print("Found /api/scan_omr at", idx)
    start = max(0, idx - 200)
    end = min(len(text), idx + 400)
    print(text[start:end])
    print("-" * 50)
    pos = idx + len('/api/scan_omr')
