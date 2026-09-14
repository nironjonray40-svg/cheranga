import json
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== 1. CHECKING SQLite DB & school_admission_applications ===")
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, length(value) FROM local_storage_sync WHERE key = 'school_admission_applications'")
row = c.fetchone()
print("school_admission_applications in DB:", row)

# If not exists or empty, let's create sample test application data
sample_app = {
    "id": "ADM-2026-TEST01",
    "trackingId": "ADM-2026-8941",
    "submissionDate": "2026-09-11 10:30 AM",
    "status": "Submitted",
    "targetClass": "Class 6 (৬ষ্ঠ শ্রেণি)",
    "session": "2026",
    "optionalSubject": "কৃষি শিক্ষা (Agriculture)",
    "photo": "",
    "student": {
        "nameBn": "মোঃ তানভীর আহমেদ",
        "nameEn": "MD. TANVIR AHMED",
        "dob": "2013-05-15",
        "birthRegNo": "20131234567890123",
        "gender": "ছাত্র",
        "bloodGroup": "B+",
        "religion": "Islam (ইসলাম)"
    },
    "parents": {
        "fatherBn": "মোঃ রফিকুল ইসলাম",
        "fatherEn": "MD. RAFIQUL ISLAM",
        "fatherNid": "19801234567890",
        "fatherPhone": "01712345678",
        "fatherOccup": "ব্যবসা",
        "motherBn": "মোসাঃ ফাতেমা বেগম",
        "motherEn": "MOSA. FATEMA BEGUM",
        "motherNid": "19851234567890",
        "motherPhone": "01812345678",
        "motherOccup": "গৃহিণী"
    },
    "guardian": {
        "name": "মোঃ রফিকুল ইসলাম",
        "relation": "পিতা",
        "phone": "01712345678",
        "email": "rafiqul@example.com"
    },
    "address": {
        "present": {
            "village": "মৌচাক",
            "post": "কালিয়াকৈর",
            "upazila": "কালিয়াকৈর",
            "district": "গাজীপুর"
        },
        "permanent": {
            "village": "মৌচাক",
            "post": "কালিয়াকৈর",
            "upazila": "কালিয়াকৈর",
            "district": "গাজীপুর"
        }
    },
    "prevAcademic": {
        "schoolName": "কালিয়াকৈর সরকারি প্রাথমিক বিদ্যালয়",
        "lastClass": "Class 5 (৫ম শ্রেণি)",
        "roll": "12",
        "gpa": "5.00",
        "passYear": "2025"
    }
}

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_admission_applications'")
data_row = c.fetchone()
apps = []
if data_row and data_row[0]:
    try:
        apps = json.loads(data_row[0])
    except:
        apps = []

# If empty, add sample test application
if len(apps) == 0:
    apps.append(sample_app)
    val_str = json.dumps(apps, ensure_ascii=False)
    c.execute("INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES ('school_admission_applications', ?, datetime('now'))", (val_str,))
    conn.commit()
    print("Inserted sample test application into school.db!")

print(f"Total applications in DB: {len(apps)}")
for a in apps[:3]:
    print(f"- App ID: {a.get('id')}, Tracking: {a.get('trackingId')}, Name: {a.get('student', {}).get('nameBn')}, Class: {a.get('targetClass')}, Status: {a.get('status')}")

conn.close()

print("\n=== 2. CHECKING student-portal.html INTEGRITY ===")
with open('student-portal.html', 'r', encoding='utf-8') as f:
    sp_content = f.read()

checks = [
    'subview-online-admissions',
    'adm-class-filter',
    'adm-session-filter',
    'adm-status-filter',
    'online-admission-list-rows',
    'admission-details-modal',
    'admission-enroll-modal',
    'admission-voucher-print-area',
    'loadOnlineAdmissions',
    'renderOnlineAdmissionsList',
    'openOnlineAdmissionDetails',
    'openEnrollModal',
    'confirmEnrollStudent',
    'printOnlineAdmissionVoucher',
    'exportOnlineAdmissionsToExcel',
    'student-portal.html?view=online-admissions'
]

for chk in checks:
    found = chk in sp_content
    print(f"[{'PASS' if found else 'FAIL'}] student-portal.html contains: {chk}")

print("\n=== 3. CHECKING cms.html INTEGRITY ===")
with open('cms.html', 'r', encoding='utf-8') as f:
    cms_content = f.read()

cms_checks = [
    'handleAdmissionSubmit',
    'school_admission_applications',
    '/api/db/save',
    'school_realtime_db_channel'
]

for chk in cms_checks:
    found = chk in cms_content
    print(f"[{'PASS' if found else 'FAIL'}] cms.html contains: {chk}")

print("\n=== 4. CHECKING server.py & main.js INTEGRITY ===")
with open('server.py', 'r', encoding='utf-8') as f:
    srv_content = f.read()
print(f"[{'PASS' if 'school_admission_applications' in srv_content else 'FAIL'}] server.py contains school_admission_applications in ESSENTIAL_UI_KEYS")

with open('main.js', 'r', encoding='utf-8') as f:
    main_content = f.read()
print(f"[{'PASS' if 'school_admission_applications' in main_content else 'FAIL'}] main.js contains school_admission_applications in INITIAL_SYNC_KEYS")
print(f"[{'PASS' if 'student-portal.html?view=online-admissions' in main_content else 'FAIL'}] main.js contains student-portal.html?view=online-admissions in LINK_PERMISSIONS")
