import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("1. Fetching cms.html...")
req = urllib.request.urlopen('http://localhost:8000/cms.html')
html = req.read().decode('utf-8')
print(f"Status Code: {req.status}")
print("chairmanPhotoImg in HTML:", 'id="chairmanPhotoImg"' in html)
print("headmasterPhotoImg in HTML:", 'id="headmasterPhotoImg"' in html)
print("chairmanAvatarFallback in HTML:", 'id="chairmanAvatarFallback"' in html)
print("headmasterAvatarFallback in HTML:", 'id="headmasterAvatarFallback"' in html)
print("modalSpeechPhoto in HTML:", 'id="modalSpeechPhoto"' in html)

print("\n2. Fetching /api/db...")
req_db = urllib.request.urlopen('http://localhost:8000/api/db')
data = json.loads(req_db.read().decode('utf-8'))
settings = json.loads(data.get('school_settings', '{}'))
print(f"Settings Chairman Name: {settings.get('chairmanName')}")
print(f"Settings Chairman Photo Length: {len(settings.get('chairmanPhoto', ''))}")
print(f"Settings Headmaster Name: {settings.get('headmasterName')}")
print(f"Settings Headmaster Photo Length: {len(settings.get('headmasterPhoto', ''))}")

staff = json.loads(data.get('school_staff', '[]'))
print(f"Total staff members: {len(staff)}")
for s in staff:
    if 'প্রধান শিক্ষক' in (s.get('designation') or ''):
        print(f"Staff Headmaster: {s.get('name') or s.get('nameBn')} | Photo length: {len(s.get('photo', ''))}")
