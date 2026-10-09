# -*- coding: utf-8 -*-
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original length:", len(content))

# 1. Update table header: '<th>শুদ্ধ উত্তরের সংখ্যা</th>' -> '<th>MCQ নম্বর</th>'
target_th = '<th>শুদ্ধ উত্তরের সংখ্যা</th>'
replace_th = '<th>MCQ নম্বর</th>'
if target_th in content:
    content = content.replace(target_th, replace_th, 1)
    print("[1] Table header updated to 'MCQ নম্বর' successfully!")
else:
    print("[1] Warning: target_th not found, checking if already updated...")

# 2. Update stat-label: 'গড় শুদ্ধ উত্তর / নম্বর' -> 'গড় MCQ নম্বর'
target_stat = '<div class="stat-label">গড় শুদ্ধ উত্তর / নম্বর</div>'
replace_stat = '<div class="stat-label">গড় MCQ নম্বর</div>'
if target_stat in content:
    content = content.replace(target_stat, replace_stat, 1)
    print("[2] Stat label updated successfully!")

# 3. Update selectAndImportExam student object creation
old_import_student = """        return {
          id: student.regNo || student.studentId || ('2211' + String(student.roll || idx + 1).padStart(3, '0')),
          name: enName,
          nameEn: enName,"""

new_import_student = """        const studentRegId = student.regNo || student.studentId || ('2211' + String(student.roll || idx + 1).padStart(3, '0'));
        return {
          id: studentRegId,
          regNo: studentRegId,
          studentId: student.studentId || studentRegId,
          name: enName,
          nameEn: enName,"""

if old_import_student in content:
    content = content.replace(old_import_student, new_import_student, 1)
    print("[3] selectAndImportExam student properties updated with regNo and studentId!")
else:
    print("[3] Note: old_import_student not found or already updated.")

# 4. Update renderPendingList, assignPendingOmr, selectPendingStudentDirect, onPendingStudentSelectChange
pending_start_marker = "    // Render the Pending List View\n    window.renderPendingList = function() {"
pending_end_marker = "    // Start Evaluation Flow\n    btnStartEvaluation.addEventListener('click', () => {"

p_start = content.find(pending_start_marker)
p_end = content.find(pending_end_marker, p_start)

if p_start == -1 or p_end == -1:
    print("Error: pending markers not found!", p_start, p_end)
    sys.exit(1)

