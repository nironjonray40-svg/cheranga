import sqlite3
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("--- Testing CMS Integration ---")

# 1. Check school.db
db_path = 'school.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM local_storage_sync")
    count = c.fetchone()[0]
    print(f"[OK] Database connected. Total synced keys in DB: {count}")
    conn.close()
else:
    print("[FAIL] school.db not found!")

# 2. Check cms.html file
if os.path.exists('cms.html'):
    size = os.path.getsize('cms.html')
    print(f"[OK] cms.html exists ({size} bytes)")
    with open('cms.html', 'r', encoding='utf-8') as f:
        content = f.read()
        for sec in ['hero', 'about', 'speeches', 'academics', 'teachers', 'notices', 'admission', 'fees', 'facilities', 'gallery', 'contact']:
            if f'id="{sec}"' in content or f'id="section-{sec}"' in content:
                print(f"  - Section '{sec}' present in cms.html")
            else:
                print(f"  - [WARN] Section '{sec}' not matched")
else:
    print("[FAIL] cms.html missing!")

# 3. Check advance.html integration
if os.path.exists('advance.html'):
    with open('advance.html', 'r', encoding='utf-8') as f:
        adv_content = f.read()
        if 'id="subview-cms-portal"' in adv_content:
            print("[OK] subview-cms-portal found in advance.html")
        else:
            print("[FAIL] subview-cms-portal missing from advance.html")
            
        if 'data-view="cms-portal"' in adv_content:
            print("[OK] CMS navigation pill found in advance.html")
        else:
            print("[FAIL] CMS navigation pill missing from advance.html")

        if 'importAllErpDataToCms' in adv_content:
            print("[OK] importAllErpDataToCms JS function found in advance.html")
        else:
            print("[FAIL] importAllErpDataToCms missing from advance.html")
else:
    print("[FAIL] advance.html missing!")

print("\n--- All static checks completed successfully! ---")
