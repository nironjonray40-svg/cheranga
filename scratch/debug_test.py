import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_tabulation_subject_marks_sync.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's inspect what getSubjectSlot returns for schedules
code_with_debug = code.replace(
    'function updateDynamicSubjectMarksAndHeaders() {',
    '''
function updateDynamicSubjectMarksAndHeaders() {
    console.log("DEBUG updateDynamicSubjectMarksAndHeaders called with class:", currentFilterClass, "exam:", currentFilterExam);
    console.log("DEBUG activeClassSlotMap:", JSON.stringify(activeClassSlotMap));
    '''
)

with open('scratch/temp_debug.js', 'w', encoding='utf-8') as f:
    f.write(code_with_debug)

res = subprocess.run(['node', 'scratch/temp_debug.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", res.stdout[:2000])
print("STDERR:\n", res.stderr[:1000])
