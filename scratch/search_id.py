import os
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('*.html') + glob.glob('*.js') + glob.glob('*.py')
for fn in sorted(files):
    if os.path.isfile(fn):
        try:
            with open(fn, 'r', encoding='utf-8') as f:
                content = f.read()
                c1 = content.count('শিক্ষার্থীর আইডি')
                c2 = content.count('studentId')
                c3 = content.count('student_id')
                c4 = content.count('Student ID')
                c5 = content.count('Student Id')
                c6 = content.count('শিক্ষার্থী আইডি')
                c7 = content.count('আইডি')
                if c1 + c2 + c3 + c4 + c5 + c6 > 0:
                    print(f'{fn:32s} | শিক্ষার্থীর আইডি: {c1:3d} | শিক্ষার্থী আইডি: {c6:3d} | studentId: {c2:3d} | student_id: {c3:3d} | Student ID: {c4:3d}')
        except Exception as e:
            print(f'{fn}: error {e}')
