import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_tabulation_subject_marks_sync.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's insert a console.log right before eval(combinedScript) to debug getSubjectMarksDistribution
debug_patch = """
combinedScript = combinedScript.replace(
    'function getSubjectMarksDistribution(slotKey, className, examName) {',
    `function getSubjectMarksDistribution(slotKey, className, examName) {
        if (slotKey === 'bangla1') {
            console.log('DEBUG inside getSubjectMarksDistribution for bangla1: className=', className, 'examName=', examName);
        }
    `
);
eval(combinedScript);
"""

patched_content = content.replace('eval(combinedScript);', debug_patch)

# Also let's log matchedSchedule
patched_content = patched_content.replace(
    'if (matchedSchedule) {',
    """
    if (slotKey === 'bangla1') {
        console.log('DEBUG matchedSchedule for bangla1:', matchedSchedule);
    }
    if (matchedSchedule) {
    """
)

with open('scratch/temp_run_debug.js', 'w', encoding='utf-8') as f:
    f.write(patched_content)

r = subprocess.run(['node', 'scratch/temp_run_debug.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", r.stdout)
print("STDERR:\n", r.stderr)
