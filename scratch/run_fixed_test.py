import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_tabulation_subject_marks_sync.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of currentFilterClass = 'Eight'; currentFilterExam = 'Elegileble test';
# Call filterClass('Eight'); filterExam('Elegileble test');
patched = content.replace(
    "currentFilterClass = 'Eight';\ncurrentFilterExam = 'Elegileble test';",
    "filterClass('Eight');\nfilterExam('Elegileble test');"
).replace(
    "currentFilterClass = 'Ten';\ncurrentFilterExam = 'বার্ষিক পরীক্ষা';",
    "filterClass('Ten');\nfilterExam('বার্ষিক পরীক্ষা');"
)

with open('scratch/temp_run_fixed.js', 'w', encoding='utf-8') as f:
    f.write(patched)

r = subprocess.run(['node', 'scratch/temp_run_fixed.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", r.stdout)
print("STDERR:\n", r.stderr)
