# -*- coding: utf-8 -*-
sample_item = {
    'room': {'number': '101'},
    'benches': [
        {'left': {'class': 'Nine', 'section': 'A', 'studentId': '0001'}, 'right': {'class': 'Seven', 'section': 'ক', 'studentId': '0101'}},
        {'left': {'class': 'Nine', 'section': 'A', 'studentId': '0002'}, 'right': {'class': 'Seven', 'section': 'ক', 'studentId': '0102'}},
        {'left': {'class': 'Nine', 'section': 'B', 'studentId': '0015'}, 'right': {'class': 'Seven', 'section': 'খ', 'studentId': '0120'}},
        {'left': {'class': 'Nine', 'section': 'B', 'studentId': '0016'}, 'right': {'class': 'Seven', 'section': 'খ', 'studentId': '0121'}},
    ]
}

classGroup = {}
for b in sample_item['benches']:
    for st in [b.get('left'), b.get('right')]:
        if st:
            c = st.get('class', 'Unassigned')
            sec = st.get('section', 'A').strip() or 'A'
            if c not in classGroup: classGroup[c] = {}
            if sec not in classGroup[c]: classGroup[c][sec] = []
            classGroup[c][sec].push(st) if hasattr(classGroup[c][sec], 'push') else classGroup[c][sec].append(st)

print("Class & Section grouping result:")
for c, secMap in classGroup.items():
    print(f"Class: {c}")
    for sec, stList in secMap.items():
        ids = [st['studentId'] for st in stList]
        print(f"  Section {sec}: {len(stList)} students -> {', '.join(ids)}")
