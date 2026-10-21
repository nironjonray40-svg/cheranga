const http = require('http');

async function check() {
    const tabs = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
    const tab = tabs.find(t => t.url.includes('Tabulation') || t.type === 'page') || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
        const send = (method, params = {}) => new Promise(res => {
            const id = Math.floor(Math.random()*10000);
            const h = (e) => {
                const m = JSON.parse(e.data);
                if (m.id === id) { ws.removeEventListener('message', h); res(m); }
            };
            ws.addEventListener('message', h);
            ws.send(JSON.stringify({ id, method, params }));
        });

        const res = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const tbody = getTabulationTbody();
                    const rows = tbody ? Array.from(tbody.querySelectorAll('tr[data-section]')) : [];
                    return rows.slice(0, 3).map((r, i) => {
                        const tds = Array.from(r.querySelectorAll('td')).map(t => t.textContent.trim());
                        return {
                            row: i + 1,
                            name: tds[1],
                            b1_mcq: tds[3], b1_cq: tds[4], b2_mcq: tds[6], b2_cq: tds[7],
                            bGrandTot: tds[8], bAvg: tds[9], bGrd: tds[10], bGP: tds[11],
                            mathCQ: tds[18], mathMCQ: tds[19], mathTot: tds[20], mathGrd: tds[21], mathGP: tds[22]
                        };
                    });
                })()
            `,
            returnByValue: true
        });
        console.log(JSON.stringify(res.result.result.value, null, 2));
        ws.close();
        process.exit(0);
    };
}
check().catch(console.error);
