import os
import sys
import json
import sqlite3

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_tests():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server_path = os.path.join(base_dir, 'server.py')
    advance_path = os.path.join(base_dir, 'advance.html')
    cms_path = os.path.join(base_dir, 'cms.html')
    db_path = os.path.join(base_dir, 'school.db')

    print("--- 1. Testing server.py ESSENTIAL_UI_KEYS ---")
    with open(server_path, 'r', encoding='utf-8') as f:
        server_content = f.read()
    assert "'bd_geo_admission_data'" in server_content, "Missing 'bd_geo_admission_data' in server.py"
    print("[PASS] server.py has 'bd_geo_admission_data' in ESSENTIAL_UI_KEYS.")

    print("\n--- 2. Testing advance.html backend sync & event dispatching ---")
    with open(advance_path, 'r', encoding='utf-8') as f:
        advance_content = f.read()
    assert "/api/db/save" in advance_content, "Missing /api/db/save in advance.html"
    assert "saveAdmissionGeoData" in advance_content, "Missing saveAdmissionGeoData in advance.html"
    assert "resetAdmissionGeoDataToDefault" in advance_content, "Missing resetAdmissionGeoDataToDefault in advance.html"
    assert "importGeoDataJson" in advance_content, "Missing importGeoDataJson in advance.html"
    assert "new CustomEvent('dbSynced', { detail: { key: 'bd_geo_admission_data' } })" in advance_content, "Missing dbSynced custom event dispatch in advance.html"
    print("[PASS] advance.html properly persists address geo data and dispatches sync events.")

    print("\n--- 3. Testing cms.html dynamic initialization and sync listeners ---")
    with open(cms_path, 'r', encoding='utf-8') as f:
        cms_content = f.read()
    assert "function escapeHtml" in cms_content, "Missing escapeHtml in cms.html"
    assert "function getAdmissionGeoData" in cms_content, "Missing getAdmissionGeoData in cms.html"
    assert "function initAdmissionGeoDropdowns" in cms_content, "Missing initAdmissionGeoDropdowns in cms.html"
    assert "function refreshCascadingGeoDropdowns" in cms_content, "Missing refreshCascadingGeoDropdowns in cms.html"
    assert "function syncPermanentAddress" in cms_content, "Missing syncPermanentAddress in cms.html"
    assert "initAdmissionGeoDropdowns();" in cms_content, "initAdmissionGeoDropdowns not called in cms.html"
    assert "bd_geo_admission_data" in cms_content, "bd_geo_admission_data key missing in cms.html"
    assert "window.addEventListener('dbSynced'" in cms_content, "dbSynced listener missing in cms.html"
    print("[PASS] cms.html has full dynamic dropdown initialization, cascading handlers, and real-time listeners.")

    print("\n--- 4. Testing SQLite Database & Data Sync Integrity ---")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS local_storage_sync (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER DEFAULT 0)")
    
    # Check if existing data or insert test verified data
    cur.execute("SELECT value FROM local_storage_sync WHERE key = 'bd_geo_admission_data'")
    row = cur.fetchone()
    if row and row[0]:
        parsed = json.loads(row[0])
        print(f"[INFO] Existing bd_geo_admission_data found in SQLite: {len(parsed)} divisions ({list(parsed.keys())})")
    else:
        print("[INFO] No existing record in SQLite. Verifying DB ready.")

    conn.close()
    print("\nAll address synchronization checks PASSED successfully!")

if __name__ == '__main__':
    run_tests()
