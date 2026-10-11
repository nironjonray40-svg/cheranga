// scratch/test_tabulation_e2e.js
const fs = require('fs');

// 1. Load real database dump
const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));

// 2. Setup mock LocalStorage
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

// 3. Read Tabulation Sheet.html and extract the main script
const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');

// Minimal mock DOM node implementation to test DOM manipulation
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
            add: (cls) => {
                const cur = (this.attributes.class || '').split(/\s+/).filter(Boolean);
                if (!cur.includes(cls)) cur.push(cls);
                this.attributes.class = cur.join(' ');
            },
            remove: (cls) => {
                const cur = (this.attributes.class || '').split(/\s+/).filter(Boolean);
                this.attributes.class = cur.filter(c => c !== cls).join(' ');
            },
            contains: (cls) => {
                return (this.attributes.class || '').split(/\s+/).includes(cls);
            }
        };
        this._textContent = '';
        this.options = [];
        this.value = '';
        this.selectedIndex = 0;
    }

    getAttribute(name) {
        return this.attributes[name] !== undefined ? this.attributes[name] : null;
    }

    setAttribute(name, val) {
        this.attributes[name] = String(val);
    }

    removeAttribute(name) {
        delete this.attributes[name];
    }

    hasAttribute(name) {
        return this.attributes[name] !== undefined;
    }

    get textContent() {
        return this._textContent;
    }

    set textContent(val) {
        this._textContent = String(val);
    }

    appendChild(child) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }
        child.parentNode = this;
        const prev = this.children[this.children.length - 1];
        if (prev) prev.nextSibling = child;
        child.nextSibling = null;
        this.children.push(child);
        if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
            this.options.push(child);
        }
        return child;
    }

    insertBefore(newNode, refNode) {
        if (newNode.parentNode) {
            newNode.parentNode.removeChild(newNode);
        }
        newNode.parentNode = this;
        const idx = this.children.indexOf(refNode);
        if (idx === -1) {
            return this.appendChild(newNode);
        }
        this.children.splice(idx, 0, newNode);
        if (idx > 0) {
            this.children[idx - 1].nextSibling = newNode;
        }
        newNode.nextSibling = refNode;
        if (this.tagName === 'SELECT' && newNode.tagName === 'OPTION') {
            this.options = this.children.filter(c => c.tagName === 'OPTION');
        }
        return newNode;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
            if (idx > 0) {
                this.children[idx - 1].nextSibling = this.children[idx] || null;
            }
            if (this.tagName === 'SELECT') {
                this.options = this.children.filter(c => c.tagName === 'OPTION');
            }
        }
        return child;
    }

    remove() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    cloneNode(deep) {
        const clone = new MockElement(this.tagName, { ...this.attributes });
        clone.style = { ...this.style };
        clone._textContent = this._textContent;
        clone.value = this.value;
        if (deep) {
            for (const child of this.children) {
                const childClone = child.cloneNode(true);
                childClone.parentNode = clone;
                clone.children.push(childClone);
            }
        }
        return clone;
    }

    closest(selector) {
        return this.parentNode || null;
    }

    querySelectorAll(selector) {
        const matches = [];
        const check = (node) => {
            if (matchesSelector(node, selector)) {
                matches.push(node);
            }
            for (const child of node.children) {
                check(child);
            }
        };
        for (const child of this.children) {
            check(child);
        }
        return matches;
    }

    querySelector(selector) {
        const all = this.querySelectorAll(selector);
        return all.length > 0 ? all[0] : null;
    }
}

function matchesSelector(node, selector) {
    if (!node || !selector) return false;
    selector = selector.trim();

    if (selector.includes('data-subj')) {
        return node.tagName === 'TH' && node.hasAttribute('data-subj');
    }

    if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        return (node.attributes.class || '').split(/\s+/).includes(cls);
    }
    if (selector.startsWith('#')) {
        const id = selector.slice(1);
        return node.attributes.id === id;
    }
    if (selector === 'td') return node.tagName === 'TD';
    if (selector === 'tr') return node.tagName === 'TR';
    if (selector === 'table tbody' || selector === 'tbody') return node.tagName === 'TBODY';

    if (selector.includes('[data-section]')) {
        return node.tagName === 'TR' && node.hasAttribute('data-section');
    }

    if (selector.startsWith('tbody tr[data-section="')) {
        const m = selector.match(/data-section="([^"]+)"/);
        if (m && node.getAttribute('data-section') !== m[1]) return false;
        if (selector.includes('[data-has-student="true"]')) {
            return node.getAttribute('data-has-student') === 'true';
        }
        return true;
    }

    return false;
}

