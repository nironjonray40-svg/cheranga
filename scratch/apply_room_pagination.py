# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

old_room_render_block = """                // Build Class Tables HTML

                let tablesHtml = '';

                classes.forEach((cls, idx) => {

                    const stList = classGroup[cls];

                    stList.sort((a, b) => {

                        const idA = String(a.studentId || a.id || a.roll || '');

                        const idB = String(b.studentId || b.id || b.roll || '');

                        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });

                    });



                    const borderClass = `class-border-${idx % 6}`;



                    let rowsHtml = '';

                    stList.forEach(st => {

                        const studentId = st.studentId || st.id || st.roll || '-';
                        let secName = (st.section || st.sec || st.sectionName || '').trim();
                        if (!secName) {
                            const idKey = String(st.studentId || st.id || '').trim();
                            if (idKey && studentSectionMap[idKey]) {
                                secName = studentSectionMap[idKey];
                            } else if (st.class && st.roll) {
                                const comboKey = `${String(st.class).trim().toLowerCase()}___${String(st.roll).trim()}`;
                                if (studentSectionMap[comboKey]) {
                                    secName = studentSectionMap[comboKey];
                                }
                            }
                        }
                        const secDisplay = formatRoomTopshetSectionBn(secName);

                        rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;

                    });



                    tablesHtml += `

                        <div class="class-table-container">

                            <table class="class-table ${borderClass}">

                                <thead>

                                    <tr>

                                        <th colspan="2">${formatClassName(cls)}</th>

                                    </tr>

                                    <tr class="sub-header-row">

                                        <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>

                                        <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    ${rowsHtml}

                                </tbody>

                            </table>

                        </div>

                    `;

                });



                pagesHtml += `

                    <!-- Page Indicator Pill (Screen Preview Only) -->

                    <div class="no-print" style="margin-top: 15px; margin-bottom: 8px; font-weight: 800; font-size: 0.92rem; color: #6d28d9; background: #f3e8ff; padding: 5px 18px; border-radius: 20px; border: 1.5px solid #d8b4fe; box-shadow: 0 2px 6px rgba(109, 40, 217, 0.12); display: inline-flex; align-items: center; gap: 8px;">

                        <span>📋 রুম টপশীট #${roomIdx}: রুম নং ${roomNo} (${buildingName})</span>

                    </div>



                    <!-- A4 Paper Preview Sheet for Room -->

                    <div class="a4-page">

                        <div class="container">

                            <div>

                                <!-- Line 1: School Name -->

                                <div class="school-name">${schoolName}</div>



                                <!-- Line 2: Exam Name -->

                                <div class="exam-name">${activeExamName}</div>



                                <!-- Building Name -->

                                <div class="building-name">বিল্ডিং : ${buildingName}</div>



                                <!-- Line 3: Header Line -->

                                <div class="header-line-3">

                                    <div class="header-col-left">রুম নং: ${roomNo}</div>

                                    <div class="header-col-center">আসন বিন্যাস</div>

                                    <div class="header-col-right">শ্রেণি: ${classHeaderStr}</div>

                                </div>



                                <!-- Room Summary Info -->

                                <div class="summary-info">

                                    ${summaryText}

                                </div>



                                <!-- Separate Tables for Each Class -->

                                <div class="tables-wrapper">

                                    ${tablesHtml}

                                </div>

                            </div>



                            <!-- Footer Signatures Section -->

                            <div class="footer-signatures" style="margin-bottom: 0.5in;">

                                <div class="sig-col" style="display: none !important;">

                                    <div style="height: 0.86in;"></div>

                                    <div class="sig-line"></div>

                                    কক্ষ পরিদর্শক

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">

                                        ${prepSigImg}

                                    </div>

                                    <div class="sig-line" style="display: none !important;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">

                                        ${hmSigImg}

                                    </div>

                                    <div class="sig-line" style="display: none !important;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>

                                </div>

                            </div>

                        </div>

                    </div>

                `;"""

