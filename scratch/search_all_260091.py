import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync')
rows = c.fetchall()

out = []
for k, v in rows:
    if '260091' in v or '260091' in k:
        out.append(f"MATCH IN KEY: {k}")
        try:
            parsed = json.loads(v)
            if isinstance(parsed, dict):
                for pk, pv in parsed.items():
                    if '260091' in pk or '260091' in json.dumps(pv):
                        out.append(f"  sub-key {pk}: {json.dumps(pv, ensure_ascii=False)[:300]}")
            elif isinstance(parsed, list):
                for item in parsed:
                    if '260091' in json.dumps(item):
                        out.append(f"  list item: {json.dumps(item, ensure_ascii=False)[:300]}")
        except Exception as e:
            out.append(f"  raw: {v[:300]}")

with open('scratch/all_260091_results.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))
print("Saved search results")
