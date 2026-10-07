import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

m = re.search(r'function runEvaluationProcess.*?function generateDataFromFiles.*?(?=function generateSampleStudents)', text, re.DOTALL)
if m:
    print(m.group(0))
else:
    print("Not found, searching lines...")
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'runEvaluationProcess' in line:
            print("\n".join(lines[i:i+80]))
            break
