import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

broken_pattern = "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);, {});\n            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);"
if broken_pattern in text:
    text = text.replace(broken_pattern, "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);")
    print("Fixed broken pattern in Student attendance sheet.html")

text = re.sub(r"const\s+savedAlloc\s*=\s*safeJsonParse\(\s*'school_saved_seat_allocations',\s*null\s*\);,\s*\{\s*\}\s*;",
              "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);", text)

with open('Student attendance sheet.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Student attendance sheet.html cleaned.")
