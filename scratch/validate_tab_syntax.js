const fs = require('fs');
const { execSync } = require('child_process');

const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let hadError = false;

while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    if (!code.trim()) continue;

    const tmpFile = `scratch/test_tab_script_${count}.js`;
    fs.writeFileSync(tmpFile, code, 'utf8');

    try {
        execSync(`node --check "${tmpFile}"`, { stdio: 'pipe' });
        console.log(`Script #${count}: Syntax OK (${code.length} chars)`);
    } catch (err) {
        console.error(`Script #${count} FAILED:`, err.message);
        console.error(err.stderr.toString());
        hadError = true;
    }
}

if (!hadError) {
    console.log(`\nALL ${count} SCRIPTS PASSED SYNTAX CHECK WITH ZERO ERRORS!`);
} else {
    process.exit(1);
}