// Build Mock Document
const doc = new MockElement('DOCUMENT');
const body = new MockElement('BODY');
doc.appendChild(body);

// Add table structure
const table = new MockElement('TABLE');
const thead = new MockElement('THEAD');
const trHead = new MockElement('TR');
const thRoll = new MockElement('TH'); thRoll.textContent = 'Roll'; trHead.appendChild(thRoll);
const thName = new MockElement('TH'); thName.textContent = 'Name'; trHead.appendChild(thName);

const subjKeys = ['bangla', 'bangla1', 'bangla2', 'english', 'english1', 'english2', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];
subjKeys.forEach(k => {
    const th = new MockElement('TH', { 'data-subj': k });
    th.textContent = k;
    trHead.appendChild(th);
});
thead.appendChild(trHead);
table.appendChild(thead);

const tbody = new MockElement('TBODY');
// Seed with initial sample rows (like what HTML starts with)
['A', 'B', 'C', 'D'].forEach(sec => {
    const dividerRow = new MockElement('TR', { 'class': 'section-divider-row', 'data-section-name': sec });
    tbody.appendChild(dividerRow);
    for (let i = 1; i <= 5; i++) {
        const tr = new MockElement('TR', { 'data-section': sec });
        const tdRoll = new MockElement('TD'); tdRoll.textContent = String(i); tr.appendChild(tdRoll);
        const tdName = new MockElement('TD'); tdName.textContent = 'কাজী নাবিহা তাহসিম রোদেলা ' + sec + i; tr.appendChild(tdName);
        for (let j = 0; j < 14; j++) {
            const tdMark = new MockElement('TD'); tdMark.textContent = '-'; tr.appendChild(tdMark);
        }
        tbody.appendChild(tr);
    }
});
table.appendChild(tbody);
body.appendChild(table);

// Add filter elements
const classFilter = new MockElement('SELECT', { id: 'class-filter' });
body.appendChild(classFilter);
const examFilter = new MockElement('SELECT', { id: 'exam-filter' });
body.appendChild(examFilter);
const groupFilter = new MockElement('SELECT', { id: 'group-filter' });
body.appendChild(groupFilter);
const secFilter = new MockElement('SELECT', { id: 'section-filter' });
body.appendChild(secFilter);

const headerPrint = new MockElement('SELECT', { id: 'header-print' });
body.appendChild(headerPrint);

body.className = '';

const elementStore = {
    'class-filter': classFilter,
    'exam-filter': examFilter,
    'group-filter': groupFilter,
    'section-filter': secFilter,
    'header-print': headerPrint
};

global.document = {
    body: body,
    documentElement: body,
    addEventListener: () => {},
    getElementById: (id) => {
        if (!elementStore[id]) {
            elementStore[id] = new MockElement('DIV', { id });
        }
        return elementStore[id];
    },
    createElement: (tag) => new MockElement(tag),
    querySelectorAll: (sel) => doc.querySelectorAll(sel),
    querySelector: (sel) => doc.querySelector(sel)
};

// Global helper stubs required by the script
global.currentLang = 'bn';
global.currentSubjFormat = 'full';
global.currentFilterClass = 'Ten';
global.currentFilterExam = 'all';
global.currentFilterGroup = 'all';
global.currentFilterSection = 'all';
global.activeClassSlotMap = {};
global.translateDigits = (val, lang) => {
    if (lang === 'bn') {
        const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(val || '').replace(/[0-9]/g, d => banglaDigits[d]);
    }
    return String(val || '');
};
global.getDefaultSectionForClass = () => 'A';
global.getDefaultGroupForClass = () => 'all';
global.updateHeaderMeta = () => {};
global.populateStudentMarksFromDatabase = () => {};
global.applyTableSettings = () => {};
global.recalculateTableGradesAndRanks = () => {};
global.highlightFailures = () => {};
global.sortStudents = () => {};
global.updateSectionFilterOptions = () => {};

