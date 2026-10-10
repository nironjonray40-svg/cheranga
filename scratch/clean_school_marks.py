import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
if not row:
    print('No marks found.')
    sys.exit(0)

marks = json.loads(row[0])
print(f'Initial total marks keys: {len(marks)}')

cleaned_marks = {}
cleaned_count = 0
fixed_cq_count = 0

for k, val in marks.items():
    if k.startswith('timestamp_'):
        cleaned_marks[k] = val
        continue
    if not isinstance(val, dict):
        cleaned_marks[k] = val
        continue

    new_sub_dict = {}
    for sub_key, sub_val in val.items():
        if isinstance(sub_val, dict):
            # Check if this is an unentered/pending placeholder stub
            is_pending_stub = (sub_val.get('status') == 'পেন্ডিং' and not sub_val.get('fileName') and not sub_val.get('omrEvaluatedAt') and sub_val.get('mcq') in (0, None, "") and sub_val.get('cq') in (0, None, ""))
            if is_pending_stub:
                cleaned_count += 1
                continue # Omit unentered stub

            # If it has omrEvaluatedAt and cq was defaulted to 0 solely by old OMR save
            if sub_val.get('omrEvaluatedAt') and sub_val.get('fileName') and sub_val.get('cq') == 0:
                sub_val = dict(sub_val)
                sub_val.pop('cq', None) # make cq undefined
                # Recalculate total if needed
                mcq = sub_val.get('mcq') or 0
                prac = sub_val.get('practical') or 0
                sub_val['total'] = mcq + prac
                fixed_cq_count += 1

            new_sub_dict[sub_key] = sub_val
        else:
            new_sub_dict[sub_key] = sub_val

    if len(new_sub_dict) > 0:
        cleaned_marks[k] = new_sub_dict

print(f'Removed {cleaned_count} unentered dummy records.')
print(f'Fixed {fixed_cq_count} OMR records where CQ was wrongly defaulted to 0.')
print(f'Remaining marks keys: {len(cleaned_marks)}')

# Save cleaned marks to school.db
c.execute("UPDATE local_storage_sync SET value = ? WHERE key = 'school_student_marks'", (json.dumps(cleaned_marks, ensure_ascii=False),))
conn.commit()
print('Successfully saved cleaned marks to school.db.')
