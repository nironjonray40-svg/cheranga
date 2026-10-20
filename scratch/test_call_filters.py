import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/verify_tabulation_e2e_subjects.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace assignments with filterClass and filterExam calls
patched = content.replace(
    "currentFilterClass = 'Eight';\ncurrentFilterExam = 'Elegileble test';",
    "filterClass('Eight');\nfilterExam('Elegileble test');"
).replace(
    "currentFilterClass = 'Ten';\ncurrentFilterExam = 'বার্ষিক পরীক্ষা';",
    "filterClass('Ten');\nfilterExam('বার্ষিক পরীক্ষা');"
)

# Also let's log inside updateSubjects what currentFilterClass is
patched = patched.replace(
    "function updateSubjects() {",
    "function updateSubjects() { console.log('DEBUG updateSubjects: currentFilterClass=', currentFilterClass, 'currentFilterExam=', currentFilterExam);"
)

with open('scratch/temp_verify_call.js', 'w', encoding='utf-8') as f:
    f.write(patched)

r = subprocess.run(['node', 'scratch/temp_verify_call.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", r.stdout)
print("STDERR:\n", r.stderr)
