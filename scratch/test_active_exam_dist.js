const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let fullScript = '';
while ((match = scriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
        fullScript += match[1] + '\n;\n';
    }
}

const sqlite = require('child_process').execSync('.venv\\Scripts\\python.exe -c "import sqlite3, json; conn=sqlite3.connect(\'school.db\'); c=conn.cursor(); c.execute(\'SELECT key, value FROM local_storage_sync\'); print(json.dumps(dict(c.fetchall()))); conn.close()"', { maxBuffer: 50 * 1024 * 1024 }).toString();
const storage = JSON.parse(sqlite);
storage['school_cms_auth_session'] = 'true';

const vm = require('vm');
const mockDoc = {
    getElementById: () => ({ innerText: '', value: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
    querySelector: () => ({ innerText: '', value: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};
const mockWin = {
    location: { href: '', search: '', replace: () => {} },
    document: mockDoc,
    addEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: function() {},
    Event: function() {}
};
const context = vm.createContext({
    window: mockWin,
    document: mockDoc,
    localStorage: { getItem: (k) => storage[k] || null, setItem: () => {} },
    sessionStorage: { getItem: () => 'true' },
    location: mockWin.location,
    console: console,
    setTimeout: () => {},
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {}
});

vm.runInContext(fullScript, context);

const schedules = JSON.parse(storage['school_exam_schedules'] || '[]');
console.log(`--- Inspecting activeExamDist for all ${schedules.length} schedules ---`);
for (const sch of schedules) {
    mockWin.openExamMarksEntryModal(sch.id);
    console.log(`\nSchedule: ${sch.subject} (${sch.class}, ${sch.term}, type=${sch.examType})`);
    console.log(`  activeExamSubjectCode:`, context.activeExamSubjectCode || mockWin.activeExamSubjectCode);
    console.log(`  activeExamDist:`, context.activeExamDist || mockWin.activeExamDist);
}
