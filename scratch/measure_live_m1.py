import subprocess
import json

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# Let's inspect Marksheet1.html live via Edge headless
script = """
(() => {
    const l = document.querySelector('.header-logo-box').getBoundingClientRect();
    const t = document.getElementById('display-school-name').getBoundingClientRect();
    const tb = document.querySelector('.header-text-box').getBoundingClientRect();
    const sub = document.getElementById('display-school-subtitle').getBoundingClientRect();
    const pill = document.getElementById('display-exam-name-pill').getBoundingClientRect();
    
    return {
        logo: { left: l.left, right: l.right, width: l.width, height: l.height },
        title: { left: t.left, right: t.right, width: t.width, height: t.height },
        textBox: { left: tb.left, right: tb.right, width: tb.width },
        overlap: (l.right > t.left),
        clearance: (t.left - l.right)
    };
})()
"""

# We can run edge headless with --dump-dom on http://127.0.0.1:8000/Marksheet1.html
cmd = [edge, '--headless', '--disable-gpu', '--window-size=1200,900', '--dump-dom', 'http://127.0.0.1:8000/Marksheet1.html']
proc = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
output = proc.stdout
print("Output received, length:", len(output))
if 'header-right-spacer' in output:
    print("[PASS] header-right-spacer found in rendered DOM!")
if 'header-logo-box' in output:
    print("[PASS] header-logo-box found in rendered DOM!")
if 'display-school-name' in output:
    print("[PASS] display-school-name found in rendered DOM!")