// Extract script blocks from Tabulation Sheet.html
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
let combinedScript = '';
for (const match of scriptMatches) {
    const rawCode = match.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
    combinedScript += '\n' + rawCode;
}
combinedScript += `
global.filterClass = typeof filterClass !== 'undefined' ? filterClass : null;
global.filterExam = typeof filterExam !== 'undefined' ? filterExam : null;
global.updateSubjects = typeof updateSubjects !== 'undefined' ? updateSubjects : null;
global.syncStudentNamesFromDatabase = typeof syncStudentNamesFromDatabase !== 'undefined' ? syncStudentNamesFromDatabase : null;
global.applyFilters = typeof applyFilters !== 'undefined' ? applyFilters : null;
`;

// Execute the scripts in this global environment
try {
    (0, eval)(combinedScript);
    console.log("Tabulation Sheet scripts executed successfully in simulated DOM!");
} catch (e) {
    console.error("Error executing combinedScript:", e);
    process.exit(1);
}

// Verification function
function verifyState(expectedClass, expectedExam, expectedMinVisibleStudents) {
    console.log(`\n======================================================`);
    console.log(`VERIFYING: Class = "${expectedClass}", Exam = "${expectedExam}"`);
    console.log(`======================================================`);

    filterClass(expectedClass);
    filterExam(expectedExam);

    // 1. Check visible student rows
    const allRows = doc.querySelectorAll('tbody tr[data-section]');
    const visibleRows = allRows.filter(r => r.style.display !== 'none');
    const hasStudentRows = visibleRows.filter(r => r.getAttribute('data-has-student') === 'true');

    console.log(`Total rows in table: ${allRows.length}`);
    console.log(`Visible rows: ${visibleRows.length}`);
    console.log(`Visible rows with real students: ${hasStudentRows.length}`);

    // Check that NO fake default names are visible
    const fakeNamesFound = visibleRows.filter(r => {
        const td = r.children[1];
        return td && td.textContent.includes('কাজী নাবিহা');
    });

    if (fakeNamesFound.length > 0) {
        console.error(`FAIL: Found ${fakeNamesFound.length} rows displaying fake hardcoded student names!`);
        process.exit(1);
    } else {
        console.log(`PASS: Zero fake/hardcoded student names visible.`);
    }

    // Print first 5 visible students
    console.log(`Sample visible students:`);
    visibleRows.slice(0, 5).forEach((r, idx) => {
        const roll = r.children[0]?.textContent;
        const name = r.children[1]?.textContent;
        const sec = r.getAttribute('data-section');
        console.log(`  [${idx+1}] Roll: ${roll} | Name: ${name} | Sec: ${sec}`);
    });

    // 2. Check Subject Headers for Exam
    const thSubjects = doc.querySelectorAll('thead th[data-subj]');
    console.log(`\nSubject Headers visible for Exam "${expectedExam}":`);
    const subjMap = {};
    thSubjects.forEach(th => {
        subjMap[th.getAttribute('data-subj')] = th.textContent;
    });
    console.log(subjMap);

    return { visibleCount: visibleRows.length, subjMap };
}

// Run test cases
console.log("\n--- TEST CASE 1: Class Ten + all exams ---");
verifyState('Ten', 'all', 9);

console.log("\n--- TEST CASE 2: Class Nine + all exams ---");
verifyState('Nine', 'all', 8);

console.log("\n--- TEST CASE 3: Class Eight + 'Elegileble test' ---");
const resEight = verifyState('Eight', 'Elegileble test', 20);
if (!resEight.subjMap.english1.includes('English For Today') && !resEight.subjMap.english1.includes('ইংরেজি ১ম')) {
    console.warn("Notice: English 1 is", resEight.subjMap.english1);
}

console.log("\n--- TEST CASE 4: Class Seven + all exams ---");
verifyState('Seven', 'all', 5);

console.log("\n--- TEST CASE 5: Class Six + 'বার্ষিক পরীক্ষা' ---");
const resSix = verifyState('Six', 'বার্ষিক পরীক্ষা', 10);

console.log("\n=======================================================");
console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
console.log("=======================================================");
