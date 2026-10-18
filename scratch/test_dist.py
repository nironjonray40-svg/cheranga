import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = ?", ("school_exam_schedules",))
schedules = json.loads(c.fetchone()[0])
c.execute("SELECT value FROM local_storage_sync WHERE key = ?", ("school_exam_types",))
types = json.loads(c.fetchone()[0])

def is_exam_match(t, s):
    if not t or not s: return False
    t_clean = t.replace('২০২', '').replace('202', '').strip().lower()
    s_clean = s.replace('২০২', '').replace('202', '').strip().lower()
    return t_clean == s_clean or t_clean in s_clean or s_clean in t_clean

for exam in ["Elegileble test", "বার্ষিক পরীক্ষা", "অর্ধ-বার্ষিক পরীক্ষা", "ক্লাস টেষ্ট পরীক্ষা"]:
    matched = next((t for t in types if is_exam_match(t.get("name"), exam)), None)
    if matched:
        cq = matched.get("defaultCQ", 70)
        mcq = matched.get("defaultMCQ", 30)
        prac = matched.get("defaultPractical", 0)
        print(f"Exam: {exam} -> Base Default: CQ={cq}, MCQ={mcq}, Prac={prac}, Total={cq+mcq+prac}")
        schs = [s for s in schedules if is_exam_match(s.get("term"), exam)]
        if schs:
            et_counts = {}
            for s in schs:
                et = s.get("examType")
                et_counts[et] = et_counts.get(et, 0) + 1
            print(f"  Schedule examTypes for {exam}: {et_counts}")
            best_et = max(et_counts, key=et_counts.get)
            sub_st = next((st for st in matched.get("examTypes", []) if st.get("typeName") == best_et), None)
            if sub_st:
                sub_cq = sub_st.get("defaultCQ")
                sub_mcq = sub_st.get("defaultMCQ")
                sub_pr = sub_st.get("defaultPractical")
                print(f"  Dominant subtype ({best_et}): CQ={sub_cq}, MCQ={sub_mcq}, Prac={sub_pr}, Total={sub_cq+sub_mcq+sub_pr}")
