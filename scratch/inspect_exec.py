import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect getSubjectMarksDistribution by evaluating it in node with logs
node_code = """
const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
dbData['school_exam_types'] = fs.readFileSync('scratch/exam_types.json', 'utf8');
dbData['school_exam_schedules'] = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

const localStorageMock = {
    store: { ...dbData },
    getItem: function(k) { return this.store[k] || null; },
    setItem: function(k, v) { this.store[k] = String(v); }
};
global.localStorage = localStorageMock;
global.window = {
    location: { search: '', replace: () => {}, href: 'http://localhost:8000/Tabulation%20Sheet.html' },
    localStorage: localStorageMock,
    addEventListener: () => {}
};
global.document = {
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => ({ value: '', appendChild: () => {}, children: [], options: [], closest: () => ({ style: {} }) }),
    createElement: (tag) => ({ tagName: tag, appendChild: () => {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, style: {} }),
    addEventListener: () => {},
    body: { className: '', style: {} }
};

const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');
const scriptMatches = html.match(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi);
let combinedScript = '';
for (const match of scriptMatches) {
    const rawCode = match.replace(/^<script\\b[^>]*>/i, '').replace(/<\\/script>$/i, '');
    combinedScript += '\\n' + rawCode;
}

eval(combinedScript);

currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'bn';

updateSubjects();

console.log("activeClassSlotMap:", activeClassSlotMap);

const dist = getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test');
console.log("dist bangla1:", dist);
"""

with open('scratch/run_inspect.js', 'w', encoding='utf-8') as f:
    f.write(node_code)

res = subprocess.run(['node', 'scratch/run_inspect.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
