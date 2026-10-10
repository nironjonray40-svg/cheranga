const fs = require('fs');
const dbData = JSON.parse(fs.readFileSync('scratch/db_dump.json', 'utf8'));

const html = fs.readFileSync('exam-portal.html', 'utf8');

const mockElements = {};
const makeMockEl = (id) => {
    if (!mockElements[id]) {
        mockElements[id] = {
            id,
            value: '',
            innerText: '',
            innerHTML: '',
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            querySelector: (s) => makeMockEl(id + '_' + s),
            querySelectorAll: () => [],
            addEventListener: () => {},
            remove: () => {}
        };
    }
    return mockElements[id];
};

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.document = {
    getElementById: (id) => makeMockEl(id),
    querySelector: (s) => makeMockEl(s),
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: (tag) => makeMockEl(tag),
    body: { appendChild: () => {} }
};
global.localStorage = {
    getItem: (k) => dbData[k] || null,
    setItem: (k, v) => { dbData[k] = v; }
};
global.alert = console.log;
global.confirm = () => true;

const script6 = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)][6][1];
eval(script6);

const schedules = JSON.parse(dbData.school_exam_schedules || '[]');
const sixBanglaSch = schedules.find(s => s.class === 'Six' && s.subject === 'Bangla Sahitya');
const schId = sixBanglaSch ? sixBanglaSch.id : '1791644395711';

console.log(`Testing openExamMarksEntryModal("${schId}")...`);
openExamMarksEntryModal(schId);

const renderedHtml = mockElements['modal-student-marks-rows']?.innerHTML || '';
console.log('Rendered rows total length:', renderedHtml.length);

// Extract rows from rendered HTML
const rowRegex = /<tr id="modal-row-student-([^"]+)"[\s\S]*?<\/tr>/g;
let match;
let count = 0;
let blankCount = 0;
let enteredCount = 0;

while ((match = rowRegex.exec(renderedHtml)) !== null) {
    count++;
    const rowHtml = match[0];
    const stId = match[1];

    const cqMatch = rowHtml.match(/modal-mark-cq"[^>]*value="([^"]*)"/);
    const mcqMatch = rowHtml.match(/modal-mark-mcq"[^>]*value="([^"]*)"/);
    const gradeMatch = rowHtml.match(/id="modal-cell-totalgrade-[^"]*"[^>]*>([\s\S]*?)<\/td>/);

    const cqVal = cqMatch ? cqMatch[1] : 'N/A';
    const mcqVal = mcqMatch ? mcqMatch[1] : 'N/A';
    const gradeVal = gradeMatch ? gradeMatch[1].trim() : 'N/A';

    if (count <= 10) {
        console.log(`Student ${count} (ID: ${stId}): CQ="${cqVal}", MCQ="${mcqVal}", Grade: ${gradeVal.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')}`);
    }

    if (cqVal === "" && mcqVal === "") {
        blankCount++;
    } else {
        enteredCount++;
    }
}

console.log(`\nSummary of ${count} students:`);
console.log(`- Blank (Unentered): ${blankCount} students (CQ and MCQ are empty, Grade is '-')`);
console.log(`- Evaluated / Entered: ${enteredCount} students (MCQ has marks, CQ is blank if unentered)`);

console.log('\nLive Stats:');
console.log('Total:', mockElements['stat-total-students']?.innerText);
console.log('Entered:', mockElements['stat-entered-students']?.innerText);
console.log('Passed:', mockElements['stat-passed-students']?.innerText);
console.log('Failed:', mockElements['stat-failed-students']?.innerText);
console.log('Class Avg:', mockElements['stat-avg-mark']?.innerText);
