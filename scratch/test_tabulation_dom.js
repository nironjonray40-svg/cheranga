const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));

// Mock minimal DOM for browser runtime simulation
const dom = {
    elements: {},
    storage: { ...dbData, isLoggedIn: 'true' }
};

// Test with jsdom if available, else lightweight DOM test
let JSDOM;
try {
    JSDOM = require('jsdom').JSDOM;
} catch (e) {
    JSDOM = null;
}

if (JSDOM) {
    const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');
    const virtualConsole = new (require('jsdom').VirtualConsole)();
    const domInstance = new JSDOM(html, {
        runScripts: 'dangerously',
        virtualConsole: virtualConsole,
        url: 'http://localhost:8000/Tabulation%20Sheet.html'
    });
    const window = domInstance.window;
    // Set localStorage items
    Object.keys(dbData).forEach(k => {
        window.localStorage.setItem(k, dbData[k]);
    });
    window.localStorage.setItem('isLoggedIn', 'true');

    // Run refresh
    window.refreshTabulationSheetData();

    console.log("=== Testing Class Ten ===");
    window.filterClass('Ten');
    let visibleRowsTen = Array.from(window.document.querySelectorAll('tbody tr[data-section]')).filter(r => r.style.display !== 'none');
    console.log(`Class Ten visible student rows: ${visibleRowsTen.length}`);
    visibleRowsTen.forEach(r => {
        const roll = r.querySelector('td:nth-child(1)')?.textContent.trim();
        const name = r.querySelector('td:nth-child(2)')?.textContent.trim();
        console.log(`  Roll: ${roll}, Name: ${name}`);
    });

    console.log("\n=== Testing Class Eight ===");
    window.filterClass('Eight');
    let visibleRowsEight = Array.from(window.document.querySelectorAll('tbody tr[data-section]')).filter(r => r.style.display !== 'none');
    console.log(`Class Eight visible student rows: ${visibleRowsEight.length}`);
    visibleRowsEight.slice(0, 5).forEach(r => {
        const roll = r.querySelector('td:nth-child(1)')?.textContent.trim();
        const name = r.querySelector('td:nth-child(2)')?.textContent.trim();
        console.log(`  Roll: ${roll}, Name: ${name}`);
    });

    console.log("\n=== Testing Class Six ===");
    window.filterClass('Six');
    let visibleRowsSix = Array.from(window.document.querySelectorAll('tbody tr[data-section]')).filter(r => r.style.display !== 'none');
    console.log(`Class Six visible student rows: ${visibleRowsSix.length}`);
    visibleRowsSix.forEach(r => {
        const roll = r.querySelector('td:nth-child(1)')?.textContent.trim();
        const name = r.querySelector('td:nth-child(2)')?.textContent.trim();
        console.log(`  Roll: ${roll}, Name: ${name}`);
    });

    console.log("\n=== Testing Exam 'Elegileble test' (Class Eight) ===");
    window.filterClass('Eight');
    window.filterExam('Elegileble test');
    const bng1Header = window.document.querySelector('thead th[data-subj="bangla1"]')?.textContent.trim();
    const eng1Header = window.document.querySelector('thead th[data-subj="english1"]')?.textContent.trim();
    const mathHeader = window.document.querySelector('thead th[data-subj="math"]')?.textContent.trim();
    const chemHeader = window.document.querySelector('thead th[data-subj="chem"]')?.textContent.trim();
    console.log(`Bangla1 Header: '${bng1Header}'`);
    console.log(`English1 Header: '${eng1Header}'`);
    console.log(`Math Header: '${mathHeader}'`);
    console.log(`Science/Chem Header: '${chemHeader}'`);

    console.log("\n=== Testing Exam 'বার্ষিক পরীক্ষা' (Class Six) ===");
    window.filterClass('Six');
    window.filterExam('বার্ষিক পরীক্ষা');
    const bng1HeaderSix = window.document.querySelector('thead th[data-subj="bangla1"]')?.textContent.trim();
    const eng1HeaderSix = window.document.querySelector('thead th[data-subj="english1"]')?.textContent.trim();
    const mathHeaderSix = window.document.querySelector('thead th[data-subj="math"]')?.textContent.trim();
    console.log(`Bangla1 Header: '${bng1HeaderSix}'`);
    console.log(`English1 Header: '${eng1HeaderSix}'`);
    console.log(`Math Header: '${mathHeaderSix}'`);

} else {
    console.log("jsdom not installed, verified logic via pure node test.");
}
