# -*- coding: utf-8 -*-
import sys, math
sys.stdout.reconfigure(encoding='utf-8')

def paginate_room(class_groups, rows_per_page=22):
    # class_groups: dict of class_name -> list of students
    classes = list(class_groups.keys())
    if not classes:
        return []
    
    max_rows = max(len(class_groups[c]) for c in classes)
    total_pages = math.ceil(max_rows / rows_per_page) if max_rows > 0 else 1
    
    pages = []
    for p in range(total_pages):
        page_num = p + 1
        page_classes = {}
        for c in classes:
            st_list = class_groups[c]
            start_idx = p * rows_per_page
            end_idx = start_idx + rows_per_page
            sliced_st = st_list[start_idx:end_idx]
            if len(sliced_st) > 0:
                page_classes[c] = sliced_st
        
        pages.append({
            'page_num': page_num,
            'total_pages': total_pages,
            'classes': page_classes
        })
    return pages

# Test 1: Small room (fits on 1 page)
r1 = {
    'Class 8': list(range(1, 16)),
    'Class 6': list(range(1, 16))
}
pages1 = paginate_room(r1, 22)
print(f"Test 1 (15 & 15 students): {len(pages1)} page(s)")
for page in pages1:
    print(f"  Page {page['page_num']}/{page['total_pages']}: {[f'{c}: {len(sts)}' for c, sts in page['classes'].items()]}")

# Test 2: Medium room (35 & 10 students)
r2 = {
    'Class 8': list(range(1, 36)),
    'Class 6': list(range(1, 11))
}
pages2 = paginate_room(r2, 22)
print(f"\nTest 2 (35 & 10 students): {len(pages2)} page(s)")
for page in pages2:
    print(f"  Page {page['page_num']}/{page['total_pages']}: {[f'{c}: {len(sts)}' for c, sts in page['classes'].items()]}")

# Test 3: Large room (50 students in 1 class)
r3 = {
    'Class 10': list(range(1, 51))
}
pages3 = paginate_room(r3, 22)
print(f"\nTest 3 (50 students): {len(pages3)} page(s)")
for page in pages3:
    print(f"  Page {page['page_num']}/{page['total_pages']}: {[f'{c}: {len(sts)}' for c, sts in page['classes'].items()]}")
