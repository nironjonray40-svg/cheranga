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

# Let's run the exact logic of getAttendanceAllStudentsList()
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

print(f"Total extracted students by getAttendanceAllStudentsList: {len(allStudents)}")
if allStudents:
    print("Sample student 0:", allStudents[0])
    print("Sample student -1:", allStudents[-1])
    
    # Check classes in allStudents
    print("Classes in allStudents:", set(s['class'] for s in allStudents))
    print("Exams in allStudents:", set(s['examName'] for s in allStudents))
    print("Shifts in allStudents:", set(s['shift'] for s in allStudents))
