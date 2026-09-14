# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check open vs close tags for critical elements
div_open = html.count('<div')
div_close = html.count('</div>')
print(f"<div> tags: open={div_open}, close={div_close}, diff={div_open - div_close}")

section_open = html.count('<section')
section_close = html.count('</section>')
print(f"<section> tags: open={section_open}, close={section_close}, diff={section_open - section_close}")

script_open = html.count('<script')
script_close = html.count('</script>')
print(f"<script> tags: open={script_open}, close={script_close}, diff={script_open - script_close}")

style_open = html.count('<style')
style_close = html.count('</style>')
print(f"<style> tags: open={style_open}, close={style_close}, diff={style_open - style_close}")