new_pending_code = """    // Render the Pending List View
    window.renderPendingList = function() {
      const container = document.getElementById('pendingListItemsContainer');
      if (!container) return;

      const list = state.pendingUnmatchedList || [];
      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 3.5rem 1rem; background: var(--bg-card); border-radius: var(--radius-md); text-align: center;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; font-size: 2rem;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 style="color: var(--text-main); font-size: 1.25rem; margin-bottom: 6px; font-weight: 700;">কোনো পেন্ডিং বা অমিল ওএমআর শিট নেই</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
              সকল আপলোডকৃত ওএমআর শিটের রেজিঃ নং সফলভাবে যাচাই করা হয়েছে এবং প্রতিটি শিক্ষার্থীর MCQ নম্বর রেজাল্ট শিটে যুক্ত করা হয়েছে।
            </p>
            <button type="button" class="btn btn-primary" onclick="switchResultsTab('main')" style="padding: 8px 22px; font-weight: 700; border-radius: var(--radius-sm); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
              <i class="fa-solid fa-list-check"></i> রেজাল্ট শিট দেখুন
            </button>
          </div>
        `;
        return;
      }

      // Group unassigned students in state.students (status === 'পেন্ডিং')
      const unassignedStudents = (state.students || []).filter(s => s.status === 'পেন্ডিং');
      const allStudents = state.students || [];

      container.innerHTML = list.map((item, idx) => {
        const isPassed = item.scoreInfo.correct >= 10;
        const passBadgeClass = isPassed ? 'status-pass' : 'status-fail';
        const passBadgeText = isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';

        // Suggest matching student if roll matches detected roll
        let suggestedStudent = null;
        if (item.detectedRoll) {
          const detRollNum = parseInt(toEnglishDigits(item.detectedRoll), 10);
          if (!isNaN(detRollNum)) {
            suggestedStudent = unassignedStudents.find(s => parseInt(toEnglishDigits(s.roll), 10) === detRollNum) ||
                               allStudents.find(s => parseInt(toEnglishDigits(s.roll), 10) === detRollNum);
          }
        }

        let studentOptionsHtml = '<option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>';
        if (suggestedStudent) {
          studentOptionsHtml += `<optgroup label="💡 রোল মিলেছে (প্রস্তাবিত)">`;
          studentOptionsHtml += `<option value="${suggestedStudent.id}" selected>⭐ প্রস্তাবিত: রেজিঃ ${suggestedStudent.id} — ${suggestedStudent.nameEn || suggestedStudent.name || 'নাম নেই'} (রোল: ${toBengaliNumber(suggestedStudent.roll)})</option>`;
          studentOptionsHtml += `</optgroup>`;
        }
        if (unassignedStudents.length > 0) {
          studentOptionsHtml += `<optgroup label="⚠️ নম্বর অপেক্ষমাণ শিক্ষার্থী (${unassignedStudents.length} জন)">`;
          unassignedStudents.forEach(s => {
            if (suggestedStudent && s.id === suggestedStudent.id) return;
            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${s.id} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, শ্রেণি: ${formatClassBangla(s.class)})</option>`;
          });
          studentOptionsHtml += `</optgroup>`;
        }
        if (allStudents.length > unassignedStudents.length) {
          studentOptionsHtml += `<optgroup label="অন্যান্য শিক্ষার্থী">`;
          allStudents.filter(s => s.status !== 'পেন্ডিং').forEach(s => {
            if (suggestedStudent && s.id === suggestedStudent.id) return;
            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${s.id} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, বর্তমান MCQ: ${toBengaliNumber(s.correct)}/৩০)</option>`;
          });
          studentOptionsHtml += `</optgroup>`;
        }

        const previewImgSrc = item.imagePreviewUrl || '';
        const defaultRegValue = suggestedStudent ? suggestedStudent.id : '';

        return `
          <div class="pending-card" id="pending_card_${item.uid}">
            <!-- LEFT SIDE: Student Detected Info & Correction Controls -->
            <div class="pending-card-left">
              <!-- Header: File Name, Set, Score Badge -->
              <div class="pending-header-row">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="pending-file-title" title="${item.fileName}">
                    <i class="fa-regular fa-image" style="color: var(--primary);"></i> ${item.fileName}
                  </span>
                  <span class="set-tag" title="সেট">সেট: ${item.detectedSet}</span>
                </div>
                <span class="status-badge ${passBadgeClass}">
                  <i class="fa-solid ${isPassed ? 'fa-check' : 'fa-xmark'}"></i> ${passBadgeText} (MCQ: ${toBengaliNumber(item.scoreInfo.correct)}/৩০)
                </span>
              </div>

              <!-- Reason / Warning Box -->
              <div class="pending-reason-box">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${item.reason}</span>
              </div>

              <!-- Detected Stats Grid -->
              <div class="pending-stats-grid">
                <div class="pending-stat-item">
                  <span class="stat-lbl">পঠিত রেজিঃ</span>
                  <strong class="stat-val ${item.detectedId ? 'val-reg' : 'val-unclear'}">${item.detectedId ? toBengaliNumber(item.detectedId) : 'সনাক্ত হয়নি'}</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">পঠিত রোল</span>
                  <strong class="stat-val">${item.detectedRoll ? toBengaliNumber(item.detectedRoll) : 'নেই'}</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">MCQ সঠিক</span>
                  <strong class="stat-val" style="color: #059669;">${toBengaliNumber(item.scoreInfo.correct)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">ভুল উত্তর</span>
                  <strong class="stat-val" style="color: #dc2626;">${toBengaliNumber(item.scoreInfo.wrong)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">ফাঁকা</span>
                  <strong class="stat-val" style="color: var(--text-muted);">${toBengaliNumber(item.scoreInfo.blank)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">প্রাপ্ত নম্বর</span>
                  <strong class="stat-val" style="color: var(--primary);">${toBengaliNumber(item.percentage)}%</strong>
                </div>
              </div>

              <!-- Correction / Assignment Form Section -->
              <div class="pending-action-section">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                  <span style="display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-user-check" style="color: var(--primary);"></i>
                    <span>OMR দেখে শিক্ষার্থী নির্বাচন বা রেজিঃ সংশোধন করুন:</span>
                  </span>
                  ${suggestedStudent ? `
                    <button type="button" class="btn btn-xs" onclick="selectPendingStudentDirect('${item.uid}', '${suggestedStudent.id}')" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; border-radius: 12px; font-weight: 700; padding: 2px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                      💡 রোল ${toBengaliNumber(suggestedStudent.roll)} মিলেছে (${suggestedStudent.nameEn || suggestedStudent.name}) — <strong>সরাসরি যুক্ত করুন ➜</strong>
                    </button>
                  ` : ''}
                </div>

                <div class="pending-inputs-row">
                  <div style="flex: 1; min-width: 220px;">
                    <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">শিক্ষার্থী নির্বাচন করুন:</label>
                    <select class="pending-student-select" id="selectStudent_${item.uid}" onchange="onPendingStudentSelectChange('${item.uid}', this.value)">
                      ${studentOptionsHtml}
                    </select>
                  </div>

                  <div style="width: 150px;">
                    <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">অথবা রেজিঃ নং:</label>
                    <input type="text" class="pending-reg-input" id="inputReg_${item.uid}" placeholder="সঠিক রেজিঃ নং..." value="${defaultRegValue}" onkeydown="if(event.key==='Enter') assignPendingOmr('${item.uid}')">
                  </div>
                </div>

                <div class="pending-btn-row">
                  <button type="button" class="btn btn-primary btn-sm" onclick="assignPendingOmr('${item.uid}')" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); font-weight: 700; padding: 8px 18px; border: none; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-sm);" title="এই শিক্ষার্থীর সাথে ওএমআর নম্বর যুক্ত করুন">
                    <i class="fa-solid fa-check"></i> সংশোধন ও মার্ক যুক্ত করুন
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" onclick="discardPendingOmr('${item.uid}')" title="পেন্ডিং তালিকা থেকে বাদ দিন" style="padding: 8px 12px; border-color: #cbd5e1; color: var(--danger); border-radius: var(--radius-sm); cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- RIGHT SIDE: Prominent OMR Sheet View -->
            <div class="pending-card-right">
              <div class="pending-omr-viewer-box" onclick="openPendingOmrLightbox('${previewImgSrc}', '${item.fileName}')" title="ক্লিক করে বড় ভিউ দেখুন (Zoom)">
                ${previewImgSrc ? `
                  <img src="${previewImgSrc}" alt="OMR Sheet" class="pending-omr-image">
                ` : `
                  <div class="pending-omr-placeholder">
                    <i class="fa-regular fa-image" style="font-size: 2.5rem; color: #94a3b8;"></i>
                    <span>ইমেজ পাওয়া যায়নি</span>
                  </div>
                `}
                <div class="pending-omr-hover-overlay">
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                  <span>বড় করে দেখুন</span>
                </div>
                <div class="pending-omr-badge">
                  <i class="fa-regular fa-file-lines"></i> ওএমআর শিট কপি
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    window.onPendingStudentSelectChange = function(uid, selectedId) {
      if (selectedId) {
        const inp = document.getElementById('inputReg_' + uid);
        if (inp) inp.value = selectedId;
      }
    };

    window.selectPendingStudentDirect = function(uid, studentId) {
      const selectEl = document.getElementById('selectStudent_' + uid);
      if (selectEl) selectEl.value = studentId;
      const inp = document.getElementById('inputReg_' + uid);
      if (inp) inp.value = studentId;
      assignPendingOmr(uid);
    };

    // Assign a Pending OMR sheet to a student by Registration Number or Roll
    window.assignPendingOmr = function(uid) {
      const item = (state.pendingUnmatchedList || []).find(p => p.uid === uid);
      if (!item) {
        showToast('পেন্ডিং ওএমআর শিটটি খুঁজে পাওয়া যায়নি!', 'danger');
        return;
      }

      const inputEl = document.getElementById('inputReg_' + uid);
      const selectEl = document.getElementById('selectStudent_' + uid);
      let targetReg = (inputEl && inputEl.value ? inputEl.value : (selectEl ? selectEl.value : '')).trim();
      targetReg = toEnglishDigits(targetReg).trim();

      if (!targetReg) {
        showToast('অনুগ্রহ করে ড্রপডাউন থেকে একজন শিক্ষার্থী নির্বাচন করুন অথবা রেজিঃ নং লিখুন!', 'warning', 'fa-triangle-exclamation');
        return;
      }

      // 1. Find in state.students by Registration Number / ID
      let student = (state.students || []).find(s => 
        isRegNoMatch(s.id, targetReg) || 
        isRegNoMatch(s.regNo, targetReg) ||
        isRegNoMatch(s.studentId, targetReg)
      );

      // 2. Fallback: If not matched by Reg No, check if it matches student's Roll No in current exam
      if (!student) {
        student = (state.students || []).find(s => 
          toEnglishDigits(String(s.roll || '')).trim() === targetReg ||
          toEnglishDigits(String(s.roll || '')).trim() === targetReg.replace(/^0+/, '')
        );
      }

      // 3. Fallback: Search in master school_students in localStorage/DB
      if (!student) {
        let allSchoolStudents = [];
        try {
          if (typeof loadStudents === 'function') {
            allSchoolStudents = loadStudents() || [];
          } else {
            allSchoolStudents = safeJsonParse('school_students', []);
          }
        } catch(e){}

        const foundSchool = allSchoolStudents.find(st => 
          isRegNoMatch(st.regNo, targetReg) || 
          isRegNoMatch(st.studentId, targetReg) || 
          isRegNoMatch(st.id, targetReg)
        );

        if (foundSchool) {
          const enName = (foundSchool.name || foundSchool.nameEn || '').trim();
          const targetRoll = String(foundSchool.roll || state.students.length + 1);
          const targetClass = foundSchool.class || '10';
          const targetSection = foundSchool.section || 'ক';

          student = {
            id: targetReg,
            regNo: targetReg,
            studentId: targetReg,
            name: enName,
            nameEn: enName,
            roll: targetRoll,
            class: targetClass,
            section: targetSection,
            set: item.detectedSet,
            correct: item.scoreInfo.correct,
            wrong: item.scoreInfo.wrong,
            blank: item.scoreInfo.blank,
            total: 30,
            percentage: item.percentage,
            status: item.status,
            fileName: item.fileName,
            file: item.file,
            imagePreviewUrl: item.imagePreviewUrl,
            answers: item.answers,
            isRealScanned: true,
            evaluatedAt: new Date().toISOString()
          };
          state.students.push(student);
        } else {
          showToast(`রেজিঃ নং বা রোল "${targetReg}" বিশিষ্ট কোনো শিক্ষার্থী ডাটাবেজে খুঁজে পাওয়া যায়নি! সঠিক রেজিঃ নং প্রদান করুন।`, 'danger', 'fa-circle-xmark');
          return;
        }
      } else {
        // Transfer evaluated marks to the existing student
        student.correct = item.scoreInfo.correct;
        student.wrong = item.scoreInfo.wrong;
        student.blank = item.scoreInfo.blank;
        student.percentage = item.percentage;
        student.status = item.status;
        student.set = item.detectedSet;
        student.answers = item.answers;
        student.fileName = item.fileName;
        student.file = item.file;
        student.imagePreviewUrl = item.imagePreviewUrl;
        student.isRealScanned = true;
        student.evaluatedAt = new Date().toISOString();
      }

      // Remove from pendingUnmatchedList
      state.pendingUnmatchedList = state.pendingUnmatchedList.filter(p => p.uid !== uid);

      // Refresh UI
      renderResultsTable();
      renderPendingList();
      updateStatistics();
      updateTabCounts();

      const stName = student.nameEn || student.name || '';
      showToast(`শিক্ষার্থী ${stName ? `"${stName}" ` : ''}(রেজিঃ ${toBengaliNumber(student.id)})-এর MCQ নম্বর (${toBengaliNumber(student.correct)}/৩০) সফলভাবে যুক্ত করা হয়েছে!`, 'success', 'fa-circle-check');

      // If all pending items are resolved, celebration & return to results sheet
      if (state.pendingUnmatchedList.length === 0) {
        setTimeout(() => {
          switchResultsTab('main');
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch(e){}
          showToast('সকল পেন্ডিং ওএমআর শিট সফলভাবে সংশোধন সম্পন্ন হয়েছে!', 'success', 'fa-circle-check');
        }, 500);
      }
    };

    // Discard / Remove a pending item
    window.discardPendingOmr = function(uid) {
      if (confirm('আপনি কি নিশ্চিতভাবে এই ওএমআর কপিটি পেন্ডিং তালিকা থেকে বাদ দিতে চান?')) {
        state.pendingUnmatchedList = (state.pendingUnmatchedList || []).filter(p => p.uid !== uid);
        renderPendingList();
        updateTabCounts();
        showToast('পেন্ডিং তালিকা থেকে ওএমআর কপি বাদ দেওয়া হয়েছে', 'info');
      }
    };

    // Lightbox viewer for pending OMR sheet image
    window.openPendingOmrLightbox = function(imgSrc, title) {
      const modal = document.getElementById('modalPendingOmrLightbox');
      const img = document.getElementById('lightboxOmrImage');
      const titleEl = document.getElementById('lightboxOmrTitle');
      if (!modal || !img) return;

      img.src = imgSrc || '';
      if (titleEl) {
        titleEl.innerHTML = `<i class="fa-regular fa-image" style="color: #60a5fa; margin-right: 6px;"></i>ওএমআর শিট প্রিভিউ: <strong>${title || ''}</strong>`;
      }
      modal.style.display = 'flex';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    window.closePendingOmrLightbox = function() {
      const modal = document.getElementById('modalPendingOmrLightbox');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
"""

