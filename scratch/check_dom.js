const fs = require('fs');

const html = fs.readFileSync('scratch/live_chrome_dom.html', 'utf8');

// Simple regex parser
const trRegex = /<tr\s+data-section="([^"]*)"([^>]*)>([\s\S]*?)<\/tr>/gi;
let match;
let count = 0;

console.log('--- Checking student rows in live Chrome DOM ---');
while ((match = trRegex.exec(html)) !== null) {
    const sec = match[1];
    const attrs = match[2];
    const inner = match[3];

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const tds = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(inner)) !== null) {
        // Strip tags
        tds.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (tds.length >= 68 && count < 6) {
        console.log(`\nStudent Row ${count + 1}: Sec=${sec}, Roll=${tds[0]}, Name=${tds[1]}`);
        console.log(`  Bangla: MCQ=${tds[2]}, CQ=${tds[3]}, Tot=${tds[4]}, B2_MCQ=${tds[5]}, B2_CQ=${tds[6]}, B2_Tot=${tds[7]}`);
        console.log(`  Bangla Combined: GrandTot=${tds[8]}, Avg=${tds[9]}, Grade=${tds[10]}, GP=${tds[11]}`);
        console.log(`  English: Eng1=${tds[12]}, Eng2=${tds[13]}, GrandTot=${tds[14]}, Avg=${tds[15]}, Grade=${tds[16]}, GP=${tds[17]}`);
        console.log(`  Math: MCQ=${tds[18]}, CQ=${tds[19]}, Tot=${tds[20]}, Grade=${tds[21]}, GP=${tds[22]}`);
        console.log(`  BGS: MCQ=${tds[23]}, CQ=${tds[24]}, Tot=${tds[25]}, Grade=${tds[26]}, GP=${tds[27]}`);
        console.log(`  Science: MCQ=${tds[28]}, CQ=${tds[29]}, Prac=${tds[30]}, Tot=${tds[31]}, Grade=${tds[32]}, GP=${tds[33]}`);
        console.log(`  Summary: GrandTotal(62)=${tds[62]}, Fail(63)=${tds[63]}, GPA_no_opt(64)=${tds[64]}, GPA(65)=${tds[65]}, Grade(66)=${tds[66]}, Rank(67)=${tds[67]}`);
        count++;
    }
}
