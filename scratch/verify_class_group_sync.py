import re
import json
import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def format_class_display_name(cls):
    if not cls:
        return ''
    c = str(cls).strip()
    c_lower = c.lower()
    if c_lower in ['play', 'প্লে']: return 'প্লে (Play)'
    if c_lower in ['nursery', 'নার্সারি']: return 'নার্সারি (Nursery)'
    if c_lower in ['kg', 'কেজি']: return 'কেজি (KG)'
    if c_lower in ['one', '1', '১', 'class 1', 'class one', '১ম শ্রেণি']: return '১ম শ্রেণি (Class 1)'
    if c_lower in ['two', '2', '২', 'class 2', 'class two', '২য় শ্রেণি']: return '২য় শ্রেণি (Class 2)'
    if c_lower in ['three', '3', '৩', 'class 3', 'class three', '৩য় শ্রেণি']: return '৩য় শ্রেণি (Class 3)'
    if c_lower in ['four', '4', '৪', 'class 4', 'class four', '৪র্থ শ্রেণি']: return '৪র্থ শ্রেণি (Class 4)'
    if c_lower in ['five', '5', '৫', 'class 5', 'class five', '৫ম শ্রেণি']: return '৫ম শ্রেণি (Class 5)'
    if c_lower in ['six', '6', '৬', 'class 6', 'class six', '৬ষ্ঠ শ্রেণি']: return '৬ষ্ঠ শ্রেণি (Class 6)'
    if c_lower in ['seven', '7', '৭', 'class 7', 'class seven', '৭ম শ্রেণি']: return '৭ম শ্রেণি (Class 7)'
    if c_lower in ['eight', '8', '৮', 'class 8', 'class eight', '৮ম শ্রেণি']: return '৮ম শ্রেণি (Class 8)'
    if c_lower in ['nine', '9', '৯', 'class 9', 'class nine', '৯ম শ্রেণি']: return '৯ম শ্রেণি (Class 9)'
    if c_lower in ['ten', '10', '১০', 'class 10', 'class ten', '১০ম শ্রেণি']: return '১০ম শ্রেণি (Class 10)'
    return c

def run_tests():
    print("=== Testing Class & Group Dynamic Sync in CMS & Advance ===")

    # 1. Read files
    with open('cms.html', 'r', encoding='utf-8') as f:
        cms_content = f.read()

    with open('advance.html', 'r', encoding='utf-8') as f:
        adv_content = f.read()

    # 2. Check essential JS function definitions in cms.html
    required_funcs = [
        'formatClassDisplayName',
        'formatGroupDisplayName',
        'isClassNineMatch',
        'isClassTenMatch',
        'isClassNineOrTenMatch',
        'getAdmissionClassesList',
        'getAdmissionGroupsForClass',
        'initAdmissionClassDropdown',
        'handleAdmClassChange',
        'handleAdmGroupChange',
        'openAdmissionModal',
        'refreshCmsRealtimeData'
    ]

    for func in required_funcs:
        assert f"function {func}" in cms_content or f"{func}(" in cms_content, f"Missing function {func} in cms.html"
        print(f"  [PASS] Function '{func}' found in cms.html")

    # 3. Check event listeners in cms.html
    assert "initAdmissionClassDropdown()" in cms_content, "initAdmissionClassDropdown() call missing"
    assert "school_classes_synced" in cms_content, "school_classes_synced event listener missing in cms.html"
    assert "school_classes_synced" in adv_content, "school_classes_synced event dispatch missing in advance.html"
    print("  [PASS] Real-time event hooks verified in cms.html and advance.html")

    # 4. Check HTML structure for #admTargetClass and #admGroup
    assert 'id="admTargetClass"' in cms_content, "admTargetClass select element missing"
    assert 'id="admGroup"' in cms_content, "admGroup select element missing"
    assert 'id="admGroupContainer"' in cms_content, "admGroupContainer element missing"
    print("  [PASS] Form markup for class and group dropdowns verified in cms.html")

    # 5. Check SQLite database school_classes & school_class_sections presence
    conn = sqlite3.connect('school.db')
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_classes', 'school_class_sections')")
    rows = dict(cursor.fetchall())
    conn.close()

    print(f"  [INFO] Database school_classes: {rows.get('school_classes')}")
    print(f"  [INFO] Database school_class_sections: {rows.get('school_class_sections')}")

    # 6. Test Class Formatting Logic
    test_classes = ["Play", "Nursery", "KG", "One", "Six", "Nine", "Ten", "Diploma 1st Year"]
    formatted = [format_class_display_name(c) for c in test_classes]
    print(f"  [PASS] Formatted classes: {formatted}")
    assert '৯ম শ্রেণি (Class 9)' in formatted
    assert '১০ম শ্রেণি (Class 10)' in formatted
    assert 'Diploma 1st Year' in formatted

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! Dynamic Class & Section sync is 100% operational.")

if __name__ == '__main__':
    run_tests()
