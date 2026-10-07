with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

elements = [
    'btnStartEvaluation', 'btnLoadSampleData', 'btnResetData', 'btnExportExcel',
    'btnPrintTable', 'btnDownloadBlankOMR', 'btnSaveEdit', 'btnCloseModal',
    'btnCancelEdit', 'btnOpenKeyModal', 'btnCloseKeyModal', 'btnSaveAnswerKeys',
    'dropzoneAnswerKey', 'dropzoneStudentOMR', 'inputAnswerKeyFolder',
    'inputAnswerKeyFile', 'inputStudentOMRFolder', 'editSet', 'inputSearch',
    'filterClass', 'filterSection', 'filterSet', 'filterStatus', 'subview-omr-reader',
    'btn-tab-omr-reader', 'modalViewEdit', 'modalAnswerKey', 'toastContainer',
    'tableResults', 'tableResultsBody', 'progressBarInner', 'progressWrapper'
]

missing = []
for el in elements:
    if f'id="{el}"' not in html and f"id='{el}'" not in html:
        missing.append(el)

print("Checked elements:")
if missing:
    print("MISSING IDs:", missing)
else:
    print("ALL 32 IDs PRESENT IN EXAM-PORTAL.HTML!")
