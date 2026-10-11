const fs = require('fs');

['cms.html', 'teachers.html', 'result-portal.html', 'student-portal.html'].forEach(filename => {
    console.log(`\n--- Checking ${filename} ---`);
    const html = fs.readFileSync(filename, 'utf8');
    const scriptMatches = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
    console.log(`Found ${scriptMatches.length} script blocks.`);
    scriptMatches.forEach((m, idx) => {
        const fullTag = m[0];
        if (fullTag.includes('src=')) return;
        const code = m[1].trim();
        if (!code) return;
        try {
            new Function(code);
            console.log(`  Script block ${idx + 1}: Syntax VALID.`);
        } catch (err) {
            console.error(`  Script block ${idx + 1}: Syntax ERROR:`, err.message);
        }
    });
});

