with open('Marksheet.html', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if 'renderMarksheetTable' in line or 'generateMarksheetCardHTML' in line:
            print(f"Line {idx}: {line.strip()[:140]}")
