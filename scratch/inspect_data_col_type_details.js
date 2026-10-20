const fs = require('fs');

const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Find all matches for data-col-type in the file
const matches = html.match(/<th[^>]*data-col-type[^>]*>[\s\S]*?<\/th>/gi) || [];
console.log(`Found ${matches.length} th elements with data-col-type`);

matches.forEach((m, i) => {
    const isFullmark = m.includes('data-fullmark');
    const colType = (m.match(/data-col-type="([^"]+)"/) || [])[1];
    const subj = (m.match(/data-subj="([^"]+)"/) || [])[1];
    const text = m.replace(/<[^>]+>/g, '').trim();
    const hasInner = m.includes('v-text-inner');
    const isVText = m.includes('v-text');
    console.log(`[${i}] colType=${colType} | subj=${subj} | isFullmark=${isFullmark} | isVText=${isVText} | hasInner=${hasInner} | text=${text}`);
});
