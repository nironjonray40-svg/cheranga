const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let idx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    if (match[0].includes('src=')) {
        console.log(`Script ${idx}: External src script`);
    } else {
        console.log(`Script ${idx}: Inline script (length: ${match[1].length})`);
        const vm = require('vm');
        const mockDoc = {
            getElementById: () => ({ innerText: '', value: '', style: {}, classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} }),
            querySelector: () => ({ innerText: '', value: '', style: {}, classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} }),
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
            console.log(`  -> Script ${idx} passed successfully!`);
        } catch (e) {
            console.error(`  -> ERROR in script ${idx}:`, e);
        }
    }
    idx++;
}
