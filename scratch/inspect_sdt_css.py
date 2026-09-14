import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/sdt_styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

print("=== SDT CSS RULES ===")
print(css[:3000])
print("\n... Media print styles ...\n")
m_print = re.search(r'@media\s+print\s*\{.*\}', css, re.DOTALL)
if m_print:
    print(m_print.group(0))

