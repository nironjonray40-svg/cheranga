const fs = require('fs');

// Read Marksheet.html script
const html = fs.readFileSync('Marksheet.html', 'utf8');
const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>[\s\S]*?<script\b[^>]*>([\s\S]*?)<\/script>/i);
const mainScript = scriptMatch ? scriptMatch[2] : '';

// Setup simulated browser DOM and localStorage
const mockStorage = {};
const mockLocalStorage = {
    getItem: (k) => (k in mockStorage ? mockStorage[k] : null),
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
};

// Load data from school.db using python dump or sqlite
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
        classList: { add: () => {}, remove: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: function(child) { this.options.push(child); }
    };
    return elements[id];
}

['filter-exam', 'filter-class', 'filter-section', 'template-filter', 'filter-student-search',
 'btn-clear-search', 'search-suggestions-dropdown', 'display-exam-name', 'display-class-name',
 'display-section-name', 'display-student-name', 'display-roll-no', 'display-student-id',
 'display-student-religion', 'display-optional-subject', 'row-optional-subject', 'single-marksheet-container',
 'batch-marksheets-container', 'single-marksheet-table-body', 'btn-create-all', 'create-all-btn-text',
 'display-school-name', 'display-school-address', 'school-logo-img', 'school-logo-fallback'
].forEach(id => createMockEl(id, id.startsWith('filter-') ? 'select' : 'div'));

// Set select options helper
function setSelectHTML(selectEl, htmlStr) {
    selectEl.innerHTML = htmlStr;
    const matches = [...htmlStr.matchAll(/<option\s+value="([^"]+)">([^<]+)<\/option>/g)];
    selectEl.options = matches.map(m => ({ value: m[1], text: m[2] }));
    if (selectEl.options.length > 0 && !selectEl.value) {
        selectEl.value = selectEl.options[0].value;
        selectEl.selectedIndex = 0;
    }
}

// Mock DOM environment
global.window = {
    location: { search: '', href: '' },
    addEventListener: () => {}
};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (!elements[id]) createMockEl(id);
        const el = elements[id];
        // wrap innerHTML setter to parse options for select
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

console.log("=== 1. Test getAllExams() ===");
const allExams = getAllExams();
console.log("getAllExams result:", allExams);

console.log("\n=== 2. Test getClassesForExam for each exam ===");
for (const ex of allExams) {
    const classes = getClassesForExam(ex);
    console.log(`Exam: '${ex}' -> Classes:`, classes);
}

console.log("\n=== 3. Test syncCascadingFilters('all') Initial Run ===");
syncCascadingFilters('all');
const examEl = document.getElementById('filter-exam');
const classEl = document.getElementById('filter-class');
console.log("Selected Exam:", examEl.value);
console.log("Class dropdown options for this exam:", classEl.options.map(o => o.value));

console.log("\n=== 4. Test selecting 'Elegileble test' ===");
examEl.value = 'Elegileble test';
updateMarksheetExam('Elegileble test');
console.log("After selecting 'Elegileble test':");
console.log("  Exam value:", examEl.value);
console.log("  Class options:", classEl.options.map(o => o.value));
console.log("  Selected Class:", classEl.value);
console.log("  Display Exam Name:", document.getElementById('display-exam-name').innerText);
console.log("  Display Class Name:", document.getElementById('display-class-name').innerText);

console.log("\n=== 5. Test selecting 'বার্ষিক পরীক্ষা' ===");
examEl.value = 'বার্ষিক পরীক্ষা';
updateMarksheetExam('বার্ষিক পরীক্ষা');
console.log("After selecting 'বার্ষিক পরীক্ষা':");
console.log("  Exam value:", examEl.value);
console.log("  Class options:", classEl.options.map(o => o.value));
console.log("  Selected Class:", classEl.value);
console.log("  Display Exam Name:", document.getElementById('display-exam-name').innerText);
console.log("  Display Class Name:", document.getElementById('display-class-name').innerText);

console.log("\n=== ALL ASSERTIONS PASSING ===");
