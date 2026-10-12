import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("cms.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

for evt in ["storage", "dbSynced", "school_classes_synced", "school_subjects_synced", "school_settings", "school_students", "school_exam_schedules", "school_exam_types"]:
    print(evt, text.count(evt))
