with open('index.html', 'r', encoding='utf-8') as f1, open('Home.html', 'r', encoding='utf-8') as f2:
    t1 = f1.read()
    t2 = f2.read()

print('index.html length:', len(t1))
print('Home.html length:', len(t2))
print('Exact match?', t1 == t2)
if t1 != t2:
    import difflib
    diff = list(difflib.unified_diff(t1.splitlines(), t2.splitlines(), lineterm=''))
    print('Diff lines count:', len(diff))
    print('\n'.join(diff[:30]))
