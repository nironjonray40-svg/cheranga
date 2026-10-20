const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));

// Inject real dumps of types & schedules
dbData['school_exam_types'] = fs.readFileSync('scratch/exam_types.json', 'utf8');
dbData['school_exam_schedules'] = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

const localStorageMock = (() => {
    let store = { ...dbData };
    return {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; },
        _getStore: () => store
    };
})();

global.localStorage = localStorageMock;
global.window = {
    location: { search: '', replace: () => {}, href: 'http://localhost:8000/Tabulation%20Sheet.html' },
    localStorage: localStorageMock,
    addEventListener: () => {}
};

const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');

class MockElement {
    constructor(tagName, attributes = {}) {
        this.tagName = tagName.toUpperCase();
        this.attributes = { ...attributes };
        this.children = [];
        this.parentNode = null;
        this.nextSibling = null;
        this.style = {
            setProperty: (prop, val) => { this.style[prop] = val; },
            removeProperty: (prop) => { delete this.style[prop]; }
        };
        this.classList = {
            add: () => {},
            remove: () => {},
            contains: () => false
        };
        this._textContent = '';
        this.options = [];
        this.value = '';
        this.selectedIndex = 0;
    }

    getAttribute(name) { return this.attributes[name] || null; }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    removeAttribute(name) { delete this.attributes[name]; }
    hasAttribute(name) { return name in this.attributes; }

    get textContent() { return this._textContent; }
    set textContent(val) { this._textContent = String(val); }

    closest() { return this; }
    appendChild(c) {
        c.parentNode = this;
        this.children.push(c);
        return c;
    }
    insertBefore(c, ref) {
        c.parentNode = this;
        const idx = this.children.indexOf(ref);
        if (idx >= 0) this.children.splice(idx, 0, c);
        else this.children.push(c);
        return c;
    }
    cloneNode() {
        const cl = new MockElement(this.tagName, { ...this.attributes });
        cl.textContent = this.textContent;
        return cl;
    }
    querySelectorAll(selector) { return querySelectorAllFrom(this, selector); }
    querySelector(selector) { return querySelectorAllFrom(this, selector)[0] || null; }
}

function querySelectorAllFrom(root, sel) {
    const res = [];
    function scan(node) {
        if (!node) return;
        if (matchesSelector(node, sel)) res.push(node);
        if (node.children) node.children.forEach(scan);
    }
    if (root.children) root.children.forEach(scan);
    return res;
}

function matchesSelector(el, sel) {
    if (!el || !el.attributes) return false;
    if (sel.includes('tbody')) return el.tagName === 'TBODY';
    if (sel === 'table') return el.tagName === 'TABLE';
    const parts = sel.split(/\s+/);
    const last = parts[parts.length - 1];
    if (last.startsWith('#')) return el.getAttribute('id') === last.slice(1);
    if (last.startsWith('.')) return (el.getAttribute('class') || '').includes(last.slice(1));
    if (last.startsWith('thead th')) {
        if (el.tagName !== 'TH') return false;
        if (last.includes('[data-subj]')) {
            const m = last.match(/\[data-subj="([^"]+)"\]/);
            if (m) {
                if (el.getAttribute('data-subj') !== m[1]) return false;
            } else {
                if (!el.hasAttribute('data-subj')) return false;
            }
        }
        if (last.includes('[data-fullmark]')) {
            const m = last.match(/\[data-fullmark="([^"]+)"\]/);
            if (m) {
                if (el.getAttribute('data-fullmark') !== m[1]) return false;
            } else {
                if (!el.hasAttribute('data-fullmark')) return false;
            }
        }
        if (last.includes('[data-col-type]')) {
            const m = last.match(/\[data-col-type="([^"]+)"\]/);
            if (m) {
                if (el.getAttribute('data-col-type') !== m[1]) return false;
            } else {
                if (!el.hasAttribute('data-col-type')) return false;
            }
        }
        return true;
    }
    if (last.includes('[data-fullmark]')) return el.hasAttribute('data-fullmark');
    if (last.includes('[data-col-type]')) return el.hasAttribute('data-col-type');
    return false;
}

const bodyEl = new MockElement('BODY');
bodyEl.className = '';
const doc = new MockElement('DOCUMENT');
global.document = {
    body: bodyEl,
    documentElement: bodyEl,
    getElementById: (id) => {
        const all = querySelectorAllFrom(doc, '#' + id);
        if (all.length > 0) return all[0];
        const el = new MockElement('div', { id });
        doc.appendChild(el);
        return el;
    },
    querySelectorAll: (sel) => querySelectorAllFrom(doc, sel),
    querySelector: (sel) => querySelectorAllFrom(doc, sel)[0] || null,
    createElement: (tag) => new MockElement(tag),
    addEventListener: () => {}
};

// Build mock THEAD and TBODY structure matching Tabulation Sheet
const table = new MockElement('TABLE');
const thead = new MockElement('THEAD');
const tbody = new MockElement('TBODY');
table.appendChild(thead);
table.appendChild(tbody);
doc.appendChild(table);

