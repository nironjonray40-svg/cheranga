with open('Marksheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

def print_func(fn):
    idx = text.find('function ' + fn)
    if idx != -1:
        # find matching closing brace or next function
        next_idx = text.find('\n        function ', idx + 20)
        if next_idx == -1: next_idx = idx + 2000
        return f"=== {fn} ===\n" + text[idx:next_idx] + "\n\n"
    return ""

with open('scratch/full_section_funcs.txt', 'w', encoding='utf-8') as out:
    out.write(print_func('getSectionsForClass'))
    out.write(print_func('normalizeSectionString'))
    out.write(print_func('getAllStudentsForClassAndSection'))
    out.write(print_func('generateMarksheetCardHTML'))

print("Saved scratch/full_section_funcs.txt")
