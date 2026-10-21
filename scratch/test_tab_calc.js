const fs = require('fs');

const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Check the tbody rows
const match = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
if (!match) {
    console.log('No tbody found');
    process.exit(1);
}
const tbodyHtml = match[1];
const trMatches = tbodyHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
console.log('Total tr in tbody:', trMatches.length);

const firstStudentTr = trMatches.find(tr => tr.includes('data-section'));
if (firstStudentTr) {
    const tds = firstStudentTr.match(/<td[\s\S]*?<\/td>/gi) || [];
    console.log('tds in first student row:', tds.length);
}
