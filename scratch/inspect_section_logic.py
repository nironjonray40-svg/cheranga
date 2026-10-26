with open('Marksheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

funcs = ['normalizeSectionString', 'getAllStudentsForClassAndSection', 'getSectionsForClass', 'updateMarksheetSection']
with open('scratch/section_funcs.txt', 'w', encoding='utf-8') as out:
    for fn in funcs:
        idx = text.find('function ' + fn)
        if idx != -1:
            out.write(f'=== {fn} ===\n')
            out.write(text[idx:idx+800] + '\n\n')

print("Wrote scratch/section_funcs.txt")
