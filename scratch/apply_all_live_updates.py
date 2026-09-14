import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

lookup_helper_code = '''
        function buildStudentLookupMap() {
            const map = {
                byId: new Map(),
                byReg: new Map(),
                byNameClass: new Map()
            };
            try {
                const list = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(list)) {
                    list.forEach(s => {
                        if (!s) return;
                        if (s.id) map.byId.set(String(s.id).trim(), s);
                        if (s.regNo) map.byReg.set(String(s.regNo).trim(), s);
                        const cKey = String(s.class || '').trim().toLowerCase();
                        const nKey = String(s.name || '').trim().toLowerCase();
                        const nbKey = String(s.nameBn || '').trim().toLowerCase();
                        const rKey = String(s.roll || '').trim();
                        if (cKey && nKey) map.byNameClass.set(`${cKey}___${nKey}`, s);
                        if (cKey && nbKey) map.byNameClass.set(`${cKey}___${nbKey}`, s);
                        if (cKey && rKey) map.byNameClass.set(`${cKey}___roll_${rKey}`, s);
                    });
                }
            } catch (e) {}
            return map;
        }

        function resolveAttendanceLiveStudent(st, studentLookupMap = null) {
            if (!st || typeof st !== 'object') return st;
            const lookup = studentLookupMap || (typeof window !== 'undefined' && window.__currentStudentLookupMap) || buildStudentLookupMap();
            let live = null;
            if (st.id && lookup.byId && lookup.byId.has(String(st.id).trim())) {
                live = lookup.byId.get(String(st.id).trim());
            } else if (st.regNo && lookup.byReg && lookup.byReg.has(String(st.regNo).trim())) {
                live = lookup.byReg.get(String(st.regNo).trim());
            } else {
                const cKey = String(st.class || st.className || '').trim().toLowerCase();
                const nKey = String(st.name || '').trim().toLowerCase();
                const nbKey = String(st.nameBn || '').trim().toLowerCase();
                const rKey = String(st.roll || '').trim();
                if (cKey && nKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nKey}`);
                } else if (cKey && nbKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nbKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nbKey}`);
                } else if (cKey && rKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___roll_${rKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___roll_${rKey}`);
                }
            }

            let finalId = '';
            if (live) {
                finalId = live.studentId || (live.roll && !isNaN(parseInt(live.roll)) ? String(parseInt(live.roll)).padStart(4, '0') : '');
            }
            if (!finalId) {
                finalId = st.studentId || '';
            }
            if (!finalId || finalId.startsWith('178') || finalId.length > 10) {
                if (st.roll && !isNaN(parseInt(st.roll))) {
                    finalId = String(parseInt(st.roll)).padStart(4, '0');
                } else if (st.regNo && String(st.regNo).trim()) {
                    finalId = String(st.regNo).trim();
                } else {
                    finalId = '-';
                }
            }

            return {
                ...st,
                studentId: finalId,
                roll: live ? (live.roll || st.roll) : st.roll,
                regNo: live ? (live.regNo || st.regNo) : st.regNo,
                name: live ? (live.name || st.name) : st.name,
                nameBn: live ? (live.nameBn || st.nameBn) : st.nameBn,
                class: live ? (live.class || st.class) : st.class,
                section: live ? (live.section || st.section) : st.section,
                gender: live ? (live.gender || st.gender) : st.gender,
                religion: live ? (live.religion || st.religion) : st.religion,
                optionalSubject: live ? (live.optionalSubject || st.optionalSubject) : st.optionalSubject
            };
        }
'''

# -------------------------------------------------------------
# 1. Update Student attendance sheet.html
# -------------------------------------------------------------
with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    att_html = f.read()

