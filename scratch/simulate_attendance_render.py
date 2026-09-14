# -*- coding: utf-8 -*-
import sys, sqlite3, json
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

def get_db_key(k):
    cursor.execute("SELECT value FROM local_storage_sync WHERE key=?", (k,))
    row = cursor.fetchone()
    if row and row[0]:
        try:
            return json.loads(row[0])
        except:
            return row[0]
    return None

store = get_db_key('school_seat_plans_store') or {}
savedAlloc = get_db_key('school_saved_seat_allocations') or {}
students = get_db_key('school_students') or []
routines = get_db_key('school_exam_routines') or []
settings = get_db_key('school_settings') or {}

# Extract all students
allStudents = []
if store and isinstance(store, dict) and len(store) > 0:
    for planKey, plan in store.items():
        if not plan or not plan.get('allocations'): continue
        planExamName = plan.get('examName') or 'বার্ষিক পরীক্ষা ২০২৬'
        planShift = plan.get('shift') or 'Morning Shift'

        for roomId, item in plan.get('allocations', {}).items():
            if item and item.get('benches') and isinstance(item.get('benches'), list):
                rNo = item.get('room', {}).get('number') if isinstance(item.get('room'), dict) else (item.get('room') or roomId)
                bldgName = item.get('building', {}).get('name') if isinstance(item.get('building'), dict) else 'একাডেমিক ভবন-ক'
                itemShift = item.get('shift') or planShift

                for b in item.get('benches', []):
                    for st in [b.get('left'), b.get('right')]:
                        if st:
                            stId = st.get('regNo') or st.get('studentId') or st.get('id') or st.get('roll')
                            if stId:
                                allStudents.append({
                                    'id': stId,
                                    'studentId': stId,
                                    'roll': int(st.get('roll', 0)) if str(st.get('roll', '')).isdigit() else (len(allStudents) + 1),
                                    'name': st.get('name') or st.get('nameBn') or '',
                                    'nameBn': st.get('nameBn') or st.get('name') or '',
                                    'class': st.get('class') or 'Nine',
                                    'shift': itemShift,
                                    'buildingName': bldgName,
                                    'roomNo': rNo,
                                    'examName': planExamName
                                })

print(f"Total allStudents: {len(allStudents)}")

# Let's test with classVal = 'all', examVal = 'all', shiftVal = 'all', langVal = 'en', searchVal = ''
classVal = 'all'
examVal = 'all'
shiftVal = 'all'
langVal = 'en'
searchVal = ''

filtered = allStudents

if classVal != 'all':
    reqClass = classVal.lower().strip()
    filtered = [s for s in filtered if reqClass in (s.get('class') or '').lower().strip() or (s.get('class') or '').lower().strip() in reqClass]

if examVal != 'all':
    reqExam = examVal.lower().strip()
    filtered = [s for s in filtered if reqExam in (s.get('examName') or '').lower().strip() or (s.get('examName') or '').lower().strip() in reqExam]

if shiftVal != 'all':
    reqShift = shiftVal.lower().strip()
    filtered = [s for s in filtered if reqShift in (s.get('shift') or '').lower().strip() or (s.get('shift') or '').lower().strip() in reqShift]

print(f"Total filtered students: {len(filtered)}")

pageGroupMap = {}
for st in filtered:
    eName = st.get('examName') or (examVal if examVal != 'all' else settings.get('examName', 'বার্ষিক পরীক্ষা ২০২৬'))
    sName = st.get('shift') or 'Morning Shift'
    bName = st.get('buildingName') or 'একাডেমিক ভবন-ক'
    rNo = st.get('roomNo') or '101'
    cName = st.get('class') or 'Nine'

    gKey = f"{eName}___{sName}___{bName}___{rNo}___{cName}"
    if gKey not in pageGroupMap:
        pageGroupMap[gKey] = {
            'examName': eName,
            'shiftName': sName,
            'buildingName': bName,
            'roomNo': rNo,
            'className': cName,
            'students': []
        }
    pageGroupMap[gKey]['students'].append(st)

print(f"Total groups formed: {len(pageGroupMap)}")
for k, g in list(pageGroupMap.items())[:5]:
    print(f"  Group {k}: {len(g['students'])} students")
