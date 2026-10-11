import re

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("=== setInterval calls ===")
for m in re.finditer(r'setInterval\s*\(([^,]+),\s*([0-9]+)\)', text):
    print(f"Interval: time={m.group(2)}ms, fn={m.group(1).strip()[:40]}")

print("\n=== EventSource or WebSocket ===")
for m in re.finditer(r'(?:EventSource|WebSocket)\s*\([^\)]+\)', text):
    print("Match:", m.group(0))

print("\n=== Window / Document listeners ===")
for m in re.finditer(r'(?:window|document)\.addEventListener\s*\(\s*[\'\"]([^\'\"]+)[\'\"]', text):
    print("Listener event:", m.group(1))