if 'function buildStudentLookupMap' not in att_html:
    new_get_all = lookup_helper_code + '''
        function getAllStudentsList() {
            let allStudents = [];
            const studentLookup = buildStudentLookupMap();
            window.__currentStudentLookupMap = studentLookup;
            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);'''
    att_html = re.sub(r'function\s+getAllStudentsList\s*\(\)\s*\{\s*let\s+allStudents\s*=\s*\[\];\s*const\s+store\s*=\s*safeJsonParse\(\s*[\'"]school_seat_plans_store[\'"]', 
                      new_get_all.strip(), att_html, count=1)

att_html = re.sub(r'const\s+stId\s*=\s*st\.studentId\s*\|\|\s*st\.id\s*\|\|\s*\(\s*[\'"]2026[\'"]\s*\+\s*String\(\s*st\.roll[^;]+;', 
                  'const liveResolved = resolveAttendanceLiveStudent(st);\n                            const stId = (langVal === "bn") ? toBnNum(liveResolved.studentId || "-") : (liveResolved.studentId || "-");', 
                  att_html)

with open('Student attendance sheet.html', 'w', encoding='utf-8') as f:
    f.write(att_html)
print("Updated Student attendance sheet.html successfully.")

# -------------------------------------------------------------
# 2. Update seat-plan.html
# -------------------------------------------------------------
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp_html = f.read()

if 'function buildAttendanceStudentLookupMap' not in sp_html:
    new_sp_get_all = '''function buildAttendanceStudentLookupMap() {
            const map = {
                byId: new Map(),
                byReg: new Map(),
                byNameClass: new Map()
            };
            try {
                const list = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(list)) {
                    list.forEach(s => {
                        if (!s) return;
                        if (s.id) map.byId.set(String(s.id).trim(), s);
                        if (s.regNo) map.byReg.set(String(s.regNo).trim(), s);
                        const cKey = String(s.class || '').trim().toLowerCase();
                        const nKey = String(s.name || '').trim().toLowerCase();
                        const nbKey = String(s.nameBn || '').trim().toLowerCase();
                        const rKey = String(s.roll || '').trim();
                        if (cKey && nKey) map.byNameClass.set(`${cKey}___${nKey}`, s);
                        if (cKey && nbKey) map.byNameClass.set(`${cKey}___${nbKey}`, s);
                        if (cKey && rKey) map.byNameClass.set(`${cKey}___roll_${rKey}`, s);
                    });
                }
            } catch (e) {}
            return map;
        }

        function resolveAttendanceLiveStudent(st, studentLookupMap = null) {
            if (!st || typeof st !== 'object') return st;
            const lookup = studentLookupMap || (typeof window !== 'undefined' && window.__currentAttendanceLookupMap) || buildAttendanceStudentLookupMap();
            let live = null;
            if (st.id && lookup.byId && lookup.byId.has(String(st.id).trim())) {
                live = lookup.byId.get(String(st.id).trim());
            } else if (st.regNo && lookup.byReg && lookup.byReg.has(String(st.regNo).trim())) {
                live = lookup.byReg.get(String(st.regNo).trim());
            } else {
                const cKey = String(st.class || st.className || '').trim().toLowerCase();
                const nKey = String(st.name || '').trim().toLowerCase();
                const nbKey = String(st.nameBn || '').trim().toLowerCase();
                const rKey = String(st.roll || '').trim();
                if (cKey && nKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nKey}`);
                } else if (cKey && nbKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nbKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nbKey}`);
                } else if (cKey && rKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___roll_${rKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___roll_${rKey}`);
                }
            }

            let finalId = '';
            if (live) {
                finalId = live.studentId || (live.roll && !isNaN(parseInt(live.roll)) ? String(parseInt(live.roll)).padStart(4, '0') : '');
            }
            if (!finalId) {
                finalId = st.studentId || '';
            }
            if (!finalId || finalId.startsWith('178') || finalId.length > 10) {
                if (st.roll && !isNaN(parseInt(st.roll))) {
                    finalId = String(parseInt(st.roll)).padStart(4, '0');
                } else if (st.regNo && String(st.regNo).trim()) {
                    finalId = String(st.regNo).trim();
                } else {
                    finalId = '-';
                }
            }

            return {
                ...st,
                studentId: finalId,
                roll: live ? (live.roll || st.roll) : st.roll,
                regNo: live ? (live.regNo || st.regNo) : st.regNo,
                name: live ? (live.name || st.name) : st.name,
                nameBn: live ? (live.nameBn || st.nameBn) : st.nameBn,
                class: live ? (live.class || st.class) : st.class,
                section: live ? (live.section || st.section) : st.section,
                gender: live ? (live.gender || st.gender) : st.gender,
                religion: live ? (live.religion || st.religion) : st.religion,
                optionalSubject: live ? (live.optionalSubject || st.optionalSubject) : st.optionalSubject
            };
        }

        function getAttendanceAllStudentsList() {
            let allStudents = [];
            const studentLookup = buildAttendanceStudentLookupMap();
            window.__currentAttendanceLookupMap = studentLookup;
            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);'''
    sp_html = re.sub(r'function\s+getAttendanceAllStudentsList\s*\(\)\s*\{\s*let\s+allStudents\s*=\s*\[\];\s*const\s+store\s*=\s*safeJsonParse\(\s*[\'"]school_seat_plans_store[\'"]',
                     new_sp_get_all.strip(), sp_html, count=1)

