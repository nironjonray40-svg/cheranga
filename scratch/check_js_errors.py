import sys, re, subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

# Extract all scripts
scripts = re.findall(r'<script[^>]*>(.*?)</script>', sp, re.DOTALL | re.I)
print(f"Total script blocks in seat-plan.html: {len(scripts)}")

for i, sc in enumerate(scripts):
    fname = f'scratch/temp_check_script_{i}.js'
    with open(fname, 'w', encoding='utf-8') as tf:
        tf.write(sc)
    
    # Try running node --check on each script
    try:
        res = subprocess.run(['node', '--check', fname], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"❌ Script {i} has SYNTAX ERROR:")
            print(res.stderr)
        else:
            print(f"✓ Script {i} (len {len(sc)}) syntax OK")
    except Exception as e:
        print(f"Could not run node check: {e}")

