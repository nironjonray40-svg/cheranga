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

class MockElement {
    constructor(tagName, attributes = {}) {
        this.tagName = tagName.toUpperCase();
        this.attributes = { ...attributes };
        this.children = [];
        this.options = [];
        this.value = '';
    }
    getAttribute(name) { return this.attributes[name] || null; }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    appendChild(c) { this.children.push(c); return c; }
    closest() { return this; }
}

const bodyEl = new MockElement('BODY');
bodyEl.className = '';
const doc = new MockElement('DOCUMENT');
global.document = {
    body: bodyEl,
    documentElement: new MockElement('HTML'),
    getElementById: (id) => {
        let el = doc.children.find(c => c.attributes.id === id);
        if (!el) { el = new MockElement('div', { id }); doc.appendChild(el); }
        return el;
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: (tag) => new MockElement(tag),
    addEventListener: () => {}
};

const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
let combinedScript = '';
for (const match of scriptMatches) {
    const rawCode = match.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
    combinedScript += '\n' + rawCode;
}

// Log inside updateSubjects
combinedScript = combinedScript.replace(
    'function updateSubjects() {',
    `function updateSubjects() {
        console.log("DEBUG updateSubjects: currentFilterClass=", currentFilterClass, "currentFilterExam=", currentFilterExam);
    `
).replace(
    'if (filteredSubs.length > 0) activeSubs = filteredSubs;',
    `if (filteredSubs.length > 0) activeSubs = filteredSubs;
    console.log("DEBUG activeSubs in updateSubjects:", activeSubs.length, activeSubs.map(s => s.name));
    `
);

eval(combinedScript);

console.log("Calling filterClass('Six')...");
filterClass('Six');
console.log("Calling filterExam('বার্ষিক পরীক্ষা')...");
filterExam('বার্ষিক পরীক্ষা');
