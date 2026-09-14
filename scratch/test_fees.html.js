
// BLOCK 2

        // Safe JSON parser to prevent errors from empty database or null storage values
        function safeJsonParse(key, defaultValue) {
            try {
                const stored = localStorage.getItem(key);
                if (stored && stored !== 'null' && stored !== 'undefined') {
                    const parsed = JSON.parse(stored);
                    if (parsed !== null && parsed !== undefined) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error(`Error parsing ${key} from localStorage:`, e);
            }
            return defaultValue;
        }

        // Retrieve fees from localStorage or use defaults
        function loadClasses() {
            const defaultClasses = ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
            const parsed = safeJsonParse('school_classes', null);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(c => c && typeof c === 'string' && c.trim() !== '');
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return defaultClasses;
        }

        // Retrieve fees from localStorage or use defaults
        function getClassFees() {
            const defaultFees = {
                "Play": { tuition: 500, admission: 800, session: 1000 },
                "Nursery": { tuition: 500, admission: 800, session: 1000 },
                "KG": { tuition: 500, admission: 800, session: 1000 },
                "Class 1": { tuition: 600, admission: 900, session: 1200 },
                "Class 2": { tuition: 600, admission: 900, session: 1200 },
                "Class 3": { tuition: 600, admission: 900, session: 1200 },
                "Class 4": { tuition: 650, admission: 950, session: 1300 },
                "Class 5": { tuition: 650, admission: 950, session: 1300 },
                "Class 6": { tuition: 700, admission: 1000, session: 1500 },
                "Class 7": { tuition: 700, admission: 1000, session: 1500 },
                "Class 8": { tuition: 800, admission: 1200, session: 1800 },
                "Class 9": { tuition: 1000, admission: 1500, session: 2000 },
                "Class 10": { tuition: 1000, admission: 1500, session: 2000 }
            };
            const parsed = safeJsonParse('school_class_fees', null);
            return (parsed && typeof parsed === 'object') ? parsed : defaultFees;
        }

        // Initialize option labels dynamically from fees data
        function initializeFeeLabels() {
            const classes = loadClasses();
            const fees = getClassFees();
            const selectEl = document.getElementById('fee-class');
            if (selectEl) {
                const currentVal = selectEl.value;
                const { primary, high } = groupClassesByDepartment(classes);

                const renderClassOptions = (classList) => classList.map(c => {
                    let cFees = fees[c] || fees[c.replace("Class ", "")] || { tuition: 0, admission: 0, session: 0 };
                    if (typeof cFees !== 'object') {
                        cFees = { tuition: parseInt(cFees) || 0, admission: 0, session: 0 };
                    }
                    return `<option value="${c}">${c} (Tuition: ${cFees.tuition} BDT)</option>`;
                }).join('');

                let html = '';
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">${renderClassOptions(primary)}</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">${renderClassOptions(high)}</optgroup>`;
                }

                selectEl.innerHTML = html;
                if (currentVal && classes.includes(currentVal)) {
                    selectEl.value = currentVal;
                } else if (classes.length > 0) {
                    selectEl.value = classes[0];
                }
            }
        }

        // --- FEE & TUITION CALCULATOR ---
        function calculateFees() {
            if (!document.getElementById('fee-class')) return;
            const classVal = document.getElementById('fee-class').value;
            const monthVal = document.getElementById('fee-month').value;
            const isTransport = document.getElementById('fee-transport').checked;
            const isCanteen = document.getElementById('fee-canteen').checked;
            const isExam = document.getElementById('fee-exam').checked;
            const isAdmission = document.getElementById('fee-admission') ? document.getElementById('fee-admission').checked : false;
            const isSession = document.getElementById('fee-session') ? document.getElementById('fee-session').checked : false;

            const fees = getClassFees();

            // Get fees for selected class
            let cFees = fees[classVal] || fees[classVal.replace("Class ", "")] || { tuition: 0, admission: 0, session: 0 };
            if (typeof cFees !== 'object') {
                cFees = { tuition: parseInt(cFees) || 0, admission: 0, session: 0 };
            }

            // Update labels dynamically
            const labelAdmission = document.getElementById('label-fee-admission');
            if (labelAdmission) labelAdmission.innerText = cFees.admission;
            const labelSession = document.getElementById('label-fee-session');
            if (labelSession) labelSession.innerText = cFees.session;

            const tuitionFee = cFees.tuition;

            let total = tuitionFee;
            let itemsHTML = `
                <tr>
                    <td>Monthly Tuition Fee</td>
                    <td style="text-align: right;">${tuitionFee} BDT</td>
                </tr>
            `;

            if (isAdmission) {
                total += cFees.admission;
                itemsHTML += `
                    <tr>
                        <td>Admission Fee</td>
                        <td style="text-align: right;">${cFees.admission} BDT</td>
                    </tr>
                `;
            }
            if (isSession) {
                total += cFees.session;
                itemsHTML += `
                    <tr>
                        <td>Session Fee</td>
                        <td style="text-align: right;">${cFees.session} BDT</td>
                    </tr>
                `;
            }
            if (isTransport) {
                total += 500;
                itemsHTML += `
                    <tr>
                        <td>School Bus Service Fee</td>
                        <td style="text-align: right;">500 BDT</td>
                    </tr>
                `;
            }
            if (isCanteen) {
                total += 800;
                itemsHTML += `
                    <tr>
                        <td>Lunch & Canteen Fee</td>
                        <td style="text-align: right;">800 BDT</td>
                    </tr>
                `;
            }
            if (isExam) {
                total += 300;
                itemsHTML += `
                    <tr>
                        <td>Exam Management Fee</td>
                        <td style="text-align: right;">300 BDT</td>
                    </tr>
                `;
            }

            // Update Invoice Panel
            document.getElementById('receipt-class').innerText = classVal;
            document.getElementById('receipt-month').innerText = monthVal;
            document.getElementById('receipt-items-body').innerHTML = itemsHTML;
            document.getElementById('receipt-total').innerText = total + " BDT";

            // Generate fake receipt number
            const randNo = "NMS-" + Math.floor(10000 + Math.random() * 90000);
            document.getElementById('receipt-no').innerText = randNo;
        }

        function printReceipt() {
            const receipt = document.getElementById('fee-receipt-container').outerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
                        .fee-receipt { border: 2px solid #333; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
                        .receipt-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
                        .receipt-title { font-size: 1.5rem; font-weight: bold; }
                        .receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.1rem; }
                        .receipt-row.total { border-top: 2px solid #333; padding-top: 12px; margin-top: 15px; font-weight: bold; font-size: 1.2rem; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #ddd; padding: 12px 8px; text-align: left; }
                        th { background: #f2f2f2; }
                    </style>
                </head>
                <body>
                    \${receipt}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }

        // Initialize invoice details and option labels
        initializeFeeLabels();
        calculateFees();
    