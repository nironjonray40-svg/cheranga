import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
import re

def getAttendanceSubjectShortName(nameStr):
    if not nameStr:
        return 'SUB'
    s = str(nameStr).strip()
    lower = s.lower()

    # 1. Higher Math vs General Math
    if re.search(r'higher\s*math|h\.?\s*math|উচ্চতর\s*গণিত', lower):
        return 'H.MATH'

    # 2. Bangladesh and Global Studies (BGS) - MUST be before general Bangla
    if re.search(r'\bbgs\b|bangladesh\s*and\s*global|bangladesh\s*&\s*global|বাংলাদেশ\s*ও\s*বিশ্ব|বাওবি|সমাজ\s*বিজ্ঞান', lower):
        return 'BGS'

    # 3. Bangla Papers
    if re.search(r'bangla.*1|বাংলা.*১|bangla\s*sahitya|বাংলা\s*সাহিত্য|bangla.*first', lower):
        return 'BAN 1st'
    if re.search(r'bangla.*2|বাংলা.*২|bangla.*gram|বাংলা.*ব্যাকরণ|byakaran|নির্মিতি|bangla.*second', lower):
        return 'BAN 2nd'
    if re.search(r'\bbangla\b|\bbng\b|বাংলা(?!দেশ)', lower):
        return 'BAN'

    # 4. English Papers
    if re.search(r'english.*1|ইংরেজি.*১|english\s*for\s*today|english.*first', lower):
        return 'ENG 1st'
    if re.search(r'english.*2|ইংরেজি.*২|english.*gram|composition|রচনা|english.*second', lower):
        return 'ENG 2nd'
    if re.search(r'\benglish\b|\beng\b|ইংরেজি', lower):
        return 'ENG'

    # 5. Work & Life, Physical Education, Arts & Crafts (before bio / physics / science)
    if re.search(r'work\s*and\s*life|কর্ম\s*ও\s*জীবন|কর্মমুখী|কর্ম', lower):
        return 'WORK'
    if re.search(r'physical\s*ed|শারীরিক\s*শিক্ষা|শারীরিক', lower):
        return 'PHY.ED'
    if re.search(r'art|drawing|চারু\s*ও\s*কারু|চারু|ড্রয়িং|অঙ্কন', lower):
        return 'ART'

    # 6. Commerce & Humanities Specific Subjects (before general Science / Math)
    if re.search(r'accounting|হিসাববিজ্ঞান|হিসাব', lower):
        return 'ACC'
    if re.search(r'finance|ফিন্যান্স|ব্যাংকিং', lower):
        return 'FIN'
    if re.search(r'business\s*ent|ব্যবসায়\s*উদ্যোগ|ব্যবসায়\s*উদ্যোগ|\bbusiness\b|ব্যবসায়|ব্যবসায়', lower):
        return 'B.ENT'
    if re.search(r'economics|অর্থনীতি', lower):
        return 'ECON'
    if re.search(r'civic|পৌরনীতি', lower):
        return 'CIV'
    if re.search(r'history|ইতিহাস|বিশ্বসভ্যতা', lower):
        return 'HIST'
    if re.search(r'geography|ভূগোল', lower):
        return 'GEO'

    # 7. General Math
    if re.search(r'general\s*math|mathematics|\bmath\b|গণিত', lower):
        return 'MATH'

    # 8. ICT
    if re.search(r'\bict\b|information\s*and\s*communication|information\s*&\s*communication|তথ্য\s*ও\s*যোগাযোগ|তথ্যপ্রযুক্তি', lower):
        return 'ICT'

    # 9. Physics / Chemistry / Biology
    if re.search(r'physics|পদার্থবিজ্ঞান|পদার্থ', lower):
        return 'PHY'
    if re.search(r'chemistry|রসায়নবিজ্ঞান|রসায়ন|রসায়ন', lower):
        return 'CHEM'
    if re.search(r'biology|জীববিজ্ঞান', lower):
        return 'BIO'

    # 10. Home Science vs Agriculture vs General Science
    if re.search(r'home\s*sci|গার্হস্থ্য', lower):
        return 'HOME'
    if re.search(r'agri|কৃষি', lower):
        return 'AGRI'
    if re.search(r'general\s*science|প্রাথমিক\s*বিজ্ঞান|\bscience\b|\bsci\b|বিজ্ঞান', lower):
        return 'SCI'

    # 11. Religions
    if re.search(r'(islam|ইসলাম).*(hindu|হিন্দু)|(hindu|হিন্দু).*(islam|ইসলাম)', lower):
        return 'ISLAM/HINDU'
    if re.search(r'hindu|হিন্দু', lower):
        return 'HINDU'
    if re.search(r'islam|ইসলাম', lower):
        return 'ISLAM'
    if re.search(r'christian|খ্রিস্ট', lower):
        return 'CHRIST'
    if re.search(r'buddh|বৌদ্ধ', lower):
        return 'BUDDHA'
    if re.search(r'religion|ধর্ম', lower):
        return 'ISLAM/HINDU'

    # 12. General Knowledge
    if re.search(r'general\s*knowledge|\bgk\b|সাধারণ\s*জ্ঞান', lower):
        return 'GK'

    # 13. Madrasah subjects
    if re.search(r'arabic|আরবি', lower):
        return 'ARABIC'
    if re.search(r'quran|কুরআন', lower):
        return 'QURAN'
    if re.search(r'hadith|হাদিস', lower):
        return 'HADITH'
    if re.search(r'fiqh|ফিকহ', lower):
        return 'FIQH'
    if re.search(r'aqaid|আকাইদ', lower):
        return 'AQAID'

    words = re.split(r'[\s\-–—/]+', s)
    if len(words) == 1:
        return words[0][:5].upper()
    return ''.join(w[0] for w in words if w)[:5].upper()


