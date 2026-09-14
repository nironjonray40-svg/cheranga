# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

# Add studentSectionMap and mock sections if needed
old_room_alloc_start = """            let allocList = [];

            let planFoundForExam = false;"""

new_room_alloc_start = """            // Build student section lookup map for robust section resolution
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

            let planFoundForExam = false;"""

if old_room_alloc_start in room_text:
    room_text = room_text.replace(old_room_alloc_start, new_room_alloc_start, 1)
    print("[OK] Added studentSectionMap in Room Seat Topshet.html")

# Update mock data with sections in Room Seat Topshet.html
old_room_mock = """                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', studentId: '26070' + String(i + 1).padStart(2, '0') } })),

                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', studentId: '26060' + String(i + 1).padStart(2, '0') } })),

                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', studentId: '26080' + String(i + 1).padStart(2, '0') } }))"""

new_room_mock = """                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', studentId: '26070' + String(i + 1).padStart(2, '0') } })),

                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', studentId: '26060' + String(i + 1).padStart(2, '0') } })),

                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', section: 'বিজ্ঞান', studentId: '26080' + String(i + 1).padStart(2, '0') } }))"""

if old_room_mock in room_text:
    room_text = room_text.replace(old_room_mock, new_room_mock, 1)
    print("[OK] Updated mock room 401 in Room Seat Topshet.html")

old_room_mock2 = """                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', studentId: '26071' + String(i + 1).padStart(2, '0') } })),

                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', studentId: '26061' + String(i + 1).padStart(2, '0') } }))"""

new_room_mock2 = """                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'B', studentId: '26071' + String(i + 1).padStart(2, '0') } })),

                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'খ', studentId: '26061' + String(i + 1).padStart(2, '0') } }))"""

if old_room_mock2 in room_text:
    room_text = room_text.replace(old_room_mock2, new_room_mock2, 1)
    print("[OK] Updated mock room 201 in Room Seat Topshet.html")

# Update table building logic in Room Seat Topshet.html
old_room_table_build = """                    let rowsHtml = '';

                    stList.forEach(st => {

                        const studentId = st.studentId || st.id || st.roll || '-';

                        rowsHtml += `<tr><td>${studentId}</td></tr>`;

                    });



                    tablesHtml += `

                        <div class="class-table-container">

                            <table class="class-table ${borderClass}">

                                <thead>

                                    <tr>

                                        <th>${formatClassName(cls)}</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    ${rowsHtml}

                                </tbody>

                            </table>

                        </div>

                    `;"""

new_room_table_build = """                    let rowsHtml = '';

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
                        if (!secName) secName = 'A';

                        rowsHtml += `<tr><td>${studentId}</td><td>${secName}</td></tr>`;

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

                    `;"""

if old_room_table_build in room_text:
    room_text = room_text.replace(old_room_table_build, new_room_table_build, 1)
    print("[OK] Updated table generation with section column in Room Seat Topshet.html")
else:
    print("[WARN] Exact match failed for table build in Room Seat Topshet.html, attempting flexible replace")
    # flexible regex
    pattern = r"let rowsHtml = '';\s*stList\.forEach\(st => \{\s*const studentId = st\.studentId \|\| st\.id \|\| st\.roll \|\| '-';\s*rowsHtml \+= `<tr><td>\$\{studentId\}<\/td><\/tr>`;\s*\}\);\s*tablesHtml \+= `\s*<div class=\"class-table-container\">\s*<table class=\"class-table \$\{borderClass\}\">\s*<thead>\s*<tr>\s*<th>\$\{formatClassName\(cls\)\}<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>\s*\$\{rowsHtml\}\s*<\/tbody>\s*<\/table>\s*<\/div>\s*`;"
    room_text = re.sub(pattern, new_room_table_build, room_text)

# Update CSS in Room Seat Topshet.html
old_room_css_th = """.class-table th {

            padding: 6px 4px;

            font-size: 12.1pt;

            font-weight: bold;

            text-align: center;

            background-color: #ffffff;

            border: 1px solid #cbd5e0;

        }"""

new_room_css_th = """.class-table th {

            padding: 5px 4px;

            font-size: 12.1pt;

            font-weight: bold;

            text-align: center;

            background-color: #ffffff;

            border: 1px solid #cbd5e0;

        }

        .class-table tr.sub-header-row th {

            font-size: 10.5pt;

            font-weight: bold;

            background-color: #f8fafc;

            padding: 4px 4px;

            color: #1e293b;

        }"""

if old_room_css_th in room_text:
    room_text = room_text.replace(old_room_css_th, new_room_css_th, 1)
    print("[OK] Updated CSS th in Room Seat Topshet.html")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

# Add studentSectionMap in updateRoomTopshetLive if not present
old_seat_alloc_start = """            let allocList = [];
            let planFoundForExam = false;"""

