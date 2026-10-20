const fs = require('fs');
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

const snippet = html.substring(248450, 248650);
console.log(snippet);