sp_html = re.sub(r'const\s+stId\s*=\s*st\.studentId\s*\|\|\s*st\.id\s*\|\|\s*\(\s*[\'"]2026[\'"]\s*\+\s*String\(\s*st\.roll[^;]+;',
                  'const liveResolved = resolveAttendanceLiveStudent(st);\n                            const stId = (langVal === "bn") ? toBnNum(liveResolved.studentId || "-") : (liveResolved.studentId || "-");',
                  sp_html)

sp_html = re.sub(r'const\s+studentId\s*=\s*st\.studentId\s*\|\|\s*st\.id\s*\|\|\s*st\.roll\s*\|\|\s*[\'"]-[\'"]\s*;',
                  'const liveResolved = resolveAttendanceLiveStudent(st);\n                            const studentId = liveResolved.studentId || "-";',
                  sp_html)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(sp_html)
print("Updated seat-plan.html successfully.")

# -------------------------------------------------------------
# 3. Update Room Seat Topshet.html
# -------------------------------------------------------------
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    rt_html = f.read()

if 'function buildStudentLookupMap' not in rt_html:
    rt_html = rt_html.replace('function safeJsonParse(key, fallback = null) {', 
                              lookup_helper_code + '\n        function safeJsonParse(key, fallback = null) {')

rt_html = re.sub(r'const\s+studentId\s*=\s*st\.studentId\s*\|\|\s*st\.id\s*\|\|\s*st\.roll\s*\|\|\s*[\'"]-[\'"]\s*;',
                 'const liveResolved = resolveAttendanceLiveStudent(st);\n                            const studentId = liveResolved.studentId || "-";',
                 rt_html)

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(rt_html)
print("Updated Room Seat Topshet.html successfully.")

# -------------------------------------------------------------
# 4. Update Seating arrangement details.html
# -------------------------------------------------------------
with open('Seating arrangement details.html', 'r', encoding='utf-8') as f:
    sad_html = f.read()

if 'function buildStudentLookupMap' not in sad_html:
    sad_html = sad_html.replace('function safeJsonParse(key, fallback = null) {',
                                lookup_helper_code + '\n        function safeJsonParse(key, fallback = null) {')

sad_html = re.sub(r'const\s+studentIds\s*=\s*stList\.map\(\s*st\s*=>\s*st\.studentId[^)]+\)\.filter\(Boolean\);',
                  'const studentIds = stList.map(st => resolveAttendanceLiveStudent(st).studentId).filter(Boolean);',
                  sad_html)

with open('Seating arrangement details.html', 'w', encoding='utf-8') as f:
    f.write(sad_html)
print("Updated Seating arrangement details.html successfully.")

print("\nALL FILES SUCCESSFULLY UPDATED WITH REAL-TIME LIVE SYNC!")
