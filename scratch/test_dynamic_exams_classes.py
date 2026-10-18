import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_val(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else []

schedules = get_val('school_exam_schedules')
types = get_val('school_exam_types')
routines = get_val('school_exam_routines')
omr = get_val('school_omr_exams')

print("=== 1. Test getAllExams ===")
exam_set = set()
for s in schedules:
    name = (s.get('term') or s.get('examName') or '').strip()
    if name: exam_set.add(name)
for t in types:
    name = (t.get('name') or (t if isinstance(t, str) else '')).strip()
    if name: exam_set.add(name)
for r in routines:
    name = (r.get('examName') or r.get('term') or '').strip()
    if name: exam_set.add(name)
for o in omr:
    name = (o.get('examName') or o.get('term') or '').strip()
    if name: exam_set.add(name)

print("Exams found:", exam_set)

def normalize_class(str_val):
    if not str_val: return '10'
    s = str(str_val).lower().strip()
    if 'দশম' in s or 'ten' in s or s == '10': return '10'
    if 'নবম' in s or 'nine' in s or s == '9': return '09'
    if 'অষ্টম' in s or 'eight' in s or s == '8': return '08'
    if 'সপ্তম' in s or 'seven' in s or s == '7': return '07'
    if 'ষষ্ঠ' in s or 'six' in s or s == '6': return '06'
    if 'পঞ্চম' in s or 'five' in s or s == '5': return '05'
    return s

def format_class_name(c):
    norm = normalize_class(c)
    m = {'10':'Ten', '09':'Nine', '08':'Eight', '07':'Seven', '06':'Six', '05':'Five'}
    return m.get(norm, c)

def get_classes_for_exam(exam_name):
    class_set = set()
    clean_exam = (exam_name or '').strip().lower()
    clean_exam_no_yr = clean_exam.replace('২০২৫', '').replace('২০২৬', '').replace('2025', '').replace('2026', '').strip()

    def is_match(target):
        if not target: return False
        t = str(target).strip().lower()
        t_no_yr = t.replace('২০২৫', '').replace('২০২৬', '').replace('2025', '').replace('2026', '').strip()
        return t == clean_exam or t_no_yr == clean_exam_no_yr or t_no_yr in clean_exam_no_yr or clean_exam_no_yr in t_no_yr

    for s in schedules:
        if is_match(s.get('term') or s.get('examName')):
            cls = s.get('class') or s.get('className')
            if cls:
                for part in str(cls).split(','):
                    class_set.add(format_class_name(part.strip()))

    for r in routines:
        if is_match(r.get('examName') or r.get('term')):
            cls = r.get('className') or r.get('class')
            if cls:
                for part in str(cls).split(','):
                    class_set.add(format_class_name(part.strip()))

    for o in omr:
        if is_match(o.get('examName') or o.get('term')):
            cls = o.get('class') or o.get('className')
            if cls:
                for part in str(cls).split(','):
                    class_set.add(format_class_name(part.strip()))

    return sorted(list(class_set))

print("\n=== 2. Test getClassesForExam for each exam ===")
for ex in sorted(list(exam_set)):
    classes = get_classes_for_exam(ex)
    print(f"Exam: '{ex}' -> Classes: {classes}")
