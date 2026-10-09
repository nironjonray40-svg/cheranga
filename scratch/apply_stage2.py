import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File size before Stage 2:", len(content))

# Replace calculateStudentScore down to end of runEvaluationProcess
start_marker = "    // Start Evaluation Flow\n    btnStartEvaluation.addEventListener('click', () => {"
end_marker = "    // Load Sample Students Demo Generator\n    btnLoadSampleData.addEventListener('click', () => {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Error: markers not found!", start_idx, end_idx)
    sys.exit(1)

new_code = """    // Registration Number Matching Utility
    function isRegNoMatch(regA, regB) {
      if (!regA || !regB) return false;
      const sA = toEnglishDigits(String(regA)).trim();
      const sB = toEnglishDigits(String(regB)).trim();
      if (!sA || !sB) return false;
      if (sA === sB) return true;
      const strippedA = sA.replace(/^0+/, '');
      const strippedB = sB.replace(/^0+/, '');
      if (strippedA && strippedB && strippedA === strippedB) return true;
      return false;
    }

    // Switch between 'main' (Result Sheet) and 'pending' (Pending List) tabs
    window.switchResultsTab = function(tab) {
      state.activeResultsTab = tab;
      const tabBtnMain = document.getElementById('tabBtnMainResults');
      const tabBtnPending = document.getElementById('tabBtnPendingResults');
      const sectionMain = document.getElementById('sectionMainResultsView');
      const sectionPending = document.getElementById('sectionPendingListView');
      const alertBanner = document.getElementById('pendingAlertBanner');

      if (tab === 'pending') {
        if (tabBtnMain) tabBtnMain.classList.remove('active');
        if (tabBtnPending) tabBtnPending.classList.add('active');
        if (sectionMain) sectionMain.style.display = 'none';
        if (sectionPending) sectionPending.style.display = 'block';
        if (alertBanner) alertBanner.style.display = 'none';
        renderPendingList();
      } else {
        if (tabBtnMain) tabBtnMain.classList.add('active');
        if (tabBtnPending) tabBtnPending.classList.remove('active');
        if (sectionMain) sectionMain.style.display = 'block';
        if (sectionPending) sectionPending.style.display = 'none';
        if (alertBanner) {
          alertBanner.style.display = (state.pendingUnmatchedList && state.pendingUnmatchedList.length > 0) ? 'flex' : 'none';
        }
      }
      updateTabCounts();
    };

    // Update Counts on the Tab Badges
    window.updateTabCounts = function() {
      const badgeMain = document.getElementById('badgeMainCount');
      const badgePending = document.getElementById('badgePendingCount');
      const alertBanner = document.getElementById('pendingAlertBanner');
      const alertHint = document.getElementById('pendingAlertQuickHint');
      const alertCountText = document.getElementById('pendingQuickCountText');
      const alertBannerDesc = document.getElementById('pendingAlertBannerDesc');

      const totalSt = (state.students || []).length;
      const evalSt = (state.students || []).filter(s => s.status !== 'পেন্ডিং').length;
      if (badgeMain) {
        badgeMain.textContent = evalSt > 0 ? `${toBengaliNumber(evalSt)}/${toBengaliNumber(totalSt)}` : toBengaliNumber(totalSt);
      }

      const pendingCount = (state.pendingUnmatchedList || []).length;
      if (badgePending) {
        badgePending.textContent = toBengaliNumber(pendingCount);
      }

      if (pendingCount > 0) {
        if (alertBanner && state.activeResultsTab === 'main') alertBanner.style.display = 'flex';
        if (alertHint) alertHint.style.display = 'inline-flex';
        if (alertCountText) alertCountText.textContent = `${toBengaliNumber(pendingCount)} টি ওএমআর শিট অমিল / পেন্ডিং তালিকায় রয়েছে`;
        if (alertBannerDesc) alertBannerDesc.textContent = `${toBengaliNumber(pendingCount)} টি ওএমআর শিটের রেজিঃ নং মেলেনি বা অপাঠ্য। "Pending List" ট্যাবে গিয়ে শিক্ষার্থীর সঠিক রেজিঃ নং নির্বাচন করে সংশোধন করুন।`;
      } else {
        if (alertBanner) alertBanner.style.display = 'none';
        if (alertHint) alertHint.style.display = 'none';
      }
    };

    // Render the Pending List View
    window.renderPendingList = function() {
      const container = document.getElementById('pendingListItemsContainer');
      if (!container) return;

      const list = state.pendingUnmatchedList || [];
      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 3rem 1rem; background: var(--bg-card); border-radius: var(--radius-md);">
            <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: #10b981; margin-bottom: 0.75rem;"></i>
            <h3 style="color: var(--text-main); font-size: 1.15rem; margin-bottom: 4px;">কোনো পেন্ডিং বা অমিল ওএমআর শিট নেই</h3>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto 1.25rem auto;">
              সকল আপলোডকৃত ওএমআর শিটের রেজিঃ নং সফলভাবে যাচাই করা হয়েছে এবং ফলাফল রেজাল্ট শিটে যুক্ত করা হয়েছে।
            </p>
            <button type="button" class="btn btn-primary btn-sm" onclick="switchResultsTab('main')" style="padding: 7px 16px;">
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

        let studentOptionsHtml = '<option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>';
        if (unassignedStudents.length > 0) {
          studentOptionsHtml += `<optgroup label="⚠️ নম্বর অপেক্ষমাণ শিক্ষার্থী (${unassignedStudents.length} জন)">`;
          unassignedStudents.forEach(s => {
            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${s.id} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, শ্রেণি: ${formatClassBangla(s.class)})</option>`;
          });
          studentOptionsHtml += `</optgroup>`;
        }
        if (allStudents.length > unassignedStudents.length) {
          studentOptionsHtml += `<optgroup label="অন্যান্য শিক্ষার্থী">`;
          allStudents.filter(s => s.status !== 'পেন্ডিং').forEach(s => {
            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${s.id} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, বর্তমান নম্বর: ${toBengaliNumber(s.correct)}/৩০)</option>`;
          });
          studentOptionsHtml += `</optgroup>`;
        }

        const previewImgSrc = item.imagePreviewUrl || '';

        return `
          <div class="pending-card" id="pending_card_${item.uid}">
            <!-- Thumbnail Preview -->
            <div class="pending-thumb-wrapper" onclick="openPendingOmrLightbox('${previewImgSrc}', '${item.fileName}')" title="পূর্ণাঙ্গ ইমেজ প্রিভিউ দেখুন">
              ${previewImgSrc ? `<img src="${previewImgSrc}" alt="OMR">` : `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;"><i class="fa-solid fa-file-image"></i></div>`}
              <div class="pending-thumb-overlay">
                <i class="fa-solid fa-magnifying-glass-plus"></i>
              </div>
            </div>

            <!-- Scanned Info -->
            <div class="pending-info-col">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                <strong style="font-size: 0.95rem; color: var(--text-main); font-family: 'Inter', monospace;">
                  <i class="fa-regular fa-image" style="color: var(--primary); margin-right: 4px;"></i>${item.fileName}
                </strong>
                <span class="set-tag" title="সেট">${item.detectedSet}</span>
                <span class="status-badge ${passBadgeClass}">
                  <i class="fa-solid ${isPassed ? 'fa-check' : 'fa-xmark'}"></i> ${passBadgeText} (${toBengaliNumber(item.scoreInfo.correct)}/৩০)
                </span>
              </div>

              <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 0.83rem; color: var(--text-muted); margin-bottom: 6px;">
                <span>পঠিত রেজিঃ: <strong style="color: ${item.detectedId ? '#4338ca' : '#dc2626'};">${item.detectedId ? toBengaliNumber(item.detectedId) : 'সনাক্ত হয়নি'}</strong></span>
                <span>রোল: <strong>${item.detectedRoll ? toBengaliNumber(item.detectedRoll) : 'নেই'}</strong></span>
                <span>শুদ্ধ: <strong style="color: #10b981;">${toBengaliNumber(item.scoreInfo.correct)}</strong></span>
                <span>ভুল: <strong style="color: #ef4444;">${toBengaliNumber(item.scoreInfo.wrong)}</strong></span>
                <span>ফাঁকা: <strong>${toBengaliNumber(item.scoreInfo.blank)}</strong></span>
              </div>

              <div style="font-size: 0.8rem; color: #b45309; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${item.reason}</span>
              </div>
            </div>

            <!-- Assignment Controls -->
            <div class="pending-assign-col">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">শিক্ষার্থী নির্বাচন করুন:</label>
                <select class="pending-student-select" id="selectStudent_${item.uid}" onchange="onPendingStudentSelectChange('${item.uid}', this.value)">
                  ${studentOptionsHtml}
                </select>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">অথবা রেজিঃ নং:</label>
                <input type="text" class="pending-reg-input" id="inputReg_${item.uid}" placeholder="রেজিঃ নং..." value="${item.detectedId || ''}" onkeydown="if(event.key==='Enter') assignPendingOmr('${item.uid}')">
              </div>

              <div style="display: flex; align-items: flex-end; gap: 6px; padding-top: 16px;">
                <button type="button" class="btn btn-primary btn-sm" onclick="assignPendingOmr('${item.uid}')" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); font-weight: 700; padding: 7px 14px; border: none; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);" title="এই শিক্ষার্থীর সাথে ওএমআর মার্ক যুক্ত করুন">
                  <i class="fa-solid fa-check"></i> সংশোধন ও মার্ক যুক্ত করুন
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="discardPendingOmr('${item.uid}')" title="পেন্ডিং তালিকা থেকে বাদ দিন" style="padding: 7px 10px; border-color: #cbd5e1; color: var(--danger);">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
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

    // Assign a Pending OMR sheet to a student by Registration Number
    window.assignPendingOmr = function(uid) {
      const item = (state.pendingUnmatchedList || []).find(p => p.uid === uid);
      if (!item) {
        showToast('পেন্ডিং ওএমআর শিটটি খুঁজে পাওয়া যায়নি!', 'danger');
        return;
      }

      const inputEl = document.getElementById('inputReg_' + uid);
      const selectEl = document.getElementById('selectStudent_' + uid);
      let targetReg = (inputEl ? inputEl.value : (selectEl ? selectEl.value : '')).trim();
      targetReg = toEnglishDigits(targetReg).trim();

      if (!targetReg) {
        showToast('অনুগ্রহ করে ড্রপডাউন থেকে একজন শিক্ষার্থী নির্বাচন করুন অথবা রেজিঃ নং লিখুন!', 'warning', 'fa-triangle-exclamation');
        return;
      }

      // Find in state.students
      let student = (state.students || []).find(s => isRegNoMatch(s.id, targetReg) || isRegNoMatch(s.regNo, targetReg));

      if (!student) {
        // Search in master school_students in localStorage/DB
        let allSchoolStudents = [];
        try {
          if (typeof loadStudents === 'function') {
            allSchoolStudents = loadStudents() || [];
          } else {
            allSchoolStudents = safeJsonParse('school_students', []);
          }
        } catch(e){}

        const foundSchool = allSchoolStudents.find(st => isRegNoMatch(st.regNo || st.studentId, targetReg));
        if (foundSchool) {
          const enName = (foundSchool.name || foundSchool.nameEn || '').trim();
          const targetRoll = String(foundSchool.roll || state.students.length + 1);
          const targetClass = foundSchool.class || '10';
          const targetSection = foundSchool.section || 'ক';

          student = {
            id: targetReg,
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
          showToast(`রেজিঃ নং "${targetReg}" বিশিষ্ট কোনো শিক্ষার্থী ডাটাবেজে খুঁজে পাওয়া যায়নি! সঠিক রেজিঃ নং প্রদান করুন।`, 'danger', 'fa-circle-xmark');
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
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
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

    // Start Evaluation Flow
    btnStartEvaluation.addEventListener('click', () => {
      let fileCount = state.studentFiles.length;
      if (fileCount === 0) {
        showToast('মূল্যায়ন করার জন্য অনুগ্রহ করে শিক্ষার্থীদের ওএমআর স্ক্যান করা ফাইল ফোল্ডার আপলোড করুন!', 'warning', 'fa-folder-open');
        return;
      }

      runEvaluationProcess(fileCount);
    });

    async function runEvaluationProcess(totalItems) {
      progressWrapper.style.display = 'block';
      progressBarInner.style.width = '0%';
      btnStartEvaluation.disabled = true;

      if (!state.studentFiles || state.studentFiles.length === 0) {
        progressWrapper.style.display = 'none';
        btnStartEvaluation.disabled = false;
        showToast('মূল্যায়নের জন্য কোনো ওএমআর ফাইল আপলোড করা হয়নি!', 'warning', 'fa-triangle-exclamation');
        return;
      }

      const files = state.studentFiles;
      const total = files.length;
      const sets = ['ক', 'খ', 'গ', 'ঘ'];
      const sections = ['ক', 'খ', 'গ', 'ঘ'];

      state.pendingUnmatchedList = state.pendingUnmatchedList || [];

      const hasImportedStudents = Array.isArray(state.students) && state.students.length > 0;
      let newlyMatchedCount = 0;
      let newlyPendingCount = 0;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        const percent = Math.min(100, Math.round(((i + 1) / total) * 100));
        progressBarInner.style.width = `${percent}%`;
        progressPercentText.textContent = `${toBengaliNumber(percent)}%`;
        progressStatusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ওএমআর শিট ${toBengaliNumber(i + 1)} / ${toBengaliNumber(total)} স্ক্যান ও মূল্যায়ন করা হচ্ছে (${file.name})...`;

        let detectedAnswers = null;
        let detectedSet = sets[i % sets.length];
        let detectedRoll = null;
        let detectedId = null;
        let detectedClass = null;
        let detectedSection = null;

        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/scan_omr', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.sets) {
              detectedSet = Object.keys(data.sets)[0] || detectedSet;
              const rawAnswers = data.sets[detectedSet] || Object.values(data.sets)[0];
              if (rawAnswers && Array.isArray(rawAnswers)) {
                detectedAnswers = {};
                for (let q = 1; q <= 30; q++) {
                  detectedAnswers[q] = normalizeOption(rawAnswers[q - 1]);
                }
              }
              if (data.roll_no && data.roll_no !== '000') {
                detectedRoll = data.roll_no;
              }
              if (data.student_id && data.student_id !== '0000000') {
                detectedId = data.student_id;
              }
              if (data.class_name && data.class_name !== '00') {
                detectedClass = data.class_name;
              }
              if (data.section) {
                detectedSection = data.section;
              }
            }
          }
        } catch (scanErr) {
          console.warn(`Scan error on ${file.name}:`, scanErr);
        }

        const set = normalizeSet(detectedSet);

        let answers = detectedAnswers;
        if (!answers) {
          const targetKey = getActiveAnswerKey(set);
          answers = {};
          for (let q = 1; q <= 30; q++) {
            answers[q] = Math.random() > 0.15 ? targetKey[q - 1] : null;
          }
        }

        const scoreInfo = calculateStudentScore(answers, set);
        const percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
        const isPassed = scoreInfo.correct >= 10;
        const fileUrl = URL.createObjectURL(file);

        const rawDetectedId = toEnglishDigits(detectedId || '').trim();
        const isValidDetectedId = rawDetectedId && !/^0+$/.test(rawDetectedId);

        const fnMatchLong = file.name.match(/\\b(\\d{4,8})\\b/);
        const fnCandidateReg = fnMatchLong ? fnMatchLong[1] : null;

        const fnMatchRoll = file.name.match(/\\b(\\d{1,3})\\b/);
        const fnCandidateRoll = fnMatchRoll ? fnMatchRoll[1] : null;

        if (hasImportedStudents) {
          let matchedStudent = null;

          // 1. Primary: Match by detected Registration Number
          if (isValidDetectedId) {
            matchedStudent = state.students.find(s => isRegNoMatch(s.id, rawDetectedId) || isRegNoMatch(s.regNo, rawDetectedId));
          }

          // 2. Secondary: If detectedId was missing, check filename registration number
          if (!matchedStudent && fnCandidateReg) {
            matchedStudent = state.students.find(s => isRegNoMatch(s.id, fnCandidateReg) || isRegNoMatch(s.regNo, fnCandidateReg));
          }

          // 3. Tertiary: Fallback if roll matches uniquely
          if (!matchedStudent && (detectedRoll || fnCandidateRoll)) {
            const targetRoll = toEnglishDigits(detectedRoll || fnCandidateRoll).replace(/^0+/, '');
            if (targetRoll) {
              const matchingByRoll = state.students.filter(s => toEnglishDigits(s.roll || '').replace(/^0+/, '') === targetRoll);
              if (matchingByRoll.length === 1) {
                matchedStudent = matchingByRoll[0];
              }
            }
          }

          if (matchedStudent) {
            matchedStudent.correct = scoreInfo.correct;
            matchedStudent.wrong = scoreInfo.wrong;
            matchedStudent.blank = scoreInfo.blank;
            matchedStudent.percentage = percentage;
            matchedStudent.status = isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
            matchedStudent.set = set;
            matchedStudent.answers = answers;
            matchedStudent.fileName = file.name;
            matchedStudent.file = file;
            matchedStudent.imagePreviewUrl = fileUrl;
            matchedStudent.isRealScanned = !!detectedAnswers;
            matchedStudent.evaluatedAt = new Date().toISOString();
            newlyMatchedCount++;
          } else {
            // Push to Pending List
            const reason = !isValidDetectedId 
              ? 'ওএমআর শিটে রেজিঃ নং বাবল সনাক্ত হয়নি / অস্পষ্ট' 
              : `সনাক্তকৃত রেজিঃ (${toBengaliNumber(rawDetectedId)}) পরীক্ষার শিক্ষার্থী তালিকায় নেই`;

            state.pendingUnmatchedList.push({
              uid: 'pending_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
              file: file,
              fileName: file.name,
              imagePreviewUrl: fileUrl,
              detectedId: isValidDetectedId ? rawDetectedId : (fnCandidateReg || ''),
              detectedRoll: detectedRoll || fnCandidateRoll || '',
              detectedClass: detectedClass || '',
              detectedSection: detectedSection || '',
              detectedSet: set,
              answers: answers,
              scoreInfo: scoreInfo,
              percentage: percentage,
              status: isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
              reason: reason
            });
            newlyPendingCount++;
          }
        } else {
          // Fallback if no imported exam was loaded
          const roll = (detectedRoll || fnCandidateRoll || String(i + 1)).padStart(3, '0');
          const studentId = isValidDetectedId ? rawDetectedId : (fnCandidateReg || ('1024' + roll));
          const studentClass = detectedClass ? String(parseInt(detectedClass, 10)) : "10";
          const section = detectedSection || sections[i % sections.length];

          const lookupMaps = getStudentsLookupMaps();
          const sNameEn = lookupMaps.byReg.get(studentId) || lookupMaps.byRollClass.get(`${mapClassToNumber(studentClass)}_${toEnglishDigits(roll)}`) || '';

          state.students.push({
            id: studentId,
            name: sNameEn,
            nameEn: sNameEn,
            roll: roll,
            class: studentClass,
            section: section,
            set: set,
            answers: answers,
            correct: scoreInfo.correct,
            wrong: scoreInfo.wrong,
            blank: scoreInfo.blank,
            total: 30,
            percentage: percentage,
            status: isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
            fileName: file.name,
            file: file,
            imagePreviewUrl: fileUrl,
            isRealScanned: !!detectedAnswers
          });
          newlyMatchedCount++;
        }
      }

      progressWrapper.style.display = 'none';
      btnStartEvaluation.disabled = false;
      btnExportExcel.disabled = false;
      btnPrintTable.disabled = false;

      renderResultsTable();
      renderPendingList();
      updateStatistics();
      updateTabCounts();

      if (newlyPendingCount > 0) {
        showToast(`${toBengaliNumber(newlyMatchedCount)} জন শিক্ষার্থীর MCQ নম্বর যুক্ত হয়েছে। ${toBengaliNumber(newlyPendingCount)} টি শিট পেন্ডিং তালিকায় সংশোধনের অপেক্ষায় রয়েছে।`, 'warning', 'fa-triangle-exclamation');
      } else {
        showToast(`সকল (${toBengaliNumber(newlyMatchedCount)}) ওএমআর শিটের রেজিঃ নং মিলেছে এবং MCQ নম্বর সফলভাবে যুক্ত হয়েছে!`, 'success', 'fa-circle-check');
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch(e){}
      }
    }\n\n"""

