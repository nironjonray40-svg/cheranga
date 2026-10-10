const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1].includes('openExamMarksEntryModal')) {
        console.log(`Script tag ${scriptIdx} has openExamMarksEntryModal (Length: ${match[1].length} chars)`);
        const vm = require('vm');
        const mockDoc = {
            getElementById: () => ({ addEventListener: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } }),
            querySelector: () => ({ addEventListener: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } }),
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
            localStorage: { getItem: () => null, setItem: () => {} },
            sessionStorage: { getItem: () => 'true' },
            location: mockWin.location,
            console: console,
            setTimeout: () => {},
            setInterval: () => {},
            clearTimeout: () => {},
            clearInterval: () => {}
        });
        try {
            vm.runInContext(match[1], context);
            console.log("Success running script block!");
            console.log("context.openExamMarksEntryModal:", typeof context.openExamMarksEntryModal);
            console.log("context.window.openExamMarksEntryModal:", typeof context.window.openExamMarksEntryModal);
        } catch (e) {
            console.error("ERROR running script block:", e);
        }
    }
    scriptIdx++;
}
