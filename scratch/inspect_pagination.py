# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

def inspect_file(filename):
    print(f"=== {filename} ===")
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Look for pagination chunking or pageSize or maxRows or page split
        for term in ['pageSize', 'page_size', 'chunk', 'slice', 'itemsPerPage', 'ROWS_PER_PAGE', 'maxRows', 'pageIdx', 'pageCount', 'totalPages']:
            matches = list(re.finditer(re.escape(term), text, re.IGNORECASE))
            if matches:
                print(f"  Matches for '{term}': {len(matches)}")
                for m in matches[:3]:
                    start = max(0, m.start() - 50)
                    end = min(len(text), m.end() + 100)
                    print(f"    Snippet: {text[start:end].replace(chr(10), ' ')}")
    except Exception as e:
        print(f"  Error: {e}")

inspect_file('Seating arrangement details.html')
inspect_file('Student attendance sheet.html')
inspect_file('Student Data Topsheet.html')
inspect_file('seat-plan.html')
