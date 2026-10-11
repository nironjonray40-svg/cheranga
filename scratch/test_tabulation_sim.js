const fs = require('fs');
const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));

// Create lightweight DOM mock
class ElementMock {
    constructor(tagName, id = '', className = '') {
        this.tagName = tagName;
        this.id = id;
        this.className = className;
        this.attributes = {};
        this.children = [];
        this.style = {};
        this.textContent = '';
        this.value = '';
        this.options = [];
        this.selectedIndex = 0;
    }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    getAttribute(name) { return this.attributes[name] || null; }
    hasAttribute(name) { return this.attributes.hasOwnProperty(name); }
    removeAttribute(name) { delete this.attributes[name]; }
    appendChild(child) { child.parentNode = this; this.children.push(child); }
    insertBefore(newChild, refChild) {
        const idx = this.children.indexOf(refChild);
        if (idx !== -1) this.children.splice(idx, 0, newChild);
        else this.children.push(newChild);
    }
    closest(selector) { return this; }
    cloneNode(deep) {
        const clone = new ElementMock(this.tagName, this.id, this.className);
        clone.attributes = { ...this.attributes };
        clone.style = { ...this.style };
        clone.textContent = this.textContent;
        clone.children = this.children.map(c => c.cloneNode(deep));
        return clone;
    }
    querySelectorAll(selector) {
        let results = [];
        const match = (el) => {
            if (selector.startsWith('tbody tr[data-section]')) {
                if (el.tagName === 'TR' && el.hasAttribute('data-section')) {
                    const secMatch = selector.match(/data-section="([^"]+)"/);
                    if (!secMatch || el.getAttribute('data-section') === secMatch[1]) {
                        results.push(el);
                    }
                }
            } else if (selector.startsWith('thead th[data-subj]')) {
                if (el.tagName === 'TH' && el.hasAttribute('data-subj')) {
                    const subjMatch = selector.match(/data-subj="([^"]+)"/);
                    if (!subjMatch || el.getAttribute('data-subj') === subjMatch[1]) {
                        results.push(el);
                    }
                }
            } else if (selector === '.section-divider-row') {
                if (el.className && el.className.includes('section-divider-row')) results.push(el);
            }
            el.children.forEach(match);
        };
        match(this);
        return results;
    }
    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }
}

// Build mock document with table structure
const documentMock = new ElementMock('DOCUMENT');
const tbody = new ElementMock('TBODY');
const thead = new ElementMock('THEAD');
documentMock.appendChild(thead);
documentMock.appendChild(tbody);

// Add th elements for subjects
['bangla', 'bangla1', 'bangla2', 'english', 'english1', 'english2', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'].forEach(sub => {
    const th = new ElementMock('TH');
    th.setAttribute('data-subj', sub);
    thead.appendChild(th);
});

// Add 4 sample rows per section A, B, C, D
['A', 'B', 'C', 'D'].forEach(sec => {
    const divRow = new ElementMock('TR', '', 'section-divider-row');
    divRow.setAttribute('data-section-name', sec);
    tbody.appendChild(divRow);

    for (let i = 0; i < 4; i++) {
        const tr = new ElementMock('TR');
        tr.setAttribute('data-section', sec);
        for (let j = 0; j < 68; j++) {
            const td = new ElementMock('TD');
            td.textContent = j === 0 ? String(i + 1) : (j === 1 ? 'Hardcoded Student ' + i : '-');
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
});

// Elements dictionary
const elements = {
    'class-filter': new ElementMock('SELECT', 'class-filter'),
    'exam-filter': new ElementMock('SELECT', 'exam-filter'),
    'section-filter': new ElementMock('SELECT', 'section-filter'),
    'group-filter': new ElementMock('SELECT', 'group-filter'),
    'sort-order': new ElementMock('SELECT', 'sort-order'),
    'page-lang': new ElementMock('SELECT', 'page-lang'),
    'subj-format': new ElementMock('SELECT', 'subj-format')
};
elements['class-filter'].value = 'Ten';
elements['exam-filter'].value = 'Elegileble test';
elements['section-filter'].value = 'all';
elements['group-filter'].value = 'all';

documentMock.addEventListener = () => {};
documentMock.createElement = (tag) => new ElementMock(tag.toUpperCase());
documentMock.body = { className: '' };
documentMock.getElementById = (id) => { if (!elements[id]) elements[id] = new ElementMock('DIV', id); return elements[id]; };
documentMock.querySelectorAll = (sel) => {
    if (sel.includes('meta-info') || sel.includes('header h2')) return [];
    return ElementMock.prototype.querySelectorAll.call(documentMock, sel);
};
documentMock.querySelector = (sel) => {
    if (sel === 'table tbody') return tbody;
    return ElementMock.prototype.querySelector.call(documentMock, sel);
};

// Set localStorage mock
const localStorageMock = {
    store: { ...dbData, isLoggedIn: 'true' },
    getItem: function(k) { return this.store[k] || null; },
    setItem: function(k, v) { this.store[k] = String(v); }
};

// Extract code from Tabulation Sheet.html and run inside sandbox
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script id="print-js">([\s\S]*?)<\/script>/gi)];
const scriptCode = scriptMatches[0][1];

