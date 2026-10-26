import re
import subprocess
import os

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's extract search helpers from Marksheet.html.bak
with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    bak_html = f.read()

# Search helpers start around `let currentSearchQuery = '';` and go until `function syncCascadingFilters`
search_start = bak_html.find("let currentSearchQuery = '';")
search_end = bak_html.find("function syncCascadingFilters(trigger = 'all') {")
search_helpers = bak_html[search_start:search_end].strip()

# Also get getAllStudentsForClassAndSection from bak
students_for_class_start = bak_html.find("function getAllStudentsForClassAndSection(selectedClass, selectedSection) {")
students_for_class_end = bak_html.find("function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {")
students_for_class_helper = bak_html[students_for_class_start:students_for_class_end].strip()

print(f"Extracted search_helpers: {len(search_helpers)} chars")
print(f"Extracted students_for_class_helper: {len(students_for_class_helper)} chars")

with open('scratch/extracted_parts.js', 'w', encoding='utf-8') as out:
    out.write("// Search Helpers:\n" + search_helpers + "\n\n// Students Helper:\n" + students_for_class_helper)
