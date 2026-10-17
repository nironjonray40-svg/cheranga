const http = require('http');

function testUrl(url) {
    http.get(url, (res) => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}, Location: ${res.headers.location}`);
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (nextUrl.startsWith('/')) nextUrl = 'http://localhost:8000' + nextUrl;
            testUrl(nextUrl);
            return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Contains subview-exam-names:', data.includes('id="subview-exam-names"'));
            console.log('Contains nav-to-exam-names-btn:', data.includes('id="nav-to-exam-names-btn"'));
            console.log('Contains dropdown Exam Names:', data.includes('view=exam-names'));
        });
    });
}

testUrl('http://localhost:8000/exam-portal?view=exam-names');
