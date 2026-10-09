import cv2, numpy as np, sys
sys.stdout.reconfigure(encoding='utf-8')

def test_grid(img_path):
    image = cv2.imread(img_path)
    std_height = 1200
    ratio = std_height / max(1, image.shape[0])
    std_width = int(image.shape[1] * ratio)
    resized = cv2.resize(image, (std_width, std_height))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 90, 255, cv2.THRESH_BINARY_INV)

    coords = cv2.findNonZero(thresh).reshape(-1, 2)
    page_left_x = int(np.min(coords[:, 0]))
    page_right_x = int(np.max(coords[:, 0]))
    page_top_y = int(np.min(coords[:, 1]))
    page_bottom_y = int(np.max(coords[:, 1]))
    page_width = page_right_x - page_left_x
    page_height = page_bottom_y - page_top_y

    # Relative to page boundaries:
    # Anchor calibration:
    # Let's use relative coordinates so even if scale changes, it's robust:
    # At page_width=804, page_height=1133:
    # reg_xs = 83..271 -> rel_x: (83-21)/804 = 0.0771, step = 31.33/804 = 0.03897
    reg_xs = [page_left_x + page_width * (0.0771 + i * 0.03897) for i in range(7)]
    roll_xs = [page_left_x + page_width * (0.3868 + i * 0.0398) for i in range(3)]
    class_xs = [page_left_x + page_width * (0.5460 + i * 0.0386) for i in range(2)]
    sec_x = page_left_x + page_width * 0.704
    set_x = page_left_x + page_width * 0.704

    # Y coordinates:
    # digit 0 at y=773 -> rel_y = (773-37)/1133 = 0.6496, step = 26.55/1133 = 0.02343
    digit_ys = [page_top_y + page_height * (0.6496 + d * 0.02343) for d in range(10)]

    # Section Ys: 774, 806, 838, 870 -> rel_y = 0.6505 + idx * 0.02824
    sec_ys = [page_top_y + page_height * (0.6505 + i * 0.02824) for i in range(4)]
    bengali_options = ['ক', 'খ', 'গ', 'ঘ']

    # Set Ys: 948, 982, 1012 -> rel_y = 0.8041 + idx * 0.0298
    set_ys = [page_top_y + page_height * (0.8041 + i * 0.0298) for i in range(3)]
    set_options = ['ক', 'খ', 'গ', 'ঘ']

    def sample_bubble(cx, cy, r=10):
        cx, cy = int(round(cx)), int(round(cy))
        mask = np.zeros(thresh.shape, dtype='uint8')
        cv2.circle(mask, (cx, cy), r, 255, -1)
        filled = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
        total = cv2.countNonZero(mask)
        return filled / float(max(1, total))

    # 1. Reg No
    reg_digits = []
    for c_idx, cx in enumerate(reg_xs):
        scores = [sample_bubble(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        best_s = scores[best_d]
        reg_digits.append(str(best_d) if best_s > 0.35 else '0')

    # 2. Roll No
    roll_digits = []
    for c_idx, cx in enumerate(roll_xs):
        scores = [sample_bubble(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        best_s = scores[best_d]
        roll_digits.append(str(best_d) if best_s > 0.35 else '0')

    # 3. Class
    class_digits = []
    for c_idx, cx in enumerate(class_xs):
        scores = [sample_bubble(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        best_s = scores[best_d]
        class_digits.append(str(best_d) if best_s > 0.35 else '0')

    # 4. Section
    sec_scores = [sample_bubble(sec_x, cy) for cy in sec_ys]
    best_sec_idx = int(np.argmax(sec_scores))
    sec_char = bengali_options[best_sec_idx] if sec_scores[best_sec_idx] > 0.35 else 'ক'

    # 5. Set
    set_scores = [sample_bubble(set_x, cy) for cy in set_ys]
    best_set_idx = int(np.argmax(set_scores))
    set_char = set_options[best_set_idx] if set_scores[best_set_idx] > 0.35 else 'ক'

    print(f"File: {img_path}")
    print(f"  Reg No:  {''.join(reg_digits)}")
    print(f"  Roll No: {''.join(roll_digits)}")
    print(f"  Class:   {''.join(class_digits)}")
    print(f"  Section: {sec_char} ({[round(s, 2) for s in sec_scores]})")
    print(f"  Set:     {set_char} ({[round(s, 2) for s in set_scores]})")

test_grid(r"C:\Users\niron\OneDrive\Desktop\Omr\Omr\101 - Copy (2).jpg")
test_grid(r"C:\Users\niron\OneDrive\Desktop\Omr\Omr\101 - Copy.jpg")
