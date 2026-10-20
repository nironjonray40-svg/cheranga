import json, re

with open('scratch/db_export.json', 'r', encoding='utf-8') as f:
    dbData = json.load(f)

with open('scratch/exam_schedules.json', 'r', encoding='utf-8') as f:
    schedules = json.load(f)

with open('scratch/exam_types.json', 'r', encoding='utf-8') as f:
    examTypes = json.load(f)

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect getSubjectMarksDistribution implementation
idx = html.find('function getSubjectMarksDistribution')
idx_end = html.find('function updateDynamicSubjectMarksAndHeaders')
fn_code = html[idx:idx_end]

# Let's run a node script that logs inside getSubjectMarksDistribution
node_script = f"""
const schedules = {json.dumps(schedules)};
const examTypes = {json.dumps(examTypes)};
const localStorage = {{
    getItem: (k) => {{
        if (k === 'school_exam_schedules') return JSON.stringify(schedules);
        if (k === 'school_exam_types') return JSON.stringify(examTypes);
        return null;
    }}
}};
let currentFilterClass = 'Eight';
let currentFilterExam = 'Elegileble test';

// We need isExamMatch and getSubjectSlot
{html[html.find('function isExamMatch'):html.find('function changeSubjectFormat')]}

{html[html.find('function getSubjectSlot'):html.find('// Dynamic Marks Distribution')]}

{fn_code}

console.log("Calling getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test'):");
const res = getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test');
console.log("RESULT:", res);
"""

with open('scratch/test_dist_trace.js', 'w', encoding='utf-8') as f:
    f.write(node_script)

import subprocess
r = subprocess.run(['node', 'scratch/test_dist_trace.js'], capture_output=True, text=True, encoding='utf-8')
print("OUTPUT:\n", r.stdout)
print("ERROR:\n", r.stderr)
