import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

funcs = [m.start() for m in re.finditer(r'function\s+([a-zA-Z0-9_$]+)', js)]
funcs.append(len(js))

print(f"Total functions in SDT script: {len(funcs)-1}")

for i in range(len(funcs)-1):
    chunk = js[funcs[i]:funcs[i+1]]
    fn_name = re.search(r'function\s+([a-zA-Z0-9_$]+)', chunk).group(1)
    print(f"\n--- Function: {fn_name} (length {len(chunk)}) ---")
    print(chunk[:300].strip().replace('\n', ' '))

# Check event listeners or initialization at the bottom
print("\n--- Code after last function or initialization ---")
last_part = js[funcs[-2]:]
print(last_part[-800:])