// Parse Row 2, 3, 4, 5 from Tabulation Sheet.html
const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi);
for (const rHtml of rowMatches) {
    if (rHtml.includes('data-subj') || rHtml.includes('data-fullmark') || rHtml.includes('data-col-type')) {
        const tr = new MockElement('TR');
        thead.appendChild(tr);
        const thMatches = rHtml.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) || [];
        for (const thH of thMatches) {
            const th = new MockElement('TH');
            const attrMatches = thH.match(/([a-zA-Z0-9_\-]+)="([^"]*)"/g) || [];
            attrMatches.forEach(am => {
                const [k, v] = am.split('=');
                th.setAttribute(k, v.replace(/"/g, ''));
            });
            const textMatch = thH.match(/>([^<]+)</);
            if (textMatch) th.textContent = textMatch[1].trim();
            tr.appendChild(th);
        }
    }
}

// Extract scripts
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
let combinedScript = '';
for (const match of scriptMatches) {
    const rawCode = match.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
    combinedScript += '\n' + rawCode;
}


combinedScript = combinedScript.replace(
    'function getSubjectMarksDistribution(slotKey, className, examName) {',
    `function getSubjectMarksDistribution(slotKey, className, examName) {
        if (slotKey === 'bangla1') {
            console.log('TRACE for bangla1: slotKey=', slotKey, 'className=', className, 'examName=', examName);
            console.trace();
        }
    `
);
eval(combinedScript);


console.log("Mock environment ready. Now testing dynamic marks & headers!");

// 1. Test Class Eight with Exam: 'Elegileble test'
currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'bn';

updateSubjects();
updateDynamicSubjectMarksAndHeaders();

console.log("\n--- Checking Full Marks Row for Class Eight ('Elegileble test') ---");
const row5Cells = doc.querySelectorAll('thead th[data-fullmark]');
const marksSummary = {};
row5Cells.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!marksSummary[s]) marksSummary[s] = {};
    marksSummary[s][f] = th.textContent;
});

console.log("Marks summary for Eight + Elegileble test:");
console.log(JSON.stringify(marksSummary, null, 2));

// Assertions for Class Eight
if (marksSummary.bangla1.mcq === '২০' && marksSummary.bangla1.written === '৩০' && marksSummary.bangla1.total === '৫০') {
    console.log("PASS: Bangla 1st has 20 MCQ, 30 Written, 50 Total.");
} else {
    console.error("FAIL: Bangla 1st marks incorrect!", marksSummary.bangla1);
    process.exit(1);
}

if (marksSummary.bangla.grand_total === '১০০') {
    console.log("PASS: Bangla Grand Total is 100.");
} else {
    console.error("FAIL: Bangla Grand Total incorrect!", marksSummary.bangla);
    process.exit(1);
}

if (marksSummary.english1.written === '৫০' && marksSummary.english2.written === '৫০' && marksSummary.english.grand_total === '১০০') {
    console.log("PASS: English has 50 Written each and Grand Total 100.");
} else {
    console.error("FAIL: English marks incorrect!", marksSummary.english);
    process.exit(1);
}

if (marksSummary.math.mcq === '৩০' && marksSummary.math.written === '৭০' && marksSummary.math.total === '১০০') {
    console.log("PASS: Math has 30 MCQ, 70 Written, 100 Total.");
} else {
    console.error("FAIL: Math marks incorrect!", marksSummary.math);
    process.exit(1);
}

if (marksSummary.chem.mcq === '২০' && marksSummary.chem.written === '৩০' && marksSummary.chem.total === '৫০') {
    console.log("PASS: Science (Chem slot) has 20 MCQ, 30 Written, 50 Total.");
} else {
    console.error("FAIL: Science marks incorrect!", marksSummary.chem);
    process.exit(1);
}

// 2. Test Class Ten with Exam: 'বার্ষিক পরীক্ষা'
currentFilterClass = 'Ten';
currentFilterExam = 'বার্ষিক পরীক্ষা';

updateSubjects();
updateDynamicSubjectMarksAndHeaders();

console.log("\n--- Checking Full Marks Row for Class Ten ('বার্ষিক পরীক্ষা') ---");
const marksSummaryTen = {};
doc.querySelectorAll('thead th[data-fullmark]').forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!marksSummaryTen[s]) marksSummaryTen[s] = {};
    marksSummaryTen[s][f] = th.textContent;
});

console.log("Marks summary for Ten + বার্ষিক পরীক্ষা:");
console.log(JSON.stringify(marksSummaryTen, null, 2));

if (marksSummaryTen.bangla1.mcq === '৩০' && marksSummaryTen.bangla1.written === '৭০' && marksSummaryTen.bangla1.total === '১০০') {
    console.log("PASS: Class 10 Bangla 1st has 30 MCQ, 70 Written, 100 Total.");
} else {
    console.error("FAIL: Class 10 Bangla 1st marks incorrect!", marksSummaryTen.bangla1);
    process.exit(1);
}

if (marksSummaryTen.bangla.grand_total === '২০০') {
    console.log("PASS: Class 10 Bangla Grand Total is 200.");
} else {
    console.error("FAIL: Class 10 Bangla Grand Total incorrect!", marksSummaryTen.bangla);
    process.exit(1);
}

if (marksSummaryTen.chem.mcq === '২৫' && marksSummaryTen.chem.written === '৫০' && marksSummaryTen.chem.practical === '২৫' && marksSummaryTen.chem.total === '১০০') {
    console.log("PASS: Class 10 Chemistry has 25 MCQ, 50 Written, 25 Practical, 100 Total.");
} else {
    console.error("FAIL: Class 10 Chemistry marks incorrect!", marksSummaryTen.chem);
    process.exit(1);
}

console.log("\n=======================================================");
console.log("ALL DYNAMIC MARKS & HEADERS TESTS PASSED WITH 100% SUCCESS!");
console.log("=======================================================");
