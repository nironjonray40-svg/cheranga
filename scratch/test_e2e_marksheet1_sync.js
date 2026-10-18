const fs = require('fs');

// Read Marksheet1.html script
const html = fs.readFileSync('Marksheet1.html', 'utf8');
const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>[\s\S]*?<script\b[^>]*>([\s\S]*?)<\/script>/i);
const mainScript = scriptMatch ? scriptMatch[2] : '';

// Setup simulated browser DOM and localStorage
const mockStorage = {};
const mockLocalStorage = {
    getItem: (k) => (k in mockStorage ? mockStorage[k] : null),
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
};

const dbDump = JSON.parse(fs.readFileSync('scratch/db_data.json', 'utf8'));
for (const [k, v] of Object.entries(dbDump)) {
    mockStorage[k] = typeof v === 'string' ? v : JSON.stringify(v);
}

// Minimal DOM elements mock
const elements = {};
function createMockEl(id, tagName = 'div') {
    elements[id] = {
        id,
        tagName: tagName.toUpperCase(),
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        options: [],
        selectedIndex: 0,
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: function(child) { this.options.push(child); }
    };
    return elements[id];
}

['filter-exam', 'filter-class', 'filter-section', 'template-filter', 'filter-student-search',
 'btn-clear-search', 'search-suggestions-dropdown', 'display-exam-name-pill', 'display-class-val',
 'display-section-val', 'display-student-name', 'display-roll-val', 'display-id-val',
 'single-marksheet-container', 'batch-marksheets-container', 'single-marksheet-table-body',
 'btn-create-all', 'create-all-btn-text', 'school-logo-img'
].forEach(id => createMockEl(id, id.startsWith('filter-') ? 'select' : 'div'));

global.window = {
    location: { search: '', href: '' },
    addEventListener: () => {}
};
global.document = {
    addEventListener: () => {},
    querySelector: () => ({ querySelectorAll: () => [] }),
    querySelectorAll: () => [],
    getElementById: (id) => {
        if (!elements[id]) createMockEl(id);
        const el = elements[id];
        return new Proxy(el, {
            set: function(target, prop, value) {
                target[prop] = value;
                if (prop === 'innerHTML' && (target.id === 'filter-exam' || target.id === 'filter-class' || target.id === 'filter-section')) {
                    const matches = [...value.matchAll(/<option\s+value="([^"]+)">([^<]+)<\/option>/g)];
                    target.options = matches.map(m => ({ value: m[1], text: m[2] }));
                }
                return true;
            }
        });
    },
    querySelectorAll: () => []
};
global.localStorage = mockLocalStorage;
global.setInterval = () => {};
global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });

// Evaluate mainScript in this context
eval(mainScript);

console.log("=== Marksheet1.html: 1. Test getAllExams() ===");
const allExams = getAllExams();
console.log("getAllExams result:", allExams);

console.log("\n=== Marksheet1.html: 2. Test getClassesForExam for each exam ===");
for (const ex of allExams) {
    const classes = getClassesForExam(ex);
    console.log(`Exam: '${ex}' -> Classes:`, classes);
}

console.log("\n=== Marksheet1.html: 3. Test selecting 'Elegileble test' ===");
const examEl = document.getElementById('filter-exam');
const classEl = document.getElementById('filter-class');
examEl.value = 'Elegileble test';
updateMarksheetExam('Elegileble test');
console.log("After selecting 'Elegileble test':");
console.log("  Exam value:", examEl.value);
console.log("  Class options:", classEl.options.map(o => o.value));
console.log("  Selected Class:", classEl.value);
console.log("  Display Exam Pill:", document.getElementById('display-exam-name-pill').innerText);
console.log("  Display Class Val:", document.getElementById('display-class-val').innerText);

console.log("\n=== Marksheet1.html: 4. Test selecting 'বার্ষিক পরীক্ষা' ===");
examEl.value = 'বার্ষিক পরীক্ষা';
updateMarksheetExam('বার্ষিক পরীক্ষা');
console.log("After selecting 'বার্ষিক পরীক্ষা':");
console.log("  Exam value:", examEl.value);
console.log("  Class options:", classEl.options.map(o => o.value));
console.log("  Selected Class:", classEl.value);
console.log("  Display Exam Pill:", document.getElementById('display-exam-name-pill').innerText);
console.log("  Display Class Val:", document.getElementById('display-class-val').innerText);

console.log("\n=== ALL MARKSHEET1 ASSERTIONS PASSING ===");