new_room_render_block = """                // Sort students inside each class group
                classes.forEach(cls => {
                    classGroup[cls].sort((a, b) => {
                        const idA = String(a.studentId || a.id || a.roll || '');
                        const idB = String(b.studentId || b.id || b.roll || '');
                        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                    });
                });

                // Paginate if student count exceeds single page height
                const maxRowsInRoom = Math.max(...classes.map(cls => classGroup[cls].length));
                const ROWS_PER_PAGE = 22;
                const totalRoomPages = Math.ceil(maxRowsInRoom / ROWS_PER_PAGE) || 1;

                for (let pageNum = 1; pageNum <= totalRoomPages; pageNum++) {
                    const startRow = (pageNum - 1) * ROWS_PER_PAGE;
                    const endRow = startRow + ROWS_PER_PAGE;

                    // Build Class Tables HTML for this page
                    let tablesHtml = '';
                    classes.forEach((cls, idx) => {
                        const fullList = classGroup[cls];
                        const pageSlice = fullList.slice(startRow, endRow);
                        if (pageSlice.length === 0 && fullList.length > 0 && pageNum > 1) {
                            return;
                        }

                        const borderClass = `class-border-${idx % 6}`;

                        let rowsHtml = '';
                        pageSlice.forEach(st => {
                            const studentId = st.studentId || st.id || st.roll || '-';
                            let secName = (st.section || st.sec || st.sectionName || '').trim();
                            if (!secName) {
                                const idKey = String(st.studentId || st.id || '').trim();
                                if (idKey && studentSectionMap[idKey]) {
                                    secName = studentSectionMap[idKey];
                                } else if (st.class && st.roll) {
                                    const comboKey = `${String(st.class).trim().toLowerCase()}___${String(st.roll).trim()}`;
                                    if (studentSectionMap[comboKey]) {
                                        secName = studentSectionMap[comboKey];
                                    }
                                }
                            }
                            const secDisplay = formatRoomTopshetSectionBn(secName);

                            rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;
                        });

                        tablesHtml += `
                            <div class="class-table-container">
                                <table class="class-table ${borderClass}">
                                    <thead>
                                        <tr>
                                            <th colspan="2">${formatClassName(cls)}</th>
                                        </tr>
                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    });

                    const pageIndicatorText = (totalRoomPages > 1)
                        ? `📋 রুম টপশীট #${roomIdx} (পৃষ্ঠা ${pageNum}/${totalRoomPages}): রুম নং ${roomNo} (${buildingName})`
                        : `📋 রুম টপশীট #${roomIdx}: রুম নং ${roomNo} (${buildingName})`;

                    const pageHeaderRoomStr = (totalRoomPages > 1)
                        ? `রুম নং: ${roomNo} (পৃষ্ঠা ${pageNum}/${totalRoomPages})`
                        : `রুম নং: ${roomNo}`;

                    pagesHtml += `
                        <!-- Page Indicator Pill (Screen Preview Only) -->
                        <div class="no-print" style="margin-top: 15px; margin-bottom: 8px; font-weight: 800; font-size: 0.92rem; color: #6d28d9; background: #f3e8ff; padding: 5px 18px; border-radius: 20px; border: 1.5px solid #d8b4fe; box-shadow: 0 2px 6px rgba(109, 40, 217, 0.12); display: inline-flex; align-items: center; gap: 8px;">
                            <span>${pageIndicatorText}</span>
                        </div>

                        <!-- A4 Paper Preview Sheet for Room -->
                        <div class="a4-page">
                            <div class="container">
                                <div>
                                    <!-- Line 1: School Name -->
                                    <div class="school-name">${schoolName}</div>

                                    <!-- Line 2: Exam Name -->
                                    <div class="exam-name">${activeExamName}</div>

                                    <!-- Building Name -->
                                    <div class="building-name">বিল্ডিং : ${buildingName}</div>

                                    <!-- Line 3: Header Line -->
                                    <div class="header-line-3">
                                        <div class="header-col-left">${pageHeaderRoomStr}</div>
                                        <div class="header-col-center">আসন বিন্যাস</div>
                                        <div class="header-col-right">শ্রেণি: ${classHeaderStr}</div>
                                    </div>

                                    <!-- Room Summary Info -->
                                    <div class="summary-info">
                                        ${summaryText}
                                    </div>

                                    <!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper">
                                        ${tablesHtml}
                                    </div>
                                </div>

                                <!-- Footer Signatures Section -->
                                <div class="footer-signatures" style="margin-bottom: 0.5in;">
                                    <div class="sig-col" style="display: none !important;">
                                        <div style="height: 0.86in;"></div>
                                        <div class="sig-line"></div>
                                        কক্ষ পরিদর্শক
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${prepSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${hmSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }"""

if old_room_render_block in room_text:
    room_text = room_text.replace(old_room_render_block, new_room_render_block, 1)
    print("[OK] Replaced render block with multi-page pagination in Room Seat Topshet.html")
