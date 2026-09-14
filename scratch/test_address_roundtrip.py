import os
import sys
import json
import sqlite3

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_full_roundtrip():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'school.db')
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT value FROM local_storage_sync WHERE key = 'bd_geo_admission_data'")
    row = cur.fetchone()
    geo_data = json.loads(row[0]) if (row and row[0]) else {}

    # Add a custom test upazila, union and post office
    test_div = 'রংপুর'
    test_dist = 'নীলফামারী'
    test_custom_upz = 'টেস্ট বিশেষ উপজেলা'
    test_custom_union = 'টেস্ট মডেল ইউনিয়ন'
    test_custom_post = 'টেস্ট মডেল ডাকঘর (৫৯৯৯)'

    if test_div not in geo_data:
        geo_data[test_div] = {}
    if test_dist not in geo_data[test_div]:
        geo_data[test_div][test_dist] = {}

    geo_data[test_div][test_dist][test_custom_upz] = {
        'unions': [test_custom_union, '২নং বিশেষ ওয়ার্ড'],
        'posts': [test_custom_post]
    }

    # Save to SQLite (simulating /api/db/save from advance.html)
    cur.execute("INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES (?, ?, ?)",
                ('bd_geo_admission_data', json.dumps(geo_data, ensure_ascii=False), 1700000000000))
    conn.commit()

    # Now verify reading back from SQLite
    cur.execute("SELECT value FROM local_storage_sync WHERE key = 'bd_geo_admission_data'")
    read_row = cur.fetchone()
    read_data = json.loads(read_row[0])

    assert test_custom_upz in read_data[test_div][test_dist], "Custom upazila was not saved!"
    assert test_custom_union in read_data[test_div][test_dist][test_custom_upz]['unions'], "Custom union was not saved!"
    assert test_custom_post in read_data[test_div][test_dist][test_custom_upz]['posts'], "Custom post was not saved!"

    print(f"[SUCCESS] Custom upazila '{test_custom_upz}', union '{test_custom_union}', and post '{test_custom_post}' saved and verified!")

    # Clean up the test entry
    del read_data[test_div][test_dist][test_custom_upz]
    cur.execute("UPDATE local_storage_sync SET value = ? WHERE key = 'bd_geo_admission_data'",
                (json.dumps(read_data, ensure_ascii=False),))
    conn.commit()
    conn.close()
    print("[SUCCESS] Test cleanup completed. Full round-trip test passed!")

if __name__ == '__main__':
    test_full_roundtrip()
