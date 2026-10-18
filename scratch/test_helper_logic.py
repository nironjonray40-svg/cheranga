import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
db = dict(c.fetchall())

schedules = json.loads(db.get('school_exam_schedules', '[]'))
marks = json.loads(db.get('school_student_marks', '{}'))
students = json.loads(db.get('school_students', '[]'))

def get_student_marks(st, sch, exam_name):
    st_ids = [st.get('id'), st.get('studentId'), st.get('regNo'), str(st.get('roll'))]
    st_ids = [x for x in st_ids if x]
    sch_id = str(sch.get('id'))
    sub_code = str(sch.get('code') or '')
    sub_name = sch.get('subject') or ''
    
    mark_record = None
    for sid in st_ids:
        k = f"marks_{sid}_{sch_id}"
        if k in marks:
            mark_record = marks[k]
            break
    if not mark_record:
        for sid in st_ids:
            k = f"marks_{sid}_{exam_name}"
            if k in marks:
                mark_record = marks[k]
                break
    
    if not mark_record:
        return {'hasMarks': False, 'mcq': '', 'cq': '', 'pr': '', 'total': None}
        
    mark_data = None
    if isinstance(mark_record, dict):
        if sub_code and sub_code in mark_record:
            mark_data = mark_record[sub_code]
        elif sub_name in mark_record:
            mark_data = mark_record[sub_name]
        else:
            for k in mark_record:
                if k.lower() in sub_name.lower() or sub_name.lower() in k.lower():
                    mark_data = mark_record[k]
                    break
        if not mark_data and len(mark_record) == 1:
            first_v = list(mark_record.values())[0]
            if isinstance(first_v, dict):
                mark_data = first_v
    
    if not mark_data:
        return {'hasMarks': False, 'mcq': '', 'cq': '', 'pr': '', 'total': None}
        
    is_abs = mark_data.get('isAbsent', False)
    return {
        'hasMarks': True,
        'isAbsent': is_abs,
        'mcq': mark_data.get('mcq', ''),
        'cq': mark_data.get('cq', ''),
        'pr': mark_data.get('practical', ''),
        'total': mark_data.get('total')
    }

# Test 1: Elegileble test, Class Eight, Section A, Student 1
st1 = next((s for s in students if s.get('class') == 'Eight' and s.get('section') == 'A' and str(s.get('roll')) == '1'), None)
eight_schedules = [s for s in schedules if s.get('term') == 'Elegileble test' and s.get('class') == 'Eight']

with open('scratch/helper_test_result.txt', 'w', encoding='utf-8') as out:
    out.write(f"=== TEST 1: Elegileble test (Eight, Sec A, Roll 1: {st1.get('name')}) ===\n")
    for sch in eight_schedules:
        m = get_student_marks(st1, sch, 'Elegileble test')
        out.write(f"  {sch.get('subject')}: mcq={m['mcq']}, cq={m['cq']}, pr={m['pr']}, total={m['total']}, hasMarks={m['hasMarks']}, isAbsent={m.get('isAbsent')}\n")

    # Test 2: বার্ষিক পরীক্ষা, Class Six, Section A, Student 1
    st_six = next((s for s in students if s.get('class') == 'Six' and s.get('section') == 'A' and (str(s.get('roll')) == '1' or str(s.get('roll')) == 'General')), None)
    six_schedules = [s for s in schedules if s.get('term') == 'বার্ষিক পরীক্ষা' and s.get('class') == 'Six']
    out.write(f"\n=== TEST 2: বার্ষিক পরীক্ষা (Six, Sec A, Student: {st_six.get('name') if st_six else 'None'}) ===\n")
    for sch in six_schedules:
        m = get_student_marks(st_six, sch, 'বার্ষিক পরীক্ষা')
        out.write(f"  {sch.get('subject')} (id {sch.get('id')}): mcq={m['mcq']}, cq={m['cq']}, pr={m['pr']}, total={m['total']}, hasMarks={m['hasMarks']}\n")

print("Done")
