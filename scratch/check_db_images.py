import sqlite3
import json

conn = sqlite3.connect('school.db')
cur = conn.cursor()

for key in ['school_staff', 'school_slider_images', 'school_settings', 'school_important_links', 'school_notices']:
    cur.execute("SELECT value FROM kv_store WHERE key = ?", (key,))
    row = cur.fetchone()
    if row and row[0]:
        val = row[0]
        print(f"=== {key} (length: {len(val)}) ===")
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                print(f"  Count: {len(parsed)}")
                if len(parsed) > 0:
                    print("  Item 0 sample:", str(parsed[0])[:200])
                    # Check for image/photo fields
                    for item in parsed:
                        if isinstance(item, dict):
                            for k, v in item.items():
                                if 'photo' in k.lower() or 'img' in k.lower() or 'url' in k.lower():
                                    if v:
                                        print(f"    Field {k}: {str(v)[:100]}")
            elif isinstance(parsed, dict):
                for k, v in parsed.items():
                    if 'photo' in k.lower() or 'img' in k.lower() or 'logo' in k.lower():
                        print(f"    Key {k}: {str(v)[:100]}")
        except Exception as e:
            print("  JSON parse error:", e)
    else:
        print(f"=== {key}: NOT FOUND ===")
conn.close()