content = content[:p_start] + new_pending_code + content[p_end:]
print("[4] renderPendingList and assignPendingOmr updated!")

# 5. In runEvaluationProcess, update completion handling:
eval_toast_old = """      if (newlyPendingCount > 0) {
        showToast(`${toBengaliNumber(newlyMatchedCount)} জন শিক্ষার্থীর MCQ নম্বর যুক্ত হয়েছে। ${toBengaliNumber(newlyPendingCount)} টি শিট পেন্ডিং তালিকায় সংশোধনের অপেক্ষায় রয়েছে।`, 'warning', 'fa-triangle-exclamation');
      } else {
        showToast(`সকল (${toBengaliNumber(newlyMatchedCount)}) ওএমআর শিটের রেজিঃ নং মিলেছে এবং MCQ নম্বর সফলভাবে যুক্ত হয়েছে!`, 'success', 'fa-circle-check');
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch(e){}
      }"""

eval_toast_new = """      if (newlyPendingCount > 0) {
        switchResultsTab('pending');
        showToast(`${toBengaliNumber(newlyMatchedCount)} জন শিক্ষার্থীর MCQ নম্বর যুক্ত হয়েছে। ${toBengaliNumber(newlyPendingCount)} টি ওএমআর শিটের রেজিঃ নং অমিল হওয়ায় পেন্ডিং তালিকায় উন্মুক্ত করা হয়েছে। অনুগ্রহ করে সংশোধন করুন।`, 'warning', 'fa-triangle-exclamation');
      } else {
        switchResultsTab('main');
        showToast(`সকল (${toBengaliNumber(newlyMatchedCount)}) ওএমআর শিটের রেজিঃ নং মিলেছে এবং MCQ নম্বর সফলভাবে যুক্ত হয়েছে!`, 'success', 'fa-circle-check');
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch(e){}
      }"""

if eval_toast_old in content:
    content = content.replace(eval_toast_old, eval_toast_new, 1)
    print("[5] runEvaluationProcess completion handler updated with automatic switch to pending tab!")
else:
    print("[5] Warning: eval_toast_old not found!")

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: exam-portal.html updated successfully! New length:", len(content))
