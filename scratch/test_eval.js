const { spawn } = require('child_process');
const http = require('http');

async function test() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--user-data-dir=C:/Users/niron/OneDrive/Desktop/Cheranga/scratch/chrome_test_profile',
        '--disable-gpu',
        'about:blank'
    ]);
    // Wait for CDP port
    let connected = false;
    let tabs = null;
    for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            tabs = await new Promise((resolve, reject) => {
                http.get('http://127.0.0.1:9222/json', res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });
            if (tabs && tabs.length > 0) {
                connected = true;
                break;
            }
        } catch (e) {}
    }
    if (!connected) throw new Error('Chrome failed to start');
    const tab = tabs[0];
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

        await send('Page.enable');
        await send('Runtime.enable');
        await send('Page.navigate', { url: 'http://localhost:8000/Tabulation%20Sheet' });
        await new Promise(r => setTimeout(r, 2000));
        
        await send('Runtime.evaluate', { expression: "filterClass('Eight'); filterExam('Elegileble test');" });
        await new Promise(r => setTimeout(r, 1000));

        const stepRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const studentRow = document.querySelector('tr[data-section]');
                    const tbody = studentRow ? studentRow.closest('tbody') : null;
                    if (!tbody) return 'NO TBODY';

                    // Temporarily patch document.querySelector('table tbody') or give main table an ID
                    const mainTable = tbody.closest('table');
                    mainTable.id = 'tabulation-main-table';

                    // Now run recalculate on correct rows
                    const rows = Array.from(tbody.querySelectorAll('tr[data-section]'));
                    
                    // Call the exact logic of recalculateTableGradesAndRanks but with correct tbody
                    const origQuerySelector = document.querySelector.bind(document);
                    document.querySelector = function(sel) {
                        if (sel === 'table tbody') return tbody;
                        return origQuerySelector(sel);
                    };

                    try {
                        recalculateTableGradesAndRanks();
                    } finally {
                        document.querySelector = origQuerySelector;
                    }

                    const r0 = rows[0];
                    const tds = Array.from(r0.querySelectorAll('td')).map(t => t.textContent.trim());

                    return {
                        success: true,
                        bGrandTot_8: tds[8],
                        bAvg_9: tds[9],
                        bGrd_10: tds[10],
                        bGP_11: tds[11],
                        engGrandTot_14: tds[14],
                        engAvg_15: tds[15],
                        engGrd_16: tds[16],
                        engGP_17: tds[17],
                        mathTot_20: tds[20],
                        mathGrd_21: tds[21],
                        mathGP_22: tds[22],
                        bgsTot_25: tds[25],
                        bgsGrd_26: tds[26],
                        bgsGP_27: tds[27],
                        sciTot_31: tds[31],
                        sciGrd_32: tds[32],
                        sciGP_33: tds[33],
                        grandTotal_62: tds[62],
                        fails_63: tds[63],
                        gpaNoOpt_64: tds[64],
                        finalGPA_65: tds[65],
                        finalGrade_66: tds[66],
                        meritRank_67: tds[67]
                    };
                })()
            `,
            returnByValue: true
        });
        console.log('Result with correct tbody:', JSON.stringify(stepRes.result.result.value, null, 2));

        chrome.kill();
        process.exit(0);
    };
}
test().catch(e => { console.error(e); process.exit(1); });
