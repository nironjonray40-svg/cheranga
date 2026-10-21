const { spawn } = require('child_process');
const http = require('http');

async function test() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9223',
        '--user-data-dir=C:/Users/niron/OneDrive/Desktop/Cheranga/scratch/chrome_test_profile',
        '--disable-gpu',
        'about:blank'
    ]);
    // Wait for CDP port
    let connected = false;
    let tabs = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            tabs = await new Promise((resolve, reject) => {
                http.get('http://127.0.0.1:9223/json', res => {
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
    if (!connected) {
        chrome.kill();
        throw new Error('Chrome failed to start');
    }
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
        await new Promise(r => setTimeout(r, 2500));
        
        await send('Runtime.evaluate', { expression: "filterClass('Eight'); filterExam('Elegileble test');" });
        await new Promise(r => setTimeout(r, 1500));

        const res = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const tbody = getTabulationTbody();
                    const rows = tbody ? Array.from(tbody.querySelectorAll('tr[data-section]')) : [];
                    if (rows.length === 0) return { error: 'No student rows found' };

                    const distMath = getSubjectMarksDistribution('math', currentFilterClass, currentFilterExam);
                    const studentResults = rows.slice(0, 5).map((r, i) => {
                        const tds = Array.from(r.querySelectorAll('td')).map(t => t.textContent.trim());
                        return {
                            row: i + 1,
                            name: tds[1],
                            b1_mcq: tds[2],
                            b1_cq: tds[3],
                            b1_tot: tds[4],
                            b2_mcq: tds[5],
                            b2_cq: tds[6],
                            b2_tot: tds[7],
                            bGrandTot_8: tds[8],
                            bAvg_9: tds[9],
                            bGrd_10: tds[10],
                            bGP_11: tds[11],
                            eng1_tot: tds[12],
                            eng2_tot: tds[13],
                            engGrandTot_14: tds[14],
                            engAvg_15: tds[15],
                            engGrd_16: tds[16],
                            engGP_17: tds[17],
                            mathMCQ_18: tds[18],
                            mathCQ_19: tds[19],
                            mathTot_20: tds[20],
                            mathGrd_21: tds[21],
                            mathGP_22: tds[22],
                            grandTotal_62: tds[62],
                            fails_63: tds[63],
                            gpaNoOpt_64: tds[64],
                            finalGPA_65: tds[65],
                            finalGrade_66: tds[66],
                            meritRank_67: tds[67]
                        };
                    });
                    return {
                        distMath,
                        students: studentResults
                    };
                })()
            `,
            returnByValue: true
        });

        console.log(JSON.stringify(res.result.result.value, null, 2));

        ws.close();
        chrome.kill();
        process.exit(0);
    };
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
