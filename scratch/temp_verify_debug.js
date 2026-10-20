const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
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
            _list: new Set(),
            add: (cls) => this.classList._list.add(cls),
            remove: (cls) => this.classList._list.delete(cls),
            contains: (cls) => this.classList._list.has(cls)
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

    get textContent() {
        if (this.children.length === 0) return this._textContent;
        return this.children.map(c => c.textContent).join('');
    }
    set textContent(val) {
        this._textContent = String(val);
        this.children = [];
    }

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
    if (last.includes('[data-subj]')) return el.hasAttribute('data-subj');
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

const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');

// Build mock table with Row 2 (subject headers)
const table = new MockElement('TABLE');
const thead = new MockElement('THEAD');
const tbody = new MockElement('TBODY');
table.appendChild(thead);
table.appendChild(tbody);
doc.appendChild(table);

// Extract thead rows from HTML
const trRegex = /<tr[\s\S]*?<\/tr>/gi;
let m;
while ((m = trRegex.exec(html)) !== null) {
    const rHtml = m[0];
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
    'function updateSubjects() {',
    `function updateSubjects() {
        console.log('--- ENTER updateSubjects: currentFilterClass=', currentFilterClass, 'currentFilterExam=', currentFilterExam);
    `
).replace(
    'if (activeSubs.length > 0) {',
    `console.log('DEBUG activeSubs length:', activeSubs.length, activeSubs.map(s => s.name || s.nameBn));
    if (activeSubs.length > 0) {
    `
).replace(
    'assignSlot(\'chem\', s);',
    `console.log('DEBUG assigning to chem:', s.name, s.nameBn); assignSlot('chem', s);`
);

eval(combinedScript);


console.log("==================================================================");
console.log("E2E VERIFICATION: TABULATION SHEET SUBJECTS SYNC WITH EXAM LIST");
console.log("==================================================================");

function getVisibleSubjectHeaders() {
    const ths = querySelectorAllFrom(thead, 'th[data-subj]');
    const res = {};
    ths.forEach(th => {
        const s = th.getAttribute('data-subj');
        if (!th.hasAttribute('data-fullmark') && !th.hasAttribute('data-col-type')) {
            res[s] = th.textContent.trim();
        }
    });
    return res;
}

// TEST 1: Class Eight + Exam "Elegileble test"
console.log("\n--- TEST 1: Class Eight + Exam: 'Elegileble test' ---");
currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'bn';
currentSubjFormat = 'full';

updateSubjects();

const headersEight = getVisibleSubjectHeaders();
console.log("Visible Subject Headers (Eight):", headersEight);

if (headersEight.chem === 'বিজ্ঞান') {
    console.log("PASS: Slot 5 correctly updated from 'Exam List' to 'বিজ্ঞান' (Science scheduled for Class Eight)!");
} else {
    console.error("FAIL: Slot 5 expected 'বিজ্ঞান', got:", headersEight.chem);
    process.exit(1);
}

if (headersEight.phys === '-' && headersEight.bio === '-') {
    console.log("PASS: Slot 6 & Slot 7 are correctly '-' since Class Eight does not have separate Physics/Biology in Exam List!");
} else {
    console.error("FAIL: Slot 6 & 7 expected '-', got:", headersEight.phys, headersEight.bio);
    process.exit(1);
}

if (headersEight.bangla1 && headersEight.bangla2) {
    console.log("PASS: Bangla 1st & 2nd are displayed:", headersEight.bangla1, headersEight.bangla2);
}

// TEST 2: Class Ten + Exam "বার্ষিক পরীক্ষা"
console.log("\n--- TEST 2: Class Ten + Exam: 'বার্ষিক পরীক্ষা' ---");
currentFilterClass = 'Ten';
currentFilterExam = 'বার্ষিক পরীক্ষা';

updateSubjects();

const headersTen = getVisibleSubjectHeaders();
console.log("Visible Subject Headers (Ten):", headersTen);

if (headersTen.chem === 'রসায়ন' && headersTen.phys === 'পদার্থ' && headersTen.bio === 'জীববিজ্ঞান') {
    console.log("PASS: Class 10 correctly displays separated Science subjects: রসায়ন, পদার্থ, জীববিজ্ঞান!");
} else {
    console.error("FAIL: Class 10 science headers mismatch:", headersTen);
    process.exit(1);
}

// TEST 3: Real-Time Dynamic Update when user edits subject in "Exam List" (school_exam_schedules)
console.log("\n--- TEST 3: Real-time update when 'Exam List' is edited ---");
currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';

// User changes Science subject name to 'সাধারণ বিজ্ঞান' in Exam List
let currentScheds = JSON.parse(localStorage.getItem('school_exam_schedules'));
currentScheds = currentScheds.map(s => {
    if (s.class === 'Eight' && s.subject === 'Science') {
        return { ...s, subject: 'সাধারণ বিজ্ঞান' };
    }
    return s;
});
localStorage.setItem('school_exam_schedules', JSON.stringify(currentScheds));

// Trigger updateSubjects
updateSubjects();

const headersUpdated = getVisibleSubjectHeaders();
console.log("Updated Slot 5 after Exam List change:", headersUpdated.chem);
if (headersUpdated.chem === 'সাধারণ বিজ্ঞান') {
    console.log("PASS: Subject name in Tabulation Sheet dynamically changed to 'সাধারণ বিজ্ঞান' directly from Exam List!");
} else {
    console.error("FAIL: Expected 'সাধারণ বিজ্ঞান', got:", headersUpdated.chem);
    process.exit(1);
}

// TEST 4: English Language Switch
console.log("\n--- TEST 4: English Language Switch ---");
currentLang = 'en';
updateSubjects();

const headersEn = getVisibleSubjectHeaders();
console.log("Visible Subject Headers (English):", headersEn);
if (headersEn.math === 'Mathematics' && headersEn.bangla1 === 'Bangla 1st Paper') {
    console.log("PASS: English translation correctly reflects Exam List subjects!");
} else {
    console.error("FAIL: English subjects mismatch:", headersEn);
    process.exit(1);
}

// TEST 5: Short Format Switch
console.log("\n--- TEST 5: Short Subject Format Switch ---");
currentLang = 'bn';
currentSubjFormat = 'short';
updateSubjects();

const headersShort = getVisibleSubjectHeaders();
console.log("Visible Subject Headers (Short BN):", headersShort);
if (headersShort.bangla1 === 'বাং ১ম' && headersShort.english1 === 'ইং ১ম') {
    console.log("PASS: Short subject format correctly applied!");
} else {
    console.error("FAIL: Short subject format mismatch:", headersShort);
    process.exit(1);
}

console.log("\n==================================================================");
console.log("ALL E2E SUBJECT DYNAMIC SYNC TESTS PASSED WITH 100% SUCCESS!");
console.log("==================================================================");
