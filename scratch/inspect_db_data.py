import sqlite3
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
keys = ['school_settings', 'school_staff', 'school_classes', 'school_subjects', 'school_ticker_notices', 'school_slider_images', 'school_notices', 'school_cms_settings', 'school_cms_data']
for k in keys:
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (k,))
    row = c.fetchone()
    if row:
        val = row[0]
        try:
            parsed = json.loads(val)
            if isinstance(parsed, dict):
                print(f'{k} (dict keys):', list(parsed.keys()))
                if k == 'school_settings':
                    for sk, sv in parsed.items():
                        if not isinstance(sv, str) or len(sv) < 80:
                            print(f'   {sk}: {sv}')
            elif isinstance(parsed, list):
                print(f'{k} (list len={len(parsed)}):')
                for item in parsed[:3]:
                    if isinstance(item, dict):
                        summary = {ik: iv for ik, iv in item.items() if not isinstance(iv, str) or len(iv) < 50}
                        print(f'   - {summary}')
                    else:
                        print(f'   - {item}')
            else:
                print(f'{k}:', parsed)
        except Exception as e:
            print(f'{k} json error: {e}')
    else:
        print(f'{k}: NOT FOUND')
