const fs = require('fs');
const html = fs.readFileSync('exam-portal.html', 'utf8');

const mockStorage = {
    'school_exam_schedules': JSON.stringify([
        { id: '1', class: 'Class 6', term: 'Half Yearly', subject: 'Bangla', date: '2026-06-15', slNo: '1', examType: 'CQ+MCQ' }
    ]),
    'school_students': JSON.stringify([
        { id: '101', class: 'Class 6', section: 'A', roll: '1', name: 'Rahim', regNo: '1001' }
    ]),
    'school_subjects': JSON.stringify({
        'Class 6': [{ name: 'Bangla', code: '101' }]
    }),
    'school_student_marks': JSON.stringify({})
};

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
                add: (c) => console.log('classList.add', c, 'on', id),
                remove: (c) => console.log('classList.remove', c, 'on', id),
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
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; }
};
global.alert = console.log;
global.confirm = () => true;

// Evaluate script 6 directly from updated exam-portal.html
const script6 = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)][6][1];
eval(script6);

console.log('Testing openExamMarksEntryModal("1")...');
openExamMarksEntryModal('1');
console.log('SUCCESS! Modal opened perfectly.');
