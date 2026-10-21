const { spawn } = require('child_process');
const http = require('http');

async function main() {
    console.log('1. Launching Chrome with CDP on 9222...');
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--user-data-dir=C:/Users/niron/OneDrive/Desktop/Cheranga/scratch/chrome_test_profile',
        '--disable-gpu',
        'about:blank'
    ]);

    // Wait for CDP port
    let connected = false;
    let versionData = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            versionData = await new Promise((resolve, reject) => {
                http.get('http://127.0.0.1:9222/json/version', res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });
            if (versionData) {
                connected = true;
                break;
            }
        } catch (e) {}
    }

    if (!connected) {
        console.error('Failed to connect to Chrome CDP');
        chrome.kill();
        return;
    }

    console.log('Connected to Chrome:', versionData.Browser);

    // Get existing tab or create new with PUT
    const tabs = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });

    const newTab = tabs.find(t => t.type === 'page') || tabs[0];
    console.log('Using tab:', newTab.id, 'WS URL:', newTab.webSocketDebuggerUrl);

    const ws = new WebSocket(newTab.webSocketDebuggerUrl);
    let msgId = 1;

    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            const handler = (evt) => {
                const msg = JSON.parse(evt.data);
                if (msg.id === id) {
                    ws.removeEventListener('message', handler);
                    if (msg.error) {
                        console.error('CDP ERROR for method', method, msg.error);
                    }
                    resolve(msg.result || msg.error);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    ws.onopen = async () => {
        console.log('WS connected! Enabling domains...');
        await send('Page.enable');
        await send('Runtime.enable');
        await send('Console.enable');

        ws.addEventListener('message', (evt) => {
            const msg = JSON.parse(evt.data);
            if (msg.method === 'Console.messageAdded') {
                console.log('[BROWSER CONSOLE]', msg.params.message.level, msg.params.message.text);
            }
            if (msg.method === 'Runtime.consoleAPICalled') {
                console.log('[BROWSER API CALL]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
            }
            if (msg.method === 'Runtime.exceptionThrown') {
                console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
            }
        });

        // Set localStorage.isLoggedIn = 'true'
        await send('Page.addScriptToEvaluateOnNewDocument', {
            source: `
                try {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('school_active_exam_filter', 'Elegileble test');
                } catch(e) {}
            `
        });

        console.log('Navigating to Tabulation Sheet...');
        const loadPromise = new Promise(resolve => {
            const lHandler = (evt) => {
                const msg = JSON.parse(evt.data);
                if (msg.method === 'Page.loadEventFired') {
                    ws.removeEventListener('message', lHandler);
                    resolve();
                }
            };
            ws.addEventListener('message', lHandler);
        });

        await send('Page.navigate', {
            url: 'http://localhost:8000/Tabulation%20Sheet'
        });

        await loadPromise;
        console.log('Page loaded! Waiting 1s for initial render...');
        await new Promise(r => setTimeout(r, 1000));

        // Explicitly set filter to Eight and Elegileble test
        console.log('Calling filterClass(Eight) and filterExam(Elegileble test)...');
        await send('Runtime.evaluate', {
            expression: `
                filterClass('Eight');
                filterExam('Elegileble test');
            `
        });

        await new Promise(r => setTimeout(r, 2000));

        // Evaluate recalculateTableGradesAndRanks with try/catch
        const debugEval = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    console.log('--- EXECUTING recalculateTableGradesAndRanks() DEBUG ---');
                    try {
                        const tbody = document.querySelector('table tbody');
                        const rows = Array.from(tbody.querySelectorAll('tr[data-section]'));
                        console.log('recalculate: total rows with data-section:', rows.length);
                        
                        const r0 = rows[0];
                        const cells0 = r0.querySelectorAll('td');
                        console.log('r0 cells length:', cells0.length);
                        console.log('r0 cell 4 (b1Tot):', cells0[4].textContent);
                        console.log('r0 cell 8 (bGrandTot):', cells0[8].textContent);

                        recalculateTableGradesAndRanks();

                        console.log('AFTER recalculate: cell 8:', cells0[8].textContent);
                        console.log('AFTER recalculate: cell 10 (grade):', cells0[10].textContent);
                        console.log('AFTER recalculate: cell 62 (grandTot):', cells0[62].textContent);
                        return 'recalculate finished without uncaught throw';
                    } catch (e) {
                        console.error('recalculate ERROR:', e.message, e.stack);
                        return 'ERROR: ' + e.message + '\n' + e.stack;
                    }
                })()
            `,
            returnByValue: true
        });

        console.log('Debug eval result:', debugEval.result.value);

        // Evaluate state in browser
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const cls = document.getElementById('class-filter')?.value;
                    const exam = document.getElementById('exam-filter')?.value;
                    const rows = Array.from(document.querySelectorAll('tbody tr[data-section]'));
                    const visRows = rows.filter(r => r.style.display !== 'none');
                    
                    const details = visRows.slice(0, 3).map(r => {
                        const tds = Array.from(r.querySelectorAll('td')).map(t => t.textContent.trim());
                        return {
                            roll: tds[0],
                            name: tds[1],
                            stId: r.getAttribute('data-student-id'),
                            bMCQ1: tds[2], bCQ1: tds[3], bTot1: tds[4],
                            bMCQ2: tds[5], bCQ2: tds[6], bTot2: tds[7],
                            bGrandTot: tds[8], bAvg: tds[9], bGrd: tds[10], bGP: tds[11],
                            eng1: tds[12], eng2: tds[13], engGrandTot: tds[14], engAvg: tds[15], engGrd: tds[16], engGP: tds[17],
                            mathMCQ: tds[18], mathCQ: tds[19], mathTot: tds[20], mathGrd: tds[21], mathGP: tds[22],
                            bgsMCQ: tds[23], bgsCQ: tds[24], bgsTot: tds[25], bgsGrd: tds[26], bgsGP: tds[27],
                            sciMCQ: tds[28], sciCQ: tds[29], sciPrac: tds[30], sciTot: tds[31], sciGrd: tds[32], sciGP: tds[33],
                            summary: {
                                grandTotal_62: tds[62],
                                fail_63: tds[63],
                                gpaNoOpt_64: tds[64],
                                finalGPA_65: tds[65],
                                finalGrade_66: tds[66],
                                meritRank_67: tds[67]
                            }
                        };
                    });

                    return {
                        cls,
                        exam,
                        totalRows: rows.length,
                        visibleRows: visRows.length,
                        activeSubjectSlots: window.activeSubjectSlots,
                        details
                    };
                })()
            `,
            returnByValue: true
        });

        console.log('\n--- LIVE BROWSER EVALUATION RESULT ---');
        console.log(JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
        chrome.kill();
        process.exit(0);
    };
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
