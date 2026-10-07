import sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find("btnDownloadBlankOMR.addEventListener")
print(text[idx:idx+800])
