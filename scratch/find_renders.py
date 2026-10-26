with open('Marksheet.html', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if any(term in line for term in ['renderSingleMarksheet', 'renderBatchMarksheets', 'renderMarksheet', 'updateMarksheet', 'populateFilter', 'loadStudents']):
            print(f"Line {idx}: {line.strip()[:140]}")
