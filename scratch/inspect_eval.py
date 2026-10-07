import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Search for fetch or api calls
fetch_calls = re.findall(r'fetch\([^\)]+\)', text)
print("Fetch calls:")
for fc in fetch_calls:
    print("  ", fc)

# Let's inspect runEvaluationProcess
m = re.search(r'(async\s+function\s+runEvaluationProcess|function\s+runEvaluationProcess|const\s+runEvaluationProcess\s*=\s*async)[^{]*{(.*?)(?=\n\s*(?:async\s+)?function|\n\s*const|\n\s*let|\Z)', text, re.DOTALL)
if m:
    print("\nrunEvaluationProcess snippet (first 1500 chars):")
    print(m.group(0)[:1500])
