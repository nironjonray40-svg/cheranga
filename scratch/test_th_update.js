const fs = require('fs');
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Read JSON dumps
const types = fs.readFileSync('scratch/exam_types.json', 'utf8');
const scheds = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

const localStorageMock = {
    getItem: (k) => {
        if (k === 'school_exam_types') return types;
        if (k === 'school_exam_schedules') return scheds;
        return null;
    },
    setItem: () => {}
};

global.window = { location: { replace: () => {}, search: '' }, addEventListener: () => {} };
global.localStorage = localStorageMock;

// Extract script
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
let combinedScript = '';
for (const match of scriptMatches) {
    const rawCode = match.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
    combinedScript += '\n' + rawCode;
}

// Minimal mock element for testing updateDynamicSubjectMarksAndHeaders
const thElements = [];
const thRegex = /<th[^>]*data-fullmark[^>]*>[\s\S]*?<\/th>/gi;
const matches = html.match(thRegex) || [];
for (const m of matches) {
    const subjM = m.match(/data-subj="([^"]+)"/);
    const fullM = m.match(/data-fullmark="([^"]+)"/);
    const th = {
        attributes: {
            'data-subj': subjM ? subjM[1] : '',
            'data-fullmark': fullM ? fullM[1] : ''
        },
        getAttribute: function(k) { return this.attributes[k]; },
        textContent: ''
    };
    thElements.push(th);
}

global.document = {
    addEventListener: () => {},
    body: { className: '', style: { setProperty: ()=>{} }, classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false } },
    documentElement: { className: '', style: { setProperty: ()=>{} }, classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false } },
    createElement: () => ({ setAttribute: ()=>{}, style: {}, value: '', textContent: '' }),
    getElementById: () => ({ value: '', options: [], style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerHTML: '', appendChild: ()=>{}, closest: ()=>({ style: {} }), setAttribute: ()=>{}, querySelectorAll: ()=>[] }),
    querySelector: () => ({ value: '', options: [], style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerHTML: '', appendChild: ()=>{}, closest: ()=>({ style: {} }), setAttribute: ()=>{}, querySelectorAll: ()=>[] }),
    querySelectorAll: (sel) => {
        if (sel.includes('[data-fullmark]')) return thElements;
        return [];
    }
};

eval(combinedScript);

currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'bn';

updateDynamicSubjectMarksAndHeaders();

console.log('Total th elements updated:', thElements.length);
const res = {};
thElements.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!res[s]) res[s] = {};
    res[s][f] = th.textContent;
});

console.log('Result for Class Eight, Elegileble test:');
console.log(JSON.stringify(res, null, 2));

currentFilterClass = 'Ten';
currentFilterExam = 'বার্ষিক পরীক্ষা';

updateDynamicSubjectMarksAndHeaders();
const resTen = {};
thElements.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!resTen[s]) resTen[s] = {};
    resTen[s][f] = th.textContent;
});

console.log('\nResult for Class Ten, বার্ষিক পরীক্ষা:');
console.log(JSON.stringify(resTen, null, 2));
