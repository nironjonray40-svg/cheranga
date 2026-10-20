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

const table = new MockElement('TABLE');
const thead = new MockElement('THEAD');
const tbody = new MockElement('TBODY');
table.appendChild(thead);
table.appendChild(tbody);
doc.appendChild(table);

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

eval(combinedScript);

console.log("==================================================================");
console.log("TESTING: ONLY EXAM CREATED SUBJECTS ARE VISIBLE IN TABULATION SHEET");
console.log("==================================================================");

function getHeaders() {
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

function getFullmarks() {
    const ths = querySelectorAllFrom(thead, 'th[data-fullmark]');
    const res = {};
    ths.forEach(th => {
        const s = th.getAttribute('data-subj');
        const f = th.getAttribute('data-fullmark');
        if (!res[s]) res[s] = {};
        res[s][f] = th.textContent.trim();
    });
    return res;
}

// TEST 1: Class Eight + Elegileble test
console.log("\n--- TEST 1: Class Eight + Elegileble test (7 created subjects) ---");
filterClass('Eight');
filterExam('Elegileble test');
changeLanguage('bn');
changeSubjectFormat('full');

const h1 = getHeaders();
console.log("Visible Headers:", h1);

// Created subjects must be visible with real names:
const createdKeys = ['bangla', 'bangla1', 'bangla2', 'english', 'english1', 'english2', 'math', 'bgs', 'chem'];
createdKeys.forEach(k => {
    if (h1[k] && h1[k] !== '-') {
        console.log(`PASS: Created subject [${k}] is VISIBLE as "${h1[k]}"`);
    } else {
        console.error(`FAIL: Created subject [${k}] should be visible, got "${h1[k]}"`);
        process.exit(1);
    }
});

// Uncreated subjects MUST be '-' (NOT visible):
const uncreatedKeys = ['phys', 'bio', 'rel', 'ict', 'agri'];
uncreatedKeys.forEach(k => {
    if (h1[k] === '-') {
        console.log(`PASS: Uncreated subject [${k}] is NOT visible (shows "-")`);
    } else {
        console.error(`FAIL: Uncreated subject [${k}] must NOT be visible, got "${h1[k]}"`);
        process.exit(1);
    }
});

// Fullmarks for uncreated subjects must also be '-'
const fm1 = getFullmarks();
uncreatedKeys.forEach(k => {
    if (fm1[k] && Object.values(fm1[k]).every(v => v === '-')) {
        console.log(`PASS: Fullmarks for uncreated subject [${k}] correctly show "-"`);
    } else {
        console.error(`FAIL: Fullmarks for uncreated subject [${k}] should be "-", got:`, fm1[k]);
        process.exit(1);
    }
});

// TEST 2: Dynamically add an exam for ICT in "Exam List"
console.log("\n--- TEST 2: Dynamically creating an Exam for ICT in Exam List ---");
let scheds = JSON.parse(localStorage.getItem('school_exam_schedules'));
const newIctExam = {
    id: '1799999999999',
    class: 'Eight',
    term: 'Elegileble test',
    subject: 'ICT',
    date: '05/09/2026',
    teacher: 'NEW TEACHER'
};
scheds.push(newIctExam);
localStorage.setItem('school_exam_schedules', JSON.stringify(scheds));

// Trigger update
updateSubjects();

const h2 = getHeaders();
console.log("Headers after creating ICT exam:", h2.ict);
if (h2.ict === 'তথ্য ও যোগাযোগ প্রযুক্তি') {
    console.log("PASS: ICT subject name IMMEDIATELY became visible in Tabulation Sheet when created in Exam List!");
} else {
    console.error("FAIL: Expected 'তথ্য ও যোগাযোগ প্রযুক্তি', got:", h2.ict);
    process.exit(1);
}

// TEST 3: Dynamically remove ICT from Exam List
console.log("\n--- TEST 3: Removing ICT exam from Exam List ---");
scheds = scheds.filter(s => s.id !== '1799999999999');
localStorage.setItem('school_exam_schedules', JSON.stringify(scheds));

updateSubjects();

const h3 = getHeaders();
console.log("Headers after removing ICT exam:", h3.ict);
if (h3.ict === '-') {
    console.log("PASS: ICT subject name IMMEDIATELY disappeared (reverted to '-') when exam was removed from Exam List!");
} else {
    console.error("FAIL: Expected '-', got:", h3.ict);
    process.exit(1);
}

// TEST 4: Class Six + Exam 'বার্ষিক পরীক্ষা' (Only Science was created)
console.log("\n--- TEST 4: Class Six + Exam 'বার্ষিক পরীক্ষা' (Only Science created) ---");
filterClass('Six');
filterExam('বার্ষিক পরীক্ষা');

const h4 = getHeaders();
console.log("Class Six Headers:", h4);
if (h4.chem === 'বিজ্ঞান') {
    console.log("PASS: Slot 5 ('chem') displays 'বিজ্ঞান' as created in Exam List!");
} else {
    console.error("FAIL: Slot 5 expected 'বিজ্ঞান', got:", h4.chem);
    process.exit(1);
}

['bangla', 'bangla1', 'bangla2', 'english', 'english1', 'english2', 'math', 'bgs', 'phys', 'bio', 'rel', 'ict', 'agri'].forEach(k => {
    if (h4[k] === '-') {
        console.log(`PASS: Class Six [${k}] correctly shows '-' because no exam is created for it!`);
    } else {
        console.error(`FAIL: Class Six [${k}] should be '-', got "${h4[k]}"`);
        process.exit(1);
    }
});

console.log("\n==================================================================");
console.log("ALL TESTS PASSED! ONLY CREATED EXAM SUBJECTS ARE VISIBLE!");
console.log("==================================================================");
process.exit(0);
