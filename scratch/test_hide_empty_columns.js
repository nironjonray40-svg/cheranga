const fs = require('fs');

// 1. Load database
const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
const realSchedules = JSON.parse(dbData['school_exam_schedules'] || '[]');
// Ensure Class 8 Elegileble test schedules include Agriculture as shown in screenshot
realSchedules.push({
    term: 'Elegileble test',
    class: 'Eight',
    subject: 'Agriculture Studies',
    code: '109',
    isOptional: true
});
dbData['school_exam_schedules'] = JSON.stringify(realSchedules);

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

// 2. Extract JavaScript code from Tabulation Sheet.html
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Parse the main tabulation table header th elements
const idxBangla = html.indexOf('data-subj="bangla"');
const theadStart = html.indexOf('<thead>', html.lastIndexOf('<table', idxBangla));
const theadEnd = html.indexOf('</thead>', idxBangla) + 8;
const mainTheadHtml = html.slice(theadStart, theadEnd);

// Simple DOM element model
class MockElement {
    constructor(tag, attrs = {}) {
        this.tagName = tag.toUpperCase();
        this.attributes = { ...attrs };
        this.style = {
            setProperty: (k, v) => { this.style[k] = v; },
            getPropertyValue: (k) => this.style[k] || ''
        };
        this.children = [];
        this.parentNode = null;
        this.textContent = '';
        this.innerHTML = '';
        this._className = attrs['class'] || '';
        this.classList = {
            contains: (c) => (this.attributes['class'] || '').split(/\s+/).includes(c),
            add: (c) => {
                const cur = (this.attributes['class'] || '').split(/\s+/).filter(Boolean);
                if (!cur.includes(c)) cur.push(c);
                this.attributes['class'] = cur.join(' ');
            },
            remove: (c) => {
                const cur = (this.attributes['class'] || '').split(/\s+/).filter(Boolean).filter(x => x !== c);
                this.attributes['class'] = cur.join(' ');
            }
        };
        this.options = [];
    }
    get className() {
        return this.attributes['class'] || '';
    }
    set className(val) {
        this.attributes['class'] = String(val);
    }
    setAttribute(name, val) {
        this.attributes[name] = String(val);
    }
    getAttribute(name) {
        return this.attributes[name] !== undefined ? this.attributes[name] : null;
    }
    removeAttribute(name) {
        delete this.attributes[name];
    }
    hasAttribute(name) {
        return this.attributes[name] !== undefined;
    }
    closest(sel) {
        let cur = this;
        while (cur) {
            if (matchesSelector(cur, sel)) return cur;
            cur = cur.parentNode;
        }
        return null;
    }
    cloneNode(deep) {
        const clone = new MockElement(this.tagName.toLowerCase(), { ...this.attributes });
        clone.style = { ...this.style };
        clone.textContent = this.textContent;
        clone.innerHTML = this.innerHTML;
        if (deep) {
            for (const child of this.children) {
                clone.appendChild(child.cloneNode(true));
            }
        }
        return clone;
    }
    insertBefore(newNode, refNode) {
        newNode.parentNode = this;
        if (!refNode) {
            this.children.push(newNode);
        } else {
            const idx = this.children.indexOf(refNode);
            if (idx !== -1) {
                this.children.splice(idx, 0, newNode);
            } else {
                this.children.push(newNode);
            }
        }
        return newNode;
    }
    get nextSibling() {
        if (!this.parentNode) return null;
        const siblings = this.parentNode.children;
        const idx = siblings.indexOf(this);
        return (idx !== -1 && idx + 1 < siblings.length) ? siblings[idx + 1] : null;
    }
    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        if (child.tagName === 'OPTION') this.options.push(child);
        return child;
    }
    querySelector(selector) {
        const matches = this.querySelectorAll(selector);
        return matches.length > 0 ? matches[0] : null;
    }
    querySelectorAll(selector) {
        const results = [];
        const matchElement = (el, sel) => {
            let matches = true;
            const parts = sel.trim().split(/\s+/);
            // Simple selector parsing for thead, tbody, tr, th, td, [attr=val], :not(...)
            // We implement selector matching based on our needs
            return matchesSelector(el, sel);
        };
        const traverse = (node) => {
            for (const child of node.children) {
                if (matchesSelector(child, selector)) {
                    results.push(child);
                }
                traverse(child);
            }
        };
        traverse(this);
        return results;
    }
}

