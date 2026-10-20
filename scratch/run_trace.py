import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/test_tabulation_subject_marks_sync.js', 'r', encoding='utf-8') as f:
    content = f.read()

debug_patch = """
combinedScript = combinedScript.replace(
    'function getSubjectMarksDistribution(slotKey, className, examName) {',
    `function getSubjectMarksDistribution(slotKey, className, examName) {
        if (slotKey === 'bangla1') {
            console.log('TRACE for bangla1: slotKey=', slotKey, 'className=', className, 'examName=', examName);
            console.trace();
        }
    `
);
eval(combinedScript);
"""

patched = content.replace('eval(combinedScript);', debug_patch)

with open('scratch/temp_trace.js', 'w', encoding='utf-8') as f:
    f.write(patched)

r = subprocess.run(['node', 'scratch/temp_trace.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", r.stdout[:3000])
print("STDERR:\n", r.stderr[:2000])
