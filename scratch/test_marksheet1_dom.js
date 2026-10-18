const fs = require('fs');

// Read Marksheet1.html
const html = fs.readFileSync('Marksheet1.html', 'utf8');

// Extract all scripts
const scriptMatches = html.match(/<script.*?>([\s\S]*?)<\/script>/g);
const scriptBody = scriptMatches.map(s => s.replace(/<\/?script.*?>/g, '')).join('\n;\n');

// Read dumped data
const dbData = JSON.parse(fs.readFileSync('scratch/db_dump.json', 'utf8'));

const store = { ...dbData, isLoggedIn: 'true', school_marksheet_exam: 'Elegileble test', school_marksheet_class: 'Eight', school_marksheet_section: 'A' };

// Simple localStorage mock
const localStorage = {
    getItem: (k) => store[k] !== undefined ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
};

const dummyElem = {
    value: '',
    innerText: '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    options: [],
    getAttribute: () => '',
    setAttribute: () => {},
    addEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
};

// Mock minimal DOM elements
const document = {
    getElementById: (id) => ({ ...dummyElem, id }),
    querySelector: () => ({ ...dummyElem }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

const window = {
    localStorage,
    location: { replace: () => {}, search: '' },
    addEventListener: () => {},
    fetch: () => Promise.resolve({ json: () => Promise.resolve({}) })
};

// Evaluate the script in our context
const vm = require('vm');
const context = {
    localStorage,
    document,
    window,
    console,
    setInterval: () => {},
    setTimeout: () => {},
    parseInt,
    parseFloat,
    Math,
    Array,
    Object,
    Set,
    Map,
    String,
    Number,
    Boolean,
    JSON,
    Date
};
vm.createContext(context);
vm.runInContext(scriptBody, context);

// Test 1: getSubjectsForClass for Elegileble test, Class Eight, Section A, Student 1
const student1 = JSON.parse(store['school_students']).find(s => s.class === 'Eight' && s.section === 'A' && s.roll === '1');
const subjects = context.getSubjectsForClass('Eight', 'A', 'Elegileble test', student1);

console.log("=== TEST 1 (Marksheet1): Elegileble test Subjects ===");
console.log(`Total subject rows: ${subjects.length}`);
subjects.forEach(s => {
    if (s.isCombined) {
        console.log(`Combined: ${s.name} (mcq=${s.mcq}, cq=${s.cq}, pr=${s.pr}, tot=${s.total}) + ${s.pairWith} (mcq=${s.pairMcq}, cq=${s.pairCq}, pr=${s.pairPr}, tot=${s.pairTotal})`);
    } else {
        console.log(`Single: ${s.name} (mcq=${s.mcq}, cq=${s.cq}, pr=${s.pr}, tot=${s.total})`);
    }
});

// Test 2: Barshik Porikkha, Class Six, Section A
const studentSix = JSON.parse(store['school_students']).find(s => s.class === 'Six');
const subjectsSix = context.getSubjectsForClass('Six', 'A', 'বার্ষিক পরীক্ষা', studentSix);
console.log("\n=== TEST 2 (Marksheet1): বার্ষিক পরীক্ষা Subjects ===");
console.log(`Total subject rows: ${subjectsSix.length}`);
subjectsSix.forEach(s => {
    console.log(`Single: ${s.name} (mcq=${s.mcq}, cq=${s.cq}, pr=${s.pr}, tot=${s.total})`);
});
