with open('seat-plan.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'Saved Seat Plans' in l or 'সংরক্ষিত সিটপ্ল্যান' in l or 'school_seat_plans' in l or 'seat_plans_store' in l or 'seat_allocations' in l:
        safe_l = l.strip()[:120].encode('ascii', 'replace').decode('ascii')
        print(f"Line {i+1}: {safe_l}")
