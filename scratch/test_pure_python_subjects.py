import sqlite3, json

c = sqlite3.connect('school.db').cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
db = dict(c.fetchall())

schedules = json.loads(db['school_exam_schedules'])

def get_exact_exam_subjects(selectedClass, selectedSection, selectedExam):
    normC = selectedClass.lower()
    normS = selectedSection.lower()
    
    matched = []
    for sc in schedules:
        if not sc: continue
        matchExam = (sc.get('term') or sc.get('examName') or '').strip().lower() == selectedExam.lower()
        matchClass = (sc.get('className') or sc.get('class') or '').strip().lower() == normC
        matchSec = True
        sec = sc.get('section')
        if normS and sec and sec != 'All' and sec != '(প্রযোজ্য না)':
            secs = [x.strip().lower() for x in sec.split(',')]
            matchSec = normS in secs
        if matchExam and matchClass and matchSec:
            matched.append(sc)

    subjectGroups = {}
    for sc in matched:
        exactSubName = (sc.get('subject') or sc.get('subjectName') or sc.get('name') or '').strip()
        if not exactSubName: continue
        groupKey = exactSubName.lower()
        if groupKey not in subjectGroups:
            subjectGroups[groupKey] = {
                'schedule': sc,
                'scheduleIds': [sc.get('id')],
                'name': exactSubName
            }
        else:
            grp = subjectGroups[groupKey]
            if sc.get('id') not in grp['scheduleIds']:
                grp['scheduleIds'].append(sc.get('id'))
            if sc.get('hasMarks'):
                grp['schedule'] = sc

    rawList = list(subjectGroups.values())

    rows = []
    pairedIndices = set()
    for i in range(len(rawList)):
        if i in pairedIndices: continue
        current = rawList[i]
        curName = current['name']
        normCur = curName.lower()

        pairIndex = -1
        if 'bangla 1' in normCur or 'বাংলা ১ম' in normCur:
            for idx, it in enumerate(rawList):
                if idx != i and idx not in pairedIndices and ('bangla 2' in it['name'].lower() or 'বাংলা ২য়' in it['name']):
                    pairIndex = idx
                    break
        elif 'english 1' in normCur or 'english for today' in normCur or 'ইংরেজি ১ম' in normCur:
            for idx, it in enumerate(rawList):
                if idx != i and idx not in pairedIndices and ('english 2' in it['name'].lower() or 'grammar' in it['name'].lower() or 'ইংরেজি ২য়' in it['name']):
                    pairIndex = idx
                    break

        if pairIndex != -1:
            pairedIndices.add(i)
            pairedIndices.add(pairIndex)
            pairItem = rawList[pairIndex]
            rows.append({
                'isCombined': True,
                'name': curName,
                'pairWith': pairItem['name']
            })
        else:
            pairedIndices.add(i)
            rows.append({
                'isCombined': False,
                'name': curName
            })

    return rows

with open('scratch/exact_rendered_subjects.txt', 'w', encoding='utf-8') as out:
    r1 = get_exact_exam_subjects('Eight', 'A', 'Elegileble test')
    out.write("=== Elegileble test (Class Eight, Section A) ===\n")
    for r in r1:
        if r['isCombined']:
            out.write(f"  Combined: '{r['name']}' + '{r['pairWith']}'\n")
        else:
            out.write(f"  Single: '{r['name']}'\n")

    r2 = get_exact_exam_subjects('Six', 'A', 'বার্ষিক পরীক্ষা')
    out.write("\n=== বার্ষিক পরীক্ষা (Class Six, Section A) ===\n")
    for r in r2:
        out.write(f"  Single: '{r['name']}'\n")

    r3 = get_exact_exam_subjects('Eight', 'A', 'অর্ধ-বার্ষিক পরীক্ষা')
    out.write("\n=== অর্ধ-বার্ষিক পরীক্ষা (Class Eight, Section A) ===\n")
    for r in r3:
        out.write(f"  Single: '{r['name']}'\n")

print("Done")
