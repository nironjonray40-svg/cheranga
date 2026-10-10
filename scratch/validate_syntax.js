const fs = require('fs');

const content = fs.readFileSync('exam-portal.html', 'utf8');

// Extract script blocks
const scriptMatches = content.match(/<script[\s\S]*?<\/script>/gi);
console.log(`Found ${scriptMatches ? scriptMatches.length : 0} script tags`);

let errorCount = 0;
scriptMatches.forEach((scriptTag, idx) => {
    // Remove <script ...> and </script>
    const js = scriptTag.replace(/^<script[\s\S]*?>/i, '').replace(/<\/script>$/i, '');
    try {
        new Function(js);
    } catch (err) {
        console.error(`Syntax Error in script #${idx + 1}:`, err.message);
        errorCount++;
    }
});

if (errorCount === 0) {
    console.log("All scripts compiled successfully without syntax errors!");
}
