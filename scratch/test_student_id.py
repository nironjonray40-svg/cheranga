import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_students'")
students = json.loads(c.fetchone()[0])

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

def get_effective_student_id(st, current_class='', rank_num=1):
    if not st: return ''
    reg = str(st.get('regNo') or '').strip()
    sid = str(st.get('studentId') or '').strip()
    # 1. regNo is the unique registration/student number (e.g. 260091, 2606001)
    if reg and not reg.startswith('178') and len(reg) <= 12:
        return reg
    # 2. full studentId (longer than 4 chars)
    if sid and len(sid) > 4 and not sid.startswith('178'):
        return sid
    # 3. clean studentId
    if sid and not sid.startswith('178') and '-' not in sid:
        return sid
    # 4. Fallback generated
    norm_c = normalize_class(st.get('class') or current_class or '10')
    class_code = norm_c.zfill(2)
    roll = str(st.get('roll') or rank_num or 1)
    digits = ''.join(c for c in roll if c.isdigit()) or str(rank_num or 1)
    return f"26{class_code}{digits.zfill(3)}"

for s in students[:20]:
    eff_id = get_effective_student_id(s)
    c_name = s.get('class')
    sec = s.get('section')
    roll = s.get('roll')
    raw_id = s.get('studentId')
    reg = s.get('regNo')
    name = s.get('nameBn')
    print(f"Class: {c_name:<6} Sec: {sec:<8} Roll: {roll:<3} RawID: {raw_id:<5} RegNo: {reg:<8} => Effective ID: {eff_id:<8} ({name})")
