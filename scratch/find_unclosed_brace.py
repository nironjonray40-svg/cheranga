code = open('scratch/temp_script_1.js', encoding='utf-8').read()
lines = code.splitlines()

depth = 0
history = []
in_multiline_comment = False

for idx, line in enumerate(lines):
    clean = ''
    i = 0
    in_str = None
    while i < len(line):
        c = line[i]
        if in_multiline_comment:
            if c == '*' and i + 1 < len(line) and line[i+1] == '/':
                in_multiline_comment = False
                i += 2
                continue
            i += 1
            continue
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == in_str:
                in_str = None
            i += 1
            continue
        if c == '/' and i + 1 < len(line) and line[i+1] == '/':
            break
        if c == '/' and i + 1 < len(line) and line[i+1] == '*':
            in_multiline_comment = True
            i += 2
            continue
        if c in ('"', "'", '`'):
            in_str = c
            i += 1
            continue
        clean += c
        i += 1
    
    opens = clean.count('{')
    closes = clean.count('}')
    depth += opens - closes
    if opens > closes:
        for _ in range(opens - closes):
            history.append((idx + 1, line.strip()[:80]))
    elif closes > opens:
        for _ in range(closes - opens):
            if history:
                history.pop()

print('Final depth:', depth)
print('Unclosed open braces count:', len(history))
for lno, text in history[-10:]:
    print(f'Line {lno}: {text}')
