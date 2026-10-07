import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Print lines between <style> and </style>
styles = re.findall(r'<style\b[^>]*>(.*?)</style>', text, re.DOTALL)
print(f"Style tag length: {len(styles[0]) if styles else 0}")

# Print main HTML body (excluding script and style)
body_match = re.search(r'<body\b[^>]*>(.*?)</body>', text, re.DOTALL)
if body_match:
    body = body_match.group(1)
    body_no_script = re.sub(r'<script\b[^>]*>.*?</script>', '', body, flags=re.DOTALL)
    print(f"Body HTML length without script: {len(body_no_script)}")

# Print function declarations in script 2
script = re.findall(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL)[2]
funcs = re.findall(r'(?:function\s+([a-zA-Z0-9_]+)|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)', script)
func_names = [f[0] or f[1] for f in funcs]
print("Functions found in script:", func_names)
