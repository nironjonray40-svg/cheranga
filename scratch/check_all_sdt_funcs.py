import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

sdt_funcs = [
    'toBengaliNumerals', 'formatClassName', 'formatShiftInfo', 'updateFontSize', 
    'updateFontFamily', 'initFontFamily', 'populateFilterDropdowns', 'getRoomGenderSuffix', 
    'getSampleDataFallback', 'getLang', 'formatNumberByLang', 'formatClassNameByLang', 
    'formatShiftInfoByLang', 'formatBuildingNameByLang', 'getMainTitleByLang', 
    'getBuildingLabelByLang', 'getShiftLabelPrefix', 'getShiftHeaderByLang', 
    'getClassHeaderByLang', 'getTotalHeaderByLang', 'getGrandTotalLabelByLang', 
    'formatRoomNumberByLang', 'updateStudentDataTopsheetLive', 'refreshStudentDataTopsheetData'
]

for fn in sdt_funcs:
    m = re.search(r'function\s+' + fn + r'\s*\(', sp)
    if m:
        print(f"Function '{fn}' is already defined in seat-plan.html")
    else:
        print(f"Function '{fn}' is new")