content = content[:start_idx] + new_code + content[end_idx:]

# Also update hook calls:
# 1. Inside renderResultsTable, add updateTabCounts()
render_target = "    function renderResultsTable() {"
if render_target in content:
    content = content.replace(render_target, "    function renderResultsTable() {\n      if (typeof updateTabCounts === 'function') updateTabCounts();", 1)
    print("renderResultsTable hook updated!")

# 2. Inside btnResetData, add pending list reset
reset_target = "state.students = [];\n        state.studentFiles = [];\n        state.answerKeyFiles = [];"
if reset_target in content:
    content = content.replace(reset_target, "state.students = [];\n        state.studentFiles = [];\n        state.answerKeyFiles = [];\n        state.pendingUnmatchedList = [];\n        if (typeof renderPendingList === 'function') renderPendingList();\n        if (typeof updateTabCounts === 'function') updateTabCounts();", 1)
    print("btnResetData hook updated!")

# 3. Inside selectAndImportExam, clear pendingUnmatchedList and update tab counts
import_hook_target = "state.students = importedStudents;\n      renderResultsTable();"
if import_hook_target in content:
    content = content.replace(import_hook_target, "state.students = importedStudents;\n      state.pendingUnmatchedList = [];\n      if (typeof switchResultsTab === 'function') switchResultsTab('main');\n      if (typeof renderPendingList === 'function') renderPendingList();\n      renderResultsTable();", 1)
    print("selectAndImportExam hook updated!")

# 4. In omr source import inside selectAndImportExam
omr_import_hook = "state.students = JSON.parse(JSON.stringify(oe.students));\n          const lookupMaps = getStudentsLookupMaps();"
if omr_import_hook in content:
    content = content.replace(omr_import_hook, "state.students = JSON.parse(JSON.stringify(oe.students));\n          state.pendingUnmatchedList = [];\n          if (typeof switchResultsTab === 'function') switchResultsTab('main');\n          if (typeof renderPendingList === 'function') renderPendingList();\n          const lookupMaps = getStudentsLookupMaps();", 1)
    print("omr source import hook updated!")

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Stage 2 applied successfully! New length:", len(content))