else:
    print("[ERROR] Could not find exact old_room_render_block in Room Seat Topshet.html")
    sys.exit(1)

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_render_block = """                // Build Class Tables HTML
                let tablesHtml = '';
                classes.forEach((cls, idx) => {
                    const stList = classGroup[cls];
                    stList.sort((a, b) => {
                        const idA = String(a.studentId || a.id || a.roll || '');
                        const idB = String(b.studentId || b.id || b.roll || '');
                        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    const borderClass = `class-border-${idx % 6}`;

                    let rowsHtml = '';
                    stList.forEach(st => {
                        const studentId = st.studentId || st.id || st.roll || '-';
                        let secName = (st.section || st.sec || st.sectionName || '').trim();
                        if (!secName) {
                            const idKey = String(st.studentId || st.id || '').trim();
                            if (idKey && studentSectionMap[idKey]) {
                                secName = studentSectionMap[idKey];
                            } else if (st.class && st.roll) {
                                const comboKey = `${String(st.class).trim().toLowerCase()}___${String(st.roll).trim()}`;
                                if (studentSectionMap[comboKey]) {
                                    secName = studentSectionMap[comboKey];
                                }
                            }
                        }
                        const secDisplay = formatRoomTopshetSectionBn(secName);

                        rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;
                    });

                    tablesHtml += `
                        <div class="class-table-container">
                            <table class="class-table ${borderClass}">
                                <thead>
                                    <tr>
                                        <th colspan="2">${formatRoomTopshetClassName(cls)}</th>
                                    </tr>
                                    <tr class="sub-header-row">
                                        <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>
                                        <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    `;
                });

                pagesHtml += `
                    <!-- Page Indicator Pill (Screen Preview Only) -->
                    <div class="no-print" style="margin-top: 15px; margin-bottom: 8px; font-weight: 800; font-size: 0.92rem; color: #6d28d9; background: #f3e8ff; padding: 5px 18px; border-radius: 20px; border: 1.5px solid #d8b4fe; box-shadow: 0 2px 6px rgba(109, 40, 217, 0.12); display: inline-flex; align-items: center; gap: 8px;">
                        <span>📋 রুম টপশীট #${roomIdx}: রুম নং ${roomNo} (${buildingName})</span>
                    </div>

                    <!-- A4 Paper Preview Sheet for Room -->
                    <div class="a4-page">
                        <div class="container">
                            <div>
                                <!-- Line 1: School Name -->
                                <div class="school-name">${schoolName}</div>

                                <!-- Line 2: Exam Name -->
                                <div class="exam-name">${activeExamName}</div>

                                <!-- Building Name -->
                                <div class="building-name">বিল্ডিং : ${buildingName}</div>

                                <!-- Line 3: Header Line -->
                                <div class="header-line-3">
                                    <div class="header-col-left">রুম নং: ${roomNo}</div>
                                    <div class="header-col-center">আসন বিন্যাস</div>
                                    <div class="header-col-right">শ্রেণি: ${classHeaderStr}</div>
                                </div>

                                <!-- Room Summary Info -->
                                <div class="summary-info">
                                    ${summaryText}
                                </div>

                                <!-- Separate Tables for Each Class -->
                                <div class="tables-wrapper">
                                    ${tablesHtml}
                                </div>
                            </div>

                            <!-- Footer Signatures Section -->
                            <div class="footer-signatures" style="margin-bottom: 0.5in;">
                                <div class="sig-col" style="display: none !important;">
                                    <div style="height: 0.86in;"></div>
                                    <div class="sig-line"></div>
                                    কক্ষ পরিদর্শক
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                        ${prepSigImg}
                                    </div>
                                    <div class="sig-line" style="display: none !important;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                        ${hmSigImg}
                                    </div>
                                    <div class="sig-line" style="display: none !important;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;"""

