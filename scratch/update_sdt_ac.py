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

# 1. Student Data Topsheet.html
with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    sdt = f.read()

if 'function buildStudentLookupMap' not in sdt:
    sdt = sdt.replace('function safeJsonParse(key, fallback = null) {',
                      lookup_helper_code + '\n        function safeJsonParse(key, fallback = null) {')

sdt = re.sub(r'const\s+student\s*=\s*bench\[side\];\s*if\s*\(\s*student\s*&&',
             'const rawStudent = bench[side];\n                            const student = resolveAttendanceLiveStudent(rawStudent);\n                            if (student &&',
             sdt)

with open('Student Data Topsheet.html', 'w', encoding='utf-8') as f:
    f.write(sdt)
print("Updated Student Data Topsheet.html successfully.")

# 2. Admit Card.html
with open('Admit Card.html', 'r', encoding='utf-8') as f:
    ac = f.read()

if 'function buildStudentLookupMap' not in ac:
    ac = ac.replace('function renderAdmitCards() {',
                    lookup_helper_code + '\n        function renderAdmitCards() {')

with open('Admit Card.html', 'w', encoding='utf-8') as f:
    f.write(ac)
print("Updated Admit Card.html successfully.")
