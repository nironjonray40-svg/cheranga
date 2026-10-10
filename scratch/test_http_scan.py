import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
with open(r"c:\Users\niron\OneDrive\Desktop\Omr\Omr 2\Answer - Copy - Copy - Copy.jpg", "rb") as f:
    img_data = f.read()

body = bytearray()
body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(b'Content-Disposition: form-data; name="file"; filename="Answer - Copy - Copy - Copy.jpg"\r\n')
body.extend(b"Content-Type: image/jpeg\r\n\r\n")
body.extend(img_data)
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(
    "http://localhost:8000/api/scan_omr",
    data=bytes(body),
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    print("HTTP API /api/scan_omr Status:", res.get("status"))
    print("Q1:", repr(res["sets"]["ক"][0]))
    print("Q30:", repr(res["sets"]["ক"][29]))
