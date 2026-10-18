import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# Mock schedules
schedules = [
    {'term': 'Elegileble test', 'subject': 'English For Today', 'class': 'Eight'},
    {'term': 'বার্ষিক পরীক্ষা', 'subject': 'Science', 'class': 'Six'},
    {'term': 'অর্ধ-বার্ষিক পরীক্ষা', 'subject': 'Bangla 1st Paper', 'class': 'Eight'},
    {'term': 'টেস্ট পরীক্ষা নো সাবজেক্ট', 'subject': '', 'class': 'Nine'},  # NO subject!
]

# Types has an exam with 0 schedules
types = [
    {'name': 'Elegileble test'},
    {'name': 'বার্ষিক পরীক্ষা'},
    {'name': 'অর্ধ-বার্ষিক পরীক্ষা'},
    {'name': 'টেস্ট পরীক্ষা নো সাবজেক্ট'},
    {'name': 'সম্পূর্ণ নতুন পরীক্ষা যা লিস্টে নেই'}
]

def getAllExams(schedules_data):
    examList = []
    seen = set()

    for s in schedules_data:
        if s and isinstance(s, dict):
            name = (s.get('term') or s.get('examName') or '').strip()
            subject = (s.get('subject') or s.get('subjectName') or s.get('sub') or '').strip()
            if name and subject:
                key = name.lower()
                if key not in seen:
                    seen.add(key)
                    examList.append(name)
    return examList

exams = getAllExams(schedules)
print("Visible exams in Marksheet:", exams)
assert 'Elegileble test' in exams
assert 'বার্ষিক পরীক্ষা' in exams
assert 'অর্ধ-বার্ষিক পরীক্ষা' in exams
assert 'টেস্ট পরীক্ষা নো সাবজেক্ট' not in exams
assert 'সম্পূর্ণ নতুন পরীক্ষা যা লিস্টে নেই' not in exams
print("ALL TESTS PASSED!")
