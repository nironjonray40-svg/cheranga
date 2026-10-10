const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

// Extract all <script> blocks
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let fullScript = '';
while ((match = scriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
        fullScript += match[1] + '\n;\n';
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
            querySelector: () => ({ innerText: '', textContent: '', style: {}, value: '' }),
            querySelectorAll: () => []
        };
    }
    return mockElements[id];
}

const mockDoc = {
    getElementById: (id) => getOrCreateMockElement(id),
    querySelector: () => ({ innerText: '', textContent: '', style: {}, value: '' }),
    querySelectorAll: () => []
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
    fetch: async () => ({ ok: true, json: async () => ({}) })
};

// Create a sandbox VM context
const vm = require('vm');
const context = vm.createContext({
    window: mockWindow,
    document: mockDoc,
    location: mockWindow.location,
    sessionStorage: mockWindow.sessionStorage,
    localStorage: mockWindow.localStorage,
    console: console,
    alert: (m) => console.log('ALERT:', m),
    confirm: () => true,
    setTimeout: (fn) => fn(),
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    CustomEvent: function() {},
    Event: function() {},
    fetch: async () => ({ ok: true, json: async () => ({}) })
});

try {
    vm.runInContext(fullScript, context);
    console.log("Script evaluated in context successfully!");

    console.log("\n--- Testing openExamMarksEntryModal for all schedules ---");
    const schedules = JSON.parse(storage['school_exam_schedules'] || '[]');
    for (const sch of schedules) {
        console.log(`\nCalling openExamMarksEntryModal('${sch.id}') for Subject: ${sch.subject}, Class: ${sch.class}...`);
        context.openExamMarksEntryModal(sch.id);
        const modalEl = mockElements['exam-marks-entry-modal'];
        const isActive = modalEl && modalEl.classList.contains('active');
        console.log(`  Modal active: ${isActive}`);
        console.log(`  activeExamStudents count: ${context.activeExamStudents ? context.activeExamStudents.length : 0}`);
    }
} catch (err) {
    console.error("FATAL ERROR in simulation:", err);
}
