import urllib.request
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

omr_dir = r'C:\Users\niron\OneDrive\Desktop\Omr\Omr'
files = [f for f in os.listdir(omr_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

for fname in files:
    fpath = os.path.join(omr_dir, fname)
    with open(fpath, 'rb') as f:
        img_bytes = f.read()

    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    part_header = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        'Content-Type: image/jpeg\r\n\r\n'
    ).encode('utf-8')
    part_footer = f'\r\n--{boundary}--\r\n'.encode('utf-8')
    body = part_header + img_bytes + part_footer

    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/scan_omr',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode('utf-8')
            print(f"{fname} -> {data}")
    except Exception as e:
        print(f"{fname} -> Error: {e}")
