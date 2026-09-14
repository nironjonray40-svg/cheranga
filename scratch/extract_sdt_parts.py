import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', sdt, re.DOTALL | re.I)
script_text = scripts[0] if scripts else ""

print("=== SDT JAVASCRIPT OVERVIEW ===")
print("Script size:", len(script_text))

# Let's save the script to scratch/sdt_script.js for thorough examination
with open('scratch/sdt_script.js', 'w', encoding='utf-8') as sf:
    sf.write(script_text)

# Also let's save the styles to scratch/sdt_styles.css
styles = re.findall(r'<style[^>]*>(.*?)</style>', sdt, re.DOTALL | re.I)
with open('scratch/sdt_styles.css', 'w', encoding='utf-8') as stf:
    stf.write(styles[0] if styles else "")

print("Saved sdt_script.js and sdt_styles.css in scratch directory.")
