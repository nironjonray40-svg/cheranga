with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
styles = re.findall(r'<style\b[^>]*>(.*?)</style>', text, re.DOTALL)
if styles:
    with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_style.css', 'w', encoding='utf-8') as out:
        out.write(styles[0])
    print("Saved omr_style.css! Length:", len(styles[0]))
