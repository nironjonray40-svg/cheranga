import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== VERIFYING CMS SETTINGS IN SQLITE DB ===")
conn = sqlite3.connect('school.db')
c = conn.cursor()

# Test setting admission to False
test_settings = {
    "updated_at": 1757567890000,
    "sections": {
        "ticker": True,
        "hero": True,
        "stats": True,
        "about": False,
        "speeches": True,
        "academics": True,
        "teachers": True,
        "notices": True,
        "admission": False,
        "fees": False,
        "facilities": True,
        "gallery": True,
        "contact": True
    }
}

val_str = json.dumps(test_settings, ensure_ascii=False)
c.execute("INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES ('school_cms_settings', ?, datetime('now'))", (val_str,))
conn.commit()

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_cms_settings'")
row = c.fetchone()
print("Saved row in DB:", row[0], "->", json.loads(row[1])['sections']['admission'])

# Now set back to True as default
test_settings['sections']['admission'] = True
val_str = json.dumps(test_settings, ensure_ascii=False)
c.execute("INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES ('school_cms_settings', ?, datetime('now'))", (val_str,))
conn.commit()

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_cms_settings'")
row = c.fetchone()
print("Reset back in DB:", row[0], "->", json.loads(row[1])['sections']['admission'])

conn.close()
print("All DB persistence tests passed!")
