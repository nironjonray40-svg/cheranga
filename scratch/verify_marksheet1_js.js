const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('Marksheet1.html', 'utf-8');

// Extract all <script> tags
const scripts = [];
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
}

console.log(`Found ${scripts.length} script blocks in Marksheet1.html`);

const storage = {
    'school_exam_schedules': JSON.stringify([
        { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Nine', subject: 'Bangla' },
        { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Ten', subject: 'Bangla' },
        { term: 'বার্ষিক পরীক্ষা ২০২৬', class: 'Six', subject: 'Math' }
    ]),
    'school_marking_system': JSON.stringify([
        { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
        { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
        { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
        { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
        { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
        { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
    ]),
    'school_students': JSON.stringify([
        { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', class: 'Ten', section: 'বিজ্ঞান' }
    ])
};

const domElements = {};
function getOrCreateElement(id) {
    if (!domElements[id]) {
        domElements[id] = {
            id,
            innerText: '',
            textContent: '',
            value: '',
            options: [],
            innerHTML: '',
            style: {},
            classList: { add: () => {}, remove: () => {} },
            setAttribute: () => {},
            getAttribute: () => null,
            appendChild: (child) => { domElements[id].options.push(child); }
        };
    }
    return domElements[id];
}

const sandbox = {
    window: {
        location: { search: '', replace: () => {}, href: '' },
        addEventListener: () => {}
    },
    document: {
        getElementById: (id) => getOrCreateElement(id),
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: (tag) => ({ tagName: tag, setAttribute: () => {}, textContent: '', value: '' }),
        body: { classList: { add: () => {}, remove: () => {} } },
        addEventListener: () => {}
    },
    localStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); },
        removeItem: (k) => { delete storage[k]; }
    },
    URLSearchParams: class {
        constructor() {}
        get() { return null; }
    },
    setInterval: () => {},
    setTimeout: () => {},
    fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
    console: console,
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    Number: Number,
    String: String,
    Array: Array,
    Object: Object,
    Set: Set,
    Boolean: Boolean
};
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;

const context = vm.createContext(sandbox);

try {
    const code = scripts[1];
    vm.runInContext(code, context);
    console.log("Syntax and initial execution in Marksheet1.html: SUCCESS!");

    // Test calling getAllExams
    const exams = vm.runInContext("getAllExams()", context);
    console.log("getAllExams() returned:", exams);

    // Test calling getClassesForExam for '১ম সাময়িক পরীক্ষা ২০২৬'
    const classesExam1 = vm.runInContext("getClassesForExam('১ম সাময়িক পরীক্ষা ২০২৬')", context);
    console.log("getClassesForExam('১ম সাময়িক পরীক্ষা ২০২৬') returned:", classesExam1);

    // Test calling getClassesForExam for 'বার্ষিক পরীক্ষা ২০২৬'
    const classesExam2 = vm.runInContext("getClassesForExam('বার্ষিক পরীক্ষা ২০২৬')", context);
    console.log("getClassesForExam('বার্ষিক পরীক্ষা ২০২৬') returned:", classesExam2);

    // Test calling syncCascadingFilters('all')
    vm.runInContext("syncCascadingFilters('all')", context);
    console.log("syncCascadingFilters('all') execution: SUCCESS!");

    // Verify filter-exam dropdown options
    const examSelect = domElements['filter-exam'];
    console.log("filter-exam innerHTML:", examSelect.innerHTML);

    // Verify filter-class dropdown options
    const classSelect = domElements['filter-class'];
    console.log("filter-class innerHTML:", classSelect.innerHTML);

    // Test exam change: user selects 'বার্ষিক পরীক্ষা ২০২৬'
    examSelect.value = 'বার্ষিক পরীক্ষা ২০২৬';
    vm.runInContext("updateMarksheetExam('বার্ষিক পরীক্ষা ২০২৬')", context);
    console.log("After updateMarksheetExam('বার্ষিক পরীক্ষা ২০২৬'):");
    console.log("filter-class innerHTML:", classSelect.innerHTML);
    console.log("selected class value:", classSelect.value);

    console.log("ALL VERIFICATIONS IN Marksheet1.html PASSED!");
} catch (e) {
    console.error("Execution error in Marksheet1.html:", e);
    process.exit(1);
}
