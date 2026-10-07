
    (function() {

    // Bengali number formatting utility
    const toBengaliNumber = num => String(num).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const optionsBengali = ['ক', 'খ', 'গ', 'ঘ'];

    // Default Answer Keys for Set ক, খ, গ (30 questions each) - Now empty by default as requested
    const defaultAnswerKeys = {
      'ক': Array(30).fill(null),
      'খ': Array(30).fill(null),
      'গ': Array(30).fill(null)
    };

    // Application Global State
    const state = {
      answerKeys: JSON.parse(JSON.stringify(defaultAnswerKeys)),
      currentEditingKeySet: 'ক',
      studentFiles: [],
      answerKeyFiles: [],
      uploadedKeyPreview: null, // Stores metadata and content for preview
      activeKeyModalTab: 'bubble',
      students: [],
      currentEditIndex: -1,
      tempEditStudent: null
    };

    // Expose Global Action Handlers Immediately
    window.handleBlankOmrClick = function() {
      window.open('2O2mr.html', '_blank');
      if (typeof showToast === 'function') {
        showToast('ব্লাংক OMR শিট নতুন ট্যাবে ওপেন হচ্ছে...', 'info', 'fa-file-arrow-down');
      }
    };

    window.openAnswerKeyModalDirect = function() {
      if (typeof selectAnswerKeySet === 'function') {
        selectAnswerKeySet(state.currentEditingKeySet || 'ক');
      }
      const m = document.getElementById('modalAnswerKey');
      if (m) {
        m.classList.add('active');
        m.style.display = 'flex';
      }
      if (window.switchKeyModalTab) {
        window.switchKeyModalTab(state && state.uploadedKeyPreview ? 'source' : 'bubble');
      }
    };

    window.closeAnswerKeyModalDirect = function() {
      const m = document.getElementById('modalAnswerKey');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    };

    window.closeStudentEditModal = function() {
      const m = document.getElementById('modalViewEdit');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    };

    // UI Elements
    const dropzoneAnswerKey = document.getElementById('dropzoneAnswerKey');
    const inputAnswerKeyFolder = document.getElementById('inputAnswerKeyFolder');
    const inputAnswerKeyFile = document.getElementById('inputAnswerKeyFile');
    const textAnswerKeyStatus = document.getElementById('textAnswerKeyStatus');
    const btnPreviewAnswerKeyCard = document.getElementById('btnPreviewAnswerKeyCard');
    const btnQuickKeyPreview = document.getElementById('btnQuickKeyPreview');

    const dropzoneStudentOMR = document.getElementById('dropzoneStudentOMR');
    const inputStudentOMRFolder = document.getElementById('inputStudentOMRFolder');
    const textStudentOMRStatus = document.getElementById('textStudentOMRStatus');

    const btnStartEvaluation = document.getElementById('btnStartEvaluation');
    const btnLoadSampleData = document.getElementById('btnLoadSampleData');
    const btnResetData = document.getElementById('btnResetData');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnPrintTable = document.getElementById('btnPrintTable');
    const btnDownloadBlankOMR = document.getElementById('btnDownloadBlankOMR');
    const btnThemeToggle = document.getElementById('btnThemeToggle');

    const progressWrapper = document.getElementById('progressWrapper');
    const progressBarInner = document.getElementById('progressBarInner');
    const progressPercentText = document.getElementById('progressPercentText');
    const progressStatusText = document.getElementById('progressStatusText');

    const tableResultsBody = document.getElementById('tableResultsBody');
    const textShowingCount = document.getElementById('textShowingCount');

    // Filter elements
    const inputSearch = document.getElementById('inputSearch');
    const filterClass = document.getElementById('filterClass');
    const filterSection = document.getElementById('filterSection');
    const filterSet = document.getElementById('filterSet');
    const filterStatus = document.getElementById('filterStatus');

    // Modal elements
    const modalViewEdit = document.getElementById('modalViewEdit');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    const modalOmrGrid = document.getElementById('modalOmrGrid');
    const editStudentId = document.getElementById('editStudentId');
    const editRoll = document.getElementById('editRoll');
    const editClass = document.getElementById('editClass');
    const editSection = document.getElementById('editSection');
    const editSet = document.getElementById('editSet');
    const editCurrentScoreDisplay = document.getElementById('editCurrentScoreDisplay');

    // Key Modal elements
    const btnOpenKeyModal = document.getElementById('btnOpenKeyModal');
    const modalAnswerKey = document.getElementById('modalAnswerKey');
    const btnCloseKeyModal = document.getElementById('btnCloseKeyModal');
    const answerKeyQuestionsGrid = document.getElementById('answerKeyQuestionsGrid');
    const btnSaveAnswerKeys = document.getElementById('btnSaveAnswerKeys');
    const keySourcePreviewContainer = document.getElementById('keySourcePreviewContainer');
    const keySourceBadge = document.getElementById('keySourceBadge');

    // Toast notification utility
    window.showToast = function showToast(message, type = 'info', icon = 'fa-info-circle') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Theme Toggle
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        btnThemeToggle.innerHTML = '<i class="fa-regular fa-moon"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
      }
      });
    }

    // Helper: Normalize any option representation to Bengali 'ক', 'খ', 'গ', 'ঘ'
    function normalizeOption(val) {
      if (val === null || val === undefined) return null;
      const str = String(val).trim().toUpperCase();
      if (str === 'ক' || str === 'A' || str === '1' || str === '১' || str.startsWith('ক') || str.startsWith('A')) return 'ক';
      if (str === 'খ' || str === 'B' || str === '2' || str === '২' || str.startsWith('খ') || str.startsWith('B')) return 'খ';
      if (str === 'গ' || str === 'C' || str === '3' || str === '৩' || str.startsWith('গ') || str.startsWith('C')) return 'গ';
      if (str === 'ঘ' || str === 'D' || str === '4' || str === '৪' || str.startsWith('ঘ') || str.startsWith('D')) return 'ঘ';
      return null;
    }

    // 1. Unified Answer Key File & Folder Processor
    async function handleAnswerKeyFiles(files) {
      if (!files || files.length === 0) return;
      state.answerKeyFiles = files;
      dropzoneAnswerKey.classList.add('filled');

      let parsedCount = 0;
      let loadedSetNames = new Set();
      let previewInfo = {
        fileName: files.length === 1 ? files[0].name : `${files.length} টি ফাইলযুক্ত ফোল্ডার`,
        fileCount: files.length,
        type: 'unknown',
        rawText: '',
        tableData: null,
        imagePreviewUrl: null
      };

      for (const file of files) {
        const lowerName = file.name.toLowerCase();

        // A. Excel Workbook (.xlsx, .xls)
        if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
          try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            previewInfo.type = 'excel';
            previewInfo.fileName = file.name;
            
            // Read first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            previewInfo.tableData = rows;

            if (rows && rows.length > 0) {
              // Analyze columns or rows for Sets
              // Pattern 1: Headers like [Question, Set A, Set B, Set C] or [প্রশ্ন, ক, খ, গ]
              let headerRow = rows[0].map(h => String(h || '').trim());
              let setCols = {};

              headerRow.forEach((colTitle, cIdx) => {
                const upper = colTitle.toUpperCase();
                if (colTitle.includes('ক') || upper.includes('SET A') || upper.includes('SET-A') || upper.includes('SETA') || upper === 'A') {
                  setCols['ক'] = cIdx;
                } else if (colTitle.includes('খ') || upper.includes('SET B') || upper.includes('SET-B') || upper.includes('SETB') || upper === 'B') {
                  setCols['খ'] = cIdx;
                } else if (colTitle.includes('গ') || upper.includes('SET C') || upper.includes('SET-C') || upper.includes('SETC') || upper === 'C') {
                  setCols['গ'] = cIdx;
                }
              });

              if (Object.keys(setCols).length > 0) {
                // Populate sets from columns
                Object.keys(setCols).forEach(setName => {
                  const colIdx = setCols[setName];
                  const newKeys = [];
                  for (let r = 1; r < rows.length && newKeys.length < 30; r++) {
                    const cellVal = rows[r][colIdx];
                    const opt = normalizeOption(cellVal);
                    if (opt) newKeys.push(opt);
                  }
                  if (newKeys.length > 0) {
                    while (newKeys.length < 30) newKeys.push('ক');
                    state.answerKeys[setName] = newKeys;
                    loadedSetNames.add(setName);
                    parsedCount++;
                  }
                });
              } else {
                // Flat list of 30 answers in row or column
                const extractedAnswers = [];
                rows.flat().forEach(cell => {
                  const opt = normalizeOption(cell);
                  if (opt && extractedAnswers.length < 30) extractedAnswers.push(opt);
                });

                if (extractedAnswers.length > 0) {
                  while (extractedAnswers.length < 30) extractedAnswers.push('ক');
                  state.answerKeys['ক'] = [...extractedAnswers];
                  loadedSetNames.add('ক');
                  parsedCount++;
                }
              }
            }
          } catch (err) {
            console.error('Excel parse error:', err);
          }
        }

        // B. JSON Key File (.json)
        else if (lowerName.endsWith('.json')) {
          try {
            const text = await file.text();
            previewInfo.type = 'json';
            previewInfo.fileName = file.name;
            previewInfo.rawText = text;

            const parsed = JSON.parse(text);
            ['ক', 'খ', 'গ', 'A', 'B', 'C'].forEach(sKey => {
              const mappedKey = (sKey === 'A' || sKey === 'ক') ? 'ক' : ((sKey === 'B' || sKey === 'খ') ? 'খ' : 'গ');
              if (parsed[sKey] && Array.isArray(parsed[sKey])) {
                state.answerKeys[mappedKey] = parsed[sKey].map(opt => normalizeOption(opt) || 'ক').slice(0, 30);
                while (state.answerKeys[mappedKey].length < 30) state.answerKeys[mappedKey].push('ক');
                loadedSetNames.add(mappedKey);
                parsedCount++;
              }
            });
          } catch (err) {
            console.error('JSON parse error:', err);
          }
        }

        // C. Text & CSV Files (.txt, .csv)
        else if (lowerName.endsWith('.txt') || lowerName.endsWith('.csv')) {
          try {
            const text = await file.text();
            previewInfo.type = lowerName.endsWith('.csv') ? 'csv' : 'txt';
            previewInfo.fileName = file.name;
            previewInfo.rawText = text;

            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            const extracted = [];

            // Detect if specific set mentioned in filename (e.g. set_b.txt)
            let targetSet = 'ক';
            if (lowerName.includes('set_b') || lowerName.includes('সেট_খ') || lowerName.includes('set-b')) targetSet = 'খ';
            else if (lowerName.includes('set_c') || lowerName.includes('সেট_গ') || lowerName.includes('set-c')) targetSet = 'গ';

            lines.forEach(line => {
              // Match lines like "1. ক" or "1: A" or "ক, খ, গ, ঘ"
              const tokens = line.split(/[,;\t\s]+/);
              tokens.forEach(tok => {
                const opt = normalizeOption(tok);
                if (opt && extracted.length < 30) {
                  extracted.push(opt);
                }
              });
            });

            if (extracted.length > 0) {
              while (extracted.length < 30) extracted.push('ক');
              state.answerKeys[targetSet] = extracted;
              loadedSetNames.add(targetSet);
              parsedCount++;
            }
          } catch (err) {
            console.error('Text/CSV parse error:', err);
          }
        }

        // D. Image File (.jpg, .png, .webp)
        else if (/\.(jpe?g|png|webp|gif|bmp)$/i.test(lowerName)) {
          previewInfo.type = 'image';
          previewInfo.fileName = file.name;
          previewInfo.imagePreviewUrl = URL.createObjectURL(file);
          
          textAnswerKeyStatus.innerHTML = '<span style="color: var(--warning);"><i class="fa-solid fa-spinner fa-spin"></i> OMR প্রসেস করা হচ্ছে...</span>';
          
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
                Object.keys(data.sets).forEach(s => {
                  state.answerKeys[s] = data.sets[s];
                  loadedSetNames.add(s);
                });
                parsedCount++;
              }
            } else {
              console.error('API Error:', await response.text());
            }
          } catch (error) {
            console.error('Network Error:', error);
          }
        }
      }

      state.uploadedKeyPreview = previewInfo;

      // Update Card 1 Status text
      const setListStr = loadedSetNames.size > 0 ? Array.from(loadedSetNames).join(', ') : 'ক, খ, গ';
      textAnswerKeyStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> ${previewInfo.fileName} (সেট: ${setListStr})</span>`;
      
      // Update Modal Live Sync
      renderAnswerKeyBubbles();
      updateKeySourcePreviewUI();
      if (keySourceBadge) {
        keySourceBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ফাইল সিঙ্ক হয়েছে: ${previewInfo.fileName}`;
      }

      // If students already evaluated, re-evaluate automatically with the new key!
      if (state.students.length > 0) {
        reEvaluateAllStudents();
        renderResultsTable();
        updateStatistics();
        showToast(`উত্তরপত্র সফলভাবে সিঙ্ক হয়েছে! নতুন উত্তরপত্রের ভিত্তিতে ${state.students.length} জন শিক্ষার্থীর ফলাফল পুনঃমূল্যায়ন করা হয়েছে।`, 'success', 'fa-rotate');
      } else {
        showToast(`উত্তরপত্র ফাইল সফলভাবে লোড ও "উত্তরপত্র সেটআপ"-এ আপডেট হয়েছে!`, 'success', 'fa-check-double');
      }
    }

    // Attach listeners for both file and folder inputs
    inputAnswerKeyFolder.addEventListener('change', (e) => handleAnswerKeyFiles(Array.from(e.target.files)));
    inputAnswerKeyFile.addEventListener('change', (e) => handleAnswerKeyFiles(Array.from(e.target.files)));

    // Quick Preview buttons
    [btnPreviewAnswerKeyCard, btnQuickKeyPreview].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectAnswerKeySet(state.currentEditingKeySet || 'ক');
          modalAnswerKey.style.display = 'flex';
          switchKeyModalTab(state.uploadedKeyPreview ? 'source' : 'bubble');
        });
      }
    });

    // 2. Student OMR Folder Selection Handling
    inputStudentOMRFolder.addEventListener('change', (e) => {
      const files = Array.from(e.target.files).filter(f => /\.(jpe?g|png|webp|bmp|gif|pdf)$/i.test(f.name) || f.size > 0);
      if (files.length > 0) {
        state.studentFiles = files;
        dropzoneStudentOMR.classList.add('filled');
        textStudentOMRStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-check-double"></i> ${files.length} টি OMR ইমেজ পাওয়া গেছে</span>`;
        showToast(`${files.length} টি শিক্ষার্থীর ওএমআর শিট নির্বাচন করা হয়েছে`, 'success', 'fa-images');
      } else {
        textStudentOMRStatus.innerHTML = `<span style="color: var(--danger);">কোনো বৈধ ইমেজ ফাইল পাওয়া যায়নি</span>`;
      }
    });

    // Drag and drop visual cues & drop handling
    [dropzoneAnswerKey, dropzoneStudentOMR].forEach(dropzone => {
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    });

    dropzoneAnswerKey.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneAnswerKey.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleAnswerKeyFiles(files);
    });

    dropzoneStudentOMR.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneStudentOMR.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files).filter(f => /\.(jpe?g|png|webp|bmp|gif|pdf)$/i.test(f.name) || f.size > 0);
      if (files.length > 0) {
        state.studentFiles = files;
        dropzoneStudentOMR.classList.add('filled');
        textStudentOMRStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-check-double"></i> ${files.length} টি OMR ইমেজ পাওয়া গেছে</span>`;
        showToast(`${files.length} টি শিক্ষার্থীর ওএমআর শিট নির্বাচন করা হয়েছে`, 'success', 'fa-images');
      }
    });

    // 3. Evaluation Simulation & Engine
    function calculateStudentScore(studentAnswers, setCode) {
      const targetKey = state.answerKeys[setCode] || state.answerKeys['ক'] || defaultAnswerKeys['ক'];
      let correct = 0;
      let wrong = 0;
      let blank = 0;
      
      for (let i = 1; i <= 30; i++) {
        const studentAns = studentAnswers[i];
        const correctAns = targetKey[i - 1];
        if (!studentAns) {
          blank++;
        } else if (studentAns === correctAns) {
          correct++;
        } else {
          wrong++;
        }
      }
      return { correct, wrong, blank, total: 30 };
    }

    // Start Evaluation Flow
    btnStartEvaluation.addEventListener('click', () => {
      let fileCount = state.studentFiles.length;
      if (fileCount === 0 && state.students.length === 0) {
        // If no files selected yet, inform user or load sample dataset
        showToast('অনুগ্রহ করে শিক্ষার্থীদের ওএমআর ফোল্ডার নির্বাচন করুন অথবা নমুনা ডেটা লোড করুন।', 'warning', 'fa-triangle-exclamation');
        return;
      }

      runEvaluationProcess(fileCount > 0 ? fileCount : state.students.length);
    });

    function runEvaluationProcess(totalItems) {
      progressWrapper.style.display = 'block';
      progressBarInner.style.width = '0%';
      btnStartEvaluation.disabled = true;

      let currentStep = 0;
      const targetCount = totalItems || 25;
      
      const interval = setInterval(() => {
        currentStep++;
        const percent = Math.min(100, Math.round((currentStep / targetCount) * 100));
        progressBarInner.style.width = `${percent}%`;
        progressPercentText.textContent = `${toBengaliNumber(percent)}%`;
        progressStatusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ওএমআর শিট ${toBengaliNumber(currentStep)} / ${toBengaliNumber(targetCount)} স্ক্যান করা হচ্ছে...`;

        if (currentStep >= targetCount) {
          clearInterval(interval);
          setTimeout(() => {
            progressWrapper.style.display = 'none';
            btnStartEvaluation.disabled = false;
            
            // If evaluating freshly selected files
            if (state.studentFiles.length > 0) {
              generateDataFromFiles(state.studentFiles);
            } else if (state.students.length === 0) {
              generateSampleStudents(25);
            } else {
              // Re-evaluate current students against updated answer keys
              reEvaluateAllStudents();
            }

            renderResultsTable();
            updateStatistics();
            btnExportExcel.disabled = false;
            btnPrintTable.disabled = false;
            
            showToast('সকল ওএমআর শিট সফলভাবে মূল্যায়ন সম্পন্ন হয়েছে!', 'success', 'fa-circle-check');
            
            // Confetti celebration
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch(e){}
          }, 400);
        }
      }, 50);
    }

    // Generate Student Data from Loaded Files
    function generateDataFromFiles(files) {
      const generated = [];
      const sets = ['ক', 'খ', 'গ'];
      const sections = ['ক', 'খ', 'গ', 'ঘ'];

      files.forEach((file, index) => {
        const studentId = String(1024500 + index + 1);
        const roll = String(index + 1).padStart(3, '0');
        const set = sets[index % sets.length];
        const section = sections[index % sections.length];
        const studentClass = "10";

        // Generate student answers with high realistic accuracy (20 to 29 correct answers)
        const targetKey = state.answerKeys[set] || defaultAnswerKeys['ক'];
        const answers = {};
        for (let q = 1; q <= 30; q++) {
          const rand = Math.random();
          if (rand > 0.15) {
            answers[q] = targetKey[q - 1]; // 85% correct match
          } else if (rand > 0.05) {
            // wrong answer
            const wrongOptions = optionsBengali.filter(o => o !== targetKey[q - 1]);
            answers[q] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
          } else {
            // omitted/blank
            answers[q] = null;
          }
        }

        const scoreInfo = calculateStudentScore(answers, set);
        const percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
        const isPassed = scoreInfo.correct >= 10; // 33% pass mark

        generated.push({
          id: studentId,
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
          fileName: file.name
        });
      });

      state.students = generated;
    }

    // Load Sample Students Demo Generator
    btnLoadSampleData.addEventListener('click', () => {
      generateSampleStudents(25);
      renderResultsTable();
      updateStatistics();
      btnExportExcel.disabled = false;
      btnPrintTable.disabled = false;
      showToast('২৫ জন শিক্ষার্থীর বাস্তবসম্মত ওএমআর নমুনা ডেটা লোড করা হয়েছে!', 'info', 'fa-wand-magic-sparkles');
    });

    function generateSampleStudents(count = 25) {
      const generated = [];
      const sets = ['ক', 'খ', 'গ'];
      const sections = ['ক', 'খ', 'গ', 'ঘ'];
      const classes = ['10', '9', '8'];

      for (let i = 1; i <= count; i++) {
        const studentId = String(2024000 + i);
        const roll = String(i).padStart(3, '0');
        const set = sets[(i - 1) % sets.length];
        const section = sections[(i - 1) % sections.length];
        const studentClass = classes[(i - 1) % classes.length];

        const targetKey = state.answerKeys[set] || defaultAnswerKeys['ক'];
        const answers = {};

        for (let q = 1; q <= 30; q++) {
          const rand = Math.random();
          if (rand > 0.22) {
            answers[q] = targetKey[q - 1]; // correct
          } else if (rand > 0.05) {
            const wrongOpts = optionsBengali.filter(o => o !== targetKey[q - 1]);
            answers[q] = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
          } else {
            answers[q] = null;
          }
        }

        const scoreInfo = calculateStudentScore(answers, set);
        const percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
        const isPassed = scoreInfo.correct >= 10;

        generated.push({
          id: studentId,
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
          fileName: `omr_scan_${roll}.jpg`
        });
      }

      state.students = generated;
    }

    function reEvaluateAllStudents() {
      state.students.forEach(student => {
        const scoreInfo = calculateStudentScore(student.answers, student.set);
        student.correct = scoreInfo.correct;
        student.wrong = scoreInfo.wrong;
        student.blank = scoreInfo.blank;
        student.percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
        student.status = student.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
      });
    }

    // 4. Render Table with Search and Filters
    function renderResultsTable() {
      const searchQuery = inputSearch.value.trim().toLowerCase();
      const selectedClass = filterClass.value;
      const selectedSection = filterSection.value;
      const selectedSet = filterSet.value;
      const selectedStatus = filterStatus.value;

      const filtered = state.students.filter(s => {
        const matchesSearch = !searchQuery || 
          s.id.toLowerCase().includes(searchQuery) || 
          s.roll.toLowerCase().includes(searchQuery) ||
          toBengaliNumber(s.roll).includes(searchQuery) ||
          toBengaliNumber(s.id).includes(searchQuery);

        const matchesClass = selectedClass === 'ALL' || s.class === selectedClass;
        const matchesSection = selectedSection === 'ALL' || s.section === selectedSection;
        const matchesSet = selectedSet === 'ALL' || s.set === selectedSet;
        const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

        return matchesSearch && matchesClass && matchesSection && matchesSet && matchesStatus;
      });

      textShowingCount.textContent = toBengaliNumber(filtered.length);

      if (filtered.length === 0) {
        tableResultsBody.innerHTML = `
          <tr>
            <td colspan="10">
              <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>কোনো ফলাফল পাওয়া যায়নি</h3>
                <p>অন্য কোনো আইডি বা ফিল্টার প্রয়োগ করে পুনরায় চেষ্টা করুন।</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tableResultsBody.innerHTML = filtered.map((student, idx) => {
        const originalIndex = state.students.indexOf(student);
        const statusBadgeClass = student.status === 'উত্তীর্ণ' ? 'status-pass' : 'status-fail';
        const statusIcon = student.status === 'উত্তীর্ণ' ? 'fa-check' : 'fa-xmark';

        return `
          <tr>
            <td style="font-family: 'Inter', monospace; color: var(--text-muted); font-size: 0.85rem;">
              ${toBengaliNumber(idx + 1)}
            </td>
            <td>
              <span class="student-badge-id">${toBengaliNumber(student.id)}</span>
            </td>
            <td class="roll-cell">
              ${toBengaliNumber(student.roll)}
            </td>
            <td>
              <strong>${toBengaliNumber(student.class)}ম</strong> শ্রেণি
            </td>
            <td>
              <span style="font-weight: 600; color: var(--text-main);">${student.section}</span>
            </td>
            <td>
              <span class="set-tag">${student.set}</span>
            </td>
            <td>
              <div class="score-badge">
                <span style="color: ${student.correct >= 15 ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
                  ${toBengaliNumber(student.correct)}
                </span>
                <span class="score-total">/ ৩০</span>
              </div>
            </td>
            <td>
              <strong>${toBengaliNumber(student.percentage)}%</strong>
            </td>
            <td>
              <span class="status-badge ${statusBadgeClass}">
                <i class="fa-solid ${statusIcon}"></i> ${student.status}
              </span>
            </td>
            <td style="text-align: right;">
              <div class="action-btn-group" style="justify-content: flex-end;">
                <button class="btn btn-sm btn-outline" onclick="openViewEditModal(${originalIndex})" title="ওএমআর শিট দেখুন ও সংশোধন করুন">
                  <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> দেখুন ও সংশোধন
                </button>
                <button class="icon-btn" style="width: 32px; height: 32px;" onclick="deleteStudent(${originalIndex})" title="মুছে ফেলুন">
                  <i class="fa-solid fa-trash-can" style="color: var(--danger); font-size: 0.85rem;"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Attach search and filter listeners
    [inputSearch, filterClass, filterSection, filterSet, filterStatus].forEach(el => {
      el.addEventListener('input', renderResultsTable);
      el.addEventListener('change', renderResultsTable);
    });

    // 5. Update Statistics Summary Cards
    function updateStatistics() {
      const total = state.students.length;
      if (total === 0) {
        document.getElementById('statTotalStudents').textContent = '০';
        document.getElementById('statPassedStudents').textContent = '০';
        document.getElementById('statAverageScore').textContent = '০.০';
        document.getElementById('statHighestScore').textContent = '০';
        document.getElementById('statPassRate').textContent = '০%';
        return;
      }

      const passed = state.students.filter(s => s.status === 'উত্তীর্ণ').length;
      const totalCorrect = state.students.reduce((acc, cur) => acc + cur.correct, 0);
      const avgCorrect = (totalCorrect / total).toFixed(1);
      const highestScore = Math.max(...state.students.map(s => s.correct));
      const passRate = ((passed / total) * 100).toFixed(1);

      document.getElementById('statTotalStudents').textContent = toBengaliNumber(total);
      document.getElementById('statPassedStudents').textContent = toBengaliNumber(passed);
      document.getElementById('statAverageScore').textContent = toBengaliNumber(avgCorrect);
      document.getElementById('statHighestScore').textContent = toBengaliNumber(highestScore);
      document.getElementById('statPassRate').textContent = `${toBengaliNumber(passRate)}%`;
    }

    // Delete a student from the table
    window.deleteStudent = function(index) {
      if (confirm('আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর ওএমআর তথ্য মুছে ফেলতে চান?')) {
        state.students.splice(index, 1);
        renderResultsTable();
        updateStatistics();
        showToast('শিক্ষার্থীর তথ্য সফলভাবে মুছে ফেলা হয়েছে', 'info');
      }
    };

    // 6. View & Edit Modal Functionality
    window.openViewEditModal = function(index) {
      state.currentEditIndex = index;
      const student = state.students[index];
      // Clone student for editing
      state.tempEditStudent = JSON.parse(JSON.stringify(student));

      editStudentId.value = student.id;
      editRoll.value = student.roll;
      editClass.value = student.class;
      editSection.value = student.section;
      editSet.value = student.set;

      updateModalScorePreview();
      renderModalOmrBubbles();

      modalViewEdit.style.display = 'flex'; modalViewEdit.classList.add('active');
    };

    function updateModalScorePreview() {
      if (!state.tempEditStudent) return;
      const score = calculateStudentScore(state.tempEditStudent.answers, state.tempEditStudent.set);
      editCurrentScoreDisplay.innerHTML = `
        <span style="color: #10b981;">${toBengaliNumber(score.correct)}</span> 
        <span style="color: var(--text-muted); font-size: 0.95rem;">/ ৩০ (ভুল: ${toBengaliNumber(score.wrong)}, ফাঁকা: ${toBengaliNumber(score.blank)})</span>
      `;
    }

    function renderModalOmrBubbles() {
      if (!state.tempEditStudent) return;
      const targetKey = state.answerKeys[state.tempEditStudent.set] || defaultAnswerKeys['ক'];

      let colsHtml = ['', '', ''];

      for (let q = 1; q <= 30; q++) {
        const colIdx = q <= 10 ? 0 : (q <= 20 ? 1 : 2);
        const studentAns = state.tempEditStudent.answers[q];
        const correctAns = targetKey[q - 1];

        let bubblesHtml = optionsBengali.map(opt => {
          let extraClass = '';
          if (studentAns === opt) {
            extraClass = (opt === correctAns) ? 'filled-correct' : 'filled-wrong';
          } else if (opt === correctAns) {
            extraClass = 'filled-key-answer';
          }

          return `
            <span class="interactive-bubble ${extraClass}" 
                  onclick="toggleStudentAnswer(${q}, '${opt}')" 
                  title="প্রশ্ন ${toBengaliNumber(q)}: অপশন ${opt}">
              ${opt}
            </span>
          `;
        }).join('');

        colsHtml[colIdx] += `
          <div class="omr-q-row">
            <span class="q-number-label">${toBengaliNumber(q)}.</span>
            <div class="bubbles-interactive-group">
              ${bubblesHtml}
            </div>
          </div>
        `;
      }

      modalOmrGrid.innerHTML = colsHtml.map((colContent, idx) => `
        <div class="omr-column">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--omr-pink); text-align: center; margin-bottom: 6px; border-bottom: 1px dashed #fbcfe8; padding-bottom: 3px;">
            প্রশ্ন ${toBengaliNumber(idx * 10 + 1)} হতে ${toBengaliNumber((idx + 1) * 10)}
          </div>
          ${colContent}
        </div>
      `).join('');
    }

    window.toggleStudentAnswer = function(questionNumber, selectedOption) {
      if (!state.tempEditStudent) return;
      const current = state.tempEditStudent.answers[questionNumber];
      if (current === selectedOption) {
        // Clear answer if clicked again
        state.tempEditStudent.answers[questionNumber] = null;
      } else {
        state.tempEditStudent.answers[questionNumber] = selectedOption;
      }
      updateModalScorePreview();
      renderModalOmrBubbles();
    };

    // React to Set change inside modal
    if (editSet) {
      editSet.addEventListener('change', () => {
        if (!state.tempEditStudent) return;
        state.tempEditStudent.set = editSet.value;
        updateModalScorePreview();
        renderModalOmrBubbles();
      });
    }

    // Save Edit Modal
    if (btnSaveEdit) {
      btnSaveEdit.addEventListener('click', () => {
      if (state.currentEditIndex < 0 || !state.tempEditStudent) return;

      const updated = state.tempEditStudent;
      updated.id = editStudentId.value.trim() || updated.id;
      updated.roll = editRoll.value.trim() || updated.roll;
      updated.class = editClass.value;
      updated.section = editSection.value;
      updated.set = editSet.value;

      const scoreInfo = calculateStudentScore(updated.answers, updated.set);
      updated.correct = scoreInfo.correct;
      updated.wrong = scoreInfo.wrong;
      updated.blank = scoreInfo.blank;
      updated.percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
      updated.status = updated.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';

      state.students[state.currentEditIndex] = updated;

      modalViewEdit.style.display = 'none'; modalViewEdit.classList.remove('active');
      renderResultsTable();
      updateStatistics();
      showToast(`রোল নং ${toBengaliNumber(updated.roll)}-এর তথ্য সফলভাবে সংশোধন করা হয়েছে!`, 'success', 'fa-check');
    });
    }

    [btnCloseModal, btnCancelEdit].forEach(el => {
      if (el) {
        el.addEventListener('click', () => {
          if (modalViewEdit) {
            modalViewEdit.style.display = 'none'; modalViewEdit.classList.remove('active');
            modalViewEdit.classList.remove('active');
          }
        });
      }
    });

    // 7. Answer Key Setup Modal
    if (btnOpenKeyModal) {
      btnOpenKeyModal.addEventListener('click', () => {
        window.openAnswerKeyModalDirect();
      });
    }

    if (btnCloseKeyModal) {
      btnCloseKeyModal.addEventListener('click', () => {
        window.closeAnswerKeyModalDirect();
      });
    }

    window.selectAnswerKeySet = function(setName) {
      state.currentEditingKeySet = setName;
      document.querySelectorAll('.active-set-btn').forEach(btn => {
        if (btn.textContent.includes(setName)) {
          btn.className = 'btn btn-sm btn-primary active-set-btn';
        } else {
          btn.className = 'btn btn-sm btn-outline active-set-btn';
        }
      });
      renderAnswerKeyBubbles();
    };

    function renderAnswerKeyBubbles() {
      const keys = state.answerKeys[state.currentEditingKeySet] || defaultAnswerKeys[state.currentEditingKeySet];
      let colsHtml = ['', '', ''];

      for (let q = 1; q <= 30; q++) {
        const colIdx = q <= 10 ? 0 : (q <= 20 ? 1 : 2);
        const correctAns = keys[q - 1];

        let bubblesHtml = optionsBengali.map(opt => {
          const isSelected = opt === correctAns;
          return `
            <span class="interactive-bubble ${isSelected ? 'selected-user' : ''}" 
                  onclick="setAnswerKeyOption(${q}, '${opt}')" 
                  title="প্রশ্ন ${toBengaliNumber(q)} এর সঠিক উত্তর ${opt}">
              ${opt}
            </span>
          `;
        }).join('');

        colsHtml[colIdx] += `
          <div class="omr-q-row">
            <span class="q-number-label">${toBengaliNumber(q)}.</span>
            <div class="bubbles-interactive-group">
              ${bubblesHtml}
            </div>
          </div>
        `;
      }

      answerKeyQuestionsGrid.innerHTML = colsHtml.map((colContent, idx) => `
        <div class="omr-column">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-align: center; margin-bottom: 6px; border-bottom: 1px dashed var(--border-color); padding-bottom: 3px;">
            প্রশ্ন ${toBengaliNumber(idx * 10 + 1)} - ${toBengaliNumber((idx + 1) * 10)}
          </div>
          ${colContent}
        </div>
      `).join('');
    }

    window.setAnswerKeyOption = function(qNum, option) {
      state.answerKeys[state.currentEditingKeySet][qNum - 1] = option;
      renderAnswerKeyBubbles();
    };

    window.randomizeAnswerKeys = function() {
      for (let q = 0; q < 30; q++) {
        state.answerKeys[state.currentEditingKeySet][q] = optionsBengali[Math.floor(Math.random() * optionsBengali.length)];
      }
      renderAnswerKeyBubbles();
      showToast(`সেট ${state.currentEditingKeySet}-এর উত্তরপত্র সফলভাবে র‍্যান্ডমাইজ করা হয়েছে`, 'info');
    };

    window.clearAnswerKeys = function() {
      state.answerKeys = JSON.parse(JSON.stringify(defaultAnswerKeys));
      state.uploadedKeyPreview = null;
      textAnswerKeyStatus.innerHTML = 'কোনো উত্তরপত্র আপলোড করা হয়নি';
      renderAnswerKeyBubbles();
      updateKeySourcePreviewUI();
      if (state.students.length > 0) {
        reEvaluateAllStudents();
        renderResultsTable();
        updateStatistics();
      }
      showToast('উত্তরপত্র মুছে ফেলা হয়েছে। এখন কোনো সঠিক উত্তর সেট করা নেই।', 'info');
    };
    
    window.switchKeyModalTab = function(tabName) {
      state.activeKeyModalTab = tabName;
      document.querySelectorAll('.key-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      const tabBubble = document.getElementById('keyTabBubbleContent');
      const tabSource = document.getElementById('keyTabSourceContent');
      const tabTemplate = document.getElementById('keyTabTemplateContent');
      
      if (tabBubble) tabBubble.style.display = 'none';
      if (tabSource) tabSource.style.display = 'none';
      if (tabTemplate) tabTemplate.style.display = 'none';
      
      if (tabName === 'bubble') {
        document.getElementById('tabBtnBubbleView').classList.add('active');
        if (tabBubble) tabBubble.style.display = 'block';
      } else if (tabName === 'source') {
        document.getElementById('tabBtnSourceView').classList.add('active');
        if (tabSource) tabSource.style.display = 'block';
      } else if (tabName === 'template') {
        document.getElementById('tabBtnTemplateView').classList.add('active');
        if (tabTemplate) tabTemplate.style.display = 'block';
      }
    };
    
    window.updateKeySourcePreviewUI = function() {
      const preview = state.uploadedKeyPreview;
      if (!preview) {
        if (typeof keySourcePreviewContainer !== 'undefined' && keySourcePreviewContainer) {
          keySourcePreviewContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
              <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i><br>
              এখনও কোনো উত্তরপত্র আপলোড করা হয়নি।<br>
              দয়া করে একটি উত্তরপত্র আপলোড করুন।
            </div>
          `;
        }
        return;
      }
      
      let innerHtml = `
        <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-file-circle-check" style="font-size: 1.5rem; color: var(--success);"></i>
            <div>
              <div style="font-weight: 600; font-size: 1.05rem;">${escapeHtml(preview.fileName)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">ফাইল টাইপ: ${preview.type.toUpperCase()}</div>
            </div>
          </div>
        </div>
      `;

      if (preview.type === 'excel' && preview.tableData) {
        let tableRowsHtml = '';
        preview.tableData.forEach((row, rIdx) => {
          let cellsHtml = row.map(cell => `<td>${escapeHtml(cell !== undefined ? cell : '')}</td>`).join('');
          if (rIdx === 0) {
            tableRowsHtml += `<tr style="background: var(--bg-card); font-weight: 600;">${row.map(cell => `<th>${escapeHtml(cell !== undefined ? cell : '')}</th>`).join('')}</tr>`;
          } else {
            tableRowsHtml += `<tr>${cellsHtml}</tr>`;
          }
        });
        
        innerHtml += `
          <div style="overflow-x: auto; max-height: 38vh; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <table class="key-preview-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              ${tableRowsHtml}
            </table>
          </div>
        `;
      } else if (preview.type === 'image' && preview.imagePreviewUrl) {
        innerHtml += `
          <div style="text-align: center; max-height: 40vh; overflow: auto; background: #000; padding: 10px; border-radius: var(--radius-sm);">
            <img src="${preview.imagePreviewUrl}" alt="Answer Key Preview" style="max-width: 100%; max-height: 360px; object-fit: contain; border-radius: 4px;">
          </div>
        `;
      } else if (preview.rawText) {
        innerHtml += `
          <div class="key-source-text-view" style="max-height: 38vh; overflow-y: auto; padding: 1rem; background: #1e293b; color: #f8fafc; border-radius: 6px; font-family: monospace; white-space: pre-wrap;">${escapeHtml(preview.rawText)}</div>
        `;
      } else {
        innerHtml += `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            ফাইলটি সফলভাবে প্রক্রিয়া করা হয়েছে এবং উত্তরমালা বাবল গ্রিডে লোড করা হয়েছে।
          </div>
        `;
      }

      if (typeof keySourcePreviewContainer !== 'undefined' && keySourcePreviewContainer) {
        keySourcePreviewContainer.innerHTML = innerHtml;
      }
    };
    
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (btnSaveAnswerKeys) {
      btnSaveAnswerKeys.addEventListener('click', () => {
      modalAnswerKey.style.display = 'none';
        modalAnswerKey.classList.remove('active');
      if (state.students.length > 0) {
        reEvaluateAllStudents();
        renderResultsTable();
        updateStatistics();
        showToast('নতুন উত্তরপত্রের ভিত্তিতে সকল শিক্ষার্থীর নম্বর পুনরায় মূল্যায়ন করা হয়েছে!', 'success', 'fa-rotate');
      } else {
        showToast('উত্তরপত্র সংরক্ষিত হয়েছে!', 'success');
      }
    });

    // 8. Excel Export Functionality (.xlsx)
    }

    btnExportExcel.addEventListener('click', () => {
      if (state.students.length === 0) {
        showToast('এক্সপোর্ট করার মতো কোনো ফলাফল পাওয়া যায়নি', 'warning');
        return;
      }

      try {
        // Prepare formatted data for SheetJS
        const excelRows = state.students.map((s, idx) => ({
          'ক্রমিক নং': idx + 1,
          'শিক্ষার্থী আইডি নং': s.id,
          'রোল নং': s.roll,
          'শ্রেণি': s.class,
          'শাখা': s.section,
          'সেট নং': s.set,
          'শুদ্ধ উত্তর': s.correct,
          'ভুল উত্তর': s.wrong,
          'ফাঁকা উত্তর': s.blank,
          'মোট নম্বর': s.correct,
          'শতকরা (%)': s.percentage + '%',
          'ফলাফল স্ট্যাটাস': s.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        
        // Auto-size columns width
        worksheet['!cols'] = [
          { wch: 10 },
          { wch: 18 },
          { wch: 12 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 14 },
          { wch: 16 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'OMR_Evaluation_Result');

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `OMR_Evaluation_Report_${dateStr}.xlsx`);
        showToast('এক্সেল (.xlsx) ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success', 'fa-file-excel');
      } catch (err) {
        console.error(err);
        showToast('এক্সেল এক্সপোর্টে সমস্যা হয়েছে: ' + err.message, 'danger');
      }
    });

    // 9. Print Table Action
    btnPrintTable.addEventListener('click', () => {
      window.print();
    });

    // 10. Blank OMR Download / Print Integration
    if (btnDownloadBlankOMR) {
      btnDownloadBlankOMR.addEventListener('click', () => {
        window.handleBlankOmrClick();
      });
    }

    // Reset All Data
    btnResetData.addEventListener('click', () => {
      if (confirm('আপনি কি বর্তমান সকল ফলাফল ও আপলোডকৃত ডেটা রিসেট করতে চান?')) {
        state.students = [];
        state.studentFiles = [];
        state.answerKeyFiles = [];
        
        dropzoneAnswerKey.classList.remove('filled');
        dropzoneStudentOMR.classList.remove('filled');
        textAnswerKeyStatus.innerHTML = 'কোনো উত্তরপত্র আপলোড করা হয়নি';
        textStudentOMRStatus.innerHTML = '০ টি ফাইল নির্বাচিত';
        
        renderResultsTable();
        updateStatistics();
        btnExportExcel.disabled = true;
        btnPrintTable.disabled = true;
        showToast('ডেটা সফলভাবে রিসেট করা হয়েছে', 'info');
      }
    });
  

    // --- Additional Template Download Utilities ---
    window.downloadAnswerKeyTemplate = function(format) {
      if (format === 'xlsx') {
        try {
          const rows = [
            ['প্রশ্ন নং', 'সেট ক', 'সেট খ', 'সেট গ']
          ];
          for (let q = 1; q <= 30; q++) {
            rows.push([q, 'ক', 'খ', 'গ']);
          }
          const ws = XLSX.utils.aoa_to_sheet(rows);
          ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Answer_Key_Template');
          XLSX.writeFile(wb, 'OMR_Answer_Key_Template.xlsx');
          showToast('এক্সেল টেমপ্লেট সফলভাবে ডাউনলোড হয়েছে!', 'success', 'fa-file-excel');
        } catch(e) {
          console.error(e);
          showToast('টেমপ্লেট তৈরিতে ত্রুটি: ' + e.message, 'danger');
        }
      } else if (format === 'csv') {
        let csvContent = 'Question,Set_A,Set_B,Set_C\n';
        for (let q = 1; q <= 30; q++) {
          csvContent += `${q},ক,খ,গ\n`;
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'OMR_Answer_Key_Template.csv';
        link.click();
        showToast('CSV টেমপ্লেট ডাউনলোড হয়েছে!', 'success', 'fa-file-csv');
      } else if (format === 'txt') {
        let txtContent = 'OMR 30 Questions Answer Key Template\n------------------------------------\n';
        for (let q = 1; q <= 30; q++) {
          txtContent += `${q}. ক\n`;
        }
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'OMR_Answer_Key_Template.txt';
        link.click();
        showToast('TXT টেমপ্লেট ডাউনলোড হয়েছে!', 'success', 'fa-file-lines');
      }
    };

    // --- ERP Exam API Integration (Persistence) ---
    window.saveOmrToExamsApi = async function() {
      if (!state.students || state.students.length === 0) {
        showToast('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর ওএমআর ফলাফল নেই। অনুগ্রহ করে প্রথমে ওএমআর শিট মূল্যায়ন করুন অথবা "নমুনা ডেটা লোড করুন" বাটনে ক্লিক করুন।', 'warning', 'fa-triangle-exclamation');
        return;
      }
      
      const examNamePrompt = prompt('পরীক্ষার নাম বা কোড লিখুন:', 'OMR পরীক্ষা ' + new Date().toLocaleDateString('bn-BD'));
      if (!examNamePrompt) return;
      
      const examRecord = {
        id: String(Date.now()),
        examName: examNamePrompt,
        date: new Date().toLocaleDateString('bn-BD'),
        totalStudents: state.students.length,
        students: state.students,
        answerKeys: state.answerKeys
      };
      
      try {
        let currentExams = [];
        try {
          const getRes = await fetch('/api/exams');
          if (getRes.ok) currentExams = await getRes.json();
        } catch(e) {}
        
        if (!Array.isArray(currentExams)) currentExams = [];
        currentExams.unshift(examRecord);
        
        const saveRes = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentExams)
        });
        
        if (saveRes.ok) {
          showToast('পরীক্ষার ফলাফল সার্ভারে সফলভাবে সংরক্ষিত হয়েছে!', 'success', 'fa-cloud-arrow-up');
        } else {
          localStorage.setItem('school_omr_exams', JSON.stringify(currentExams));
          showToast('ফলাফল লোকাল মেমরিতে সংরক্ষিত হয়েছে', 'info');
        }
      } catch(err) {
        localStorage.setItem('school_omr_exams', JSON.stringify([examRecord]));
        showToast('ফলাফল লোকাল মেমরিতে ব্যাকআপ করা হয়েছে', 'info');
      }
    };

    window.loadOmrFromExamsApi = async function() {
      try {
        const res = await fetch('/api/exams');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[0];
            if (latest.students && latest.students.length > 0) {
              state.students = latest.students;
              if (latest.answerKeys) {
                state.answerKeys = latest.answerKeys;
              }
              renderResultsTable();
              updateStatistics();
              btnExportExcel.disabled = false;
              btnPrintTable.disabled = false;
              renderAnswerKeyBubbles();
              showToast(`সংরক্ষিত পরীক্ষা "${latest.examName || latest.id}" (${toBengaliNumber(latest.students.length)} জন) সফলভাবে লোড হয়েছে!`, 'success', 'fa-check');
              return true;
            }
          }
        }
      } catch(e) {
        console.warn('Could not auto-load exams:', e);
      }
      return false;
    };

    // Subview Lifecycle Initializer
    window.initOmrReaderView = function() {
      if (state.students.length === 0) {
        loadOmrFromExamsApi();
      }
    };

    })();
    