import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original length:", len(content))

# 1. Update results-tab-bar HTML to include Save & Entry button
tab_bar_old = """      <!-- Navigation Tabs & Alert Bar -->
      <div class="results-tab-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="tabBtnMainResults" class="results-tab-btn active" onclick="switchResultsTab('main')">
            <i class="fa-solid fa-list-check"></i> রেজাল্ট শিট
            <span class="tab-badge" id="badgeMainCount">০</span>
          </button>
          <button type="button" id="tabBtnPendingResults" class="results-tab-btn" onclick="switchResultsTab('pending')">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> পেন্ডিং তালিকা (Pending List)
            <span class="tab-badge badge-warning" id="badgePendingCount">০</span>
          </button>
        </div>
        <div id="pendingAlertQuickHint" style="display: none; font-size: 0.85rem; color: #dc2626; font-weight: 600; align-items: center; gap: 6px;">
          <i class="fa-solid fa-circle-exclamation"></i> <span id="pendingQuickCountText">০ টি শিট পেন্ডিং তালিকায় রয়েছে</span>
        </div>
      </div>"""

tab_bar_new = """      <!-- Navigation Tabs & Alert Bar -->
      <div class="results-tab-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="tabBtnMainResults" class="results-tab-btn active" onclick="switchResultsTab('main')">
            <i class="fa-solid fa-list-check"></i> রেজাল্ট শিট
            <span class="tab-badge" id="badgeMainCount">০</span>
          </button>
          <button type="button" id="tabBtnPendingResults" class="results-tab-btn" onclick="switchResultsTab('pending')">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> পেন্ডিং তালিকা (Pending List)
            <span class="tab-badge badge-warning" id="badgePendingCount">০</span>
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-left: auto;">
          <div id="pendingAlertQuickHint" style="display: none; font-size: 0.85rem; color: #dc2626; font-weight: 600; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-exclamation"></i> <span id="pendingQuickCountText">০ টি শিট পেন্ডিং তালিকায় রয়েছে</span>
          </div>
          <button type="button" id="btnSaveAndEntry" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; border: none; padding: 0.52rem 1.25rem; font-size: 0.9rem; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; gap: 7px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: all 0.2s ease;" onclick="saveAndEntryExamMarks()" title="বর্তমান মূল্যায়নকৃত ফলাফল Exam List এ স্থায়ীভাবে সংরক্ষণ ও এন্ট্রি করুন">
            <i class="fa-solid fa-cloud-arrow-up"></i> Save & Entry
          </button>
        </div>
      </div>"""

if tab_bar_old in content:
    content = content.replace(tab_bar_old, tab_bar_new, 1)
    print("Tab bar updated with Save & Entry button successfully!")
else:
    print("Error: tab_bar_old not found!")
    sys.exit(1)

# 2. Update state to include importedExamInfo
state_find = "pendingUnmatchedList: [],\n      activeResultsTab: 'main',"
state_replace = "pendingUnmatchedList: [],\n      activeResultsTab: 'main',\n      importedExamInfo: null,"

if state_find in content:
    content = content.replace(state_find, state_replace, 1)
    print("State updated with importedExamInfo!")

# 3. Update selectAndImportExam and add saveAndEntryExamMarks function
# Look for window.selectAndImportExam = function
old_select_start = "    window.selectAndImportExam = function(examId, source) {"
idx_start = content.find(old_select_start)

old_load_omr_start = "    window.loadOmrFromExamsApi = async function() {"
idx_end = content.find(old_load_omr_start)

if idx_start == -1 or idx_end == -1:
    print("Error: selectAndImportExam block markers not found!", idx_start, idx_end)
    sys.exit(1)

