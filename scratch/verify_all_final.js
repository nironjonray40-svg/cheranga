const fs = require('fs');

const html = fs.readFileSync('Marksheet1.html', 'utf-8');

// 1. Check CSS
if (!html.includes('.header-right-spacer')) {
    throw new Error('Missing .header-right-spacer in CSS or HTML');
}
if (!html.includes('justify-content: space-between;')) {
    throw new Error('Missing justify-content: space-between in institution-header');
}
if (!html.includes('font-size: 20.5px;')) {
    throw new Error('Missing font-size: 20.5px for inst-title-bn');
}
console.log('[PASS] CSS flexbox and spacing confirmed.');

// 2. Check Single View Header
const singleHdr = html.match(/<div class="institution-header">([\s\S]*?)<\/div>\s*<!-- Student Meta/);
if (!singleHdr || !singleHdr[1].includes('header-right-spacer') || !singleHdr[1].includes('header-logo-box')) {
    throw new Error('Single View header missing logo or spacer');
}
console.log('[PASS] Single View header structure confirmed.');

// 3. Check Batch Card Header
if (!html.includes('<div class="header-right-spacer" aria-hidden="true"></div>')) {
    throw new Error('Batch card header missing spacer');
}
console.log('[PASS] Batch card header structure confirmed.');

// 4. Confirm no "পূর্ণমান" in theads
if (html.includes('id="th-header-full-1"') || html.includes('style="width: 8%;">${isEn ? "Full Marks" : "পূর্ণমান"}')) {
    throw new Error('Still contains Full Marks thead!');
}
console.log('[PASS] Full marks column completely absent.');

console.log('All final checks passed successfully!');
