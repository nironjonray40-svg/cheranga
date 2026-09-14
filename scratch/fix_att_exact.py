import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

bad_str = "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);, {});\n\n            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);"
if bad_str in text:
    text = text.replace(bad_str, "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);")
    print("Exact replacement done.")
else:
    # try with varying whitespace
    import re
    text = re.sub(r"const\s+savedAlloc\s*=\s*safeJsonParse\(\s*[\'\"']school_saved_seat_allocations[\'\"'],\s*null\s*\);,\s*\{\s*\}\s*;\s*\n*\s*const\s+savedAlloc\s*=\s*safeJsonParse\(\s*[\'\"']school_saved_seat_allocations[\'\"'],\s*null\s*\);",
                  "const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);", text)
    print("Regex replacement done.")

with open('Student attendance sheet.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved Student attendance sheet.html")
