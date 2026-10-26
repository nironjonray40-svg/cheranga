import sys
import re

def search_file(filepath):
    print(f"=== Searching {filepath} ===")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    for idx, line in enumerate(lines, 1):
        # Look for select, input, filter, exam, class dropdowns
        if any(term in line.lower() for term in ['<select', 'filter-exam', 'filter-class', 'exam-select', 'class-select', 'exam list', 'school_exam_schedules', 'school_exam_types', 'populateexam', 'syncfilters']):
            print(f"{idx}: {line.strip()[:140]}")

if __name__ == '__main__':
    search_file('Marksheet.html')
    search_file('Marksheet1.html')
