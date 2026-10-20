import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/verify_tabulation_e2e_subjects.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's add debug logging inside updateSubjects
debug_code = """
combinedScript = combinedScript.replace(
    'function updateSubjects() {',
    `function updateSubjects() {
        console.log('--- ENTER updateSubjects: currentFilterClass=', currentFilterClass, 'currentFilterExam=', currentFilterExam);
    `
).replace(
    'if (activeSubs.length > 0) {',
    `console.log('DEBUG activeSubs length:', activeSubs.length, activeSubs.map(s => s.name || s.nameBn));
    if (activeSubs.length > 0) {
    `
).replace(
    'assignSlot(\\'chem\\', s);',
    `console.log('DEBUG assigning to chem:', s.name, s.nameBn); assignSlot('chem', s);`
);

eval(combinedScript);
"""

patched = content.replace('eval(combinedScript);', debug_code)

with open('scratch/temp_verify_debug.js', 'w', encoding='utf-8') as f:
    f.write(patched)

r = subprocess.run(['node', 'scratch/temp_verify_debug.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", r.stdout)
print("STDERR:\n", r.stderr)
