const fs = require('fs');
const html = fs.readFileSync('scratch/live_tabulation_dom.html', 'utf8');
console.log('HTML size:', html.length);

const trRegex = /<tr[^>]*data-section="([^"]*)"([^>]*)>([\s\S]*?)<\/tr>/gi;
let match;
let count = 0;
while ((match = trRegex.exec(html)) !== null && count < 5) {
    const sec = match[1];
    const attrs = match[2];
    const inner = match[3];
    const tds = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tm;
    while ((tm = tdRegex.exec(inner)) !== null) {
        tds.push(tm[1].replace(/<[^>]+>/g, '').trim());
    }
    const isHidden = attrs.includes('display: none');
    console.log(`\nRow ${count+1}: Sec=${sec}, Roll=${tds[0]}, Name=${tds[1]}, Hidden=${isHidden}`);
    console.log('  Bangla (2-11):', JSON.stringify(tds.slice(2, 12)));
    console.log('  English (12-17):', JSON.stringify(tds.slice(12, 18)));
    console.log('  Math (18-22):', JSON.stringify(tds.slice(18, 23)));
    console.log('  BGS (23-27):', JSON.stringify(tds.slice(23, 28)));
    console.log('  Science (28-33):', JSON.stringify(tds.slice(28, 34)));
    console.log('  Summary (62-67):', JSON.stringify(tds.slice(62, 68)));
    count++;
}

// Also check selected filter options:
const selClass = html.match(/<select[^>]*id="class-filter"[^>]*>([\s\S]*?)<\/select>/i);
const selExam = html.match(/<select[^>]*id="exam-filter"[^>]*>([\s\S]*?)<\/select>/i);
if (selClass) {
    const selected = selClass[1].match(/<option[^>]*selected[^>]*>([\s\S]*?)<\/option>/i);
    console.log('Class selected option:', selected ? selected[1].trim() : 'none');
}
if (selExam) {
    const selected = selExam[1].match(/<option[^>]*selected[^>]*>([\s\S]*?)<\/option>/i);
    console.log('Exam selected option:', selected ? selected[1].trim() : 'none');
}
