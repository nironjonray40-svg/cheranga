import re

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract <style> block
styles = re.findall(r'<style>([\s\S]*?)</style>', text)
css = "\n".join(styles)

# Find all rules with padding, margin, height, in, gap
rules = re.findall(r'([^{}]+)\{([^{}]+)\}', css)

print("=== Large Spacing / Margins / Paddings in cms.html ===")
for selector, body in rules:
    selector = selector.strip().replace('\n', ' ')
    if any(k in body for k in ['padding', 'margin', 'gap', 'height', 'before', 'after']):
        lines = [l.strip() for l in body.split(';') if any(k in l for k in ['padding', 'margin', 'gap', 'height', '::before', '::after', 'in'])]
        if lines:
            print(f"{selector}:")
            for l in lines:
                print(f"   {l}")
