const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

// Extract all <script> blocks
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let fullScript = '';
let scriptIdx = 0;
const scripts = [];
while ((match = scriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
        scripts.push({ idx: scriptIdx++, code: match[1] });
    }
}

// Mock DOM & localStorage with school.db data
const sqlite = require('child_process').execSync('.venv\\Scripts\\python.exe -c "import sqlite3, json; conn=sqlite3.connect(\'school.db\'); c=conn.cursor(); c.execute(\'SELECT key, value FROM local_storage_sync\'); print(json.dumps(dict(c.fetchall()))); conn.close()"', { maxBuffer: 50 * 1024 * 1024 }).toString();
const parsedDb = JSON.parse(sqlite);

const storage = { ...parsedDb, 'school_cms_auth_session': 'true', 'school_session_user': JSON.stringify({ username: 'admin', role: 'admin' }) };

const mockElements = {};
function getOrCreateMockElement(id) {
    if (!mockElements[id]) {
        mockElements[id] = {
            id: id,
            innerText: '',
            innerHTML: '',
            value: '',
            style: {},
            classList: {
                classes: new Set(),
                add: function(c) { this.classes.add(c); },
                remove: function(c) { this.classes.delete(c); },
                contains: function(c) { return this.classes.has(c); }
            },
            querySelector: () => ({ innerText: '', textContent: '', style: {}, value: '', addEventListener: () => {} }),
            querySelectorAll: () => [],
            addEventListener: () => {}
        };
    }
    return mockElements[id];
}

const mockDoc = {
    getElementById: (id) => getOrCreateMockElement(id),
    querySelector: () => ({ innerText: '', textContent: '', style: {}, value: '', addEventListener: () => {} }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

const mockWindow = {
    location: { href: 'http://localhost:8000/exam-portal.html', search: '', replace: () => {}, assign: () => {} },
    sessionStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = v; },
        removeItem: (k) => { delete storage[k]; }
    },
    localStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = v; },
        removeItem: (k) => { delete storage[k]; }
    },
    document: mockDoc,
    addEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: function() {},
    Event: function() {},
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    XLSX: {
        utils: { aoa_to_sheet: () => ({ '!cols': [] }), decode_range: () => ({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }), encode_cell: () => 'A1', book_new: () => ({}), book_append_sheet: () => {} },
        writeFile: () => {}
    }
};

const vm = require('vm');
const context = vm.createContext({
    window: mockWindow,
    document: mockDoc,
    location: mockWindow.location,
    sessionStorage: mockWindow.sessionStorage,
    localStorage: mockWindow.localStorage,
    XLSX: mockWindow.XLSX,
    console: console,
    alert: (m) => console.log('ALERT:', m),
    confirm: () => true,
    setTimeout: (fn) => {},
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    CustomEvent: function() {},
    Event: function() {},
    fetch: async () => ({ ok: true, json: async () => ({}) })
});

for (const s of scripts) {
    try {
        vm.runInContext(s.code, context);
    } catch (e) {
        console.error(`Error in script block ${s.idx}:`, e.message);
    }
}

console.log("Checking if openExamMarksEntryModal is available...");
const func = context.openExamMarksEntryModal || mockWindow.openExamMarksEntryModal;
console.log("Function type:", typeof func);

if (typeof func === 'function') {
    const schedules = JSON.parse(storage['school_exam_schedules'] || '[]');
    for (const sch of schedules) {
        getOrCreateMockElement('exam-marks-entry-modal').classList.remove('active');
        func(sch.id);
        const modalEl = getOrCreateMockElement('exam-marks-entry-modal');
        const isActive = modalEl.classList.contains('active');
        const count = context.activeExamStudents ? context.activeExamStudents.length : 0;
        console.log(`[PASS] Schedule ${sch.id} (${sch.subject} - ${sch.class}): Modal active = ${isActive}, students = ${count}`);
    }
}