new_seat_render_block = """                // Sort students inside each class group
                classes.forEach(cls => {
                    classGroup[cls].sort((a, b) => {
                        const idA = String(a.studentId || a.id || a.roll || '');
                        const idB = String(b.studentId || b.id || b.roll || '');
                        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                    });
                });

                // Paginate if student count exceeds single page height
                const maxRowsInRoom = Math.max(...classes.map(cls => classGroup[cls].length));
                const ROWS_PER_PAGE = 22;
                const totalRoomPages = Math.ceil(maxRowsInRoom / ROWS_PER_PAGE) || 1;

                for (let pageNum = 1; pageNum <= totalRoomPages; pageNum++) {
                    const startRow = (pageNum - 1) * ROWS_PER_PAGE;
                    const endRow = startRow + ROWS_PER_PAGE;

                    // Build Class Tables HTML for this page
                    let tablesHtml = '';
                    classes.forEach((cls, idx) => {
                        const fullList = classGroup[cls];
                        const pageSlice = fullList.slice(startRow, endRow);
                        if (pageSlice.length === 0 && fullList.length > 0 && pageNum > 1) {
                            return;
                        }

                        const borderClass = `class-border-${idx % 6}`;

                        let rowsHtml = '';
                        pageSlice.forEach(st => {
                            const studentId = st.studentId || st.id || st.roll || '-';
                            let secName = (st.section || st.sec || st.sectionName || '').trim();
                            if (!secName) {
                                const idKey = String(st.studentId || st.id || '').trim();
                                if (idKey && studentSectionMap[idKey]) {
                                    secName = studentSectionMap[idKey];
                                } else if (st.class && st.roll) {
                                    const comboKey = `${String(st.class).trim().toLowerCase()}___${String(st.roll).trim()}`;
                                    if (studentSectionMap[comboKey]) {
                                        secName = studentSectionMap[comboKey];
                                    }
                                }
                            }
                            const secDisplay = formatRoomTopshetSectionBn(secName);

                            rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;
                        });

                        tablesHtml += `
                            <div class="class-table-container">
                                <table class="class-table ${borderClass}">
                                    <thead>
                                        <tr>
                                            <th colspan="2">${formatRoomTopshetClassName(cls)}</th>
                                        </tr>
                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি (ID)</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা (Section):</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    });

                    const pageIndicatorText = (totalRoomPages > 1)
                        ? `📋 রুম টপশীট #${roomIdx} (পৃষ্ঠা ${pageNum}/${totalRoomPages}): রুম নং ${roomNo} (${buildingName})`
                        : `📋 রুম টপশীট #${roomIdx}: রুম নং ${roomNo} (${buildingName})`;

                    const pageHeaderRoomStr = (totalRoomPages > 1)
                        ? `রুম নং: ${roomNo} (পৃষ্ঠা ${pageNum}/${totalRoomPages})`
                        : `রুম নং: ${roomNo}`;

                    pagesHtml += `
                        <!-- Page Indicator Pill (Screen Preview Only) -->
                        <div class="no-print" style="margin-top: 15px; margin-bottom: 8px; font-weight: 800; font-size: 0.92rem; color: #6d28d9; background: #f3e8ff; padding: 5px 18px; border-radius: 20px; border: 1.5px solid #d8b4fe; box-shadow: 0 2px 6px rgba(109, 40, 217, 0.12); display: inline-flex; align-items: center; gap: 8px;">
                            <span>${pageIndicatorText}</span>
                        </div>

                        <!-- A4 Paper Preview Sheet for Room -->
                        <div class="a4-page">
                            <div class="container">
                                <div>
                                    <!-- Line 1: School Name -->
                                    <div class="school-name">${schoolName}</div>

                                    <!-- Line 2: Exam Name -->
                                    <div class="exam-name">${activeExamName}</div>

                                    <!-- Building Name -->
                                    <div class="building-name">বিল্ডিং : ${buildingName}</div>

                                    <!-- Line 3: Header Line -->
                                    <div class="header-line-3">
                                        <div class="header-col-left">${pageHeaderRoomStr}</div>
                                        <div class="header-col-center">আসন বিন্যাস</div>
                                        <div class="header-col-right">শ্রেণি: ${classHeaderStr}</div>
                                    </div>

                                    <!-- Room Summary Info -->
                                    <div class="summary-info">
                                        ${summaryText}
                                    </div>

                                    <!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper">
                                        ${tablesHtml}
                                    </div>
                                </div>

                                <!-- Footer Signatures Section -->
                                <div class="footer-signatures" style="margin-bottom: 0.5in;">
                                    <div class="sig-col" style="display: none !important;">
                                        <div style="height: 0.86in;"></div>
                                        <div class="sig-line"></div>
                                        কক্ষ পরিদর্শক
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${prepSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${hmSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }"""

if old_seat_render_block in seat_text:
    seat_text = seat_text.replace(old_seat_render_block, new_seat_render_block, 1)
    print("[OK] Replaced render block with multi-page pagination in seat-plan.html")
else:
    print("[ERROR] Could not find exact old_seat_render_block in seat-plan.html")
    sys.exit(1)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
