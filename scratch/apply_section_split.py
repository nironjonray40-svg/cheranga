# -*- coding: utf-8 -*-
import sys

# =========================================================================
# Updated updateSeatingDetailsLive function with Section division & new rows
# =========================================================================

new_update_seating_live_code = '''        function updateSeatingDetailsLive() {
            const settings = safeJsonParse('school_settings', null);
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);
            const store = safeJsonParse('school_seat_plans_store', {});

            const classVal = document.getElementById('seating-filter-class')?.value || 'all';
            const examVal = document.getElementById('seating-filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('seating-filter-shift')?.value || 'all';
            const langVal = document.getElementById('seating-filter-lang')?.value || 'bn';
            const searchVal = (document.getElementById('seating-search-student')?.value || '').trim().toLowerCase();

            // Build student section lookup map for robust section resolution
            const studentSectionMap = {};
            try {
                const allStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(allStudents)) {
                    allStudents.forEach(s => {
                        const sec = s.section || s.sec || s.sectionName || '';
                        if (sec) {
                            if (s.studentId) studentSectionMap[String(s.studentId).trim()] = sec.trim();
                            if (s.id) studentSectionMap[String(s.id).trim()] = sec.trim();
                            if (s.class && s.roll) {
                                studentSectionMap[`${String(s.class).trim().toLowerCase()}___${String(s.roll).trim()}`] = sec.trim();
                            }
                        }
                    });
                }
            } catch (e) {}

            let allocList = [];
            let planFoundForExam = false;

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.keys(store).forEach(planKey => {
                    const plan = store[planKey];
                    if (!plan || !plan.allocations) return;

                    let matchesExam = false;
                    if (examVal === 'all') {
                        matchesExam = true;
                    } else {
                        const cleanExam = examVal.toLowerCase().trim();
                        const cleanPlanKey = planKey.toLowerCase().trim();
                        const cleanPlanExam = (plan.examName || '').toLowerCase().trim();
                        matchesExam = (cleanPlanKey === cleanExam) || 
                                      (cleanPlanExam === cleanExam) || 
                                      (cleanPlanKey.includes(cleanExam) && cleanExam.length > 3) ||
                                      (cleanPlanExam.includes(cleanExam) && cleanExam.length > 3);
                    }

                    if (matchesExam) {
                        planFoundForExam = true;
                        Object.keys(plan.allocations).forEach(rId => {
                            const item = plan.allocations[rId];
                            if (item) {
                                const itemCopy = JSON.parse(JSON.stringify(item));
                                if (!itemCopy.shift && plan.shift) itemCopy.shift = plan.shift;
                                allocList.push({ rId, item: itemCopy });
                            }
                        });
                    }
                });
            }

            if (allocList.length === 0 && savedAlloc && typeof savedAlloc === 'object' && Object.keys(savedAlloc).length > 0) {
                if (examVal === 'all') {
                    Object.keys(savedAlloc).forEach(rId => {
                        const item = savedAlloc[rId];
                        if (item) allocList.push({ rId, item });
                    });
                }
            }

            // Show sample mock template ONLY when examVal is 'all' and no data exists anywhere in localStorage
            if (allocList.length === 0 && examVal === 'all' && !planFoundForExam && (!savedAlloc || Object.keys(savedAlloc).length === 0)) {
                allocList = [
                    {
                        rId: '201',
                        item: {
                            room: { number: '201' },
                            building: { name: 'একাডেমিক ভবন-ক' },
                            shift: 'Morning Shift',
                            benches: [
                                ...Array(9).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', roll: String(i + 1).padStart(2, '0'), studentId: '2026080' + (i + 1) } })),
                                ...Array(8).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'B', roll: String(i + 10).padStart(2, '0'), studentId: '202608' + (i + 10) } })),
                                ...Array(9).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', roll: String(i + 1).padStart(2, '0'), studentId: '2026060' + (i + 1) } })),
                                ...Array(8).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'খ', roll: String(i + 10).padStart(2, '0'), studentId: '202606' + (i + 10) } }))
                            ]
                        }
                    },
                    {
                        rId: '401',
                        item: {
                            room: { number: '401' },
                            building: { name: 'একাডেমিক ভবন-ক' },
                            shift: 'Morning Shift',
                            benches: [
                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', roll: String(109 + i), studentId: '202608' + (109 + i) } })),
                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', roll: String(66 + i), studentId: '202606' + (66 + i) } })),
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', section: 'বিজ্ঞান', roll: String(44 + i), studentId: '202610' + (44 + i) } }))
                            ]
                        }
                    },
                    {
                        rId: '501',
                        item: {
                            room: { number: '501' },
                            building: { name: 'গোলাপী ভবন' },
                            shift: 'Afternoon Shift',
                            benches: [
                                ...Array(8).fill(0).map((_, i) => ({ left: { class: 'সপ্তম (SEVEN)', section: 'A', roll: String(i + 1).padStart(2, '0'), studentId: '2026070' + (i + 1) } })),
                                ...Array(7).fill(0).map((_, i) => ({ left: { class: 'সপ্তম (SEVEN)', section: 'B', roll: String(i + 9).padStart(2, '0'), studentId: '2026070' + (i + 9) } })),
                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'নবম (NINE)', section: 'মানবিক', roll: String(i + 1).padStart(2, '0'), studentId: '2026090' + (i + 1) } }))
                            ]
                        }
                    }
                ];
            }

            const schoolName = settings?.schoolName || (document.getElementById('school-name')?.textContent?.trim()) || 'আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়';
            const activeExamName = (examVal !== 'all') ? examVal : (settings?.examName || 'বার্ষিক পরীক্ষা - ২০২৬');

            const customLogo = localStorage.getItem('school_logo');
            const logoUrl = customLogo || settings?.schoolLogo;
            const logoHtml = logoUrl 
                ? `<img src="${logoUrl}" alt="Logo" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
                : `<span id="seating-site-logo-icon">🎓</span>`;

            // Group rooms by shift and building for selected exam
            const pageGroupMap = {};
            let itemsToProcess = allocList;

            if (searchVal) {
                itemsToProcess = itemsToProcess.filter(({ rId, item }) => {
                    const rNo = String(item.room?.number || rId).toLowerCase();
                    return rNo.includes(searchVal);
                });
            }

            itemsToProcess.forEach(({ rId, item }) => {
                if (!item || !item.benches) return;
                let sName = item.shift || 'Morning Shift';
                if (!isSeatingShiftMatch(sName, shiftVal)) return;
                let bName = (item.building && item.building.name && item.building.name.trim()) ? item.building.name.trim() : 'একাডেমিক ভবন-ক';

                const groupKey = sName + '___' + bName;
                if (!pageGroupMap[groupKey]) {
                    pageGroupMap[groupKey] = {
                        shiftName: sName,
                        buildingName: bName,
                        roomList: []
                    };
                }
                pageGroupMap[groupKey].roomList.push({ rId, item });
            });

            const pagesContainer = document.getElementById('seating-pages-container');
            if (!pagesContainer) return;

            const groupKeys = Object.keys(pageGroupMap);
            if (groupKeys.length === 0) {
                const noDataMsg = (examVal !== 'all' && !planFoundForExam)
                    ? `উক্ত পরীক্ষা (${examVal}) এর জন্য কোন সংরক্ষিত সিটপ্ল্যান পাওয়া যায়নি (No saved seat plan data found).`
                    : `কোন তথ্য পাওয়া যায়নি (No matching data found for selected filters).`;

                pagesContainer.innerHTML = `<div style="background:#fff; padding:35px 20px; margin-top:25px; border-radius:10px; text-align:center; font-weight:700; color:#ef4444; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); border: 1.5px solid #fca5a5;">⚠️ ${noDataMsg}</div>`;
                return;
            }

            // Ensure Morning Shift comes first, then Afternoon Shift, and within each shift sort by building name
            groupKeys.sort((aKey, bKey) => {
                const groupA = pageGroupMap[aKey];
                const groupB = pageGroupMap[bKey];

                const isAMorning = /morning|sokal|সকাল|প্রভাতি/i.test(groupA.shiftName);
                const isBMorning = /morning|sokal|সকাল|প্রভাতি/i.test(groupB.shiftName);
                if (isAMorning && !isBMorning) return -1;
                if (!isAMorning && isBMorning) return 1;

                if (groupA.shiftName !== groupB.shiftName) {
                    return groupA.shiftName.localeCompare(groupB.shiftName);
                }

                return groupA.buildingName.localeCompare(groupB.buildingName, 'bn', { numeric: true });
            });

            let pagesHtml = '';
            let pageIdx = 1;

            groupKeys.forEach(gKey => {
                const { shiftName, buildingName, roomList } = pageGroupMap[gKey];
                let tbodyHtml = '';
                let sl = 1;
                let grandTotal = 0;

                roomList.forEach(({ rId, item }) => {
                    const roomNo = item.room ? item.room.number : rId;

                    // Group students in this room by Class and then by Section: { [class]: { [section]: [students] } }
                    const classGroup = {};
                    item.benches.forEach(b => {
                        [b.left, b.right].forEach(st => {
                            if (st) {
                                const c = st.class || st.className || 'Unassigned';
                                if (!isSeatingClassMatch(c, classVal)) return;

                                let sec = (st.section || st.sec || st.sectionName || '').trim();
                                if (!sec) {
                                    const idKey = String(st.studentId || st.id || '').trim();
                                    if (idKey && studentSectionMap[idKey]) {
                                        sec = studentSectionMap[idKey];
                                    } else {
                                        const crKey = `${String(c).trim().toLowerCase()}___${String(st.roll || '').trim()}`;
                                        if (studentSectionMap[crKey]) {
                                            sec = studentSectionMap[crKey];
                                        }
                                    }
                                }
                                if (!sec) sec = 'A';

                                if (!classGroup[c]) classGroup[c] = {};
                                if (!classGroup[c][sec]) classGroup[c][sec] = [];
                                classGroup[c][sec].push(st);
                            }
                        });
                    });

                    const classes = Object.keys(classGroup);
                    if (classes.length === 0) return;

                    // Calculate total table rows for this room across all classes and their sections
                    let totalRoomRows = 0;
                    classes.forEach(c => {
                        totalRoomRows += Object.keys(classGroup[c]).length;
                    });

                    let isFirstRowInRoom = true;

                    classes.forEach(cls => {
                        const secMap = classGroup[cls];
                        const sections = Object.keys(secMap);
                        const classRowCount = sections.length;

                        sections.forEach((sec, sIdx) => {
                            const stList = secMap[sec];
                            stList.sort((a, b) => {
                                const idA = String(a.studentId || a.id || a.roll || '');
                                const idB = String(b.studentId || b.id || b.roll || '');
                                return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                            });

                            const studentIds = stList.map(st => st.studentId || st.id || st.roll).filter(Boolean);
                            const idDisplay = studentIds.length > 0 ? studentIds.join(', ') : '-';
                            const total = stList.length;
                            grandTotal += total;

                            // Formatted Section Label
                            let secLabel = '';
                            if (langVal === 'en') secLabel = `Section: ${sec}`;
                            else if (langVal === 'both') secLabel = `শাখা (Section): ${sec}`;
                            else secLabel = `শাখা: ${sec}`;

                            tbodyHtml += '<tr>';

                            if (isFirstRowInRoom) {
                                tbodyHtml += `<td rowspan="${totalRoomRows}" style="vertical-align: middle; text-align: center; font-weight: 700;">${String(sl).padStart(2, '0')}</td>`;
                                tbodyHtml += `<td rowspan="${totalRoomRows}" style="vertical-align: middle; text-align: center; font-weight: 800;">${roomNo}</td>`;
                                isFirstRowInRoom = false;
                            }

                            if (sIdx === 0) {
                                tbodyHtml += `<td rowspan="${classRowCount}" style="vertical-align: middle; text-align: center; font-weight: 700;">${formatSeatingClassLabel(cls)}</td>`;
                            }

                            tbodyHtml += `<td style="text-align: left; padding: 6px 12px; line-height: 1.6;">
                                <div style="display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; font-weight: 800; font-size: 0.88em; padding: 1px 8px; border-radius: 4px; margin-right: 6px; box-shadow: 0 1px 3px rgba(2, 132, 199, 0.1);">
                                    ${secLabel}
                                </div>
                                <span style="font-weight: 600; color: #1e293b;">${idDisplay}</span>
                            </td>`;

                            tbodyHtml += `<td style="vertical-align: middle; text-align: center; font-weight: 700;">${total}</td>`;

                            tbodyHtml += '</tr>';
                        });
                    });

                    sl++;
                });

                if (sl === 1 || grandTotal === 0) return;

                const sText = shiftName === 'Morning Shift' ? 'সকাল' : (shiftName === 'Afternoon Shift' ? 'বিকাল' : shiftName);
                let shiftDisplay = '';
                if (langVal === 'en') shiftDisplay = 'Shift: ' + shiftName;
                else if (langVal === 'both') shiftDisplay = 'শিফট: ' + sText + ' (' + shiftName + ')';
                else shiftDisplay = 'শিফট: ' + sText;

                let bldgDisplay = '';
                if (langVal === 'en') bldgDisplay = 'Building : ' + buildingName;
                else if (langVal === 'both') bldgDisplay = 'বিল্ডিং / Building : ' + buildingName;
                else bldgDisplay = 'বিল্ডিং : ' + buildingName;

                let centerTitle = '<b>আসন বিন্যাস বিবরণী</b>';
                if (langVal === 'en') centerTitle = '<b>Seating Arrangement Details</b>';
                else if (langVal === 'both') centerTitle = '<b>আসন বিন্যাস বিবরণী / Details</b>';

                let grandTotalLabel = 'সর্বমোট পরীক্ষার্থী =';
                if (langVal === 'en') grandTotalLabel = 'Total Candidates =';
                else if (langVal === 'both') grandTotalLabel = 'সর্বমোট পরীক্ষার্থী / Total =';

                tbodyHtml += `
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 15px; font-weight: bold;">${grandTotalLabel}</td>
                        <td style="font-weight: bold;">${grandTotal}</td>
                    </tr>
                `;

                pagesHtml += `
                    <!-- Page Indicator Pill (Screen Preview Only) -->
                    <div class="no-print" style="margin-top: 30px; margin-bottom: 12px; font-weight: 800; font-size: 0.95rem; color: #0284c7; background: #e0f2fe; padding: 6px 20px; border-radius: 20px; border: 1.5px solid #7dd3fc; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15); display: inline-flex; align-items: center; gap: 8px;">
                        <span>📄 পৃষ্ঠা ${pageIdx} (${buildingName} - ${sText} শিফট)</span>
                    </div>

                    <div class="a4-page" style="margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); border: 1px solid #cbd5e1;">
                        <div class="details-container" style="position: relative;">
                            <!-- Website Logo Badge -->
                            <div class="header-logo-badge" style="position: absolute; left: 15px; top: calc(12px - 0.1in); width: 62px; height: 62px; background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 33px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); border: 2.5px solid #0284c7; z-index: 5;">
                                ${logoHtml}
                            </div>

                            <!-- School Header Title (Centered to the right of logo) -->
                            <div class="header-titles-wrapper" style="padding-left: 72px; text-align: center; margin-bottom: 4px;">
                                <div class="school-name">${schoolName}</div>
                                <div class="exam-name">${activeExamName}</div>
                            </div>

                            <!-- Full Page Margin Dashed Line Divider -->
                            <div class="header-dashed-divider" style="width: 100%; border-bottom: 2px dashed #000000; margin-top: 4px; margin-bottom: 12px;"></div>

                            <!-- Header Info Line (Full Page Margin Centered) -->
                            <div class="header-line-3">
                                <div class="header-col-left">${shiftDisplay}</div>
                                <div class="header-col-center">${centerTitle}</div>
                                <div class="header-col-right">${bldgDisplay}</div>
                            </div>

                            <!-- Summary Table for Shift & Building -->
                            <table class="summary-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="col-head-sl">${langVal === 'en' ? 'SL' : 'SL'}</th>
                                        <th rowspan="2" class="col-head-room">${langVal === 'en' ? 'Room No' : (langVal === 'both' ? 'রুম নং / Room' : 'রুম নং')}</th>
                                        <th rowspan="2" class="col-head-class">${langVal === 'en' ? 'Class' : (langVal === 'both' ? 'শ্রেণি / Class' : 'শ্রেণি')}</th>
                                        <th rowspan="2" class="col-head-rollrange">${langVal === 'en' ? 'Student ID' : (langVal === 'both' ? 'শিক্ষার্থীর আইডি / Student ID' : 'শিক্ষার্থীর আইডি')}</th>
                                        <th rowspan="2" class="col-head-total">${langVal === 'en' ? 'Total' : (langVal === 'both' ? 'মোট / Total' : 'মোট')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tbodyHtml}
                                </tbody>
                            </table>

                            <!-- Signatures Section -->
                            <div class="footer-signatures" style="display: none;">
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-1">কক্ষ পরিদর্শক</span>
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-2">প্রস্তুতকারী</span>
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-3">প্রধান শিক্ষক / পরীক্ষা নিয়ন্ত্রক</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                pageIdx++;
            });

            pagesContainer.innerHTML = pagesHtml;

            const currentFontSize = document.getElementById('seating-font-size-slider')?.value;
            if (currentFontSize) {
                updateSeatingDetailsFontSize(currentFontSize);
            }
        }'''