const sandbox = {
    document: documentMock,
    window: {
        addEventListener: () => {},
        location: { search: '' }
    },
    localStorage: localStorageMock,
    console: console,
    banglaToEnglishDigits: s => s,
    translateDigits: (s) => s,
    toBnDigits: (s) => s
};

const fn = new Function(...Object.keys(sandbox), scriptCode);
fn(...Object.values(sandbox));

console.log("\n>>> Testing filterClass('Ten'):");
sandbox.filterClass('Ten');
let visibleTen = tbody.children.filter(c => c.tagName === 'TR' && c.hasAttribute('data-section') && c.style.display !== 'none');
console.log(`Visible rows for Ten: ${visibleTen.length}`);
visibleTen.forEach(r => {
    console.log(`  Roll: ${r.children[0].textContent}, Name: ${r.children[1].textContent}, Sec: ${r.getAttribute('data-section')}`);
});

console.log("\n>>> Testing filterClass('Eight'):");
sandbox.filterClass('Eight');
let visibleEight = tbody.children.filter(c => c.tagName === 'TR' && c.hasAttribute('data-section') && c.style.display !== 'none');
console.log(`Visible rows for Eight: ${visibleEight.length}`);
visibleEight.forEach(r => {
    console.log(`  Roll: ${r.children[0].textContent}, Name: ${r.children[1].textContent}, Sec: ${r.getAttribute('data-section')}`);
});

console.log("\n>>> Testing filterClass('Six'):");
sandbox.filterClass('Six');
let visibleSix = tbody.children.filter(c => c.tagName === 'TR' && c.hasAttribute('data-section') && c.style.display !== 'none');
console.log(`Visible rows for Six: ${visibleSix.length}`);
visibleSix.forEach(r => {
    console.log(`  Roll: ${r.children[0].textContent}, Name: ${r.children[1].textContent}, Sec: ${r.getAttribute('data-section')}`);
});

console.log("\n>>> Testing filterExam('Elegileble test') for Eight:");
sandbox.filterClass('Eight');
sandbox.filterExam('Elegileble test');
const thBangla1 = thead.children.find(c => c.getAttribute('data-subj') === 'bangla1');
const thEnglish1 = thead.children.find(c => c.getAttribute('data-subj') === 'english1');
const thMath = thead.children.find(c => c.getAttribute('data-subj') === 'math');
const thChem = thead.children.find(c => c.getAttribute('data-subj') === 'chem');
console.log(`Subject bangla1: '${thBangla1.textContent}'`);
console.log(`Subject english1: '${thEnglish1.textContent}'`);
console.log(`Subject math: '${thMath.textContent}'`);
console.log(`Subject chem (science): '${thChem.textContent}'`);

console.log("\n>>> Testing filterExam('বার্ষিক পরীক্ষা') for Six:");
sandbox.filterClass('Six');
sandbox.filterExam('বার্ষিক পরীক্ষা');
console.log(`Subject bangla1: '${thBangla1.textContent}'`);
console.log(`Subject english1: '${thEnglish1.textContent}'`);
console.log(`Subject math: '${thMath.textContent}'`);
