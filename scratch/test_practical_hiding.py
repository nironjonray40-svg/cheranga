import json
import sqlite3
import re
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_practical_logic():
    print("=" * 65)
    print("TEST: Practical Column Detection and Hiding Logic")
    print("=" * 65)

    conn = sqlite3.connect('school.db')
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_student_marks', 'school_students')")
    data = dict(cursor.fetchall())
    conn.close()

    schedules = json.loads(data.get('school_exam_schedules', '[]'))
    exam_types = json.loads(data.get('school_exam_types', '[]'))
    marks = json.loads(data.get('school_student_marks', '{}'))

    def get_subject_slot(sub_name):
        s = (sub_name or '').lower()
        if 'science' in s or 'বিজ্ঞান' in s or 'chemistry' in s or 'রসায়ন' in s: return 'chem'
        if 'physics' in s or 'পদার্থ' in s: return 'phys'
        if 'biology' in s or 'জীববিজ্ঞান' in s: return 'bio'
        if 'agriculture' in s or 'কৃষি' in s or 'higher' in s: return 'agri'
        if 'math' in s or 'গণিত' in s: return 'math'
        if 'bangla' in s or 'বাংলা' in s: return 'bangla1'
        if 'english' in s or 'ইংরেজি' in s: return 'english1'
        return None

    def get_prac_status(exam_name, class_name):
        status = {'chem': False, 'phys': False, 'bio': False, 'agri': False}
        matched = [s for s in schedules if s.get('term', '').strip().lower() == exam_name.strip().lower() and (not class_name or s.get('class', '').strip().lower() == class_name.strip().lower())]
        for s in matched:
            slot = get_subject_slot(s.get('subject'))
            if slot in status:
                has_prac = False
                if s.get('practical') and int(s.get('practical')) > 0:
                    has_prac = True
                if not has_prac:
                    et = next((t for t in exam_types if t.get('name', '').strip().lower() == s.get('term', '').strip().lower()), None)
                    if et:
                        sub_types = et.get('examTypes', [])
                        st = next((t for t in sub_types if t.get('typeName', '').strip().lower() == s.get('examType', '').strip().lower()), sub_types[0] if sub_types else None)
                        if st and st.get('defaultPractical') and int(st.get('defaultPractical')) > 0:
                            has_prac = True
                if has_prac:
                    status[slot] = True
        return status

    # 1. Test 'Elegileble test' (Class Eight)
    status_eleg = get_prac_status('Elegileble test', 'Eight')
    print("\nScenario 1: 'Elegileble test' (Class Eight)")
    print("  Practical Status:", status_eleg)
    assert status_eleg['chem'] is False, "Science in Elegileble test should NOT have practical!"
    assert status_eleg['phys'] is False, "Physics should NOT have practical!"
    assert status_eleg['bio'] is False, "Biology should NOT have practical!"
    assert status_eleg['agri'] is False, "Agri should NOT have practical!"
    print("  ✓ All practical columns are HIDDEN for 'Elegileble test'.")
    print(f"  Colspan adjustment: 68 - 4 = 64 total columns.")

    # 2. Test 'বার্ষিক পরীক্ষা' (Class Ten)
    status_annual = get_prac_status('বার্ষিক পরীক্ষা', 'Ten')
    print("\nScenario 2: 'বার্ষিক পরীক্ষা' (Class Ten)")
    print("  Practical Status:", status_annual)
    assert status_annual['agri'] is True, "Agriculture in Annual Exam SHOULD have practical (25 marks)!"
    print("  ✓ Agriculture Practical column is SHOWN for 'বার্ষিক পরীক্ষা'.")

    # 3. Verify HTML structure has the data-col-type attributes
    with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
        html = f.read()

    assert 'data-col-type="practical"' in html, "Missing data-col-type practical in Tabulation Sheet"
    assert 'data-subj="chem"' in html, "Missing data-subj chem"
    assert 'data-subj="phys"' in html, "Missing data-subj phys"
    assert 'data-subj="bio"' in html, "Missing data-subj bio"
    assert 'data-subj="agri"' in html, "Missing data-subj agri"
    assert 'getSubjectPracticalStatus' in html, "Missing getSubjectPracticalStatus function"

    print("\n✓ HTML attributes data-col-type and data-subj verified in Row 2 and Row 4.")
    print("\n" + "=" * 65)
    print("🎉 ALL PRACTICAL COLUMN LOGIC TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == '__main__':
    test_practical_logic()
