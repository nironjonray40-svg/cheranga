import re

with open('server.py', 'r', encoding='utf-8') as f:
    code = f.read()

endpoints = re.findall(r'(\/[a-zA-Z0-9_\/\-\*]+)', code)
unique_endpoints = [e for e in set(endpoints) if any(kw in e for kw in ['api', 'sync', 'db', 'save', 'set', 'get', 'student', 'admission'])]
print("Endpoints found in server.py:", unique_endpoints)
