# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

# Helper function to add
bn_func_code = """        function formatRoomTopshetSectionBn(sec) {
            if (!sec) return 'ক';
            const s = String(sec).trim();
            if (!s) return 'ক';

            const lower = s.toLowerCase();
            const letterMap = {
                'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', 'e': 'ঙ',
                'f': 'চ', 'g': 'ছ', 'h': 'জ', 'i': 'ঝ', 'j': 'ঞ'
            };
            if (letterMap[lower]) return letterMap[lower];

            const nameMap = {
                'sec-a': 'ক', 'sec a': 'ক', 'section a': 'ক',
                'sec-b': 'খ', 'sec b': 'খ', 'section b': 'খ',
                'sec-c': 'গ', 'sec c': 'গ', 'section c': 'গ',
                'sec-d': 'ঘ', 'sec d': 'ঘ', 'section d': 'ঘ',
                'science': 'বিজ্ঞান', 'humanities': 'মানবিক', 'arts': 'মানবিক',
                'commerce': 'ব্যবসায় শিক্ষা', 'business': 'ব্যবসায় শিক্ষা', 'business studies': 'ব্যবসায় শিক্ষা',
                'general': 'সাধারণ', 'vocational': 'ভোকেশনাল',
                'padma': 'পদ্মা', 'meghna': 'মেঘনা', 'jamuna': 'যমুনা', 'surma': 'সুরমা',
                'karnafuli': 'কর্ণফুলী', 'karnaphuli': 'কর্ণফুলী', 'tista': 'তিস্তা', 'teesta': 'তিস্তা',
                'rupsha': 'রূপসা', 'rupson': 'রূপসা',
                'rose': 'গোলাপ', 'golap': 'গোলাপ', 'beli': 'বেলী', 'belly': 'বেলী',
                'jaba': 'জবা', 'shapla': 'শাপলা', 'chameli': 'চামেলী', 'tagar': 'টগর',
                'hasnahena': 'হাসনাহেনা', 'bakul': 'বকুল', 'kadam': 'কদম',
                'sunflower': 'সূর্যমুখী', 'surjamukhi': 'সূর্যমুখী',
                'morning': 'প্রভাতি', 'prabhati': 'প্রভাতি', 'day': 'দিবা', 'diba': 'দিবা',
                'boys': 'বালক', 'girls': 'বালিকা'
            };
            if (nameMap[lower]) return nameMap[lower];

            if (/[\\u0980-\\u09FF]/.test(s)) {
                return s;
            }

            const cleanSec = lower.replace(/^(section|sec|শাখা)\\s*[-:]?\\s*/i, '').trim();
            if (letterMap[cleanSec]) return letterMap[cleanSec];
            if (nameMap[cleanSec]) return nameMap[cleanSec];

            return s;
        }"""

# Insert function before formatClassName or formatShiftLabel
if "function formatRoomTopshetSectionBn" not in room_text:
    room_text = room_text.replace("function formatShiftLabel", bn_func_code + "\n\n        function formatShiftLabel", 1)
    print("[OK] Added formatRoomTopshetSectionBn in Room Seat Topshet.html")

# Update table building logic in Room Seat Topshet.html
old_room_rows = """                        const studentId = st.studentId || st.id || st.roll || '-';
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

                        rowsHtml += `<tr><td>${studentId}</td><td>${secName}</td></tr>`;"""

new_room_rows = """                        const studentId = st.studentId || st.id || st.roll || '-';
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

                        rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;"""

if old_room_rows in room_text:
    room_text = room_text.replace(old_room_rows, new_room_rows, 1)
    print("[OK] Updated table rows to use formatRoomTopshetSectionBn in Room Seat Topshet.html")

# Update fallback mock data to Bengali section names
room_text = room_text.replace("section: 'A'", "section: 'ক'")
room_text = room_text.replace("section: 'B'", "section: 'খ'")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

# Insert function before formatRoomTopshetShiftLabel or formatRoomTopshetClassShort
if "function formatRoomTopshetSectionBn" not in seat_text:
    seat_text = seat_text.replace("function formatRoomTopshetShiftLabel", bn_func_code + "\n\n        function formatRoomTopshetShiftLabel", 1)
    print("[OK] Added formatRoomTopshetSectionBn in seat-plan.html")

old_seat_rows = """                        const studentId = st.studentId || st.id || st.roll || '-';
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

                        rowsHtml += `<tr><td>${studentId}</td><td>${secName}</td></tr>`;"""

new_seat_rows = """                        const studentId = st.studentId || st.id || st.roll || '-';
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

                        rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;"""

if old_seat_rows in seat_text:
    seat_text = seat_text.replace(old_seat_rows, new_seat_rows, 1)
    print("[OK] Updated table rows to use formatRoomTopshetSectionBn in seat-plan.html")

# Update fallback mock data for topshet in seat-plan.html
old_seat_top_mock = """...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', studentId: '26070' + String(i + 1).padStart(2, '0') } })),"""
new_seat_top_mock = """...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'ক', studentId: '26070' + String(i + 1).padStart(2, '0') } })),"""
if old_seat_top_mock in seat_text:
    seat_text = seat_text.replace(old_seat_top_mock, new_seat_top_mock, 1)

old_seat_top_mock2 = """...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'B', studentId: '26071' + String(i + 1).padStart(2, '0') } })),"""
new_seat_top_mock2 = """...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'খ', studentId: '26071' + String(i + 1).padStart(2, '0') } })),"""
if old_seat_top_mock2 in seat_text:
    seat_text = seat_text.replace(old_seat_top_mock2, new_seat_top_mock2, 1)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")
