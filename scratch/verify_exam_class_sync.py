import sqlite3, json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_k(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else []

schedules = get_k('school_exam_schedules')
types = get_k('school_exam_types')
routines = get_k('school_exam_routines')
omr = get_k('school_omr_exams')
classes_db = get_k('school_classes')

def strip_year(s):
    return re.sub(r'২০২[০-৯]|202[0-9]', '', s).strip()

def is_exam_match(target, selected):
    if not target or not selected: return False
    t = str(target).strip().lower()
    s = str(selected).strip().lower()
    if t == s: return True
    t_no_yr = strip_year(t)
    s_no_yr = strip_year(s)
    if t_no_yr and s_no_yr:
        if t_no_yr == s_no_yr: return True
        if t_no_yr in s_no_yr or s_no_yr in t_no_yr: return True
    return False

def normalize_class_string(str_val):
    if not str_val: return '10'
    s = str(str_val).lower().strip()
    if 'দশম' in s or 'ten' in s or re.search(r'\b10\b', s) or s == '10' or s == '10th' or '১০' in s: return '10'
    if 'নবম' in s or 'nine' in s or re.search(r'\b9\b', s) or s == '9' or s == '9th' or '৯' in s: return '9'
    if 'অষ্টম' in s or 'eight' in s or re.search(r'\b8\b', s) or s == '8' or s == '8th' or '৮' in s: return '8'
    if 'সপ্তম' in s or 'seven' in s or re.search(r'\b7\b', s) or s == '7' or s == '7th' or '৭' in s: return '7'
    if 'ষষ্ঠ' in s or 'six' in s or re.search(r'\b6\b', s) or s == '6' or s == '6th' or '৬' in s: return '6'
    if 'পঞ্চম' in s or 'five' in s or re.search(r'\b5\b', s) or s == '5' or s == '5th' or '৫' in s: return '5'
    if 'চতুর্থ' in s or 'four' in s or re.search(r'\b4\b', s) or s == '4' or s == '4th' or '৪' in s: return '4'
    if 'তৃতীয়' in s or 'তৃতীয়' in s or 'three' in s or re.search(r'\b3\b', s) or s == '3' or s == '3rd' or '৩' in s: return '3'
    if 'দ্বিতীয়' in s or 'দ্বিতীয়' in s or 'two' in s or re.search(r'\b2\b', s) or s == '2' or s == '2nd' or '২' in s: return '2'
    if 'প্রথম' in s or 'one' in s or re.search(r'\b1\b', s) or s == '1' or s == '1st' or '১' in s: return '1'
    if 'কেজি' in s or 'kg' in s: return 'kg'
    if 'নার্সারি' in s or 'nursery' in s: return 'nursery'
    if 'প্লে' in s or 'play' in s: return 'play'
    return s

def format_class_name_display(c):
    if not c: return ''
    # strip group/section if present e.g. "Nine - বিজ্ঞান" -> "Nine"
    c_base = re.split(r'[\-\(\–\—]', str(c))[0].strip()
    norm = normalize_class_string(c_base)
    class_map = {
        'play': 'Play', 'nursery': 'Nursery', 'kg': 'KG',
        '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
        '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight',
        '9': 'Nine', '10': 'Ten'
    }
    if norm in class_map: return class_map[norm]
    clean = re.sub(r'^class\s*', '', c_base, flags=re.I)
    clean = re.sub(r'শ্রেণি|শ্রেণী', '', clean).strip()
    return clean or c_base

def sort_classes_sequential(classes):
    order = {
        'play': 1, 'nursery': 2, 'kg': 3, '1': 4, '2': 5,
        '3': 6, '4': 7, '5': 8, '6': 9, '7': 10, '8': 11,
        '9': 12, '10': 13
    }
    return sorted(list(classes), key=lambda x: order.get(normalize_class_string(x), 99))

def get_all_exams():
    exam_set = []
    seen = set()

    def add_exam(name):
        if not name or not isinstance(name, str): return
        clean = name.strip()
        if not clean: return
        key = clean.lower()
        if key not in seen:
            seen.add(key)
            exam_set.append(clean)

    # 1. From Exam List (schedules)
    for s in schedules:
        add_exam(s.get('term') or s.get('examName'))

    # 2. From Exam Types / Exam Names
    for t in types:
        if isinstance(t, dict):
            add_exam(t.get('name'))
        elif isinstance(t, str):
            add_exam(t)

    # 3. From Routines
    for r in routines:
        add_exam(r.get('examName') or r.get('term'))

    # 4. From OMR exams
    for o in omr:
        add_exam(o.get('examName') or o.get('term'))

    if not exam_set:
        exam_set = ["বার্ষিক পরীক্ষা", "অর্ধ-বার্ষিক পরীক্ষা", "প্রাক-নির্বাচনী পরীক্ষা", "নির্বাচনী পরীক্ষা"]

    return exam_set

def get_classes_for_exam(exam_name):
    class_set = set()

    # 1. Check Exam List (schedules)
    for s in schedules:
        ex = s.get('term') or s.get('examName')
        if is_exam_match(ex, exam_name):
            raw = s.get('class') or s.get('className')
            if raw:
                for part in str(raw).split(','):
                    f = format_class_name_display(part.strip())
                    if f: class_set.add(f)

    # 2. Check Routines
    for r in routines:
        ex = r.get('examName') or r.get('term')
        if is_exam_match(ex, exam_name):
            raw = r.get('className') or r.get('class')
            if raw:
                for part in str(raw).split(','):
                    f = format_class_name_display(part.strip())
                    if f: class_set.add(f)

    # 3. Check OMR
    for o in omr:
        ex = o.get('examName') or o.get('term')
        if is_exam_match(ex, exam_name):
            raw = o.get('class') or o.get('className')
            if raw:
                for part in str(raw).split(','):
                    f = format_class_name_display(part.strip())
                    if f: class_set.add(f)

    # If this specific exam has no classes registered yet, fallback to available classes
    if not class_set:
        for c in classes_db:
            if isinstance(c, str) and c.strip():
                class_set.add(format_class_name_display(c))
            elif isinstance(c, dict) and c.get('name'):
                class_set.add(format_class_name_display(c.get('name')))

    if not class_set:
        class_set = {"Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"}

    return sort_classes_sequential(class_set)

exams = get_all_exams()
print("All Exams from Exam List:", exams)
print("\nClasses for each Exam:")
for ex in exams:
    classes = get_classes_for_exam(ex)
    print(f"  Exam: '{ex}' -> Classes: {classes}")
