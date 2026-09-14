const http = require('http');

http.get('http://127.0.0.1:8000/', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Received HTML Length:', rawData.length);
        
        const hasBootData = rawData.includes('__SERVER_SYNC_DATA__');
        console.log('Includes __SERVER_SYNC_DATA__:', hasBootData);

        const hasCmsStructure = rawData.includes('hero-section') && rawData.includes('academic-programs');
        console.log('Includes CMS structure:', hasCmsStructure);

        const hasSchoolName = rawData.includes('Al-haj Mobarak Hossain') || rawData.includes('\u0986\u09b2\u09b9\u09be\u099c\u09cd\u09ac');
        console.log('Includes school data payload:', hasSchoolName);

        if (hasBootData && hasCmsStructure) {
            console.log('>>> SUCCESS: Server is serving CMS Public Website with full boot data!');
        } else {
            console.log('>>> FAILED: Content mismatch.');
        }
    });
}).on('error', (e) => {
    console.error('Error fetching:', e.message);
});
