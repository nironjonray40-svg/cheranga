import re

def update_file():
    with open('exam-portal.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update editStudentId input in HTML
    old_input1 = '<input type="text" id="editStudentId" class="form-control" maxlength="7">'
    new_input1 = '<input type="text" id="editStudentId" class="form-control" maxlength="10" style="font-family: \'Inter\', monospace; font-weight: 600;">'
    if old_input1 in content:
        content = content.replace(old_input1, new_input1, 1)
        print("1. Replaced editStudentId HTML input")
    else:
        print("1. Note: old_input1 not matched or already updated")

    # 2. Update splitEditStudentId input in HTML
    pattern_split = r'<input type="text" id="splitEditStudentId" class="form-control"([^>]*)oninput="syncStudentInput\(\'id\', this\.value\)"'
    def repl_split(m):
        attrs = m.group(1)
        if "font-family: 'Inter', monospace" not in attrs:
            return '<input type="text" id="splitEditStudentId" class="form-control" style="padding: 2px 6px; font-size: 0.85rem; height: 26px; font-family: \'Inter\', monospace; font-weight: 600;" oninput="syncStudentInput(\'id\', this.value)"'
        return m.group(0)
    content, count_split = re.subn(pattern_split, repl_split, content, count=1)
    print(f"2. Updated splitEditStudentId: {count_split}")

    # 3. Update selectAndImportExam for both 'omr' and 'schedule' sources
    # For 'omr':
    old_omr_code = "state.students = sortStudentsByRegNo(JSON.parse(JSON.stringify(oe.students)));"
    new_omr_code = """const importedOmrStudents = sortStudentsByRegNo(JSON.parse(JSON.stringify(oe.students)));
          importedOmrStudents.forEach(st => {
            st.id = toEnglishDigits(st.id || st.regNo || '').trim();
            st.regNo = st.id;
            if (st.studentId) st.studentId = toEnglishDigits(st.studentId).trim();
          });
          state.students = importedOmrStudents;"""
    if old_omr_code in content:
        content = content.replace(old_omr_code, new_omr_code, 1)
        print("3. Updated selectAndImportExam for OMR source")

    # For 'schedule':
    old_sch_reg = "const studentRegId = student.regNo || student.studentId || ('2211' + String(student.roll || idx + 1).padStart(3, '0'));"
    new_sch_reg = """const fallbackReg = '2211' + String(student.roll || idx + 1).padStart(3, '0');
          const studentRegId = toEnglishDigits(student.regNo || student.studentId || student.id || fallbackReg).trim();"""
    if old_sch_reg in content:
        content = content.replace(old_sch_reg, new_sch_reg, 1)
        print("4. Updated selectAndImportExam for Schedule source")

    # 5. Update student object return in selectAndImportExam for Schedule source
    old_sch_obj = """return {
            id: studentRegId,
            regNo: studentRegId,
            studentId: student.studentId || studentRegId,"""
    new_sch_obj = """return {
            id: studentRegId,
            regNo: studentRegId,
            studentId: studentRegId,"""
    if old_sch_obj in content:
        content = content.replace(old_sch_obj, new_sch_obj, 1)
        print("5. Updated student object fields in Schedule import")

    # 6. Update loadOmrFromExamsApi
    old_load_omr = "state.students = latest.students;"
    new_load_omr = """state.students = sortStudentsByRegNo(latest.students);
                state.students.forEach(st => {
                  st.id = toEnglishDigits(st.id || st.regNo || '').trim();
                  st.regNo = st.id;
                  if (st.studentId) st.studentId = toEnglishDigits(st.studentId).trim();
                });"""
    if old_load_omr in content:
        content = content.replace(old_load_omr, new_load_omr, 1)
        print("6. Updated loadOmrFromExamsApi")

    # 7. Update assignPendingOmr toast
    old_assign_toast = """showToast(`শিক্ষার্থী ${stName ? `"${stName}" ` : ''}(রেজিঃ ${toBengaliNumber(student.id)})-এর MCQ নম্বর (${toBengaliNumber(student.correct)}/৩০) সফলভাবে যুক্ত করা হয়েছে!`, 'success', 'fa-circle-check');"""
    new_assign_toast = """showToast(`শিক্ষার্থী ${stName ? `"${stName}" ` : ''}(রেজিঃ ${toEnglishDigits(student.id)})-এর MCQ নম্বর (${toBengaliNumber(student.correct)}/৩০) সফলভাবে যুক্ত করা হয়েছে!`, 'success', 'fa-circle-check');"""
    if old_assign_toast in content:
        content = content.replace(old_assign_toast, new_assign_toast, 1)
        print("7. Updated assignPendingOmr toast")

    # 8. Update openViewEditModal header info
    old_modal_hdr1 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(student.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main);">${toBengaliNumber(student.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${student.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileLabel}</span>`;"""
    new_modal_hdr1 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(student.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(student.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${student.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileLabel}</span>`;"""
    if old_modal_hdr1 in content:
        content = content.replace(old_modal_hdr1, new_modal_hdr1, 1)
        print("8. Updated openViewEditModal header info")

    # 9. Update syncStudentInput header info
    old_modal_hdr2 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main);">${toBengaliNumber(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${state.tempEditStudent.fileName || 'ওএমআর কপি'}</span>`;"""
    new_modal_hdr2 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${state.tempEditStudent.fileName || 'ওএমআর কপি'}</span>`;"""
    if old_modal_hdr2 in content:
        content = content.replace(old_modal_hdr2, new_modal_hdr2, 1)
        print("9. Updated syncStudentInput header info")

    # 10. Update rescanCurrentStudentOmr header info
    old_modal_hdr3 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main);">${toBengaliNumber(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileName}</span>`;"""
    new_modal_hdr3 = """headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileName}</span>`;"""
    if old_modal_hdr3 in content:
        content = content.replace(old_modal_hdr3, new_modal_hdr3, 1)
        print("10. Updated rescanCurrentStudentOmr header info")

    # 11. Update openViewEditModal input population
    old_edit_pop = """if (editStudentId) editStudentId.value = student.id || '';"""
    new_edit_pop = """if (editStudentId) editStudentId.value = toEnglishDigits(student.id || '');"""
    if old_edit_pop in content:
        content = content.replace(old_edit_pop, new_edit_pop, 1)
        print("11. Updated editStudentId population")

    old_split_pop = """if (splitId) splitId.value = student.id || '';"""
    new_split_pop = """if (splitId) splitId.value = toEnglishDigits(student.id || '');"""
    if old_split_pop in content:
        content = content.replace(old_split_pop, new_split_pop, 1)
        print("12. Updated splitId population")

    # 12. Update syncStudentInput 'id' branch to force toEnglishDigits
    old_sync_id = """if (field === 'id') {
                    if (editStudentId && editStudentId.value !== value) editStudentId.value = value;
                    const splitId = document.getElementById('splitEditStudentId');
                    if (splitId && splitId.value !== value) splitId.value = value;"""
    new_sync_id = """if (field === 'id') {
                    const engVal = toEnglishDigits(value).trim();
                    state.tempEditStudent.id = engVal;
                    state.tempEditStudent.regNo = engVal;
                    if (editStudentId && editStudentId.value !== engVal) editStudentId.value = engVal;
                    const splitId = document.getElementById('splitEditStudentId');
                    if (splitId && splitId.value !== engVal) splitId.value = engVal;"""
    if old_sync_id in content:
        content = content.replace(old_sync_id, new_sync_id, 1)
        print("13. Updated syncStudentInput id branch")

    # 13. Update saveCurrentTempChangesSilently
    old_silent_save = """function saveCurrentTempChangesSilently() {
                if (state.currentEditIndex < 0 || !state.tempEditStudent) return;
                const updated = state.tempEditStudent;"""
    new_silent_save = """function saveCurrentTempChangesSilently() {
                if (state.currentEditIndex < 0 || !state.tempEditStudent) return;
                const updated = state.tempEditStudent;
                updated.id = toEnglishDigits(updated.id || '').trim();
                updated.regNo = updated.id;
                if (updated.studentId) updated.studentId = toEnglishDigits(updated.studentId).trim();"""
    if old_silent_save in content:
        content = content.replace(old_silent_save, new_silent_save, 1)
        print("14. Updated saveCurrentTempChangesSilently")

    # 14. Update exportResultsExcel
    old_excel_id = "'শিক্ষার্থী রেজিঃ নং': s.id,"
    new_excel_id = "'শিক্ষার্থী রেজিঃ নং': toEnglishDigits(s.id || s.regNo),"
    if old_excel_id in content:
        content = content.replace(old_excel_id, new_excel_id, 1)
        print("15. Updated exportResultsExcel")

    with open('exam-portal.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done! exam-portal.html updated.")

if __name__ == '__main__':
    update_file()
