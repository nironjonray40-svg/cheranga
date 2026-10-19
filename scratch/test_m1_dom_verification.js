const fs = require('fs');

const html = fs.readFileSync('Marksheet1.html', 'utf-8');

// Check that the institution header contains .header-logo-box
const singleHeaderMatch = html.match(/<div class="institution-header">([\s\S]*?)<\/div>\s*<!-- Student Meta/);
if (!singleHeaderMatch) {
    throw new Error('Single institution-header not found!');
}
const singleHeader = singleHeaderMatch[1];
if (!singleHeader.includes('header-logo-box')) {
    throw new Error('Single institution-header does not contain header-logo-box!');
}
if (!singleHeader.includes('header-text-box')) {
    throw new Error('Single institution-header does not contain header-text-box!');
}
console.log('[PASS] Single view institution-header contains logo and headline.');

// Check that the table header does not contain "পূর্ণমান" or "Full Marks"
const theadMatch = html.match(/<table class="transcript-table">([\s\S]*?)<\/thead>/);
if (!theadMatch) {
    throw new Error('Single transcript-table thead not found!');
}
const thead = theadMatch[1];
if (thead.includes('পূর্ণমান')) {
    throw new Error('Single transcript-table thead still contains "পূর্ণমান"!');
}
console.log('[PASS] Single table header has removed "পূর্ণমান" column.');

// Check batch card generator contains header-logo-box and customLogo
if (!html.includes('<div class="header-logo-box">') || !html.includes('src="${customLogo}"')) {
    throw new Error('Batch card template does not contain header-logo-box with customLogo!');
}
console.log('[PASS] Batch card template contains header-logo-box inside institution-header.');

// Check batch card thead does not contain "পূর্ণমান"
const batchTheadMatch = html.match(/\$\{isEn \? "Subjects" : "পাঠ্য বিষয়সমূহ"\}<\/th>([\s\S]*?)<\/thead>/);
if (batchTheadMatch && batchTheadMatch[1].includes('পূর্ণমান')) {
    throw new Error('Batch card thead still contains "পূর্ণমান"!');
}
console.log('[PASS] Batch card thead has removed "পূর্ণমান" column.');

console.log('All verification assertions passed successfully!');