function matchesSelector(el, selector) {
    // Handle comma-separated selectors
    if (selector.includes(',')) {
        return selector.split(',').some(s => matchesSelector(el, s.trim()));
    }

    // Handle space-separated hierarchy
    const parts = selector.trim().split(/\s+/);
    if (parts.length > 1) {
        let current = el;
        for (let i = parts.length - 1; i >= 0; i--) {
            if (!current) return false;
            if (!matchSingleSelector(current, parts[i])) {
                if (i === parts.length - 1) return false;
                // Walk up parent chain
                let found = false;
                while (current.parentNode) {
                    current = current.parentNode;
                    if (matchSingleSelector(current, parts[i])) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            } else {
                current = current.parentNode;
            }
        }
        return true;
    }

    return matchSingleSelector(el, selector);
}

function matchSingleSelector(el, sel) {
    let s = sel;
    // Check tag name
    const tagMatch = s.match(/^([a-zA-Z0-9]+)/);
    if (tagMatch) {
        if (el.tagName !== tagMatch[1].toUpperCase()) return false;
        s = s.slice(tagMatch[0].length);
    }

    // Check id (#id)
    const idMatch = s.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
        if (el.getAttribute('id') !== idMatch[1]) return false;
        s = s.replace(idMatch[0], '');
    }

    // Check class (.class)
    const classMatches = s.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatches) {
        const elClasses = (el.getAttribute('class') || '').split(/\s+/);
        for (const cm of classMatches) {
            const cls = cm.slice(1);
            if (!elClasses.includes(cls)) return false;
        }
        s = s.replace(/\.([a-zA-Z0-9_-]+)/g, '');
    }

    // Check :not(...)
    const notMatches = s.match(/:not\(([^)]+)\)/g);
    if (notMatches) {
        for (const nm of notMatches) {
            const innerSel = nm.match(/:not\(([^)]+)\)/)[1];
            if (matchSingleSelector(el, innerSel)) return false;
        }
        s = s.replace(/:not\(([^)]+)\)/g, '');
    }

    // Check attribute selectors: [attr="val"] or [attr]
    const attrMatches = s.match(/\[([a-zA-Z0-9_-]+)(?:=("[^"]*"|'[^']*'|[^\]]+))?\]/g);
    if (attrMatches) {
        for (const am of attrMatches) {
            const m = am.match(/\[([a-zA-Z0-9_-]+)(?:=("[^"]*"|'[^']*'|[^\]]+))?\]/);
            const attrName = m[1];
            const attrVal = m[2] ? m[2].replace(/^["']|["']$/g, '') : null;
            if (!el.hasAttribute(attrName)) return false;
            if (attrVal !== null && el.getAttribute(attrName) !== attrVal) return false;
        }
    }

    return true;
}

// Parse HTML string of thead into MockElements
function parseHtmlToDom(htmlStr) {
    const root = new MockElement('root');
    // Match tags: <tag attr1="val1"...> or </tag>
    const tagRegex = /<(\/)?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
    const stack = [root];
    let match;

    while ((match = tagRegex.exec(htmlStr)) !== null) {
        const [full, isClose, tagName, attrStr, text] = match;
        if (text) {
            if (stack.length > 0) {
                const trimmed = text.trim();
                if (trimmed) {
                    stack[stack.length - 1].textContent += trimmed;
                    stack[stack.length - 1].innerHTML += text;
                }
            }
        } else if (isClose) {
            if (stack.length > 1 && stack[stack.length - 1].tagName === tagName.toUpperCase()) {
                stack.pop();
            }
        } else {
            // Open tag
            const el = new MockElement(tagName);
            if (attrStr) {
                const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
                let attrM;
                while ((attrM = attrRegex.exec(attrStr)) !== null) {
                    const k = attrM[1];
                    const v = attrM[2] !== undefined ? attrM[2] : (attrM[3] !== undefined ? attrM[3] : (attrM[4] !== undefined ? attrM[4] : ''));
                    el.setAttribute(k, v);
                }
            }
            stack[stack.length - 1].appendChild(el);
            // Self closing?
            if (!attrStr.endsWith('/') && !['input', 'img', 'br', 'hr'].includes(tagName.toLowerCase())) {
                stack.push(el);
            }
        }
    }
    return root;
}

// Build table DOM
const tableEl = new MockElement('table');
const parsedTheadRoot = parseHtmlToDom(mainTheadHtml);
const theadEl = parsedTheadRoot.querySelector('thead');
tableEl.appendChild(theadEl);

const tbodyEl = new MockElement('tbody');
tableEl.appendChild(tbodyEl);

const tableDom = new MockElement('div');
tableDom.appendChild(tableEl);

// Add mock filter elements
const classSelect = new MockElement('select', { id: 'class-filter' });
classSelect.value = '৮ম';
tableDom.appendChild(classSelect);

const examSelect = new MockElement('select', { id: 'exam-filter' });
examSelect.value = 'Elegileble test';
tableDom.appendChild(examSelect);

const layoutSelect = new MockElement('select', { id: 'table-layout' });
layoutSelect.value = 'default';
tableDom.appendChild(layoutSelect);

const mcqwSelect = new MockElement('select', { id: 'mcq-written' });
mcqwSelect.value = 'show';
tableDom.appendChild(mcqwSelect);

for (let r = 0; r < 5; r++) {
    const tr = new MockElement('tr', { 'data-section': 'A', 'data-has-student': 'true' });
    for (let c = 0; c < 68; c++) {
        const td = new MockElement('td');
        td.textContent = (c === 0 ? String(r + 1) : (c === 1 ? 'Student ' + (r + 1) : '-'));
        tr.appendChild(td);
    }
    tbodyEl.appendChild(tr);
}

// Add inside-header-row th and print-tfoot-signatures
const insideHeaderTr = new MockElement('tr', { id: 'inside-header-row' });
const insideHeaderTh = new MockElement('th');
insideHeaderTr.appendChild(insideHeaderTh);
theadEl.appendChild(insideHeaderTr);

// Global document mock
const mockBody = new MockElement('body');
mockBody.appendChild(tableDom);

global.document = {
    body: mockBody,
    head: new MockElement('head'),
    querySelector: (sel) => mockBody.querySelector(sel) || tableDom.querySelector(sel),
    querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
    getElementById: (id) => {
        let el = mockBody.querySelector('#' + id) || tableDom.querySelector('#' + id);
        if (!el) {
            el = new MockElement('div', { id });
            mockBody.appendChild(el);
        }
        return el;
    },
    createElement: (tag) => new MockElement(tag),
    addEventListener: () => {}
};

global.window = {
    location: { search: '', replace: () => {}, href: 'http://localhost:8000/Tabulation%20Sheet.html' },
    localStorage: localStorageMock,
    addEventListener: () => {}
};

console.log("Mock DOM populated: Thead rows =", theadEl.querySelectorAll('tr').length, ", Tbody rows =", tbodyEl.querySelectorAll('tr').length);

// Now execute the actual functions extracted from Tabulation Sheet.html
// Let's test getSubjectSlot, updateSubjects, applyTableSettings, getActiveColspan
// Run evaluation of the relevant script functions:

// Set current filters for Class 8 and Elegileble test
global.currentFilterClass = '৮ম';
global.currentFilterExam = 'Elegileble test';
global.currentFilterGroup = 'all';
global.currentFilterSection = 'all';
global.currentLang = 'bn';
global.currentSubjFormat = 'full';
global.currentLayout = 'default';
global.currentMCQWritten = 'show';
global.currentGPACalcMethod = 'board';

// Extract the script between bnDigits and storage listener
const codeSlice = html.slice(html.indexOf("const bnDigits = ['০'"), html.indexOf('// Listen for storage and database changes'));
eval(codeSlice);

console.log("\n--- Testing updateSubjects() for Class 8 Elegileble test ---");
filterClass('৮ম');
filterExam('Elegileble test');
updateSubjects();

console.log("activeSubjectSlots:", JSON.stringify(window.activeSubjectSlots, null, 2));

console.log("\n--- Testing applyTableSettings() ---");
applyTableSettings();

const slots = ['bangla', 'english', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];

console.log("\nChecking Row 1 Thead Headers:");
slots.forEach(s => {
    const th = document.querySelector('thead th[data-subj="' + s + '"]:not([data-col-type]):not([data-fullmark])');
    if (th) {
        console.log('  Slot ' + s.padEnd(8) + ': display=\'' + (th.style.display || 'visible') + '\' colspan=' + th.getAttribute('colspan') + ' text=\'' + th.textContent.trim() + '\'');
    } else {
        console.log('  Slot ' + s.padEnd(8) + ': NOT FOUND in Row 1');
    }
});

console.log("\nChecking Row 2 / Sub-paper Headers for inactive slots (phys, bio, rel, ict):");
['phys', 'bio', 'rel', 'ict'].forEach(s => {
    const ths = document.querySelectorAll('thead th[data-subj="' + s + '"]');
    const visibleCount = ths.filter(t => t.style.display !== 'none').length;
    const hiddenCount = ths.filter(t => t.style.display === 'none').length;
    console.log('  Slot ' + s.padEnd(8) + ': total th=' + ths.length + ', visible=' + visibleCount + ', hidden=' + hiddenCount);
});

console.log("\nChecking Tbody Student Row 0 Cells:");
const firstRowCells = tbodyEl.querySelectorAll('tr')[0].querySelectorAll('td');
const subjectColMap = {
    bangla: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    english: [12, 13, 14, 15, 16, 17],
    math: [18, 19, 20, 21, 22],
    bgs: [23, 24, 25, 26, 27],
    chem: [28, 29, 30, 31, 32, 33],
    phys: [34, 35, 36, 37, 38, 39],
    bio: [40, 41, 42, 43, 44, 45],
    rel: [46, 47, 48, 49, 50],
    ict: [51, 52, 53, 54, 55],
    agri: [56, 57, 58, 59, 60, 61]
};

slots.forEach(s => {
    const indices = subjectColMap[s];
    const hiddenCells = indices.filter(idx => firstRowCells[idx].style.display === 'none').length;
    const visibleCells = indices.filter(idx => firstRowCells[idx].style.display !== 'none').length;
    console.log('  Slot ' + s.padEnd(8) + ': active=' + window.activeSubjectSlots[s] + ', total cols=' + indices.length + ', visible=' + visibleCells + ', hidden=' + hiddenCells);
});

console.log("\nChecking Colspans:");
console.log("  insideHeaderTh colspan =", insideHeaderTh.getAttribute('colspan'));
console.log("  getActiveColspan()      =", getActiveColspan());

const visibleTbodyCells = Array.from(firstRowCells).filter(c => c.style.display !== 'none').length;
console.log("  Visible tbody cells count =", visibleTbodyCells);

if (visibleTbodyCells === getActiveColspan()) {
    console.log("\nSUCCESS: Total visible cells in tbody (" + visibleTbodyCells + ") EXACTLY matches getActiveColspan (" + getActiveColspan() + ")!");
} else {
    console.error("\nFAILURE: Mismatch between visible cells and colspan!");
    process.exit(1);
}

