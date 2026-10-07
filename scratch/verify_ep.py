import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

checks = {
    'subview-omr-reader': 'id="subview-omr-reader"' in content,
    'btn-tab-omr-reader': 'id="btn-tab-omr-reader"' in content,
    'modalViewEdit': 'id="modalViewEdit"' in content,
    'modalAnswerKey': 'id="modalAnswerKey"' in content,
    'btnStartEvaluation': 'id="btnStartEvaluation"' in content,
    'btnLoadSampleData': 'id="btnLoadSampleData"' in content,
    'btnResetData': 'id="btnResetData"' in content,
    'btnExportExcel': 'id="btnExportExcel"' in content,
    'btnPrintTable': 'id="btnPrintTable"' in content,
    'btnDownloadBlankOMR': 'id="btnDownloadBlankOMR"' in content,
    'btnSaveToExamsApi': 'id="btnSaveToExamsApi"' in content,
    'dropzoneAnswerKey': 'id="dropzoneAnswerKey"' in content,
    'dropzoneStudentOMR': 'id="dropzoneStudentOMR"' in content,
    'tableResults': 'id="tableResults"' in content,
    'tableResultsBody': 'id="tableResultsBody"' in content,
    'progressBarInner': 'id="progressBarInner"' in content,
    'statTotalStudents': 'id="statTotalStudents"' in content,
    'switchExamView omr-reader': "viewName === 'omr-reader'" in content
}

all_ok = True
for k, v in checks.items():
    print(f"[{'PASS' if v else 'FAIL'}] {k}")
    if not v:
        all_ok = False

print("\nSummary:", "ALL CHECKS PASSED!" if all_ok else "SOME CHECKS FAILED")
