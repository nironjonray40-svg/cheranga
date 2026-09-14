import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos_promote = html.find('id="subview-promote"')
if pos_promote != -1:
    pos_promote_end = html.find('</div>', pos_promote + 1500)
    print("Around end of subview-promote:")
    # let's find closing of subview-promote
    match = re.search(r'</div>\s*<!--\s*MODALS', html)
    if not match:
        match = re.search(r'</div>\s*</section>', html)
    if match:
        print("Found section end at:", match.start())
        print(html[match.start()-200:match.start()+300])

# Find where scripts start
pos_script = html.find('<script>')
print("\nFirst <script> at:", pos_script)
scripts = re.findall(r'<script[^>]*>', html)
print("All script tags:", scripts)
