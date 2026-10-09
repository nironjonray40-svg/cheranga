const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  scriptIndex++;
  const code = match[1];
  // check if type is module or javascript
  if (!code.trim()) continue;
  try {
    new Function(code);
    console.log(`Script #${scriptIndex}: Syntax OK (${code.length} chars)`);
  } catch (err) {
    // some scripts might contain top-level return or await if module
    console.log(`Script #${scriptIndex}: Syntax issue - ${err.message}`);
    errors++;
  }
}

if (errors === 0) {
  console.log('\nAll scripts parsed with ZERO syntax errors!');
} else {
  console.log(`\nCompleted with ${errors} scripts having parse issues.`);
}
