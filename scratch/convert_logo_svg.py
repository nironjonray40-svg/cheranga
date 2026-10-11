import base64
import xml.etree.ElementTree as ET

with open('school_logo.jpg', 'rb') as f:
    jpeg_data = f.read()

b64_str = base64.b64encode(jpeg_data).decode('ascii')
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1047 1024" width="100%" height="100%">
  <image width="1047" height="1024" href="data:image/jpeg;base64,{b64_str}" xlink:href="data:image/jpeg;base64,{b64_str}"/>
</svg>'''

# Validate XML parsing
ET.fromstring(svg_content)
print("Valid XML SVG generated! Size:", len(svg_content))

with open('school_logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Saved real SVG to school_logo.svg")
