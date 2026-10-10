import sys, os, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.abspath('.'))

import server

img_path = r"c:\Users\niron\OneDrive\Desktop\Omr\Omr 2\Answer - Copy - Copy - Copy.jpg"
with open(img_path, 'rb') as f:
    img_data = f.read()

res = server.process_omr_image(img_data, "Answer - Copy - Copy - Copy.jpg")
print("=== RESULT FROM process_omr_image ===")
print(json.dumps(res, indent=2, ensure_ascii=False))
