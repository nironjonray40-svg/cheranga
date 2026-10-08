import sys
import json
import urllib.request
sys.stdout.reconfigure(encoding='utf-8')

filepath = r"C:\Users\niron\OneDrive\Desktop\Omr\Omr\101 - Copy (2).jpg"
with open(filepath, 'rb') as f:
    img_bytes = f.read()

boundary = '----WebKitFormBoundaryXyZ123'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="101 - Copy (2).jpg"\r\n'
    f'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8') + img_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(
    'http://localhost:8000/api/scan_omr',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print("STATUS:", res.get("status"))
    print("STUDENT ID:", res.get("student_id"))
    print("ROLL:", res.get("roll_no"))
    print("SETS:", list(res.get("sets", {}).keys()))
    ans = res["sets"]["ক"]
    for i in range(10):
        print(f"Q{i+1:02d}: {ans[i]} | Q{i+11:02d}: {ans[i+10]} | Q{i+21:02d}: {ans[i+20]}")