# Check where updateRoomTopshetLive is in seat-plan.html
old_seat_alloc_in_func = """        function updateRoomTopshetLive() {
            const settings = safeJsonParse('school_settings', null);
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);
            const store = safeJsonParse('school_seat_plans_store', {});

            const classVal = document.getElementById('room-topshet-filter-class')?.value || 'all';
            const examVal = document.getElementById('room-topshet-filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('room-topshet-filter-shift')?.value || 'all';
            const searchVal = (document.getElementById('room-topshet-search-student')?.value || '').trim().toLowerCase();

            let allocList = [];
            let planFoundForExam = false;"""

new_seat_alloc_in_func = """        function updateRoomTopshetLive() {
            const settings = safeJsonParse('school_settings', null);
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);
            const store = safeJsonParse('school_seat_plans_store', {});

            const classVal = document.getElementById('room-topshet-filter-class')?.value || 'all';
            const examVal = document.getElementById('room-topshet-filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('room-topshet-filter-shift')?.value || 'all';
            const searchVal = (document.getElementById('room-topshet-search-student')?.value || '').trim().toLowerCase();

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
            let planFoundForExam = false;"""

if old_seat_alloc_in_func in seat_text:
    seat_text = seat_text.replace(old_seat_alloc_in_func, new_seat_alloc_in_func, 1)
    print("[OK] Added studentSectionMap in seat-plan.html updateRoomTopshetLive")

# Update mock data in seat-plan.html
old_seat_mock = """                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', studentId: '26070' + String(i + 1).padStart(2, '0') } })),
                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', studentId: '26060' + String(i + 1).padStart(2, '0') } })),
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', studentId: '26080' + String(i + 1).padStart(2, '0') } }))"""

new_seat_mock = """                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', studentId: '26070' + String(i + 1).padStart(2, '0') } })),
                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', studentId: '26060' + String(i + 1).padStart(2, '0') } })),
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', section: 'বিজ্ঞান', studentId: '26080' + String(i + 1).padStart(2, '0') } }))"""

if old_seat_mock in seat_text:
    seat_text = seat_text.replace(old_seat_mock, new_seat_mock, 1)
    print("[OK] Updated mock room 401 in seat-plan.html")

old_seat_mock2 = """                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', studentId: '26071' + String(i + 1).padStart(2, '0') } })),
                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', studentId: '26061' + String(i + 1).padStart(2, '0') } }))"""

new_seat_mock2 = """                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'B', studentId: '26071' + String(i + 1).padStart(2, '0') } })),
                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'খ', studentId: '26061' + String(i + 1).padStart(2, '0') } }))"""

if old_seat_mock2 in seat_text:
    seat_text = seat_text.replace(old_seat_mock2, new_seat_mock2, 1)
    print("[OK] Updated mock room 201 in seat-plan.html")

# Update table building logic in seat-plan.html
old_seat_table_build = """                    let rowsHtml = '';
                    stList.forEach(st => {
                        const studentId = st.studentId || st.id || st.roll || '-';
                        rowsHtml += `<tr><td>${studentId}</td></tr>`;
                    });

                    tablesHtml += `
                        <div class="class-table-container">
                            <table class="class-table ${borderClass}">
                                <thead>
                                    <tr>
                                        <th>${formatRoomTopshetClassName(cls)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    `;"""

new_seat_table_build = """                    let rowsHtml = '';
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
                        if (!secName) secName = 'A';

                        rowsHtml += `<tr><td>${studentId}</td><td>${secName}</td></tr>`;
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
                    `;"""

if old_seat_table_build in seat_text:
    seat_text = seat_text.replace(old_seat_table_build, new_seat_table_build, 1)
    print("[OK] Updated table generation with section column in seat-plan.html")

# Update CSS in seat-plan.html
old_seat_css_th = """        #subview-room-topshet .class-table th {
            padding: 6px 4px;
            font-size: 12.1pt;
            font-weight: bold;
            text-align: center;
            background-color: #ffffff;
            border: 1px solid #cbd5e0;
            color: #000000;
        }"""

new_seat_css_th = """        #subview-room-topshet .class-table th {
            padding: 5px 4px;
            font-size: 12.1pt;
            font-weight: bold;
            text-align: center;
            background-color: #ffffff;
            border: 1px solid #cbd5e0;
            color: #000000;
        }

        #subview-room-topshet .class-table tr.sub-header-row th {
            font-size: 10.5pt;
            font-weight: bold;
            background-color: #f8fafc;
            padding: 4px 4px;
            color: #1e293b;
        }"""

if old_seat_css_th in seat_text:
    seat_text = seat_text.replace(old_seat_css_th, new_seat_css_th, 1)
    print("[OK] Updated CSS th in seat-plan.html")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
