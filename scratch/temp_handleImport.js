lick();
            }
        }

        function handleExamMarksFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.onload = function (e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rawMatrix = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

                        let headerIdx = rawMatrix.findIndex(r => Array.isArray(r) && r.some(cell => String(cell).toLowerCase().includes('student id') || String(cell).toLowerCase().includes('sl')));
                        if (headerIdx === -1) headerIdx = 0;

                        const rows = XLSX.utils.sheet_to_json(firstSheet, { range: headerIdx });
                        processImportedExamMarksRows(rows);
                    } catch (err) {
                        alert("Error parsing Excel file: " + err.message);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                reader.onload = function (e) {
                    try {
                        const text = e.target.result;
                        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                        if (lines.length <= 1) {
                            alert("File is empty or invalid!");
                            return;
                        }
                        let headerIdx = lines.findIndex(l => l.toLowerCase().includes('student id') || l.toLowerCase().includes('sl'));
                        if (headerIdx === -1) headerIdx = 0;

                        const headers = lines[headerIdx].split(',').map(h => h.replace(/^"|"$/g, '').trim());
                        const rows = [];
                        for (let i = headerIdx + 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
                            const row = {};
                            headers.forEach((h, idx) => {
                                row[h] = values[idx] || "";
                            });
                            rows.push(row);
                        }
                        