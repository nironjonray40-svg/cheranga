import sqlite3
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Connect to database and load school_subjects
conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_subjects'")
row = cursor.fetchone()
conn.close()

assert row is not None, "school_subjects not found in DB"
all_subjects = json.loads(row[0])

def is_class_nine_match(cls_name):
    if not cls_name: return False
    c = str(cls_name).strip().lower()
    return 'nine' in c or '৯ম' in c or ' 9' in c or c == '9' or 'নবম' in c

def is_class_ten_match(cls_name):
    if not cls_name: return False
    c = str(cls_name).strip().lower()
    return 'ten' in c or '১০ম' in c or ' 10' in c or c == '10' or 'দশম' in c

def get_admission_optional_subjects(class_val, group_val, all_subs):
    is_nine = is_class_nine_match(class_val)
    is_ten = is_class_ten_match(class_val)
    
    class_subs = []
    if isinstance(all_subs, dict):
        for k, v in all_subs.items():
            if is_nine and is_class_nine_match(k):
                class_subs = v
                break
            elif is_ten and is_class_ten_match(k):
                class_subs = v
                break
            elif str(k).lower() == str(class_val).lower():
                class_subs = v
                break
        if not class_subs:
            if is_nine:
                class_subs = all_subs.get('Nine', [])
            elif is_ten:
                class_subs = all_subs.get('Ten', [])
                
    clean_grp = str(group_val or '').strip().lower()
    optional_subs = []
    for sub in class_subs:
        if not sub: continue
        is_opt = sub.get('isOptional') in (True, 'true', 1)
        if not is_opt: continue
        
        if clean_grp:
            sub_sec = str(sub.get('section') or sub.get('group') or 'All').strip().lower()
            if sub_sec in ('all', '') or clean_grp in sub_sec:
                optional_subs.append(sub)
            elif ('বিজ্ঞান' in clean_grp or 'science' in clean_grp) and ('বিজ্ঞান' in sub_sec or 'science' in sub_sec):
                optional_subs.append(sub)
            elif ('মানবিক' in clean_grp or 'humanities' in clean_grp or 'arts' in clean_grp) and ('মানবিক' in sub_sec or 'humanities' in sub_sec or 'arts' in sub_sec):
                optional_subs.append(sub)
            elif ('ব্যবসায়' in clean_grp or 'business' in clean_grp or 'commerce' in clean_grp) and ('ব্যবসায়' in sub_sec or 'business' in sub_sec or 'commerce' in sub_sec):
                optional_subs.append(sub)
        else:
            optional_subs.append(sub)
            
    if optional_subs:
        res = []
        for s in optional_subs:
            name_bn = (s.get('nameBn') or '').strip()
            name_en = (s.get('name') or '').strip()
            val = name_bn or name_en
            label = f"{name_bn} ({name_en})" if name_bn and name_en and name_bn != name_en else val
            res.append({'val': val, 'label': label, 'code': s.get('code')})
        return res
    return []

print("=== Testing Class Nine - বিজ্ঞান ===")
opts_nine_sci = get_admission_optional_subjects("Nine", "বিজ্ঞান", all_subjects)
print(json.dumps(opts_nine_sci, ensure_ascii=False, indent=2))

print("=== Testing Class Nine - মানবিক ===")
opts_nine_hum = get_admission_optional_subjects("Nine", "মানবিক", all_subjects)
print(json.dumps(opts_nine_hum, ensure_ascii=False, indent=2))

print("=== Testing Class Ten - বিজ্ঞান ===")
opts_ten_sci = get_admission_optional_subjects("Ten", "বিজ্ঞান", all_subjects)
print(json.dumps(opts_ten_sci, ensure_ascii=False, indent=2))

print("=== Testing Class Ten - মানবিক ===")
opts_ten_hum = get_admission_optional_subjects("Ten", "মানবিক", all_subjects)
print(json.dumps(opts_ten_hum, ensure_ascii=False, indent=2))
