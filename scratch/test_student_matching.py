import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_students',))
all_students = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
omr_exams = json.loads(c.fetchone()[0])

target_exam = next((e for e in omr_exams if str(e.get('id')) == '1791596672085'), None)

def is_reg_no_match(reg_a, reg_b):
    if not reg_a or not reg_b:
        return False
    sa = str(reg_a).strip()
    sb = str(reg_b).strip()
    if sa == sb:
        return True
    stra = sa.lstrip('0')
    strb = sb.lstrip('0')
    if stra and strb and stra == strb:
        return True
    return False

def map_class_to_number(c):
    if not c:
        return '8'
    c_str = str(c).strip().lower()
    m = {'six': '6', '6': '6', '৬': '6', 'seven': '7', '7': '7', '৭': '7', 'eight': '8', '8': '8', '৮': '8', 'nine': '9', '9': '9', '৯': '9', 'ten': '10', '10': '10', '১০': '10'}
    return m.get(c_str, c_str)

print("--- Testing NEW Matching Logic ---")
collision_count = 0
matched_map = {}

for st in target_exam.get('students', []):
    raw_reg = str(st.get('id') or st.get('regNo') or '').strip()
    raw_roll = str(st.get('roll') or '').strip()
    sec = str(st.get('section') or '').strip()
    cls_num = map_class_to_number(st.get('class'))

    # Step 1: Exact RegNo match
    master_st = next((s for s in all_students if is_reg_no_match(s.get('regNo'), raw_reg) or is_reg_no_match(s.get('studentId'), raw_reg) or is_reg_no_match(s.get('id'), raw_reg)), None)

    # Step 2: Fallback Class + Section + Roll
    if not master_st:
        master_st = next((s for s in all_students if map_class_to_number(s.get('class')) == cls_num and str(s.get('section', '')).strip().lower() == sec.lower() and str(s.get('roll', '')).strip() == raw_roll), None)

    # Step 3: Fallback Class + Roll
    if not master_st:
        master_st = next((s for s in all_students if map_class_to_number(s.get('class')) == cls_num and str(s.get('roll', '')).strip() == raw_roll), None)

    if master_st:
        mid = master_st.get('id')
        mreg = master_st.get('regNo')
        msec = master_st.get('section')
        mroll = master_st.get('roll')
        if mid in matched_map:
            print(f"COLLISION DETECTED! Student {raw_reg} collided with {matched_map[mid]}")
            collision_count += 1
        else:
            matched_map[mid] = (raw_reg, st.get('name'))
        if raw_reg in ['2606003', '2606039']:
            print(f"Student Reg: {raw_reg} (Roll {raw_roll}, Sec {sec}) => Matched Master ID: {mid}, Master Reg: {mreg}, Sec: {msec}, Roll: {mroll}")
    else:
        print(f"NOT MATCHED: Reg {raw_reg}, Roll {raw_roll}")

print(f"\nTotal OMR students matched uniquely: {len(matched_map)} / {len(target_exam.get('students', []))}")
print(f"Total Collisions: {collision_count}")

conn.close()