new_exam_import_and_save_logic = """    window.selectAndImportExam = function(examId, source) {
      const selected = cachedAvailableExams.find(x => x.id === examId && x.source === source);
      if (!selected) return;

      if (source === 'omr') {
        const oe = selected.omrData;
        if (oe && oe.students && oe.students.length > 0) {
          state.students = JSON.parse(JSON.stringify(oe.students));
          state.pendingUnmatchedList = [];
          state.importedExamInfo = {
            id: examId,
            source: 'omr',
            examName: selected.examName,
            subject: selected.subject || 'MCQ ওএমআর',
            class: selected.class || '',
            section: selected.section || 'সকল শাখা',
            omrData: oe
          };
          try {
            localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(state.importedExamInfo));
          } catch(e){}

          if (typeof switchResultsTab === 'function') switchResultsTab('main');
          if (typeof renderPendingList === 'function') renderPendingList();
          const lookupMaps = getStudentsLookupMaps();
          state.students.forEach(st => {
            if (!st.nameEn) {
              const rId = toEnglishDigits(st.id || '').trim();
              const rRoll = toEnglishDigits(st.roll || '').trim();
              const rCls = mapClassToNumber(st.class);
              const foundName = lookupMaps.byReg.get(rId) || lookupMaps.byRollClass.get(`${rCls}_${rRoll}`) || lookupMaps.byRollClass.get(`_${rRoll}`);
              if (foundName) {
                st.name = foundName;
                st.nameEn = foundName;
              }
            }
          });
          if (oe.answerKeys) {
            state.answerKeys = JSON.parse(JSON.stringify(oe.answerKeys));
            renderAnswerKeyBubbles();
          }
          renderResultsTable();
          updateStatistics();
          btnExportExcel.disabled = false;
          btnPrintTable.disabled = false;
          closeImportExamModal();
          showToast(`সংরক্ষিত পরীক্ষা "${selected.examName}" (${toBengaliNumber(oe.students.length)} জন) এর ফলাফলসহ লোড হয়েছে!`, 'success', 'fa-check');
          
          const targetSection = document.getElementById('tableResults') || document.getElementById('statsGrid');
          if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      // Schedule source from Exam List
      const sch = selected.scheduleData;
      state.importedExamInfo = {
        id: examId,
        source: 'schedule',
        examName: selected.examName,
        subject: sch.subject || '',
        class: sch.class || '',
        section: sch.section || 'All',
        scheduleData: sch
      };
      try {
        localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(state.importedExamInfo));
      } catch(e){}

      let allStudents = [];
      try {
        if (typeof loadStudents === 'function') {
          allStudents = loadStudents() || [];
        } else {
          allStudents = safeJsonParse('school_students', []);
        }
      } catch(e) {}

      let savedMarks = {};
      try {
        if (typeof loadStudentMarks === 'function') {
          savedMarks = loadStudentMarks() || {};
        } else {
          savedMarks = safeJsonParse('school_student_marks', {});
        }
      } catch(e) {}

      const targetClassNum = mapClassToNumber(sch.class);
      let classStudents = allStudents.filter(s => {
        return mapClassToNumber(s.class) === targetClassNum ||
               (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
      });

      if (classStudents.length === 0) {
        classStudents = allStudents.slice(0, 30);
      }

      // Sort students by roll
      classStudents.sort((a, b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0));

      const activeKey = (state.answerKeys && (state.answerKeys['ক'] || state.answerKeys['A'])) || {};
      const options = ['ক', 'খ', 'গ', 'ঘ'];
      const targetSubjectCode = sch.subjectCode || sch.subject;

      let totalLoadedWithMarks = 0;

      const importedStudents = classStudents.map((student, idx) => {
        // Look up student mark across various standard keys
        const rawReg = toEnglishDigits(student.regNo || student.id || student.studentId || '').trim();
        const rawId = toEnglishDigits(student.id || '').trim();

        let studentMarkObj = savedMarks['marks_' + rawReg + '_' + sch.id] ||
                             savedMarks['marks_' + rawId + '_' + sch.id] ||
                             savedMarks['marks_' + student.id + '_' + sch.id] ||
                             savedMarks['marks_' + student.studentId + '_' + sch.id] ||
                             savedMarks['marks_' + rawReg + '_' + (sch.term || sch.examType || '')] ||
                             savedMarks['marks_' + student.id + '_' + (sch.term || sch.examType || '')];

        let hasRealMark = false;
        let correctScore = null;
        let savedAnswers = null;
        let savedSet = null;
        let savedStatus = null;
        let savedPct = null;

        if (studentMarkObj && typeof studentMarkObj === 'object') {
          const subVal = (targetSubjectCode && studentMarkObj[targetSubjectCode]) ? studentMarkObj[targetSubjectCode] : (studentMarkObj[sch.subject] || Object.values(studentMarkObj)[0]);
          if (subVal && typeof subVal === 'object') {
            if (subVal.mcq !== undefined && subVal.mcq !== null && !isNaN(parseInt(subVal.mcq))) {
              correctScore = parseInt(subVal.mcq);
              hasRealMark = true;
            } else if (subVal.total !== undefined && subVal.total !== null && !isNaN(parseInt(subVal.total))) {
              correctScore = Math.min(30, Math.round(parseInt(subVal.total) * 0.3));
              hasRealMark = true;
            }

            if (subVal.answers && typeof subVal.answers === 'object') {
              savedAnswers = subVal.answers;
            }
            if (subVal.set) {
              savedSet = normalizeSet(subVal.set);
            }
            if (subVal.percentage) {
              savedPct = subVal.percentage;
            }
            if (subVal.status) {
              savedStatus = subVal.status;
            }
          }
        }

        const totalQ = 30;
        let pct = '0.0';
        let status = 'পেন্ডিং';
        let wrongCount = 0;
        let blankCount = totalQ;
        const studentAnswers = {};

        if (hasRealMark && correctScore !== null && !isNaN(correctScore)) {
          correctScore = Math.max(0, Math.min(30, correctScore));
          pct = savedPct || ((correctScore / totalQ) * 100).toFixed(1);
          status = savedStatus || (correctScore >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ');
          wrongCount = totalQ - correctScore;
          blankCount = 0;
          totalLoadedWithMarks++;

          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            for (let q = 1; q <= 30; q++) {
              studentAnswers[q] = savedAnswers[q] || savedAnswers[String(q)] || null;
            }
          } else {
            for (let q = 1; q <= 30; q++) {
              const correctOpt = activeKey[q] || options[(q + (parseInt(student.roll) || 0)) % 4];
              if (q <= correctScore) {
                studentAnswers[q] = correctOpt;
              } else {
                const wrongOpts = options.filter(o => o !== correctOpt);
                studentAnswers[q] = wrongOpts[(q + (parseInt(student.roll) || 0)) % wrongOpts.length];
              }
            }
          }
        } else {
          // No marks entered yet - keep score as 0 and status as Pending
          correctScore = 0;
          wrongCount = 0;
          blankCount = totalQ;
          pct = '0.0';
          status = 'পেন্ডিং';
        }

        const setChoice = savedSet || ['ক', 'খ', 'গ', 'ঘ'][idx % 4];
        const enName = (student.name || student.nameEn || '').trim();

        return {
          id: student.regNo || student.studentId || ('2211' + String(student.roll || idx + 1).padStart(3, '0')),
          name: enName,
          nameEn: enName,
          roll: String(student.roll || idx + 1),
          class: targetClassNum || '8',
          section: (student.section && student.section !== 'All') ? student.section : 'গ',
          set: setChoice,
          correct: correctScore,
          wrong: wrongCount,
          blank: blankCount,
          total: totalQ,
          percentage: pct,
          status: status,
          fileName: `${student.roll || idx + 1}.jpg`,
          answers: studentAnswers,
          isRealScanned: !!hasRealMark
        };
      });

      state.students = importedStudents;
      state.pendingUnmatchedList = [];
      if (typeof switchResultsTab === 'function') switchResultsTab('main');
      if (typeof renderPendingList === 'function') renderPendingList();
      renderResultsTable();
      updateStatistics();
      btnExportExcel.disabled = false;
      btnPrintTable.disabled = false;
      closeImportExamModal();

      const markInfoText = totalLoadedWithMarks > 0 
        ? ` (${toBengaliNumber(totalLoadedWithMarks)} জনের সংরক্ষিত ফলাফল সহ)` 
        : '';
      showToast(`Exam List থেকে "${selected.examName} (${sch.subject || ''})" (${toBengaliNumber(importedStudents.length)} জন)${markInfoText} সফলভাবে লোড হয়েছে!`, 'success', 'fa-check');

      const targetSection = document.getElementById('tableResults') || document.getElementById('statsGrid');
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Save & Entry: Permanently save evaluated OMR marks to Exam List & Database ---
    window.saveAndEntryExamMarks = async function() {
      if (!state.students || state.students.length === 0) {
        showToast('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর ফলাফল নেই! প্রথমে ওএমআর শিট মূল্যায়ন করুন।', 'warning', 'fa-triangle-exclamation');
        return;
      }

      // Check evaluated students
      const evaluatedStudents = state.students.filter(s => s.status !== 'পেন্ডিং' || (s.correct && s.correct > 0));
      if (evaluatedStudents.length === 0) {
        showToast('এখনও কোনো শিক্ষার্থীর নম্বর মূল্যায়ন করা হয়নি! প্রথমে ওএমআর শিট মূল্যায়ন করুন।', 'warning', 'fa-triangle-exclamation');
        return;
      }

      // Check if there are still pending unmatched sheets
      const pendingCount = (state.pendingUnmatchedList || []).length;
      if (pendingCount > 0) {
        const proceed = confirm(`⚠️ পেন্ডিং তালিকায় এখনও ${toBengaliNumber(pendingCount)} টি অমিল ওএমআর শিট রয়েছে।\\n\\nআপনি কি বর্তমান ${toBengaliNumber(evaluatedStudents.length)} জন শিক্ষার্থীর মূল্যায়নকৃত নম্বর Exam List-এ সংরক্ষণ ও স্থায়ী এন্ট্রি করতে চান?`);
        if (!proceed) return;
      }

      // Check imported exam info
      let examInfo = state.importedExamInfo;
      if (!examInfo) {
        try {
          examInfo = safeJsonParse('school_active_omr_imported_exam', null);
        } catch(e){}
      }

      if (!examInfo) {
        showToast('ফলাফল এন্ট্রি করার জন্য অনুগ্রহ করে প্রথমে "Import Exam" বাটনে ক্লিক করে পরীক্ষার শিডিউল নির্বাচন করুন!', 'warning', 'fa-file-import');
        if (typeof openImportExamModal === 'function') openImportExamModal();
        return;
      }

      const btn = document.getElementById('btnSaveAndEntry');
      const originalBtnHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> সংরক্ষণ হচ্ছে...';
      }

      try {
        const schId = examInfo.id;
        const nowIso = new Date().toISOString();
        const nowFormatted = new Date().toLocaleString('bn-BD');

        // 1. Update schedule in school_exam_schedules
        let schedules = [];
        try {
          if (typeof loadSchedules === 'function') {
            schedules = loadSchedules() || [];
          } else {
            schedules = safeJsonParse('school_exam_schedules', []);
          }
        } catch(e){}

        let targetSch = schedules.find(s => String(s.id) === String(schId));
        if (targetSch) {
          targetSch.marksEntryTime = nowFormatted;
          targetSch.hasMarks = true;
          targetSch.totalEntered = evaluatedStudents.length;
          targetSch.totalStudents = state.students.length;
          targetSch.omrEvaluatedAt = nowIso;
          
          const schIdx = schedules.findIndex(s => String(s.id) === String(schId));
          if (schIdx !== -1) {
            schedules[schIdx] = targetSch;
          }
          localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
          fetch('/api/db/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'school_exam_schedules', value: JSON.stringify(schedules) })
          }).catch(() => {});
        }

        // 2. Update student marks in school_student_marks
        let savedMarks = {};
        try {
          if (typeof loadStudentMarks === 'function') {
            savedMarks = loadStudentMarks() || {};
          } else {
            savedMarks = safeJsonParse('school_student_marks', {});
          }
        } catch(e){}

        const subjectCode = (targetSch && (targetSch.subjectCode || targetSch.subject)) || examInfo.subject || 'MCQ';
        const examVal = targetSch ? targetSch.term : (examInfo.examName || 'Exam');

        state.students.forEach(student => {
          const rawReg = toEnglishDigits(student.id || student.regNo || '').trim();
          const rawRoll = toEnglishDigits(student.roll || '').trim();
          const mcqScore = (student.status === 'পেন্ডিং' && (!student.correct || student.correct === 0)) ? 0 : (student.correct || 0);
          const isAbsent = student.status === 'পেন্ডিং' && !student.isRealScanned;

          const keysToUpdate = [
            `marks_${rawReg}_${schId}`,
            `marks_${student.id}_${schId}`,
            `marks_${rawReg}_${examVal}`,
            `marks_${student.id}_${examVal}`
          ];
          if (student.studentId) {
            keysToUpdate.push(`marks_${student.studentId}_${schId}`);
            keysToUpdate.push(`marks_${student.studentId}_${examVal}`);
          }

          keysToUpdate.forEach(k => {
            savedMarks[k] = savedMarks[k] || {};
            const existingData = savedMarks[k][subjectCode] || Object.values(savedMarks[k])[0] || {};
            const cqVal = (existingData.cq !== undefined && !isNaN(parseInt(existingData.cq))) ? parseInt(existingData.cq) : 0;
            const pracVal = (existingData.practical !== undefined && !isNaN(parseInt(existingData.practical))) ? parseInt(existingData.practical) : 0;
            const totalVal = cqVal + mcqScore + pracVal;

            savedMarks[k][subjectCode] = {
              total: totalVal,
              isAbsent: isAbsent,
              cq: cqVal,
              mcq: mcqScore,
              practical: pracVal,
              set: student.set || 'ক',
              answers: student.answers || {},
              percentage: student.percentage || ((mcqScore / 30) * 100).toFixed(1),
              status: student.status,
              fileName: student.fileName || '',
              omrEvaluatedAt: student.evaluatedAt || nowIso
            };
          });
        });

        localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
        fetch('/api/db/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'school_student_marks', value: JSON.stringify(savedMarks) })
        }).catch(() => {});

        // 3. Save to school_omr_exams & /api/exams
        const examRecord = {
          id: String(schId),
          scheduleId: String(schId),
          source: examInfo.source,
          examName: examInfo.examName,
          subject: examInfo.subject,
          class: examInfo.class,
          section: examInfo.section,
          date: targetSch ? targetSch.date : new Date().toLocaleDateString('bn-BD'),
          totalStudents: state.students.length,
          evaluatedStudentsCount: evaluatedStudents.length,
          students: state.students,
          answerKeys: state.answerKeys,
          lastSavedAt: nowIso
        };

        let omrExams = safeJsonParse('school_omr_exams', []);
        const oeIdx = omrExams.findIndex(x => String(x.id) === String(schId));
        if (oeIdx !== -1) {
          omrExams[oeIdx] = examRecord;
        } else {
          omrExams.unshift(examRecord);
        }
        localStorage.setItem('school_omr_exams', JSON.stringify(omrExams));

        try {
          await fetch('/api/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(omrExams)
          });
        } catch(e){}

        // Update active cache
        state.importedExamInfo = examInfo;
        try {
          localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(examInfo));
        } catch(e){}

        // Dispatch sync events to update the rest of the portal
        window.dispatchEvent(new CustomEvent('dbSynced'));
        window.dispatchEvent(new Event('storage'));
        if (typeof renderScheduleList === 'function') renderScheduleList();
        if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();

        // Visual confirmation
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved & Entered!';
          btn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
          setTimeout(() => {
            btn.innerHTML = originalBtnHtml;
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            btn.disabled = false;
          }, 2500);
        }

        showToast(`"${examInfo.examName}" পরীক্ষার ${toBengaliNumber(evaluatedStudents.length)} জন শিক্ষার্থীর ওএমআর মার্ক সফলভাবে Exam List-এ স্থায়ীভাবে সংরক্ষণ ও এন্ট্রি করা হয়েছে!`, 'success', 'fa-cloud-arrow-up');
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch(e){}

      } catch(err) {
        console.error('Error in saveAndEntryExamMarks:', err);
        if (btn) {
          btn.innerHTML = originalBtnHtml;
          btn.disabled = false;
        }
        showToast('সংরক্ষণ করার সময় ত্রুটি ঘটেছে: ' + err.message, 'danger');
      }
    };\n\n"""

content = content[:idx_start] + new_exam_import_and_save_logic + content[idx_end:]

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("exam-portal.html updated successfully! New length:", len(content))