# 1. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

start_fn = seat_content.find('function updateSeatingDetailsLive() {')
end_fn = seat_content.find('function refreshSeatingDetailsData() {')

if start_fn != -1 and end_fn != -1:
    seat_content = seat_content[:start_fn] + new_update_seating_live_code.strip() + '\n\n        ' + seat_content[end_fn:]
    with open('seat-plan.html', 'w', encoding='utf-8') as f:
        f.write(seat_content)
    print("seat-plan.html updated with Section rows successfully!")
else:
    print("Markers not found in seat-plan.html")


# 2. Update standalone Seating arrangement details.html
with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    orig_content = f.read()

# In standalone file, replace element IDs appropriately (e.g. pages-container instead of seating-pages-container)
standalone_code = new_update_seating_live_code.replace('seating-filter-class', 'filter-class') \
                                              .replace('seating-filter-exam', 'filter-exam') \
                                              .replace('seating-filter-shift', 'filter-shift') \
                                              .replace('seating-filter-lang', 'filter-lang') \
                                              .replace('seating-search-student', 'search-student') \
                                              .replace('seating-pages-container', 'pages-container') \
                                              .replace('seating-font-size-slider', 'font-size-slider') \
                                              .replace('isSeatingShiftMatch', 'isShiftMatch') \
                                              .replace('isSeatingClassMatch', 'isClassMatch') \
                                              .replace('formatSeatingClassLabel', 'formatClassLabel') \
                                              .replace('updateSeatingDetailsFontSize', 'updateSeatingDetailsFontSize')

start_fn2 = orig_content.find('function updateSeatingDetailsLive() {')
end_fn2 = orig_content.find('document.addEventListener(\'DOMContentLoaded\', () => {')

if start_fn2 != -1 and end_fn2 != -1:
    orig_content = orig_content[:start_fn2] + standalone_code.strip() + '\n\n        ' + orig_content[end_fn2:]
    with open('Seating arrangement details.html', 'w', encoding='utf-8') as f:
        f.write(orig_content)
    print("Seating arrangement details.html updated with Section rows successfully!")
else:
    print("Markers not found in Seating arrangement details.html")
