import re, sys, sqlite3, json
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("=== Exam Portal Marks Storage Keys ===")
for m in re.finditer(r'localStorage\.(?:setItem|getItem)\([\'"]([^\'"]+)[\'"]', text):
    k = m.group(1)
    if 'mark' in k.lower() or 'exam' in k.lower() or 'score' in k.lower():
        print("  Key:", k)

print("\n=== Check school.db local_storage_sync keys related to marks ===")
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key FROM local_storage_sync WHERE key LIKE '%mark%' OR key LIKE '%exam%' OR key LIKE '%score%'")
for r in c.fetchall():
    print("  DB key:", r[0])