test_cases = [
    ("Bangla 1st Paper", "BAN 1st"),
    ("বাংলা ১ম পত্র", "BAN 1st"),
    ("বাংলা সাহিত্য", "BAN 1st"),
    ("Bangla 2nd Paper", "BAN 2nd"),
    ("বাংলা ২য় পত্র", "BAN 2nd"),
    ("বাংলা ভাষার ব্যাকরণ ও নির্মিতি", "BAN 2nd"),
    ("বাংলা", "BAN"),
    ("English For Today", "ENG 1st"),
    ("ইংরেজি ১ম পত্র", "ENG 1st"),
    ("English Grammar and Composition", "ENG 2nd"),
    ("ইংরেজি ২য় পত্র", "ENG 2nd"),
    ("English", "ENG"),
    ("Mathematics", "MATH"),
    ("সাধারণ গণিত", "MATH"),
    ("গণিত", "MATH"),
    ("Higher Mathematics", "H.MATH"),
    ("উচ্চতর গণিত", "H.MATH"),
    ("Information and Communication Technology", "ICT"),
    ("তথ্য ও যোগাযোগ প্রযুক্তি", "ICT"),
    ("Bangladesh and Global Studies", "BGS"),
    ("বাংলাদেশ ও বিশ্বপরিচয়", "BGS"),
    ("Physics", "PHY"),
    ("পদার্থবিজ্ঞান", "PHY"),
    ("Chemistry", "CHEM"),
    ("রসায়নবিজ্ঞান", "CHEM"),
    ("রসায়ন", "CHEM"),
    ("Biology", "BIO"),
    ("জীববিজ্ঞান", "BIO"),
    ("Agriculture Studies", "AGRI"),
    ("কৃষি শিক্ষা", "AGRI"),
    ("Home Science", "HOME"),
    ("গার্হস্থ্য বিজ্ঞান", "HOME"),
    ("Science", "SCI"),
    ("প্রাথমিক বিজ্ঞান", "SCI"),
    ("Accounting", "ACC"),
    ("হিসাববিজ্ঞান", "ACC"),
    ("Business Entrepreneurship", "B.ENT"),
    ("ব্যবসায় উদ্যোগ", "B.ENT"),
    ("Finance and Banking", "FIN"),
    ("ফিন্যান্স ও ব্যাংকিং", "FIN"),
    ("Economics", "ECON"),
    ("অর্থনীতি", "ECON"),
    ("Civics and Citizenship", "CIV"),
    ("পৌরনীতি ও নাগরিকতা", "CIV"),
    ("History of Bangladesh and World Civilization", "HIST"),
    ("বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা", "HIST"),
    ("Geography and Environment", "GEO"),
    ("ভূগোল ও পরিবেশ", "GEO"),
    ("Islamic Studies / Hindu Religion Studies", "ISLAM/HINDU"),
    ("ধর্ম ও নৈতিক শিক্ষা", "ISLAM/HINDU"),
    ("ইসলাম ও নৈতিক শিক্ষা", "ISLAM"),
    ("হিন্দুধর্ম ও নৈতিক শিক্ষা", "HINDU"),
    ("Physical Education and Health", "PHY.ED"),
    ("শারীরিক শিক্ষা ও স্বাস্থ্য", "PHY.ED"),
    ("Work and Life Oriented Education", "WORK"),
    ("কর্ম ও জীবনমুখী শিক্ষা", "WORK"),
    ("Arts and Crafts", "ART"),
    ("চারু ও কারুকলা", "ART"),
    ("সাধারণ জ্ঞান", "GK"),
]

passed = 0
for inp, exp in test_cases:
    res = getAttendanceSubjectShortName(inp)
    if res == exp:
        passed += 1
    else:
        print(f"FAIL: {inp!r} => got {res!r}, expected {exp!r}")

print(f"Test result: {passed}/{len(test_cases)} passed.")
