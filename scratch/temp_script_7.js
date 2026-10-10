
        (function () {

            // Bengali & English number formatting utilities
            const toBengaliNumber = num => String(num).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
            const toEnglishDigits = str => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            const optionsBengali = ['ক', 'খ', 'গ', 'ঘ'];

            // Class normalization and formatting helpers
            function mapClassToNumber(cls) {
                if (!cls) return '8';
                const str = String(cls).trim().toLowerCase();
                const enMap = {
                    'ten': '10', 'nine': '9', 'eight': '8', 'seven': '7', 'six': '6',
                    'five': '5', 'four': '4', 'three': '3', 'two': '2', 'one': '1'
                };
                if (enMap[str]) return enMap[str];
                const bnMap = {
                    '১০': '10', '৯': '9', '৮': '8', '৭': '7', '৬': '6',
                    '৫': '5', '৪': '4', '৩': '3', '২': '2', '১': '1'
                };
                if (bnMap[str]) return bnMap[str];
                const digits = str.replace(/[^\d]/g, '');
                if (digits) return digits;
                return cls;
            }
            window.mapClassToNumber = mapClassToNumber;

            function formatClassBangla(cls) {
                const c = mapClassToNumber(cls);
                if (c === '6') return '৬ষ্ঠ শ্রেণি';
                if (c === '7') return '৭ম শ্রেণি';
                if (c === '8') return '৮ম শ্রেণি';
                if (c === '9') return '৯ম শ্রেণি';
                if (c === '10') return '১০ম শ্রেণি';
                return toBengaliNumber(c) + ' শ্রেণি';
            }
            window.formatClassBangla = formatClassBangla;

            // Helper: Sort students in sequential/ascending order by Registration Number
            function sortStudentsByRegNo(studentsArray) {
                if (!Array.isArray(studentsArray)) return studentsArray;
                return studentsArray.sort((a, b) => {
                    const rawA = toEnglishDigits(a.id || a.regNo || a.studentId || '').trim();
                    const rawB = toEnglishDigits(b.id || b.regNo || b.studentId || '').trim();
                    const numA = parseInt(rawA, 10);
                    const numB = parseInt(rawB, 10);

                    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
                        return numA - numB;
                    }
                    const cmp = rawA.localeCompare(rawB, undefined, { numeric: true, sensitivity: 'base' });
                    if (cmp !== 0) return cmp;

                    const rollA = parseInt(toEnglishDigits(a.roll || '0'), 10) || 0;
                    const rollB = parseInt(toEnglishDigits(b.roll || '0'), 10) || 0;
                    return rollA - rollB;
                });
            }
            window.sortStudentsByRegNo = sortStudentsByRegNo;

            // Student Lookup Index Helper (for instant lookup of English name from school_students)
            function getStudentsLookupMaps() {
                let allStudents = [];
                try {
                    if (typeof loadStudents === 'function') {
                        allStudents = loadStudents() || [];
                    } else {
                        allStudents = safeJsonParse('school_students', []);
                    }
                } catch (e) { }
                if (!Array.isArray(allStudents)) allStudents = [];

                const byReg = new Map();
                const byRollClass = new Map();

                allStudents.forEach(s => {
                    const enName = String(s.name || s.nameEn || '').trim();
                    if (!enName) return;

                    const reg = toEnglishDigits(s.regNo || '').trim();
                    const sId = toEnglishDigits(s.studentId || '').trim();
                    const sDbId = toEnglishDigits(s.id || '').trim();
                    if (reg) byReg.set(reg, enName);
                    if (sId && !byReg.has(sId)) byReg.set(sId, enName);
                    if (sDbId && !byReg.has(sDbId)) byReg.set(sDbId, enName);

                    const r = toEnglishDigits(s.roll || '').trim();
                    const c = mapClassToNumber(s.class);
                    if (r) {
                        if (c) byRollClass.set(`${c}_${r}`, enName);
                        if (!byRollClass.has(`_${r}`)) byRollClass.set(`_${r}`, enName);
                    }
                });

                return { byReg, byRollClass };
            }
            window.getStudentsLookupMaps = getStudentsLookupMaps;

            function getStudentEnglishNameById(id, roll, cls) {
                if (!id && !roll) return '';
                const lookup = getStudentsLookupMaps();
                const rawId = toEnglishDigits(id || '').trim();
                const rawRoll = toEnglishDigits(roll || '').trim();
                const rawCls = mapClassToNumber(cls);
                return lookup.byReg.get(rawId) || lookup.byRollClass.get(`${rawCls}_${rawRoll}`) || lookup.byRollClass.get(`_${rawRoll}`) || '';
            }
            window.getStudentEnglishNameById = getStudentEnglishNameById;

            // Default pattern for Sets ক, খ, গ, ঘ (30 questions each) so visual review & matching work immediately
            const sampleKeysPattern = {
                'ক': ['ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ'],
                'খ': ['খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক'],
                'গ': ['গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ'],
                'ঘ': ['ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ']
            };

            // Default Answer Keys initialized with full 30 keys per set
            const defaultAnswerKeys = JSON.parse(JSON.stringify(sampleKeysPattern));

            // Helper: Normalize set representation ('ক', 'খ', 'গ', 'ঘ')
            function normalizeSet(val) {
                if (!val) return 'ক';
                const str = String(val).trim().toLowerCase();
                if (str.includes('ঘ') || str.includes('d') || str === '4' || str === '৪') return 'ঘ';
                if (str.includes('গ') || str.includes('c') || str === '3' || str === '৩') return 'গ';
                if (str.includes('খ') || str.includes('b') || str === '2' || str === '২') return 'খ';
                if (str.includes('ক') || str.includes('a') || str === '1' || str === '১') return 'ক';
                return 'ক';
            }

            // Helper: Normalize single option to Bengali 'ক', 'খ', 'গ', 'ঘ'
            function normalizeSingleOption(val) {
                if (val === null || val === undefined) return null;
                const str = String(val).trim().toUpperCase();
                if (str === 'ক' || str === 'A' || str === '1' || str === '১') return 'ক';
                if (str === 'খ' || str === 'B' || str === '2' || str === '২') return 'খ';
                if (str === 'গ' || str === 'C' || str === '3' || str === '৩') return 'গ';
                if (str === 'ঘ' || str === 'D' || str === '4' || str === '৪') return 'ঘ';
                return null;
            }

            // Helper: Normalize option representation (supports single option or multiple/duplicate options array)
            function normalizeOption(val) {
                if (val === null || val === undefined) return null;
                if (Array.isArray(val)) {
                    const normList = [];
                    val.forEach(v => {
                        const n = normalizeSingleOption(v);
                        if (n && !normList.includes(n)) normList.push(n);
                    });
                    normList.sort((a, b) => optionsBengali.indexOf(a) - optionsBengali.indexOf(b));
                    if (normList.length === 0) return null;
                    if (normList.length === 1) return normList[0];
                    return normList; // Multiple bubbles filled (Duplicate)
                }
                const str = String(val).trim();
                // Check for comma, slash, space separated multiple options
                if (str.includes(',') || str.includes('/') || str.includes('+') || str.includes(';') || (str.length > 1 && !['ক', 'খ', 'গ', 'ঘ', 'A', 'B', 'C', 'D'].includes(str.toUpperCase()))) {
                    const parts = str.split(/[,/+;\s]+/);
                    const normList = [];
                    parts.forEach(p => {
                        const n = normalizeSingleOption(p);
                        if (n && !normList.includes(n)) normList.push(n);
                    });
                    normList.sort((a, b) => optionsBengali.indexOf(a) - optionsBengali.indexOf(b));
                    if (normList.length === 0) return null;
                    if (normList.length === 1) return normList[0];
                    return normList;
                }
                return normalizeSingleOption(str);
            }

            // Helper: Check if an answer has multiple filled bubbles (Duplicate)
            function isDuplicateOption(ans) {
                if (!ans) return false;
                if (Array.isArray(ans) && ans.length > 1) return true;
                if (typeof ans === 'string' && ans.includes(',')) return true;
                return false;
            }

            // Helper: Retrieve active answer key for a set with intelligent fallback
            function getActiveAnswerKey(setCode) {
                const normSet = normalizeSet(setCode);
                // 1. Specified set has valid filled answers
                if (state.answerKeys && state.answerKeys[normSet] && state.answerKeys[normSet].some(ans => ans !== null && ans !== undefined && ans !== '')) {
                    return state.answerKeys[normSet];
                }
                // 2. Set 'ক' if it has answers
                if (state.answerKeys && state.answerKeys['ক'] && state.answerKeys['ক'].some(ans => ans !== null && ans !== undefined && ans !== '')) {
                    return state.answerKeys['ক'];
                }
                // 3. Any active set that has answers
                if (state.answerKeys) {
                    for (const s of ['খ', 'গ', 'ঘ']) {
                        if (state.answerKeys[s] && state.answerKeys[s].some(ans => ans !== null && ans !== undefined && ans !== '')) {
                            return state.answerKeys[s];
                        }
                    }
                }
                // 4. Default fallback key
                return defaultAnswerKeys[normSet] || defaultAnswerKeys['ক'];
            }

            // Helper: Safely get student answer for question q (1-indexed)
            function getStudentAnswer(student, q) {
                if (!student || !student.answers) return null;
                const ansObj = student.answers;
                let val = null;
                if (Array.isArray(ansObj)) {
                    if (ansObj.length === 30) {
                        val = ansObj[q - 1];
                    } else {
                        val = ansObj[q] !== undefined ? ansObj[q] : ansObj[q - 1];
                    }
                } else if (typeof ansObj === 'object') {
                    val = ansObj[q] !== undefined ? ansObj[q] : ansObj[String(q)];
                    if (val === undefined && ansObj[q - 1] !== undefined) {
                        val = ansObj[q - 1];
                    }
                }
                return normalizeOption(val);
            }

            // Helper: Get student answer as an array of selected options
            function getStudentAnswerOptions(student, q) {
                const ans = getStudentAnswer(student, q);
                if (!ans) return [];
                if (Array.isArray(ans)) return ans;
                if (typeof ans === 'string') {
                    if (ans.includes(',')) return ans.split(',').map(s => s.trim()).filter(Boolean);
                    return [ans];
                }
                return [];
            }

            // Application Global State
            const state = {
                answerKeys: JSON.parse(JSON.stringify(defaultAnswerKeys)),
                currentEditingKeySet: 'ক',
                setSourceFiles: {
                    'ক': null,
                    'খ': null,
                    'গ': null,
                    'ঘ': null
                },
                studentFiles: [],
                answerKeyFiles: [],
                uploadedKeyPreview: null, // Stores metadata and content for preview
                activeKeyModalTab: 'bubble',
                activeStudentModalTab: 'split', // Default tab for student review modal
                studentScanZoom: 1.0,
                students: [],
                pendingUnmatchedList: [],
                activeResultsTab: 'main',
                importedExamInfo: null,
                currentEditIndex: -1,
                tempEditStudent: null
            };

            // Expose Global Action Handlers Immediately
            window.openMultiSetUploadModal = function () {
                window.openAnswerKeyModalDirect('multiset');
            };

            window.handleBlankOmrClick = function () {
                window.open('2O2mr.html', '_blank');
                if (typeof showToast === 'function') {
                    showToast('ব্লাংক OMR শিট নতুন ট্যাবে ওপেন হচ্ছে...', 'info', 'fa-file-arrow-down');
                }
            };

            window.openAnswerKeyModalDirect = function (defaultTab) {
                if (typeof selectAnswerKeySet === 'function') {
                    selectAnswerKeySet(state.currentEditingKeySet || 'ক');
                }
                const m = document.getElementById('modalAnswerKey');
                if (m) {
                    m.classList.add('active');
                    m.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                const targetTab = defaultTab || (state && state.uploadedKeyPreview ? 'split' : 'bubble');
                if (window.switchKeyModalTab) {
                    window.switchKeyModalTab(targetTab);
                }
            };

            window.closeAnswerKeyModalDirect = function () {
                const m = document.getElementById('modalAnswerKey');
                if (m) {
                    m.classList.remove('active');
                    m.style.display = 'none';
                    document.body.style.overflow = '';
                }
            };

            window.closeStudentEditModal = function () {
                const m = document.getElementById('modalViewEdit');
                if (m) {
                    m.classList.remove('active');
                    m.style.display = 'none';
                    const card = m.querySelector('.modal-card');
                    if (card) card.classList.remove('split-active');
                    document.body.style.overflow = '';
                }
                state.currentEditIndex = -1;
                state.tempEditStudent = null;
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

            // 1. Unified Multi-Set Answer Key File & Folder Processor
            window.handleSingleSetUpload = function (targetSet, file) {
                if (!file) return;
                handleAnswerKeyFiles([file], targetSet);
            };

            async function handleAnswerKeyFiles(files, forcedSet = null) {
                if (!files || files.length === 0) return;
                state.answerKeyFiles = files;
                if (dropzoneAnswerKey) dropzoneAnswerKey.classList.add('filled');

                let parsedCount = 0;
                let loadedSetNames = new Set();
                let previewInfo = {
                    fileName: files.length === 1 ? files[0].name : `${files.length} টি ফাইলযুক্ত ফোল্ডার/সেট`,
                    fileCount: files.length,
                    type: 'unknown',
                    rawText: '',
                    tableData: null,
                    imagePreviewUrl: null
                };

                // Helper: Detect target set from filename
                function detectSetFromFileName(filename) {
                    if (forcedSet) return forcedSet;
                    const lower = filename.toLowerCase();
                    if (/(set[_\s-]?a|সেট[_\s-]?ক|[_(\s]ক[_)\s.]|^ক[\._\s])/i.test(lower)) return 'ক';
                    if (/(set[_\s-]?b|সেট[_\s-]?খ|[_(\s]খ[_)\s.]|^খ[\._\s])/i.test(lower)) return 'খ';
                    if (/(set[_\s-]?c|সেট[_\s-]?গ|[_(\s]গ[_)\s.]|^গ[\._\s])/i.test(lower)) return 'গ';
                    if (/(set[_\s-]?d|সেট[_\s-]?ঘ|[_(\s]ঘ[_)\s.]|^ঘ[\._\s])/i.test(lower)) return 'ঘ';
                    return null;
                }

                for (let fIdx = 0; fIdx < files.length; fIdx++) {
                    const file = files[fIdx];
                    const lowerName = file.name.toLowerCase();
                    let targetSet = detectSetFromFileName(file.name);

                    // A. Excel Workbook (.xlsx, .xls)
                    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
                        try {
                            const buffer = await file.arrayBuffer();
                            const workbook = XLSX.read(buffer, { type: 'array' });
                            previewInfo.type = 'excel';
                            previewInfo.fileName = file.name;

                            let sheetMatched = false;
                            // Check if multiple sheets represent multiple sets
                            workbook.SheetNames.forEach(sName => {
                                let sheetSet = detectSetFromFileName(sName);
                                if (!sheetSet) {
                                    const sUpper = sName.trim().toUpperCase();
                                    if (sUpper === 'A' || sUpper === 'ক' || sUpper.includes('SET A')) sheetSet = 'ক';
                                    else if (sUpper === 'B' || sUpper === 'খ' || sUpper.includes('SET B')) sheetSet = 'খ';
                                    else if (sUpper === 'C' || sUpper === 'গ' || sUpper.includes('SET C')) sheetSet = 'গ';
                                    else if (sUpper === 'D' || sUpper === 'ঘ' || sUpper.includes('SET D')) sheetSet = 'ঘ';
                                }

                                if (sheetSet) {
                                    const sheet = workbook.Sheets[sName];
                                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                                    const extractedAnswers = [];
                                    rows.flat().forEach(cell => {
                                        const opt = normalizeOption(cell);
                                        if (opt && extractedAnswers.length < 30) extractedAnswers.push(opt);
                                    });
                                    if (extractedAnswers.length > 0) {
                                        while (extractedAnswers.length < 30) extractedAnswers.push('ক');
                                        state.answerKeys[sheetSet] = [...extractedAnswers];
                                        state.setSourceFiles[sheetSet] = {
                                            fileName: `${file.name} [শীট: ${sName}]`,
                                            type: 'excel',
                                            count: 30,
                                            timestamp: new Date().toLocaleTimeString()
                                        };
                                        loadedSetNames.add(sheetSet);
                                        parsedCount++;
                                        sheetMatched = true;
                                    }
                                }
                            });

                            // If not sheet-by-sheet, check columns in first sheet
                            if (!sheetMatched) {
                                const sheetName = workbook.SheetNames[0];
                                const sheet = workbook.Sheets[sheetName];
                                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                                previewInfo.tableData = rows;

                                if (rows && rows.length > 0) {
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
                                        } else if (colTitle.includes('ঘ') || upper.includes('SET D') || upper.includes('SET-D') || upper.includes('SETD') || upper === 'D') {
                                            setCols['ঘ'] = cIdx;
                                        }
                                    });

                                    if (Object.keys(setCols).length > 0) {
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
                                                state.setSourceFiles[setName] = {
                                                    fileName: `${file.name} [কলাম: ${setName}]`,
                                                    type: 'excel',
                                                    count: 30,
                                                    timestamp: new Date().toLocaleTimeString()
                                                };
                                                loadedSetNames.add(setName);
                                                parsedCount++;
                                            }
                                        });
                                    } else {
                                        // Single flat list in rows/columns
                                        const defaultSet = targetSet || (files.length > 1 ? ['ক', 'খ', 'গ', 'ঘ'][fIdx % 4] : state.currentEditingKeySet);
                                        const extractedAnswers = [];
                                        rows.flat().forEach(cell => {
                                            const opt = normalizeOption(cell);
                                            if (opt && extractedAnswers.length < 30) extractedAnswers.push(opt);
                                        });
                                        if (extractedAnswers.length > 0) {
                                            while (extractedAnswers.length < 30) extractedAnswers.push('ক');
                                            state.answerKeys[defaultSet] = [...extractedAnswers];
                                            state.setSourceFiles[defaultSet] = {
                                                fileName: file.name,
                                                type: 'excel',
                                                count: 30,
                                                timestamp: new Date().toLocaleTimeString()
                                            };
                                            loadedSetNames.add(defaultSet);
                                            parsedCount++;
                                        }
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
                            ['ক', 'খ', 'গ', 'ঘ', 'A', 'B', 'C', 'D'].forEach(sKey => {
                                const mappedKey = (sKey === 'A' || sKey === 'ক') ? 'ক' : ((sKey === 'B' || sKey === 'খ') ? 'খ' : ((sKey === 'C' || sKey === 'গ') ? 'গ' : 'ঘ'));
                                if (parsed[sKey] && Array.isArray(parsed[sKey])) {
                                    state.answerKeys[mappedKey] = parsed[sKey].map(opt => normalizeOption(opt) || 'ক').slice(0, 30);
                                    while (state.answerKeys[mappedKey].length < 30) state.answerKeys[mappedKey].push('ক');
                                    state.setSourceFiles[mappedKey] = {
                                        fileName: `${file.name} [JSON: ${sKey}]`,
                                        type: 'json',
                                        count: 30,
                                        timestamp: new Date().toLocaleTimeString()
                                    };
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
                            const defaultSet = targetSet || (files.length > 1 ? ['ক', 'খ', 'গ', 'ঘ'][fIdx % 4] : state.currentEditingKeySet);

                            lines.forEach(line => {
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
                                state.answerKeys[defaultSet] = extracted;
                                state.setSourceFiles[defaultSet] = {
                                    fileName: file.name,
                                    type: previewInfo.type,
                                    count: extracted.length,
                                    timestamp: new Date().toLocaleTimeString()
                                };
                                loadedSetNames.add(defaultSet);
                                parsedCount++;
                            }
                        } catch (err) {
                            console.error('Text/CSV parse error:', err);
                        }
                    }

                    // D. Image File (.jpg, .png, .webp) - Scanned OMR Sheet
                    else if (/\.(jpe?g|png|webp|gif|bmp)$/i.test(lowerName)) {
                        previewInfo.type = 'image';
                        previewInfo.fileName = file.name;
                        previewInfo.imagePreviewUrl = URL.createObjectURL(file);

                        if (textAnswerKeyStatus) {
                            textAnswerKeyStatus.innerHTML = `<span style="color: var(--warning);"><i class="fa-solid fa-spinner fa-spin"></i> ওএমআর স্ক্যান করা হচ্ছে (${toBengaliNumber(fIdx + 1)}/${toBengaliNumber(files.length)}): ${file.name}...</span>`;
                        }

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
                                    const detectedByServer = Object.keys(data.sets)[0] || 'ক';
                                    const assignedSet = targetSet || detectedByServer || (files.length > 1 ? ['ক', 'খ', 'গ', 'ঘ'][fIdx % 4] : state.currentEditingKeySet);
                                    const answers = data.sets[detectedByServer] || Object.values(data.sets)[0];

                                    state.answerKeys[assignedSet] = answers;
                                    state.setSourceFiles[assignedSet] = {
                                        fileName: file.name,
                                        type: 'image',
                                        count: answers.filter(Boolean).length,
                                        imagePreviewUrl: previewInfo.imagePreviewUrl,
                                        timestamp: new Date().toLocaleTimeString()
                                    };
                                    loadedSetNames.add(assignedSet);
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

                // Update Card 1 Status text & Multi-Set indicators
                const setListStr = loadedSetNames.size > 0 ? Array.from(loadedSetNames).join(', ') : 'ক, খ, গ';
                if (textAnswerKeyStatus) {
                    textAnswerKeyStatus.innerHTML = `<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> ${previewInfo.fileName} (সেট: ${setListStr})</span>`;
                }

                // Update UI across all views
                renderAnswerKeyBubbles();
                updateKeySourcePreviewUI();
                updateMultiSetStatusUI();

                if (keySourceBadge) {
                    keySourceBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ফাইল সিঙ্ক হয়েছে: ${previewInfo.fileName}`;
                }

                // Re-evaluate if students exist
                if (state.students.length > 0) {
                    reEvaluateAllStudents();
                    renderResultsTable();
                    updateStatistics();
                    showToast(`একাধিক সেটের উত্তরপত্র সফলভাবে সিঙ্ক হয়েছে! নতুন উত্তরপত্রের ভিত্তিতে ${state.students.length} জন শিক্ষার্থীর ফলাফল পুনঃমূল্যায়ন করা হয়েছে।`, 'success', 'fa-layer-group');
                } else {
                    showToast(`সফলভাবে ${loadedSetNames.size} টি সেটের (${Array.from(loadedSetNames).join(', ')}) উত্তরপত্র লোড ও সেটআপ সম্পন্ন হয়েছে!`, 'success', 'fa-layer-group');
                }
            }

            // Update Multi-Set Badges in Card 1 and Chips
            window.updateMultiSetStatusUI = function () {
                const sets = ['ক', 'খ', 'গ', 'ঘ'];

                // 1. Update Chips in Card 1
                sets.forEach(s => {
                    const chip = document.getElementById(`chipUploadSet_${s}`);
                    const statusSpan = document.getElementById(`chipStatus_${s}`);
                    const answers = state.answerKeys[s] || [];
                    const filled = answers.filter(Boolean).length;

                    if (statusSpan) {
                        if (filled > 0) {
                            statusSpan.textContent = `✓ ${toBengaliNumber(filled)}`;
                            statusSpan.style.color = '#059669';
                            statusSpan.style.fontWeight = '700';
                            if (chip) chip.classList.add('filled');
                        } else {
                            statusSpan.textContent = '';
                            if (chip) chip.classList.remove('filled');
                        }
                    }
                });

                // 2. Update multiSetBadgesBar in Card 1 status bar
                const badgesBar = document.getElementById('multiSetBadgesBar');
                if (badgesBar) {
                    badgesBar.innerHTML = sets.map(s => {
                        const filled = (state.answerKeys[s] || []).filter(Boolean).length;
                        const bg = filled === 30 ? '#ecfdf5' : (filled > 0 ? '#fffbeb' : '#f8fafc');
                        const border = filled === 30 ? '#a7f3d0' : (filled > 0 ? '#fde68a' : '#e2e8f0');
                        const color = filled === 30 ? '#059669' : (filled > 0 ? '#b45309' : '#94a3b8');
                        const icon = filled === 30 ? 'fa-circle-check' : (filled > 0 ? 'fa-clock' : 'fa-circle-notch');

                        return `
            <span style="font-size: 0.73rem; background: ${bg}; border: 1px solid ${border}; color: ${color}; padding: 2px 7px; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" title="সেট ${s}: ${toBengaliNumber(filled)} টি সঠিক উত্তর সেট করা">
              <i class="fa-solid ${icon}"></i> সেট ${s}: ${toBengaliNumber(filled)}/৩০
            </span>
          `;
                    }).join('');
                }

                // 3. Update Modal Multi-Set Tab cards if visible
                renderMultiSetUploadUI();
            };

            // Render 4 Set Cards in Modal Multi-Set Tab
            window.renderMultiSetUploadUI = function () {
                const container = document.getElementById('multiSetCardsContainer');
                if (!container) return;

                const sets = [
                    { code: 'ক', name: 'সেট ক', label: 'Set A', color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)', border: '#c7d2fe' },
                    { code: 'খ', name: 'সেট খ', label: 'Set B', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', border: '#a7f3d0' },
                    { code: 'গ', name: 'সেট গ', label: 'Set C', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', border: '#fde68a' },
                    { code: 'ঘ', name: 'সেট ঘ', label: 'Set D', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', border: '#fecaca' }
                ];

                container.innerHTML = sets.map(setInfo => {
                    const s = setInfo.code;
                    const answers = state.answerKeys[s] || [];
                    const filledCount = answers.filter(Boolean).length;
                    const source = state.setSourceFiles[s];
                    const isFilled = filledCount > 0;

                    return `
          <div class="multi-set-card ${isFilled ? 'has-data' : ''}">
            <div class="multi-set-card-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${setInfo.color}; color: white; font-weight: 700; font-size: 0.88rem; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
                  ${s}
                </span>
                <div>
                  <strong style="color: var(--text-main); font-size: 0.95rem;">${setInfo.name}</strong>
                  <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 4px;">(${setInfo.label})</span>
                </div>
              </div>
              <span class="set-status-pill ${isFilled ? 'active' : 'empty'}">
                <i class="fa-solid ${isFilled ? 'fa-circle-check' : 'fa-circle-notch'}"></i>
                ${isFilled ? `${toBengaliNumber(filledCount)}/৩০ প্রস্তুত` : 'ফাঁকা'}
              </span>
            </div>

            <!-- Source Details -->
            <div style="font-size: 0.78rem; background: var(--bg-page); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <span style="color: var(--text-muted); font-size: 0.72rem;">সংযুক্ত ফাইল:</span>
                <span style="color: ${source ? 'var(--text-main)' : 'var(--text-muted)'}; font-weight: 600; font-size: 0.78rem; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${source ? source.fileName : 'কোনো ফাইল নেই'}">
                  ${source ? source.fileName : 'কোনো ফাইল যুক্ত নেই'}
                </span>
              </div>
              
              <!-- Mini Preview of questions -->
              <div style="display: flex; gap: 3px; margin-top: 4px; overflow-x: auto; padding-bottom: 2px;">
                ${[1, 2, 3, 4, 5, 6].map(q => {
                        const ans = answers[q - 1];
                        return `
                    <span style="font-size: 0.68rem; padding: 1px 4px; border-radius: 4px; background: ${ans ? setInfo.bg : '#f1f5f9'}; color: ${ans ? setInfo.color : '#94a3b8'}; border: 1px solid ${ans ? setInfo.border : '#e2e8f0'}; font-weight: 700;">
                      ${toBengaliNumber(q)}:${ans || '-'}
                    </span>
                  `;
                    }).join('')}
                <span style="font-size: 0.68rem; color: var(--text-muted); align-self: center;">...</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 4px;">
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-xs btn-primary" onclick="document.getElementById('inputAnswerKeySet_${s}').click()" title="সেট ${s} এর জন্য ফাইল নির্বাচন করুন">
                  <i class="fa-solid fa-file-arrow-up"></i> ফাইল আপলোড
                </button>
                <button type="button" class="btn btn-xs btn-outline" onclick="selectAnswerKeySet('${s}'); switchKeyModalTab('bubble');" title="এই সেটের ওএমআর বাবল দেখুন ও সংশোধন করুন">
                  <i class="fa-solid fa-pen-to-square"></i> বাবল
                </button>
              </div>
              ${isFilled ? `
                <button type="button" class="icon-btn" onclick="clearSingleSetAnswers('${s}')" title="সেট ${s}-এর উত্তরপত্র মুছে ফেলুন" style="width: 26px; height: 26px; color: var(--danger);">
                  <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `;
                }).join('');
            };

            window.clearSingleSetAnswers = function (setName) {
                if (!confirm(`আপনি কি নিশ্চিতভাবে সেট '${setName}'-এর উত্তরপত্র মুছে ফেলতে চান?`)) return;
                state.answerKeys[setName] = Array(30).fill(null);
                state.setSourceFiles[setName] = null;
                renderAnswerKeyBubbles();
                updateMultiSetStatusUI();
                if (state.students.length > 0) {
                    reEvaluateAllStudents();
                    renderResultsTable();
                    updateStatistics();
                }
                showToast(`সেট '${setName}'-এর উত্তরপত্র মুছে ফেলা হয়েছে।`, 'info');
            };

            // Attach listeners for both file and folder inputs
            inputAnswerKeyFolder.addEventListener('change', (e) => handleAnswerKeyFiles(Array.from(e.target.files)));
            inputAnswerKeyFile.addEventListener('change', (e) => handleAnswerKeyFiles(Array.from(e.target.files)));

            // Quick Preview buttons
            [btnPreviewAnswerKeyCard, btnQuickKeyPreview].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.openAnswerKeyModalDirect();
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
                const targetKey = getActiveAnswerKey(setCode);
                let correct = 0;
                let wrong = 0;
                let blank = 0;
                let duplicate = 0;

                for (let q = 1; q <= 30; q++) {
                    let studentAns = null;
                    if (studentAnswers) {
                        if (Array.isArray(studentAnswers)) {
                            studentAns = normalizeOption(studentAnswers.length === 30 ? studentAnswers[q - 1] : (studentAnswers[q] !== undefined ? studentAnswers[q] : studentAnswers[q - 1]));
                        } else if (typeof studentAnswers === 'object') {
                            studentAns = normalizeOption(studentAnswers[q] !== undefined ? studentAnswers[q] : studentAnswers[String(q)]);
                            if (!studentAns && studentAnswers[q - 1] !== undefined) {
                                studentAns = normalizeOption(studentAnswers[q - 1]);
                            }
                        }
                    }
                    const correctAns = normalizeSingleOption(targetKey ? targetKey[q - 1] : null);

                    if (!studentAns || (Array.isArray(studentAns) && studentAns.length === 0)) {
                        blank++;
                    } else if (isDuplicateOption(studentAns)) {
                        // একাধিক বাবল ভরাট -> ডুপ্লিকেট হিসেবে চিহ্নিত হবে এবং উক্ত প্রশ্নে কোনো মার্ক যুক্ত হবে না (০ নম্বর)
                        duplicate++;
                        wrong++;
                    } else if (correctAns && studentAns === correctAns) {
                        correct++;
                    } else {
                        wrong++;
                    }
                }
                return { correct, wrong, blank, duplicate, total: 30 };
            }

            // Registration Number Matching Utility
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
            window.switchResultsTab = function (tab) {
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
            window.updateTabCounts = function () {
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
                    const dupCount = (state.pendingUnmatchedList || []).filter(p => p.isDuplicateReg).length;
                    const dupNote = dupCount > 0 ? ` (যার মধ্যে ${toBengaliNumber(dupCount)} টিতে ডুপ্লিকেট রেজিঃ রয়েছে)` : '';
                    if (alertBanner && state.activeResultsTab === 'main') alertBanner.style.display = 'flex';
                    if (alertHint) alertHint.style.display = 'inline-flex';
                    if (alertCountText) alertCountText.textContent = `${toBengaliNumber(pendingCount)} টি ওএমআর শিট অমিল / পেন্ডিং তালিকায় রয়েছে${dupNote}`;
                    if (alertBannerDesc) alertBannerDesc.textContent = `${toBengaliNumber(pendingCount)} টি ওএমআর শিটের রেজিঃ নং মেলেনি বা একাধিক ওএমআরে একই রেজিঃ (ডুপ্লিকেট) ব্যবহার করা হয়েছে। "Pending List" ট্যাবে গিয়ে শিক্ষার্থীর সঠিক রেজিঃ নং নির্বাচন করে সংশোধন করুন।`;
                } else {
                    if (alertBanner) alertBanner.style.display = 'none';
                    if (alertHint) alertHint.style.display = 'none';
                }
            };

            // Render the Pending List View
            window.renderPendingList = function () {
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
                        studentOptionsHtml += `<option value="${suggestedStudent.id}" selected>⭐ প্রস্তাবিত: রেজিঃ ${toEnglishDigits(suggestedStudent.id)} — ${suggestedStudent.nameEn || suggestedStudent.name || 'নাম নেই'} (রোল: ${toBengaliNumber(suggestedStudent.roll)})</option>`;
                        studentOptionsHtml += `</optgroup>`;
                    }
                    if (unassignedStudents.length > 0) {
                        studentOptionsHtml += `<optgroup label="⚠️ নম্বর অপেক্ষমাণ শিক্ষার্থী (${unassignedStudents.length} জন)">`;
                        unassignedStudents.forEach(s => {
                            if (suggestedStudent && s.id === suggestedStudent.id) return;
                            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${toEnglishDigits(s.id)} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, শ্রেণি: ${formatClassBangla(s.class)})</option>`;
                        });
                        studentOptionsHtml += `</optgroup>`;
                    }
                    if (allStudents.length > unassignedStudents.length) {
                        studentOptionsHtml += `<optgroup label="অন্যান্য শিক্ষার্থী">`;
                        allStudents.filter(s => s.status !== 'পেন্ডিং').forEach(s => {
                            if (suggestedStudent && s.id === suggestedStudent.id) return;
                            studentOptionsHtml += `<option value="${s.id}">রেজিঃ ${toEnglishDigits(s.id)} — ${s.nameEn || s.name || 'নাম নেই'} (রোল: ${toBengaliNumber(s.roll)}, বর্তমান MCQ: ${toBengaliNumber(s.correct)}/৩০)</option>`;
                        });
                        studentOptionsHtml += `</optgroup>`;
                    }

                    const previewImgSrc = item.imagePreviewUrl || '';
                    const defaultRegValue = suggestedStudent ? suggestedStudent.id : '';

                    return `
          <div class="pending-card ${item.isDuplicateReg ? 'duplicate-reg-card' : ''}" id="pending_card_${item.uid}">
            <!-- LEFT SIDE: Student Detected Info & Correction Controls -->
            <div class="pending-card-left">
              <!-- Header: File Name, Set, Score Badge -->
              <div class="pending-header-row">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="pending-file-title" title="${item.fileName}">
                    <i class="fa-regular fa-image" style="color: var(--primary);"></i> ${item.fileName}
                  </span>
                  ${item.isDuplicateReg ? `
                    <span class="badge-duplicate-reg" title="ডুপ্লিকেট রেজিঃ - একাধিক ওএমআরে একই রেজিঃ ব্যবহার করা হয়েছে">
                      <i class="fa-solid fa-triangle-exclamation"></i> ডুপ্লিকেট রেজিঃ (${toEnglishDigits(item.detectedId || item.duplicateRegId)})
                    </span>
                  ` : ''}
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; background: var(--omr-pink-light); color: var(--omr-pink); font-weight: 700; font-size: 0.84rem; border: 1.5px solid var(--omr-pink); white-space: nowrap; box-shadow: 0 1px 3px rgba(217, 28, 132, 0.12);" title="সনাক্তকৃত সেট: ${item.detectedSet}">
                    <i class="fa-solid fa-layer-group" style="font-size: 0.75rem;"></i> সেট: <strong style="font-size: 0.95rem; margin-left: 2px;">${item.detectedSet}</strong>
                  </span>
                </div>
                <span class="status-badge ${passBadgeClass}">
                  <i class="fa-solid ${isPassed ? 'fa-check' : 'fa-xmark'}"></i> ${passBadgeText} (MCQ: ${toBengaliNumber(item.scoreInfo.correct)}/৩০)
                </span>
              </div>

              <!-- Reason / Warning Box -->
              <div class="pending-reason-box" style="${item.isDuplicateReg ? 'background: #fef2f2; border: 1.5px solid #f87171; color: #991b1b;' : ''}">
                <i class="fa-solid fa-triangle-exclamation" style="${item.isDuplicateReg ? 'color: #dc2626; font-size: 1.15rem; flex-shrink: 0;' : ''}"></i>
                <span>${item.reason}</span>
              </div>

              <!-- Detected Stats Grid -->
              <div class="pending-stats-grid">
                <div class="pending-stat-item" style="${item.isDuplicateReg ? 'background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 2px 6px;' : ''}">
                  <span class="stat-lbl" style="${item.isDuplicateReg ? 'color: #9f1239; font-weight: 700;' : ''}">পঠিত রেজিঃ</span>
                  <strong class="stat-val ${item.detectedId ? (item.isDuplicateReg ? 'val-duplicate' : 'val-reg') : 'val-unclear'}" style="${item.isDuplicateReg ? 'color: #be123c; font-weight: 800;' : ''}">
                    ${item.detectedId ? toEnglishDigits(item.detectedId) : 'সনাক্ত হয়নি'}
                    ${item.isDuplicateReg ? '<span style="font-size: 0.7rem; background: #e11d48; color: #fff; padding: 1px 6px; border-radius: 4px; vertical-align: middle; margin-left: 3px; font-weight: 700;">ডুপ্লিকেট</span>' : ''}
                  </strong>
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
                <div class="pending-omr-badge" style="${item.isDuplicateReg ? 'background: #b91c1c; color: #fff;' : ''}">
                  <i class="fa-regular ${item.isDuplicateReg ? 'fa-triangle-exclamation' : 'fa-file-lines'}"></i> ${item.isDuplicateReg ? 'ডুপ্লিকেট রেজিঃ ওএমআর কপি' : 'ওএমআর শিট কপি'}
                </div>
              </div>
            </div>
          </div>
        `;
                }).join('');
            };

            window.onPendingStudentSelectChange = function (uid, selectedId) {
                if (selectedId) {
                    const inp = document.getElementById('inputReg_' + uid);
                    if (inp) inp.value = selectedId;
                }
            };

            window.selectPendingStudentDirect = function (uid, studentId) {
                const selectEl = document.getElementById('selectStudent_' + uid);
                if (selectEl) selectEl.value = studentId;
                const inp = document.getElementById('inputReg_' + uid);
                if (inp) inp.value = studentId;
                assignPendingOmr(uid);
            };

            // Assign a Pending OMR sheet to a student by Registration Number or Roll
            window.assignPendingOmr = function (uid) {
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
                    } catch (e) { }

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

                // Maintain sequential ordering by Registration Number
                sortStudentsByRegNo(state.students);

                // Refresh UI
                renderResultsTable();
                renderPendingList();
                updateStatistics();
                updateTabCounts();

                const stName = student.nameEn || student.name || '';
                showToast(`শিক্ষার্থী ${stName ? `"${stName}" ` : ''}(রেজিঃ ${toEnglishDigits(student.id)})-এর MCQ নম্বর (${toBengaliNumber(student.correct)}/৩০) সফলভাবে যুক্ত করা হয়েছে!`, 'success', 'fa-circle-check');

                // If all pending items are resolved, celebration & return to results sheet
                if (state.pendingUnmatchedList.length === 0) {
                    setTimeout(() => {
                        switchResultsTab('main');
                        try {
                            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                        } catch (e) { }
                        showToast('সকল পেন্ডিং ওএমআর শিট সফলভাবে সংশোধন সম্পন্ন হয়েছে!', 'success', 'fa-circle-check');
                    }, 500);
                }
            };

            // Discard / Remove a pending item
            window.discardPendingOmr = function (uid) {
                if (confirm('আপনি কি নিশ্চিতভাবে এই ওএমআর কপিটি পেন্ডিং তালিকা থেকে বাদ দিতে চান?')) {
                    state.pendingUnmatchedList = (state.pendingUnmatchedList || []).filter(p => p.uid !== uid);
                    renderPendingList();
                    updateTabCounts();
                    showToast('পেন্ডিং তালিকা থেকে ওএমআর কপি বাদ দেওয়া হয়েছে', 'info');
                }
            };

            // Lightbox viewer for pending OMR sheet image
            window.openPendingOmrLightbox = function (imgSrc, title) {
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

            window.closePendingOmrLightbox = function () {
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

                const scannedBatch = [];

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
                    let answers = detectedAnswers || {};
                    const scoreInfo = calculateStudentScore(answers, set);
                    const percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
                    const isPassed = scoreInfo.correct >= 10;
                    const fileUrl = URL.createObjectURL(file);

                    const rawDetectedId = toEnglishDigits(detectedId || '').trim();
                    const isValidDetectedId = rawDetectedId && !/^0+$/.test(rawDetectedId);

                    const fnMatchLong = file.name.match(/\b(\d{4,8})\b/);
                    const fnCandidateReg = fnMatchLong ? fnMatchLong[1] : null;

                    const fnMatchRoll = file.name.match(/\b(\d{1,3})\b/);
                    const fnCandidateRoll = fnMatchRoll ? fnMatchRoll[1] : null;

                    const candidateReg = isValidDetectedId ? rawDetectedId : (fnCandidateReg || '');
                    const candidateRoll = detectedRoll || fnCandidateRoll || '';

                    scannedBatch.push({
                        file: file,
                        fileName: file.name,
                        fileUrl: fileUrl,
                        detectedAnswers: detectedAnswers,
                        answers: answers,
                        detectedSet: detectedSet,
                        set: set,
                        detectedRoll: detectedRoll,
                        detectedId: detectedId,
                        detectedClass: detectedClass,
                        detectedSection: detectedSection,
                        scoreInfo: scoreInfo,
                        percentage: percentage,
                        isPassed: isPassed,
                        rawDetectedId: rawDetectedId,
                        isValidDetectedId: isValidDetectedId,
                        fnCandidateReg: fnCandidateReg,
                        candidateReg: candidateReg,
                        candidateRoll: candidateRoll
                    });
                }

                // 2. Frequency Analysis for Duplicate Registration Number Detection
                const regFrequency = {};
                scannedBatch.forEach(item => {
                    const r = toEnglishDigits(item.candidateReg || '').trim();
                    if (r && !/^0+$/.test(r)) {
                        regFrequency[r] = (regFrequency[r] || 0) + 1;
                    }
                });

                // Also check if existing evaluated students already possess this registration
                if (hasImportedStudents) {
                    state.students.forEach(st => {
                        if (st.status !== 'পেন্ডিং' && st.isRealScanned) {
                            const r = toEnglishDigits(st.id || st.regNo || '').trim();
                            if (r && !/^0+$/.test(r)) {
                                const inBatch = scannedBatch.some(it => it.fileName === st.fileName);
                                if (!inBatch && regFrequency[r]) {
                                    regFrequency[r] = (regFrequency[r] || 0) + 1;
                                }
                            }
                        }
                    });
                }

                // 3. Routing & Evaluation Phase
                for (let i = 0; i < scannedBatch.length; i++) {
                    const item = scannedBatch[i];
                    const rawReg = toEnglishDigits(item.candidateReg || '').trim();
                    const isDupReg = (rawReg && !/^0+$/.test(rawReg) && regFrequency[rawReg] > 1);

                    if (isDupReg) {
                        // একাধিক শিক্ষার্থী একই রেজিঃ নং ভুলবশত ব্যবহার করেছে -> ফলাফল Pending List এ যুক্ত হবে এবং "ডুপ্লিকেট রেজিঃ" দেখাবে
                        state.pendingUnmatchedList.push({
                            uid: 'pending_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
                            file: item.file,
                            fileName: item.fileName,
                            imagePreviewUrl: item.fileUrl,
                            detectedId: rawReg,
                            duplicateRegId: rawReg,
                            isDuplicateReg: true,
                            detectedRoll: item.detectedRoll || item.candidateRoll || '',
                            detectedClass: item.detectedClass || '',
                            detectedSection: item.detectedSection || '',
                            detectedSet: item.set,
                            answers: item.answers,
                            scoreInfo: item.scoreInfo,
                            percentage: item.percentage,
                            status: item.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
                            reason: `⚠️ ডুপ্লিকেট রেজিঃ নং (${toBengaliNumber(rawReg)}) — একাধিক ওএমআর শিটে একই রেজিঃ বাবল পূরণ করা হয়েছে!`
                        });
                        newlyPendingCount++;

                        // Reset any imported student who has this duplicate registration number back to pending
                        if (hasImportedStudents) {
                            const dupStudent = state.students.find(s => isRegNoMatch(s.id, rawReg) || isRegNoMatch(s.regNo, rawReg));
                            if (dupStudent) {
                                dupStudent.correct = 0;
                                dupStudent.wrong = 0;
                                dupStudent.blank = 30;
                                dupStudent.percentage = '0.0';
                                dupStudent.status = 'পেন্ডিং';
                                dupStudent.answers = {};
                                dupStudent.fileName = '';
                                dupStudent.file = null;
                                dupStudent.imagePreviewUrl = '';
                                dupStudent.isRealScanned = false;
                            }
                        }
                    } else if (hasImportedStudents) {
                        let matchedStudent = null;

                        // 1. Primary: Match strictly by detected Registration Number
                        if (item.isValidDetectedId) {
                            matchedStudent = state.students.find(s => isRegNoMatch(s.id, item.rawDetectedId) || isRegNoMatch(s.regNo, item.rawDetectedId));
                        }

                        // 2. Secondary: If detectedId was missing, check filename registration number (strictly 4-8 digits)
                        if (!matchedStudent && item.fnCandidateReg) {
                            matchedStudent = state.students.find(s => isRegNoMatch(s.id, item.fnCandidateReg) || isRegNoMatch(s.regNo, item.fnCandidateReg));
                        }

                        if (matchedStudent) {
                            matchedStudent.correct = item.scoreInfo.correct;
                            matchedStudent.wrong = item.scoreInfo.wrong;
                            matchedStudent.blank = item.scoreInfo.blank;
                            matchedStudent.percentage = item.percentage;
                            matchedStudent.status = item.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
                            matchedStudent.set = item.set;
                            matchedStudent.answers = item.answers;
                            matchedStudent.fileName = item.fileName;
                            matchedStudent.file = item.file;
                            matchedStudent.imagePreviewUrl = item.fileUrl;
                            matchedStudent.isRealScanned = !!item.detectedAnswers && Object.keys(item.detectedAnswers).length > 0;
                            matchedStudent.evaluatedAt = new Date().toISOString();
                            newlyMatchedCount++;
                        } else {
                            // Push to Pending List
                            const reason = !item.isValidDetectedId
                                ? 'ওএমআর শিটে রেজিঃ নং বাবল সনাক্ত হয়নি / অস্পষ্ট'
                                : `সনাক্তকৃত রেজিঃ (${toBengaliNumber(item.rawDetectedId)}) পরীক্ষার শিক্ষার্থী তালিকায় নেই`;

                            state.pendingUnmatchedList.push({
                                uid: 'pending_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
                                file: item.file,
                                fileName: item.fileName,
                                imagePreviewUrl: item.fileUrl,
                                detectedId: item.isValidDetectedId ? item.rawDetectedId : (item.fnCandidateReg || ''),
                                duplicateRegId: '',
                                isDuplicateReg: false,
                                detectedRoll: item.detectedRoll || item.candidateRoll || '',
                                detectedClass: item.detectedClass || '',
                                detectedSection: item.detectedSection || '',
                                detectedSet: item.set,
                                answers: item.answers,
                                scoreInfo: item.scoreInfo,
                                percentage: item.percentage,
                                status: item.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
                                reason: reason
                            });
                            newlyPendingCount++;
                        }
                    } else {
                        // Fallback if no imported exam was loaded
                        const roll = (item.detectedRoll || item.candidateRoll || String(i + 1)).padStart(3, '0');
                        const studentId = item.isValidDetectedId ? item.rawDetectedId : (item.fnCandidateReg || ('1024' + roll));
                        const studentClass = item.detectedClass ? String(parseInt(item.detectedClass, 10)) : "10";
                        const section = item.detectedSection || sections[i % sections.length];

                        const lookupMaps = getStudentsLookupMaps();
                        const sNameEn = lookupMaps.byReg.get(studentId) || lookupMaps.byRollClass.get(`${mapClassToNumber(studentClass)}_${toEnglishDigits(roll)}`) || '';

                        state.students.push({
                            id: studentId,
                            name: sNameEn,
                            nameEn: sNameEn,
                            roll: roll,
                            class: studentClass,
                            section: section,
                            set: item.set,
                            answers: item.answers,
                            correct: item.scoreInfo.correct,
                            wrong: item.scoreInfo.wrong,
                            blank: item.scoreInfo.blank,
                            total: 30,
                            percentage: item.percentage,
                            status: item.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
                            fileName: item.fileName,
                            file: item.file,
                            imagePreviewUrl: item.fileUrl,
                            isRealScanned: !!item.detectedAnswers
                        });
                        newlyMatchedCount++;
                    }
                }

                progressWrapper.style.display = 'none';
                btnStartEvaluation.disabled = false;
                btnExportExcel.disabled = false;
                btnPrintTable.disabled = false;

                // Ensure state.students is sorted sequentially by Registration Number
                sortStudentsByRegNo(state.students);

                renderResultsTable();
                renderPendingList();
                updateStatistics();
                updateTabCounts();

                if (newlyPendingCount > 0) {
                    switchResultsTab('pending');
                    showToast(`${toBengaliNumber(newlyMatchedCount)} জন শিক্ষার্থীর MCQ নম্বর যুক্ত হয়েছে। ${toBengaliNumber(newlyPendingCount)} টি ওএমআর শিটের রেজিঃ নং অমিল হওয়ায় পেন্ডিং তালিকায় উন্মুক্ত করা হয়েছে। অনুগ্রহ করে সংশোধন করুন।`, 'warning', 'fa-triangle-exclamation');
                } else {
                    switchResultsTab('main');
                    showToast(`সকল (${toBengaliNumber(newlyMatchedCount)}) ওএমআর শিটের রেজিঃ নং মিলেছে এবং MCQ নম্বর সফলভাবে যুক্ত হয়েছে!`, 'success', 'fa-circle-check');
                    try {
                        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                    } catch (e) { }
                }
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
                const sets = ['ক', 'খ', 'গ', 'ঘ'];
                const sections = ['ক', 'খ', 'গ', 'ঘ'];
                const classes = ['10', '9', '8'];

                for (let i = 1; i <= count; i++) {
                    const studentId = String(2024000 + i);
                    const roll = String(i).padStart(3, '0');
                    const set = sets[(i - 1) % sets.length];
                    const section = sections[(i - 1) % sections.length];
                    const studentClass = classes[(i - 1) % classes.length];

                    const targetKey = getActiveAnswerKey(set);
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
                    const hasAnswers = student.answers && Object.keys(student.answers).some(k => student.answers[k]);
                    if (!hasAnswers && student.status === 'পেন্ডিং') {
                        return;
                    }
                    const scoreInfo = calculateStudentScore(student.answers, student.set || 'ক');
                    student.correct = scoreInfo.correct;
                    student.wrong = scoreInfo.wrong;
                    student.blank = scoreInfo.blank;
                    student.percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
                    student.status = student.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
                });
            }

            // 4. Render Table with Search and Filters
            function renderResultsTable() {
                if (typeof updateTabCounts === 'function') updateTabCounts();
                const searchQuery = inputSearch.value.trim().toLowerCase();
                const selectedClass = filterClass.value;
                const selectedSection = filterSection.value;
                const selectedSet = filterSet.value;
                const selectedStatus = filterStatus.value;

                const lookupMaps = getStudentsLookupMaps();

                const filtered = state.students.filter(s => {
                    const rawId = toEnglishDigits(s.id || '').trim();
                    const rawRoll = toEnglishDigits(s.roll || '').trim();
                    const rawCls = mapClassToNumber(s.class);
                    const sNameEn = (s.nameEn || s.name || lookupMaps.byReg.get(rawId) || lookupMaps.byRollClass.get(`${rawCls}_${rawRoll}`) || lookupMaps.byRollClass.get(`_${rawRoll}`) || '').toLowerCase();

                    const matchesSearch = !searchQuery ||
                        s.id.toLowerCase().includes(searchQuery) ||
                        s.roll.toLowerCase().includes(searchQuery) ||
                        toBengaliNumber(s.roll).includes(searchQuery) ||
                        toBengaliNumber(s.id).includes(searchQuery) ||
                        sNameEn.includes(searchQuery);

                    const matchesClass = selectedClass === 'ALL' || s.class === selectedClass;
                    const matchesSection = selectedSection === 'ALL' || s.section === selectedSection;
                    const matchesSet = selectedSet === 'ALL' || s.set === selectedSet;
                    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

                    return matchesSearch && matchesClass && matchesSection && matchesSet && matchesStatus;
                });

                // Maintain strict sequential ordering by Registration Number
                sortStudentsByRegNo(filtered);

                textShowingCount.textContent = toBengaliNumber(filtered.length);

                if (filtered.length === 0) {
                    tableResultsBody.innerHTML = `
          <tr>
            <td colspan="10">
              <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>কোনো ফলাফল পাওয়া যায়নি</h3>
                <p>অন্য কোনো রেজিঃ নং বা ফিল্টার প্রয়োগ করে পুনরায় চেষ্টা করুন।</p>
              </div>
            </td>
          </tr>
        `;
                    return;
                }

                tableResultsBody.innerHTML = filtered.map((student, idx) => {
                    const originalIndex = state.students.indexOf(student);
                    const isPending = student.status === 'পেন্ডিং';
                    const statusBadgeClass = isPending ? 'status-pending' : (student.status === 'উত্তীর্ণ' ? 'status-pass' : 'status-fail');
                    const statusIcon = isPending ? 'fa-clock' : (student.status === 'উত্তীর্ণ' ? 'fa-check' : 'fa-xmark');

                    const hasOmr = !isPending && Boolean(
                        student.isRealScanned ||
                        student.imagePreviewUrl ||
                        student.file ||
                        (student.fileName && String(student.fileName).trim() !== '') ||
                        (student.answers && Object.keys(student.answers).length > 0)
                    );

                    const rawId = toEnglishDigits(student.id || '').trim();
                    const rawRoll = toEnglishDigits(student.roll || '').trim();
                    const rawCls = mapClassToNumber(student.class);

                    const studentNameEn = student.nameEn ||
                        student.name ||
                        lookupMaps.byReg.get(rawId) ||
                        lookupMaps.byRollClass.get(`${rawCls}_${rawRoll}`) ||
                        lookupMaps.byRollClass.get(`_${rawRoll}`) ||
                        '';

                    return `
          <tr>
            <td style="font-family: 'Inter', monospace; color: var(--text-muted); font-size: 0.85rem;">
              ${toBengaliNumber(idx + 1)}
            </td>
            <td>
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 3px;">
                <span class="student-badge-id">${toEnglishDigits(student.id || student.regNo)}</span>
                ${studentNameEn ? `<span class="student-name-en" style="font-size: 0.82rem; font-weight: 600; color: #4338ca; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.1px; line-height: 1.25;" title="শিক্ষার্থীর নাম: ${studentNameEn}"><i class="fa-regular fa-user" style="font-size: 0.72rem; color: #6366f1; margin-right: 4px;"></i>${studentNameEn}</span>` : ''}
              </div>
            </td>
            <td class="roll-cell">
              ${toBengaliNumber(student.roll)}
            </td>
            <td>
              <strong>${formatClassBangla(student.class)}</strong>
            </td>
            <td>
              <span style="font-weight: 600; color: var(--text-main);">${student.section}</span>
            </td>
            <td>
              ${(hasOmr && student.set) ? `
                <span class="set-tag">${student.set}</span>
              ` : (student.set ? `
                <span class="set-tag">${student.set}</span>
              ` : `
                <span style="color: var(--text-muted); font-size: 0.95rem; font-weight: 600; display: inline-block; padding: 2px 6px;" title="ওএমআর মূল্যায়ন হলে সেট প্রদর্শিত হবে">—</span>
              `)}
            </td>
            <td>
              <div class="score-badge">
                <span style="color: ${isPending ? 'var(--text-muted)' : (student.correct >= 15 ? '#10b981' : '#ef4444')}; font-size: 1.1rem;">
                  ${isPending ? '০' : toBengaliNumber(student.correct)}
                </span>
                <span class="score-total">/ ৩০</span>
              </div>
            </td>
            <td>
              <strong>${isPending ? '০%' : `${toBengaliNumber(student.percentage)}%`}</strong>
            </td>
            <td>
              <span class="status-badge ${statusBadgeClass}">
                <i class="fa-solid ${statusIcon}"></i> ${student.status}
              </span>
            </td>
            <td style="text-align: right;">
              ${hasOmr ? `
                <div class="action-btn-group" style="justify-content: flex-end;">
                  <button class="btn btn-sm btn-primary" onclick="openViewEditModal(${originalIndex}, 'split')" title="স্প্লিট ভিউতে ওএমআর ও উত্তরমালা পাশাপাশি দেখুন">
                    <i class="fa-solid fa-table-columns"></i> স্প্লিট ভিউ
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="openViewEditModal(${originalIndex}, 'standard')" title="সাধারণ ভিউতে তথ্য পর্যালোচনা ও সংশোধন">
                    <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> সংশোধন
                  </button>
                  <button class="icon-btn" style="width: 32px; height: 32px;" onclick="deleteStudent(${originalIndex})" title="মুছে ফেলুন">
                    <i class="fa-solid fa-trash-can" style="color: var(--danger); font-size: 0.85rem;"></i>
                  </button>
                </div>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; color: #94a3b8; padding: 4px 10px; border-radius: 6px; background: #f8fafc; border: 1px dashed #cbd5e1;" title="এই শিক্ষার্থীর কোনো ওএমআর শিট মূল্যায়ন করা হয়নি">
                  <i class="fa-regular fa-file"></i> ওএমআর নেই
                </span>
              `}
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

                const pending = state.students.filter(s => s.status === 'পেন্ডিং').length;
                const passed = state.students.filter(s => s.status === 'উত্তীর্ণ').length;
                const evaluated = total - pending;

                const totalCorrect = state.students.reduce((acc, cur) => acc + (cur.status === 'পেন্ডিং' ? 0 : (cur.correct || 0)), 0);
                const avgCorrect = evaluated > 0 ? (totalCorrect / evaluated).toFixed(1) : '০.০';
                const evaluatedStudents = state.students.filter(s => s.status !== 'পেন্ডিং');
                const highestScore = evaluatedStudents.length > 0 ? Math.max(...evaluatedStudents.map(s => s.correct || 0)) : 0;
                const passRate = evaluated > 0 ? ((passed / evaluated) * 100).toFixed(1) : '০';

                document.getElementById('statTotalStudents').textContent = toBengaliNumber(total);
                document.getElementById('statPassedStudents').textContent = toBengaliNumber(passed);
                document.getElementById('statAverageScore').textContent = toBengaliNumber(avgCorrect);
                document.getElementById('statHighestScore').textContent = toBengaliNumber(highestScore);
                document.getElementById('statPassRate').textContent = `${toBengaliNumber(passRate)}%`;
            }

            // Delete a student from the table
            window.deleteStudent = function (index) {
                if (confirm('আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর ওএমআর তথ্য মুছে ফেলতে চান?')) {
                    state.students.splice(index, 1);
                    renderResultsTable();
                    updateStatistics();
                    showToast('শিক্ষার্থীর তথ্য সফলভাবে মুছে ফেলা হয়েছে', 'info');
                }
            };

            // 6. View & Edit Modal Functionality (with Split View Support)
            window.openViewEditModal = function (index, defaultTab = 'split') {
                if (index < 0 || index >= state.students.length) return;
                state.currentEditIndex = index;
                const student = state.students[index];

                // Clone student for isolated editing
                state.tempEditStudent = JSON.parse(JSON.stringify(student));
                if (student.imagePreviewUrl) {
                    state.tempEditStudent.imagePreviewUrl = student.imagePreviewUrl;
                }
                if (student.file) {
                    state.tempEditStudent.file = student.file;
                }

                // Ensure answers is cleanly indexed 1..30 with normalized options
                const normalizedAnswers = {};
                const hasRealAnswers = student.answers && typeof student.answers === 'object' && Object.keys(student.answers).length > 0;
                const isStudentPendingNoOmr = (student.status === 'পেন্ডিং' && !student.isRealScanned) || !hasRealAnswers;

                for (let q = 1; q <= 30; q++) {
                    normalizedAnswers[q] = isStudentPendingNoOmr ? null : getStudentAnswer(student, q);
                }
                state.tempEditStudent.answers = normalizedAnswers;
                state.tempEditStudent.set = normalizeSet(student.set);

                // Populate Standard form inputs
                if (editStudentId) editStudentId.value = toEnglishDigits(student.id || '');
                if (editRoll) editRoll.value = student.roll || '';
                if (editClass) editClass.value = student.class || '10';
                if (editSection) editSection.value = student.section || 'ক';
                if (editSet) editSet.value = state.tempEditStudent.set;

                // Populate Split panel inputs
                const splitId = document.getElementById('splitEditStudentId');
                const splitRoll = document.getElementById('splitEditRoll');
                const splitClass = document.getElementById('splitEditClass');
                const splitSection = document.getElementById('splitEditSection');
                const splitSet = document.getElementById('splitEditSet');
                if (splitId) splitId.value = toEnglishDigits(student.id || '');
                if (splitRoll) splitRoll.value = student.roll || '';
                if (splitClass) splitClass.value = student.class || '10';
                if (splitSection) splitSection.value = student.section || 'ক';
                if (splitSet) splitSet.value = state.tempEditStudent.set;

                // Update header info text
                const headerInfo = document.getElementById('textStudentModalHeaderInfo');
                if (headerInfo) {
                    const studentNameEn = student.nameEn || student.name || getStudentEnglishNameById(student.id, student.roll, student.class);
                    const namePart = studentNameEn ? ` | নাম: <strong style="color: #4f46e5;">${studentNameEn}</strong>` : '';
                    const fileLabel = (student.fileName && student.fileName.trim()) ? student.fileName : '<span style="color: #ef4444;"><i class="fa-solid fa-file-circle-xmark"></i> স্ক্যান অনুপস্থিত</span>';
                    headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(student.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(student.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${student.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileLabel}</span>`;
                }

                // Update student counter & navigation buttons
                updateStudentNavButtons();

                // Update score display in both views
                updateModalScorePreview();

                // Render bubbles for both views
                renderModalOmrBubbles();
                renderSplitModalOmrBubbles();

                // Reset and render student scanned image
                state.studentScanZoom = 1.0;
                renderStudentScanImage();

                // Switch to requested tab
                switchStudentModalTab(defaultTab);

                // Open Modal
                if (modalViewEdit) {
                    modalViewEdit.style.display = 'flex';
                    modalViewEdit.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                // Auto re-scan from image if student has a file/image and is not yet real-scanned
                if (!student.isRealScanned && (state.tempEditStudent.file || state.tempEditStudent.imagePreviewUrl)) {
                    setTimeout(() => {
                        if (state.currentEditIndex === index) {
                            rescanCurrentStudentOmr();
                        }
                    }, 120);
                }
            };

            function updateStudentNavButtons() {
                const counter = document.getElementById('textStudentCounter');
                const btnPrev = document.getElementById('btnPrevStudent');
                const btnNext = document.getElementById('btnNextStudent');
                const total = state.students.length;
                const curr = state.currentEditIndex;

                if (counter) {
                    counter.textContent = `${toBengaliNumber(curr + 1)} / ${toBengaliNumber(total)}`;
                }
                if (btnPrev) {
                    btnPrev.disabled = (curr <= 0);
                }
                if (btnNext) {
                    btnNext.disabled = (curr >= total - 1);
                }
            }

            window.switchStudentModalTab = function (tabName) {
                state.activeStudentModalTab = tabName;
                const btnStandard = document.getElementById('tabBtnStudentStandard');
                const btnSplit = document.getElementById('tabBtnStudentSplit');
                const standardContent = document.getElementById('studentStandardContent');
                const splitContent = document.getElementById('studentSplitContent');
                const modalCard = modalViewEdit ? modalViewEdit.querySelector('.modal-card') : null;
                const badge = document.getElementById('studentModalActiveBadge');

                if (tabName === 'split') {
                    if (btnSplit) btnSplit.classList.add('active');
                    if (btnStandard) btnStandard.classList.remove('active');
                    if (standardContent) standardContent.style.display = 'none';
                    if (splitContent) splitContent.style.display = 'flex';
                    if (modalCard) modalCard.classList.add('split-active');
                    if (badge) {
                        badge.innerHTML = '<i class="fa-solid fa-table-columns"></i> স্প্লিট ভিউ মোড';
                        badge.className = 'badge-pill badge-primary';
                    }
                } else {
                    if (btnStandard) btnStandard.classList.add('active');
                    if (btnSplit) btnSplit.classList.remove('active');
                    if (standardContent) standardContent.style.display = 'block';
                    if (splitContent) splitContent.style.display = 'none';
                    if (modalCard) modalCard.classList.remove('split-active');
                    if (badge) {
                        badge.innerHTML = '<i class="fa-solid fa-table-list"></i> সাধারণ ভিউ';
                        badge.className = 'badge-pill badge-outline';
                    }
                }
            };

            window.syncStudentInput = function (field, value) {
                if (!state.tempEditStudent) return;
                state.tempEditStudent[field] = value;

                // Sync counterpart inputs
                if (field === 'id') {
                    const engVal = toEnglishDigits(value).trim();
                    state.tempEditStudent.id = engVal;
                    state.tempEditStudent.regNo = engVal;
                    if (editStudentId && editStudentId.value !== engVal) editStudentId.value = engVal;
                    const splitId = document.getElementById('splitEditStudentId');
                    if (splitId && splitId.value !== engVal) splitId.value = engVal;
                } else if (field === 'roll') {
                    if (editRoll && editRoll.value !== value) editRoll.value = value;
                    const splitRoll = document.getElementById('splitEditRoll');
                    if (splitRoll && splitRoll.value !== value) splitRoll.value = value;
                } else if (field === 'class') {
                    if (editClass && editClass.value !== value) editClass.value = value;
                    const splitClass = document.getElementById('splitEditClass');
                    if (splitClass && splitClass.value !== value) splitClass.value = value;
                } else if (field === 'section') {
                    if (editSection && editSection.value !== value) editSection.value = value;
                    const splitSec = document.getElementById('splitEditSection');
                    if (splitSec && splitSec.value !== value) splitSec.value = value;
                } else if (field === 'set') {
                    const normSet = normalizeSet(value);
                    state.tempEditStudent.set = normSet;
                    if (editSet && editSet.value !== normSet) editSet.value = normSet;
                    const splitSet = document.getElementById('splitEditSet');
                    if (splitSet && splitSet.value !== normSet) splitSet.value = normSet;

                    // Live re-evaluate score and bubbles against newly selected set
                    updateModalScorePreview();
                    renderModalOmrBubbles();
                    renderSplitModalOmrBubbles();
                }

                // Update header info text
                const headerInfo = document.getElementById('textStudentModalHeaderInfo');
                if (headerInfo && state.tempEditStudent) {
                    const studentNameEn = state.tempEditStudent.nameEn || state.tempEditStudent.name || getStudentEnglishNameById(state.tempEditStudent.id, state.tempEditStudent.roll, state.tempEditStudent.class);
                    const namePart = studentNameEn ? ` | নাম: <strong style="color: #4f46e5;">${studentNameEn}</strong>` : '';
                    headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${state.tempEditStudent.fileName || 'ওএমআর কপি'}</span>`;
                }
            };

            // Synchronize inputs from standard view form
            if (editStudentId) editStudentId.addEventListener('input', e => syncStudentInput('id', e.target.value));
            if (editRoll) editRoll.addEventListener('input', e => syncStudentInput('roll', e.target.value));
            if (editClass) editClass.addEventListener('change', e => syncStudentInput('class', e.target.value));
            if (editSection) editSection.addEventListener('change', e => syncStudentInput('section', e.target.value));
            if (editSet) editSet.addEventListener('change', e => syncStudentInput('set', e.target.value));

            function updateModalScorePreview() {
                if (!state.tempEditStudent) return;
                const score = calculateStudentScore(state.tempEditStudent.answers, state.tempEditStudent.set);

                // Update Standard view score
                if (editCurrentScoreDisplay) {
                    const dupText = score.duplicate > 0 ? `, ডুপ্লিকেট: ${toBengaliNumber(score.duplicate)}` : '';
                    editCurrentScoreDisplay.innerHTML = `
          <span style="color: #16a34a;">${toBengaliNumber(score.correct)}</span> 
          <span style="color: var(--text-muted); font-size: 0.95rem;">/ ৩০ (ভুল: ${toBengaliNumber(score.wrong)}${dupText}, ফাঁকা: ${toBengaliNumber(score.blank)})</span>
        `;
                }

                // Update Split view score badge
                const splitBadge = document.getElementById('splitScoreBadgeDisplay');
                if (splitBadge) {
                    const dupBadgeHtml = score.duplicate > 0 ? `
          <span style="background: #fef2f2; color: #b91c1c; padding: 2px 7px; border-radius: 6px; border: 1.5px solid #f87171; margin-right: 4px;" title="একাধিক বাবল ভরাটকৃত প্রশ্ন (কোনো মার্ক যুক্ত হবে না)">
            <i class="fa-solid fa-clone"></i> ডুপ্লিকেট: <strong>${toBengaliNumber(score.duplicate)}</strong>
          </span>` : '';

                    splitBadge.innerHTML = `
          <span style="background: #ecfdf5; color: #15803d; padding: 2px 7px; border-radius: 6px; border: 1px solid #a7f3d0; margin-right: 4px;" title="সঠিক উত্তর (সবুজ)">
            <i class="fa-solid fa-check"></i> <strong>${toBengaliNumber(score.correct)}</strong>
          </span>
          <span style="background: #fef2f2; color: #b91c1c; padding: 2px 7px; border-radius: 6px; border: 1px solid #fecaca; margin-right: 4px;" title="ভুল উত্তর (লাল)">
            <i class="fa-solid fa-xmark"></i> <strong>${toBengaliNumber(score.wrong)}</strong>
          </span>
          ${dupBadgeHtml}
          <span style="background: #f8fafc; color: #64748b; padding: 2px 7px; border-radius: 6px; border: 1px solid #e2e8f0;" title="অনুত্তরিত">
            <i class="fa-solid fa-circle-dot"></i> ফাঁকা: <strong>${toBengaliNumber(score.blank)}</strong>
          </span>
        `;
                }
            }

            function renderModalOmrBubbles() {
                if (!state.tempEditStudent) return;
                const targetKey = getActiveAnswerKey(state.tempEditStudent.set);

                let colsHtml = ['', '', ''];

                for (let q = 1; q <= 30; q++) {
                    const colIdx = q <= 10 ? 0 : (q <= 20 ? 1 : 2);
                    const studentAns = getStudentAnswer(state.tempEditStudent, q);
                    const selectedOpts = getStudentAnswerOptions(state.tempEditStudent, q);
                    const isDup = isDuplicateOption(studentAns);
                    const correctAns = normalizeSingleOption(targetKey ? targetKey[q - 1] : null);

                    let bubblesHtml = optionsBengali.map(opt => {
                        let extraClass = '';
                        let titleText = `প্রশ্ন ${toBengaliNumber(q)}: অপশন ${opt}`;

                        const isSelectedByStudent = selectedOpts.includes(opt);

                        if (isSelectedByStudent) {
                            if (isDup) {
                                // একাধিক বাবল ভরাট (ডুপ্লিকেট) -> লাল রঙে চিহ্নিত এবং কোনো মার্ক পাবে না
                                extraClass = 'filled-wrong filled-duplicate';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - ডুপ্লিকেট বাবল ✗, কোনো মার্ক যুক্ত হবে না)';
                            } else if (correctAns && opt === correctAns) {
                                extraClass = 'filled-correct';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - সঠিক উত্তর ✓)';
                            } else {
                                extraClass = 'filled-wrong';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - ভুল উত্তর ✗)';
                            }
                        } else if (correctAns && opt === correctAns) {
                            // আসল উত্তর নির্দেশক
                            extraClass = 'filled-key-answer';
                            titleText += ' (উত্তরপত্রের সঠিক উত্তর)';
                        }

                        return `
            <span class="interactive-bubble ${extraClass}" 
                  onclick="toggleStudentAnswer(${q}, '${opt}')" 
                  title="${titleText}">
              ${opt}
            </span>
          `;
                    }).join('');

                    const dupTagHtml = isDup ? `<span style="font-size: 0.65rem; color: #b91c1c; background: #fee2e2; border: 1px solid #fca5a5; padding: 0 4px; border-radius: 4px; font-weight: 700; margin-left: 2px;" title="একাধিক বাবল ভরাট (ডুপ্লিকেট - ০ মার্ক)">ডুপ্লিকেট</span>` : '';

                    colsHtml[colIdx] += `
          <div class="omr-q-row">
            <span class="q-number-label">${toBengaliNumber(q)}.${dupTagHtml}</span>
            <div class="bubbles-interactive-group">
              ${bubblesHtml}
            </div>
          </div>
        `;
                }

                if (modalOmrGrid) {
                    modalOmrGrid.innerHTML = colsHtml.map((colContent, idx) => `
          <div class="omr-column">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--omr-pink); text-align: center; margin-bottom: 6px; border-bottom: 1px dashed #fbcfe8; padding-bottom: 3px;">
              প্রশ্ন ${toBengaliNumber(idx * 10 + 1)} হতে ${toBengaliNumber((idx + 1) * 10)}
            </div>
            ${colContent}
          </div>
        `).join('');
                }
            }

            function renderSplitModalOmrBubbles() {
                if (!state.tempEditStudent) return;
                const targetKey = getActiveAnswerKey(state.tempEditStudent.set);
                const splitGrid = document.getElementById('splitModalOmrGrid');
                if (!splitGrid) return;

                let colsHtml = ['', '', ''];

                for (let q = 1; q <= 30; q++) {
                    const colIdx = q <= 10 ? 0 : (q <= 20 ? 1 : 2);
                    const studentAns = getStudentAnswer(state.tempEditStudent, q);
                    const selectedOpts = getStudentAnswerOptions(state.tempEditStudent, q);
                    const isDup = isDuplicateOption(studentAns);
                    const correctAns = normalizeSingleOption(targetKey ? targetKey[q - 1] : null);

                    let bubblesHtml = optionsBengali.map(opt => {
                        let extraClass = '';
                        let titleText = `প্রশ্ন ${toBengaliNumber(q)}: অপশন ${opt}`;

                        const isSelectedByStudent = selectedOpts.includes(opt);

                        if (isSelectedByStudent) {
                            if (isDup) {
                                extraClass = 'filled-wrong filled-duplicate';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - ডুপ্লিকেট বাবল ✗, কোনো মার্ক যুক্ত হবে না)';
                            } else if (correctAns && opt === correctAns) {
                                extraClass = 'filled-correct';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - সঠিক উত্তর ✓)';
                            } else {
                                extraClass = 'filled-wrong';
                                titleText += ' (শিক্ষার্থীর ভরাটকৃত - ভুল উত্তর ✗)';
                            }
                        } else if (correctAns && opt === correctAns) {
                            extraClass = 'filled-key-answer';
                            titleText += ' (উত্তরপত্রের সঠিক উত্তর)';
                        }

                        return `
            <span class="interactive-bubble ${extraClass}" 
                  onclick="toggleStudentAnswer(${q}, '${opt}')" 
                  title="${titleText}">
              ${opt}
            </span>
          `;
                    }).join('');

                    const dupTagHtml = isDup ? `<span style="font-size: 0.62rem; color: #b91c1c; background: #fee2e2; border: 1px solid #fca5a5; padding: 0 3px; border-radius: 3px; font-weight: 700; margin-left: 2px;" title="একাধিক বাবল ভরাট (ডুপ্লিকেট - ০ মার্ক)">ডুপ্লিকেট</span>` : '';

                    colsHtml[colIdx] += `
          <div class="omr-q-row" style="padding: 2px 0;">
            <span class="q-number-label" style="min-width: 22px; font-size: 0.8rem;">${toBengaliNumber(q)}.${dupTagHtml}</span>
            <div class="bubbles-interactive-group">
              ${bubblesHtml}
            </div>
          </div>
        `;
                }

                splitGrid.innerHTML = colsHtml.map((colContent, idx) => `
        <div class="omr-column" style="padding: 6px; border-radius: 4px; background: #ffffff;">
          <div style="font-size: 0.76rem; font-weight: 700; color: var(--omr-pink); text-align: center; margin-bottom: 4px; border-bottom: 1px dashed #fbcfe8; padding-bottom: 2px;">
            ${toBengaliNumber(idx * 10 + 1)} - ${toBengaliNumber((idx + 1) * 10)}
          </div>
          ${colContent}
        </div>
      `).join('');
            }

            window.toggleStudentAnswer = function (questionNumber, selectedOption) {
                if (!state.tempEditStudent) return;
                if (!state.tempEditStudent.answers) state.tempEditStudent.answers = {};

                const normOpt = normalizeSingleOption(selectedOption);
                if (!normOpt) return;

                const currentOpts = getStudentAnswerOptions(state.tempEditStudent, questionNumber);

                if (currentOpts.includes(normOpt)) {
                    // Option was already selected -> remove it
                    const updated = currentOpts.filter(o => o !== normOpt);
                    if (updated.length === 0) {
                        state.tempEditStudent.answers[questionNumber] = null;
                    } else if (updated.length === 1) {
                        state.tempEditStudent.answers[questionNumber] = updated[0];
                    } else {
                        state.tempEditStudent.answers[questionNumber] = updated;
                    }
                } else {
                    // Option was not selected -> add it
                    const updated = [...currentOpts, normOpt].sort((a, b) => optionsBengali.indexOf(a) - optionsBengali.indexOf(b));
                    if (updated.length === 1) {
                        state.tempEditStudent.answers[questionNumber] = updated[0];
                    } else {
                        state.tempEditStudent.answers[questionNumber] = updated;
                    }
                }

                updateModalScorePreview();
                renderModalOmrBubbles();
                renderSplitModalOmrBubbles();
            };

            // Render Scanned OMR image in Split View
            function renderStudentScanImage() {
                const container = document.getElementById('studentScanImageContainer');
                const badge = document.getElementById('studentScanBadge');
                if (!container) return;

                let imageUrl = null;
                let imageName = '';

                if (state.tempEditStudent) {
                    if (state.tempEditStudent.imagePreviewUrl) {
                        imageUrl = state.tempEditStudent.imagePreviewUrl;
                        imageName = state.tempEditStudent.fileName || 'শিক্ষার্থীর ওএমআর শিট';
                    } else if (state.tempEditStudent.file) {
                        imageUrl = URL.createObjectURL(state.tempEditStudent.file);
                        state.tempEditStudent.imagePreviewUrl = imageUrl;
                        imageName = state.tempEditStudent.file.name;
                    } else if (state.studentFiles && state.studentFiles[state.currentEditIndex]) {
                        const f = state.studentFiles[state.currentEditIndex];
                        imageUrl = URL.createObjectURL(f);
                        state.tempEditStudent.imagePreviewUrl = imageUrl;
                        imageName = f.name;
                    } else if (state.studentFiles && state.studentFiles.length > 0) {
                        const match = state.studentFiles.find(f => f.name === state.tempEditStudent.fileName);
                        if (match) {
                            imageUrl = URL.createObjectURL(match);
                            state.tempEditStudent.imagePreviewUrl = imageUrl;
                            imageName = match.name;
                        }
                    } else if (state.uploadedKeyPreview && state.uploadedKeyPreview.imagePreviewUrl) {
                        imageUrl = state.uploadedKeyPreview.imagePreviewUrl;
                        imageName = 'নমুনা ওএমআর রেফারেন্স শিট';
                    }
                }

                if (imageUrl) {
                    if (badge) {
                        badge.innerHTML = `<i class="fa-solid fa-file-image"></i> ${imageName}`;
                        badge.style.display = 'inline-block';
                    }
                    container.innerHTML = `
          <div id="studentScanImageWrapper" style="display: inline-block; transition: transform 0.2s ease; transform: scale(${state.studentScanZoom || 1.0}); transform-origin: top center; max-width: 100%;">
            <img src="${imageUrl}" alt="Student OMR Scan" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: block; margin: 0 auto; user-select: none;">
          </div>
        `;
                } else {
                    if (badge) {
                        badge.innerHTML = 'স্ক্যান অনুপস্থিত';
                    }
                    container.innerHTML = `
          <div style="height: 100%; min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; padding: 2rem; text-align: center;">
            <i class="fa-solid fa-file-image" style="font-size: 3rem; margin-bottom: 12px; color: #64748b;"></i>
            <div style="font-weight: 700; color: #e2e8f0; font-size: 1rem; margin-bottom: 6px;">কোনো ওএমআর স্ক্যান ইমেজ সংযুক্ত নেই</div>
            <p style="font-size: 0.82rem; max-width: 320px; line-height: 1.5; margin-bottom: 14px; color: #94a3b8;">
              এই শিক্ষার্থীর ওএমআর স্ক্যান ইমেজ আপলোড করে সরাসরি বাবলের সাথে মিলিয়ে দেখুন।
            </p>
            <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('inputStudentSingleScan').click()">
              <i class="fa-solid fa-upload"></i> ওএমআর ছবি আপলোড করুন
            </button>
          </div>
        `;
                }
            }

            // Zoom Controls
            window.changeStudentScanZoom = function (delta) {
                state.studentScanZoom = Math.min(3.0, Math.max(0.4, (state.studentScanZoom || 1.0) + delta));
                const wrapper = document.getElementById('studentScanImageWrapper');
                if (wrapper) {
                    wrapper.style.transform = `scale(${state.studentScanZoom})`;
                }
            };

            window.resetStudentScanZoom = function () {
                state.studentScanZoom = 1.0;
                const wrapper = document.getElementById('studentScanImageWrapper');
                if (wrapper) {
                    wrapper.style.transform = 'scale(1.0)';
                }
            };

            // Single student scan upload handler
            window.handleStudentSingleScanUpload = async function (event) {
                const file = event.target.files && event.target.files[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                if (state.tempEditStudent) {
                    state.tempEditStudent.imagePreviewUrl = url;
                    state.tempEditStudent.fileName = file.name;
                    state.tempEditStudent.file = file;
                    state.tempEditStudent.isRealScanned = false;
                }
                renderStudentScanImage();
                showToast('শিক্ষার্থীর ওএমআর স্ক্যান কপি লোড হয়েছে! বাবল স্ক্যান করা হচ্ছে...', 'info', 'fa-file-image');
                await rescanCurrentStudentOmr(file);
            };

            // Re-scan & detect bubbles from current student's OMR image
            window.rescanCurrentStudentOmr = async function (explicitFile = null) {
                if (!state.tempEditStudent) return;
                let fileBlob = explicitFile || state.tempEditStudent.file;
                const imageUrl = state.tempEditStudent.imagePreviewUrl;
                const fileName = state.tempEditStudent.fileName || (fileBlob ? fileBlob.name : 'omr_sheet.jpg');

                const badge = document.getElementById('studentScanBadge');
                if (badge) {
                    badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> বাবল স্ক্যান করা হচ্ছে...';
                    badge.style.background = '#fef3c7';
                    badge.style.color = '#d97706';
                }

                showToast('ওএমআর ইমেজ থেকে বাবলগুলো স্ক্যান করা হচ্ছে...', 'info', 'fa-spinner fa-spin');

                try {
                    if (!fileBlob && imageUrl) {
                        const resp = await fetch(imageUrl);
                        fileBlob = await resp.blob();
                    }

                    if (fileBlob) {
                        const formData = new FormData();
                        formData.append('file', fileBlob, fileName);
                        const response = await fetch('/api/scan_omr', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.status === 'success' && data.sets) {
                                const detectedSet = Object.keys(data.sets)[0] || 'ক';
                                const rawAnswers = data.sets[detectedSet] || Object.values(data.sets)[0];

                                if (rawAnswers && Array.isArray(rawAnswers)) {
                                    const answersObj = {};
                                    for (let q = 1; q <= 30; q++) {
                                        answersObj[q] = normalizeOption(rawAnswers[q - 1]);
                                    }
                                    state.tempEditStudent.answers = answersObj;
                                    state.tempEditStudent.isRealScanned = true;
                                }

                                // Detect roll: prefer scanned roll from bubbles
                                if (data.roll_no && data.roll_no !== '000') {
                                    state.tempEditStudent.roll = data.roll_no;
                                } else {
                                    const matchRoll = fileName.match(/\b(\d{1,4})\b/);
                                    if (matchRoll) {
                                        state.tempEditStudent.roll = matchRoll[1].padStart(3, '0');
                                    }
                                }

                                if (data.student_id && data.student_id !== '0000000') {
                                    state.tempEditStudent.id = data.student_id;
                                } else if (state.tempEditStudent.roll) {
                                    state.tempEditStudent.id = '1024' + state.tempEditStudent.roll;
                                }

                                if (data.class_name && data.class_name !== '00') {
                                    const cNum = parseInt(data.class_name, 10);
                                    state.tempEditStudent.class = String(cNum);
                                }

                                if (data.section) {
                                    state.tempEditStudent.section = data.section;
                                }

                                if (detectedSet) {
                                    state.tempEditStudent.set = normalizeSet(detectedSet);
                                }

                                // Update input controls
                                const splitId = document.getElementById('splitEditStudentId');
                                const splitRoll = document.getElementById('splitEditRoll');
                                const splitClass = document.getElementById('splitEditClass');
                                const splitSection = document.getElementById('splitEditSection');
                                const splitSet = document.getElementById('splitEditSet');
                                if (splitId) splitId.value = state.tempEditStudent.id;
                                if (splitRoll) splitRoll.value = state.tempEditStudent.roll;
                                if (splitClass) splitClass.value = state.tempEditStudent.class;
                                if (splitSection) splitSection.value = state.tempEditStudent.section;
                                if (splitSet) splitSet.value = state.tempEditStudent.set;

                                if (editStudentId) editStudentId.value = state.tempEditStudent.id;
                                if (editRoll) editRoll.value = state.tempEditStudent.roll;
                                if (editClass) editClass.value = state.tempEditStudent.class;
                                if (editSection) editSection.value = state.tempEditStudent.section;
                                if (editSet) editSet.value = state.tempEditStudent.set;

                                // Update Header Info
                                const headerInfo = document.getElementById('textStudentModalHeaderInfo');
                                if (headerInfo) {
                                    const studentNameEn = state.tempEditStudent.nameEn || state.tempEditStudent.name || getStudentEnglishNameById(state.tempEditStudent.id, state.tempEditStudent.roll, state.tempEditStudent.class);
                                    const namePart = studentNameEn ? ` | নাম: <strong style="color: #4f46e5;">${studentNameEn}</strong>` : '';
                                    headerInfo.innerHTML = `রোল: <strong style="color: var(--primary);">${toBengaliNumber(state.tempEditStudent.roll)}</strong> | রেজিঃ নং: <strong style="color: var(--text-main); font-family: 'Inter', monospace;">${toEnglishDigits(state.tempEditStudent.id)}</strong>${namePart} | সেট: <strong style="color: var(--omr-pink);">${state.tempEditStudent.set}</strong> | ফাইল: <span style="color: var(--text-muted);">${fileName}</span>`;
                                }

                                // Re-evaluate score and re-render bubbles
                                updateModalScorePreview();
                                renderModalOmrBubbles();
                                renderSplitModalOmrBubbles();

                                if (badge) {
                                    badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${fileName}`;
                                    badge.style.background = '#ecfdf5';
                                    badge.style.color = '#059669';
                                }
                                showToast('ওএমআর ইমেজ থেকে ৩০টি বাবল শতভাগ সঠিকভাবে সনাক্ত করা হয়েছে!', 'success', 'fa-circle-check');
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.error('Re-scan error:', err);
                }

                if (badge) {
                    badge.innerHTML = `<i class="fa-solid fa-file-image"></i> ${fileName}`;
                    badge.style.background = '#fdf2f8';
                    badge.style.color = '#d91c84';
                }
                showToast('স্ক্যান সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে ফাইলটি পরীক্ষা করুন।', 'warning');
            };

            // Helper: auto-save current in-memory edits before moving to next/prev student
            function saveCurrentTempChangesSilently() {
                if (state.currentEditIndex < 0 || !state.tempEditStudent) return;
                const updated = state.tempEditStudent;
                updated.id = toEnglishDigits(updated.id || '').trim();
                updated.regNo = updated.id;
                if (updated.studentId) updated.studentId = toEnglishDigits(updated.studentId).trim();
                const scoreInfo = calculateStudentScore(updated.answers, updated.set);
                updated.correct = scoreInfo.correct;
                updated.wrong = scoreInfo.wrong;
                updated.blank = scoreInfo.blank;
                updated.percentage = ((scoreInfo.correct / 30) * 100).toFixed(1);
                updated.status = updated.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
                state.students[state.currentEditIndex] = JSON.parse(JSON.stringify(updated));
            }

            // Prev / Next Navigation within Edit Modal
            window.prevStudentInEdit = function () {
                if (state.currentEditIndex > 0) {
                    saveCurrentTempChangesSilently();
                    openViewEditModal(state.currentEditIndex - 1, state.activeStudentModalTab || 'split');
                }
            };

            window.nextStudentInEdit = function () {
                if (state.currentEditIndex < state.students.length - 1) {
                    saveCurrentTempChangesSilently();
                    openViewEditModal(state.currentEditIndex + 1, state.activeStudentModalTab || 'split');
                }
            };

            // Save Edit Modal
            if (btnSaveEdit) {
                btnSaveEdit.addEventListener('click', () => {
                    if (state.currentEditIndex < 0 || !state.tempEditStudent) return;

                    saveCurrentTempChangesSilently();
                    const updated = state.students[state.currentEditIndex];

                    closeStudentEditModal();
                    renderResultsTable();
                    updateStatistics();
                    showToast(`রোল নং ${toBengaliNumber(updated.roll)}-এর তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!`, 'success', 'fa-check');
                });
            }

            [btnCloseModal, btnCancelEdit].forEach(el => {
                if (el) {
                    el.addEventListener('click', () => {
                        closeStudentEditModal();
                    });
                }
            });

            // Close on Escape key press
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeStudentEditModal();
                    if (window.closeAnswerKeyModalDirect) window.closeAnswerKeyModalDirect();
                    if (window.closeImportExamModal) window.closeImportExamModal();
                }
            });

            // 7. Answer Key Setup Modal
            if (btnOpenKeyModal) {
                btnOpenKeyModal.addEventListener('click', () => {
                    window.openAnswerKeyModalDirect();
                });
            }

            if (btnCloseKeyModal) {
                btnCloseKeyModal.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.closeAnswerKeyModalDirect();
                });
            }

            // Close on overlay backdrop click
            if (modalAnswerKey) {
                modalAnswerKey.addEventListener('click', (e) => {
                    if (e.target === modalAnswerKey) {
                        window.closeAnswerKeyModalDirect();
                    }
                });
            }
            if (modalViewEdit) {
                modalViewEdit.addEventListener('click', (e) => {
                    if (e.target === modalViewEdit) {
                        window.closeStudentEditModal();
                    }
                });
            }
            const modalImportExam = document.getElementById('modalImportExam');
            if (modalImportExam) {
                modalImportExam.addEventListener('click', (e) => {
                    if (e.target === modalImportExam) {
                        window.closeImportExamModal();
                    }
                });
            }

            window.selectAnswerKeySet = function (setName) {
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

                const gridHtml = colsHtml.map((colContent, idx) => `
        <div class="omr-column">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-align: center; margin-bottom: 6px; border-bottom: 1px dashed var(--border-color); padding-bottom: 3px;">
            প্রশ্ন ${toBengaliNumber(idx * 10 + 1)} - ${toBengaliNumber((idx + 1) * 10)}
          </div>
          ${colContent}
        </div>
      `).join('');

                if (answerKeyQuestionsGrid) {
                    answerKeyQuestionsGrid.innerHTML = gridHtml;
                }
                const splitQuestionsGrid = document.getElementById('splitAnswerKeyQuestionsGrid');
                if (splitQuestionsGrid) {
                    splitQuestionsGrid.innerHTML = gridHtml;
                }
            }

            window.setAnswerKeyOption = function (qNum, option) {
                state.answerKeys[state.currentEditingKeySet][qNum - 1] = option;
                renderAnswerKeyBubbles();
            };

            window.randomizeAnswerKeys = function () {
                for (let q = 0; q < 30; q++) {
                    state.answerKeys[state.currentEditingKeySet][q] = optionsBengali[Math.floor(Math.random() * optionsBengali.length)];
                }
                state.setSourceFiles[state.currentEditingKeySet] = {
                    fileName: `ডেমো কি (সেট ${state.currentEditingKeySet})`,
                    type: 'demo',
                    count: 30,
                    timestamp: new Date().toLocaleTimeString()
                };
                renderAnswerKeyBubbles();
                updateMultiSetStatusUI();
                showToast(`সেট ${state.currentEditingKeySet}-এর উত্তরপত্র সফলভাবে র‍্যান্ডমাইজ করা হয়েছে`, 'info');
            };

            window.randomizeAllAnswerKeys = function () {
                ['ক', 'খ', 'গ', 'ঘ'].forEach(s => {
                    for (let q = 0; q < 30; q++) {
                        state.answerKeys[s][q] = optionsBengali[Math.floor(Math.random() * optionsBengali.length)];
                    }
                    state.setSourceFiles[s] = {
                        fileName: `ডেমো উত্তরমালা (সেট ${s})`,
                        type: 'demo',
                        count: 30,
                        timestamp: new Date().toLocaleTimeString()
                    };
                });
                renderAnswerKeyBubbles();
                updateMultiSetStatusUI();
                if (state.students.length > 0) {
                    reEvaluateAllStudents();
                    renderResultsTable();
                    updateStatistics();
                }
                showToast('সকল সেটের (ক, খ, গ, ঘ) উত্তরমালা সফলভাবে ডেমো কি দ্বারা প্রস্তুত করা হয়েছে!', 'success', 'fa-wand-magic-sparkles');
            };

            window.clearAnswerKeys = function () {
                state.answerKeys[state.currentEditingKeySet] = Array(30).fill(null);
                state.setSourceFiles[state.currentEditingKeySet] = null;
                renderAnswerKeyBubbles();
                updateKeySourcePreviewUI();
                updateMultiSetStatusUI();
                if (state.students.length > 0) {
                    reEvaluateAllStudents();
                    renderResultsTable();
                    updateStatistics();
                }
                showToast(`সেট ${state.currentEditingKeySet}-এর উত্তরপত্র মুছে ফেলা হয়েছে।`, 'info');
            };

            window.clearAllAnswerKeys = function () {
                if (!confirm('আপনি কি নিশ্চিতভাবে সকল সেটের (ক, খ, গ, ঘ) উত্তরপত্র মুছে ফেলতে চান?')) return;
                state.answerKeys = JSON.parse(JSON.stringify(defaultAnswerKeys));
                state.setSourceFiles = { 'ক': null, 'খ': null, 'গ': null, 'ঘ': null };
                state.uploadedKeyPreview = null;
                renderAnswerKeyBubbles();
                updateKeySourcePreviewUI();
                updateMultiSetStatusUI();
                if (state.students.length > 0) {
                    reEvaluateAllStudents();
                    renderResultsTable();
                    updateStatistics();
                }
                showToast('সকল সেটের উত্তরপত্র সফলভাবে মুছে ফেলা হয়েছে।', 'info');
            };

            window.switchKeyModalTab = function (tabName) {
                state.activeKeyModalTab = tabName;
                document.querySelectorAll('.key-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                const tabMultiSet = document.getElementById('keyTabMultiSetContent');
                const tabBubble = document.getElementById('keyTabBubbleContent');
                const tabSource = document.getElementById('keyTabSourceContent');
                const tabSplit = document.getElementById('keyTabSplitContent');
                const tabTemplate = document.getElementById('keyTabTemplateContent');
                const modalKeyCard = document.querySelector('#modalAnswerKey .modal-card');

                if (tabMultiSet) tabMultiSet.style.display = 'none';
                if (tabBubble) tabBubble.style.display = 'none';
                if (tabSource) tabSource.style.display = 'none';
                if (tabSplit) tabSplit.style.display = 'none';
                if (tabTemplate) tabTemplate.style.display = 'none';

                if (modalKeyCard) {
                    if (tabName === 'split') {
                        modalKeyCard.classList.add('split-active');
                    } else {
                        modalKeyCard.classList.remove('split-active');
                    }
                }

                if (tabName === 'multiset') {
                    const btn = document.getElementById('tabBtnMultiSetView');
                    if (btn) btn.classList.add('active');
                    if (tabMultiSet) tabMultiSet.style.display = 'block';
                    if (typeof renderMultiSetUploadUI === 'function') {
                        renderMultiSetUploadUI();
                    }
                } else if (tabName === 'bubble') {
                    const btn = document.getElementById('tabBtnBubbleView');
                    if (btn) btn.classList.add('active');
                    if (tabBubble) tabBubble.style.display = 'block';
                } else if (tabName === 'source') {
                    const btn = document.getElementById('tabBtnSourceView');
                    if (btn) btn.classList.add('active');
                    if (tabSource) tabSource.style.display = 'block';
                    if (typeof updateKeySourcePreviewUI === 'function') {
                        updateKeySourcePreviewUI();
                    }
                } else if (tabName === 'split') {
                    const btn = document.getElementById('tabBtnSplitView');
                    if (btn) btn.classList.add('active');
                    if (tabSplit) tabSplit.style.display = 'block';
                    renderAnswerKeyBubbles();
                    if (typeof updateKeySourcePreviewUI === 'function') {
                        updateKeySourcePreviewUI();
                    }
                } else if (tabName === 'template') {
                    const btn = document.getElementById('tabBtnTemplateView');
                    if (btn) btn.classList.add('active');
                    if (tabTemplate) tabTemplate.style.display = 'block';
                }
            };

            window.updateKeySourcePreviewUI = function () {
                const preview = state.uploadedKeyPreview;
                if (!preview) {
                    const emptyHtml = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.2rem; margin-bottom: 12px; color: var(--primary); opacity: 0.6;"></i><br>
            <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px; font-size: 1rem;">এখনও কোনো উত্তরপত্র আপলোড করা হয়নি</div>
            <p style="font-size: 0.85rem; margin-bottom: 14px;">এক্সেল, CSV, TXT বা স্ক্যান করা উত্তরপত্র আপলোড করুন</p>
            <button type="button" class="btn btn-xs btn-primary" onclick="document.getElementById('inputAnswerKeyFile').click();">
              <i class="fa-solid fa-file-arrow-up"></i> ফাইল আপলোড করুন
            </button>
          </div>
        `;
                    if (typeof keySourcePreviewContainer !== 'undefined' && keySourcePreviewContainer) {
                        keySourcePreviewContainer.innerHTML = emptyHtml;
                    }
                    const splitPreview = document.getElementById('splitSourcePreviewContainer');
                    if (splitPreview) {
                        splitPreview.innerHTML = emptyHtml;
                    }
                    return;
                }

                let innerHtml = `
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-file-circle-check" style="font-size: 1.4rem; color: var(--success);"></i>
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(preview.fileName)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">টাইপ: ${preview.type.toUpperCase()} | মোট প্রশ্ন: ৩০</div>
            </div>
          </div>
        </div>
      `;

                if (preview.type === 'excel' && preview.tableData) {
                    let tableRowsHtml = '';
                    preview.tableData.forEach((row, rIdx) => {
                        let cellsHtml = row.map(cell => `<td>${escapeHtml(cell !== undefined ? cell : '')}</td>`).join('');
                        if (rIdx === 0) {
                            tableRowsHtml += `<tr>${row.map(cell => `<th>${escapeHtml(cell !== undefined ? cell : '')}</th>`).join('')}</tr>`;
                        } else {
                            tableRowsHtml += `<tr>${cellsHtml}</tr>`;
                        }
                    });

                    innerHtml += `
          <div style="overflow-x: auto; max-height: 42vh; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <table class="key-preview-table">
              ${tableRowsHtml}
            </table>
          </div>
        `;
                } else if (preview.type === 'image' && preview.imagePreviewUrl) {
                    innerHtml += `
          <div style="text-align: center; max-height: 42vh; overflow: auto; background: #0f172a; padding: 10px; border-radius: var(--radius-sm);">
            <img src="${preview.imagePreviewUrl}" alt="Answer Key Preview" style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 4px;">
          </div>
        `;
                } else if (preview.rawText) {
                    innerHtml += `
          <div class="key-source-text-view" style="max-height: 42vh; overflow-y: auto; padding: 1rem; background: #1e293b; color: #f8fafc; border-radius: 6px; font-family: monospace; white-space: pre-wrap; font-size: 0.85rem;">${escapeHtml(preview.rawText)}</div>
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
                const splitPreview = document.getElementById('splitSourcePreviewContainer');
                if (splitPreview) {
                    splitPreview.innerHTML = innerHtml;
                }
                const splitBadge = document.getElementById('splitSourceBadge');
                if (splitBadge && preview) {
                    splitBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(preview.fileName)}`;
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
                    window.closeAnswerKeyModalDirect();
                    if (state.students.length > 0) {
                        reEvaluateAllStudents();
                        renderResultsTable();
                        updateStatistics();
                        showToast('নতুন উত্তরপত্রের ভিত্তিতে সকল শিক্ষার্থীর নম্বর পুনরায় মূল্যায়ন করা হয়েছে!', 'success', 'fa-rotate');
                    } else {
                        showToast('উত্তরপত্র সংরক্ষিত হয়েছে!', 'success');
                    }
                });
            }

            // Close Answer Key modal on Escape key press
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const m = document.getElementById('modalAnswerKey');
                    if (m && (m.classList.contains('active') || m.style.display === 'flex')) {
                        window.closeAnswerKeyModalDirect();
                    }
                }
            });

            btnExportExcel.addEventListener('click', () => {
                if (state.students.length === 0) {
                    showToast('এক্সপোর্ট করার মতো কোনো ফলাফল পাওয়া যায়নি', 'warning');
                    return;
                }

                try {
                    // Prepare formatted data for SheetJS
                    const lookupMaps = getStudentsLookupMaps();
                    const excelRows = state.students.map((s, idx) => {
                        const rawId = toEnglishDigits(s.id || '').trim();
                        const rawRoll = toEnglishDigits(s.roll || '').trim();
                        const rawCls = mapClassToNumber(s.class);
                        const sName = s.nameEn || s.name || lookupMaps.byReg.get(rawId) || lookupMaps.byRollClass.get(`${rawCls}_${rawRoll}`) || lookupMaps.byRollClass.get(`_${rawRoll}`) || '';

                        return {
                            'ক্রমিক নং': idx + 1,
                            'শিক্ষার্থী রেজিঃ নং': toEnglishDigits(s.id || s.regNo),
                            'শিক্ষার্থীর নাম (English)': sName,
                            'রোল নং': s.roll,
                            'শ্রেণি': s.class,
                            'শাখা': s.section,
                            'সেট নং': (s.set && s.set !== '') ? s.set : '—',
                            'শুদ্ধ উত্তর': s.correct,
                            'ভুল উত্তর': s.wrong,
                            'ফাঁকা উত্তর': s.blank,
                            'মোট নম্বর': s.correct,
                            'শতকরা (%)': s.percentage + '%',
                            'ফলাফল স্ট্যাটাস': s.status
                        };
                    });

                    const worksheet = XLSX.utils.json_to_sheet(excelRows);

                    // Auto-size columns width
                    worksheet['!cols'] = [
                        { wch: 10 },
                        { wch: 18 },
                        { wch: 22 },
                        { wch: 12 },
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
                    state.pendingUnmatchedList = [];
                    if (typeof renderPendingList === 'function') renderPendingList();
                    if (typeof updateTabCounts === 'function') updateTabCounts();

                    dropzoneAnswerKey.classList.remove('filled');
                    dropzoneStudentOMR.classList.remove('filled');
                    textAnswerKeyStatus.innerHTML = 'কোনো ফাইল যুক্ত হয়নি';
                    textStudentOMRStatus.innerHTML = '০ টি ফাইল';

                    renderResultsTable();
                    updateStatistics();
                    btnExportExcel.disabled = true;
                    btnPrintTable.disabled = true;
                    showToast('ডেটা সফলভাবে রিসেট করা হয়েছে', 'info');
                }
            });


            // --- Additional Template Download Utilities ---
            window.downloadAnswerKeyTemplate = function (format) {
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
                    } catch (e) {
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
            window.saveOmrToExamsApi = async function () {
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
                    } catch (e) { }

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
                } catch (err) {
                    localStorage.setItem('school_omr_exams', JSON.stringify([examRecord]));
                    showToast('ফলাফল লোকাল মেমরিতে ব্যাকআপ করা হয়েছে', 'info');
                }
            };

            // Class normalization and formatting helpers
            window.mapClassToNumber = function (cls) {
                if (!cls) return '8';
                const str = String(cls).trim().toLowerCase();
                const enMap = {
                    'ten': '10', 'nine': '9', 'eight': '8', 'seven': '7', 'six': '6',
                    'five': '5', 'four': '4', 'three': '3', 'two': '2', 'one': '1'
                };
                if (enMap[str]) return enMap[str];
                const bnMap = {
                    '১০': '10', '৯': '9', '৮': '8', '৭': '7', '৬': '6',
                    '৫': '5', '৪': '4', '৩': '3', '২': '2', '১': '1'
                };
                if (bnMap[str]) return bnMap[str];
                const digits = str.replace(/[^\d]/g, '');
                if (digits) return digits;
                return cls;
            };

            window.formatClassBangla = function (cls) {
                const c = mapClassToNumber(cls);
                if (c === '6') return '৬ষ্ঠ শ্রেণি';
                if (c === '7') return '৭ম শ্রেণি';
                if (c === '8') return '৮ম শ্রেণি';
                if (c === '9') return '৯ম শ্রেণি';
                if (c === '10') return '১০ম শ্রেণি';
                return toBengaliNumber(c) + ' শ্রেণি';
            };

            // --- IMPORT EXAM MODAL LOGIC (Exam List Selection) ---
            let cachedAvailableExams = [];

            // Helper: Check if an exam schedule from Exam List already has MCQ marks entered
            window.checkIfScheduleHasMcqMarks = function (sch, savedMarks = {}, omrExams = []) {
                if (!sch || !sch.id) return false;
                const schId = String(sch.id).trim();

                // 1. Explicit flags on schedule
                if (sch.hasMcqMarks === true || sch.omrEvaluatedAt) {
                    return true;
                }

                // 2. Check if schedule is already in saved OMR exams list
                if (Array.isArray(omrExams) && omrExams.length > 0) {
                    const inOmr = omrExams.some(oe => String(oe.id) === schId || String(oe.scheduleId) === schId);
                    if (inOmr) return true;
                }

                // 3. Inspect saved student marks in school_student_marks
                if (savedMarks && typeof savedMarks === 'object') {
                    const targetSubCode = (sch.subjectCode || sch.subject || '').trim().toLowerCase();
                    const targetSubName = (sch.subject || '').trim().toLowerCase();

                    for (const [key, studentData] of Object.entries(savedMarks)) {
                        if (key.startsWith('timestamp_')) continue;
                        // Match key ending or containing _scheduleId
                        if (key.endsWith('_' + schId) || key.includes('_' + schId)) {
                            if (studentData && typeof studentData === 'object') {
                                for (const [subKey, subVal] of Object.entries(studentData)) {
                                    if (!subVal || typeof subVal !== 'object') continue;
                                    
                                    const subKeyClean = subKey.trim().toLowerCase();
                                    const isMatch = !targetSubCode || 
                                        subKeyClean === targetSubCode || 
                                        subKeyClean === targetSubName || 
                                        Object.keys(studentData).length === 1;

                                    if (isMatch) {
                                        if (subVal.omrEvaluatedAt) return true;
                                        if (subVal.answers && typeof subVal.answers === 'object' && Object.keys(subVal.answers).length > 0) {
                                            return true;
                                        }
                                        if (subVal.mcq !== undefined && subVal.mcq !== null && subVal.mcq !== '') {
                                            const mcqStr = String(subVal.mcq).trim().toUpperCase();
                                            if (!isNaN(Number(mcqStr)) || mcqStr === 'A' || mcqStr === 'ABS') {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 4. If sch.marksEntryTime is present, check if there are student marks
                    if (sch.marksEntryTime) {
                        const hasMarksKeys = Object.keys(savedMarks).some(k => !k.startsWith('timestamp_') && (k.endsWith('_' + schId) || k.includes('_' + schId)));
                        if (hasMarksKeys) {
                            return true;
                        }
                    }
                }

                return false;
            };

            window.openImportExamModal = async function () {
                const modal = document.getElementById('modalImportExam');
                if (!modal) return;

                modal.style.display = 'flex';
                modal.classList.add('active');

                const searchInput = document.getElementById('inputImportExamSearch');
                if (searchInput) {
                    searchInput.value = '';
                    setTimeout(() => searchInput.focus(), 80);
                }

                const listContainer = document.getElementById('importExamListContainer');
                if (listContainer) {
                    listContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #4f46e5; margin-bottom: 10px;"></i>
            <p style="margin: 0; font-size: 0.95rem;">Exam List এবং সংরক্ষিত পরীক্ষার তালিকা লোড হচ্ছে...</p>
          </div>
        `;
                }

                try {
                    const exams = [];

                    // 1. Fetch saved OMR evaluations first to know which exams already have OMR evaluations
                    let omrExams = [];
                    try {
                        const res = await fetch('/api/exams');
                        if (res.ok) {
                            const data = await res.json();
                            if (Array.isArray(data)) omrExams = data;
                        }
                    } catch (e) { }

                    if (omrExams.length === 0) {
                        try {
                            omrExams = safeJsonParse('school_omr_exams', []);
                        } catch (e) { }
                    }

                    // 2. Fetch schedules from Exam List (school_exam_schedules)
                    let schedules = [];
                    try {
                        if (typeof loadSchedules === 'function') {
                            schedules = loadSchedules() || [];
                        } else {
                            schedules = safeJsonParse('school_exam_schedules', []);
                        }
                    } catch (e) {
                        console.warn('Error reading schedules:', e);
                    }

                    // Fetch students to count students per class
                    let allStudents = [];
                    try {
                        if (typeof loadStudents === 'function') {
                            allStudents = loadStudents() || [];
                        } else {
                            allStudents = safeJsonParse('school_students', []);
                        }
                    } catch (e) { }

                    // Fetch saved student marks to check mark status
                    let savedMarks = {};
                    try {
                        if (typeof loadStudentMarks === 'function') {
                            savedMarks = loadStudentMarks() || {};
                        } else {
                            savedMarks = safeJsonParse('school_student_marks', {});
                        }
                    } catch (e) { }

                    schedules.forEach(sch => {
                        // "Exam List" এ যে সকল exam এর MCQ নাম্বার এন্ট্রি করা থাকবে, সে সকল পরীক্ষা "Import Exam" এ আসবে না।
                        const hasMcqMarks = checkIfScheduleHasMcqMarks(sch, savedMarks, omrExams);
                        if (hasMcqMarks) {
                            return; // Exclude exams that already have MCQ marks entered
                        }

                        const targetClassNum = mapClassToNumber(sch.class);
                        const studentCount = allStudents.filter(s => {
                            return mapClassToNumber(s.class) === targetClassNum ||
                                (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
                        }).length;

                        exams.push({
                            id: sch.id,
                            source: 'schedule',
                            sourceLabel: 'Exam List শিডিউল',
                            examName: sch.term || 'পরীক্ষা',
                            subject: sch.subject || '',
                            class: sch.class || '',
                            section: sch.section || 'All',
                            date: sch.date || '',
                            totalStudents: studentCount > 0 ? studentCount : (sch.totalStudents || 0),
                            hasMarks: false,
                            scheduleData: sch
                        });
                    });

                    // 3. Fetch saved OMR evaluations if any
                    omrExams.forEach(oe => {
                        if (exams.some(x => x.id === oe.id)) return;
                        const firstStudent = (oe.students && oe.students[0]) ? oe.students[0] : null;
                        const classLabel = firstStudent ? formatClassBangla(firstStudent.class) : 'সকল শ্রেণি';
                        exams.push({
                            id: oe.id,
                            source: 'omr',
                            sourceLabel: 'OMR সংরক্ষিত',
                            examName: oe.examName || ('OMR পরীক্ষা ' + (oe.id || '')),
                            subject: oe.subject || 'MCQ ওএমআর',
                            class: classLabel,
                            section: 'সকল শাখা',
                            date: oe.date || '',
                            totalStudents: oe.totalStudents || (oe.students ? oe.students.length : 0),
                            hasMarks: true,
                            omrData: oe
                        });
                    });

                    cachedAvailableExams = exams;
                    renderImportExamList();

                } catch (err) {
                    console.error('Error loading available exams:', err);
                    if (listContainer) {
                        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger);">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 8px;"></i>
              <p>পরীক্ষার তালিকা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।</p>
            </div>
          `;
                    }
                }
            };

            window.closeImportExamModal = function () {
                const modal = document.getElementById('modalImportExam');
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                }
            };

            window.renderImportExamList = function () {
                const listContainer = document.getElementById('importExamListContainer');
                const searchInput = document.getElementById('inputImportExamSearch');
                const sourceSelect = document.getElementById('selectImportExamSource');
                const countEl = document.getElementById('totalAvailableExamsCount');
                if (!listContainer) return;

                const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
                const filterSource = (sourceSelect ? sourceSelect.value : 'ALL');

                const filtered = cachedAvailableExams.filter(exam => {
                    if (filterSource === 'SCHEDULE' && exam.source !== 'schedule') return false;
                    if (filterSource === 'OMR' && exam.source !== 'omr') return false;

                    if (!query) return true;
                    const examName = (exam.examName || '').toLowerCase();
                    const subject = (exam.subject || '').toLowerCase();
                    const cls = (exam.class || '').toLowerCase();
                    const date = (exam.date || '').toLowerCase();
                    return examName.includes(query) || subject.includes(query) || cls.includes(query) || date.includes(query);
                });

                if (countEl) {
                    countEl.textContent = toBengaliNumber(filtered.length);
                }

                if (filtered.length === 0) {
                    listContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 1.5rem; color: #94a3b8;">
              <i class="fa-solid fa-folder-open"></i>
            </div>
            <h4 style="margin: 0 0 6px 0; color: var(--text-main); font-size: 1.05rem;">কোনো পরীক্ষা পাওয়া যায়নি</h4>
            <p style="margin: 0; font-size: 0.85rem;">অন্য কোনো নাম দিয়ে অনুসন্ধান করুন অথবা Exam List এ নতুন পরীক্ষার শিডিউল যুক্ত করুন।</p>
          </div>
        `;
                    return;
                }

                listContainer.innerHTML = filtered.map((exam) => {
                    const isSchedule = exam.source === 'schedule';
                    const sourceBg = isSchedule ? '#eef2ff' : '#ecfdf5';
                    const sourceColor = isSchedule ? '#4f46e5' : '#059669';
                    const sourceIcon = isSchedule ? 'fa-calendar-check' : 'fa-circle-check';
                    const badgeBg = isSchedule ? '#e0e7ff' : '#d1fae5';
                    const badgeColor = isSchedule ? '#3730a3' : '#065f46';

                    const marksStatusHtml = exam.hasMarks
                        ? `<span style="font-size: 0.73rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-check"></i> নম্বর সম্পন্ন</span>`
                        : `<span style="font-size: 0.73rem; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-clock"></i> পেন্ডিং</span>`;

                    const displayClass = exam.class ? (exam.class.includes('শ্রেণি') ? exam.class : (formatClassBangla(exam.class))) : 'শ্রেণি: -';

                    return `
          <div class="import-exam-item-card" 
               style="display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-radius: 12px; background: #ffffff; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03); cursor: pointer; gap: 14px;"
               onmouseover="this.style.borderColor='#4f46e5'; this.style.transform='translateY(-2px)';"
               onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)';"
               onclick="selectAndImportExam('${exam.id}', '${exam.source}')">
            
            <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${sourceBg}; color: ${sourceColor}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
                <i class="fa-solid ${sourceIcon}"></i>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                  <strong style="font-size: 1.05rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${exam.examName} ${exam.subject ? `— ${exam.subject}` : ''}
                  </strong>
                  <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor};">
                    ${exam.sourceLabel}
                  </span>
                  ${marksStatusHtml}
                </div>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 0.83rem; color: #64748b;">
                  <span><i class="fa-solid fa-graduation-cap" style="color: #6366f1;"></i> ${displayClass}</span>
                  ${exam.subject ? `<span><i class="fa-solid fa-book" style="color: #0ea5e9;"></i> ${exam.subject}</span>` : ''}
                  <span><i class="fa-regular fa-calendar" style="color: #f59e0b;"></i> ${exam.date || 'তারিখ নেই'}</span>
                  <span><i class="fa-solid fa-users" style="color: #10b981;"></i> ${toBengaliNumber(exam.totalStudents)} জন পরীক্ষার্থী</span>
                </div>
              </div>
            </div>

            <div style="flex-shrink: 0;">
              <button type="button" class="btn btn-sm" 
                      style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; font-weight: 700; border-radius: 8px; padding: 7px 16px; border: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.3); font-size: 0.88rem; cursor: pointer;">
                <i class="fa-solid fa-arrow-down-to-bracket"></i> নির্বাচন করুন
              </button>
            </div>
          </div>
        `;
                }).join('');
            };

            window.selectAndImportExam = function (examId, source) {
                const selected = cachedAvailableExams.find(x => x.id === examId && x.source === source);
                if (!selected) return;

                if (source === 'omr') {
                    const oe = selected.omrData;
                    if (oe && oe.students && oe.students.length > 0) {
                        const importedOmrStudents = sortStudentsByRegNo(JSON.parse(JSON.stringify(oe.students)));
                        importedOmrStudents.forEach(st => {
                            st.id = toEnglishDigits(st.id || st.regNo || '').trim();
                            st.regNo = st.id;
                            if (st.studentId) st.studentId = toEnglishDigits(st.studentId).trim();
                        });
                        state.students = importedOmrStudents;
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
                        } catch (e) { }

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
                } catch (e) { }

                let allStudents = [];
                try {
                    if (typeof loadStudents === 'function') {
                        allStudents = loadStudents() || [];
                    } else {
                        allStudents = safeJsonParse('school_students', []);
                    }
                } catch (e) { }

                let savedMarks = {};
                try {
                    if (typeof loadStudentMarks === 'function') {
                        savedMarks = loadStudentMarks() || {};
                    } else {
                        savedMarks = safeJsonParse('school_student_marks', {});
                    }
                } catch (e) { }

                const targetClassNum = mapClassToNumber(sch.class);
                let classStudents = allStudents.filter(s => {
                    return mapClassToNumber(s.class) === targetClassNum ||
                        (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
                });

                if (classStudents.length === 0) {
                    classStudents = allStudents.slice(0, 30);
                }

                // Sort students sequentially by Registration Number in ascending serial order
                sortStudentsByRegNo(classStudents);

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
                    let correctScore = 0;
                    let savedAnswers = null;
                    let savedSet = null;
                    let savedStatus = null;
                    let savedPct = null;
                    let savedFileName = '';

                    if (studentMarkObj && typeof studentMarkObj === 'object') {
                        const subVal = (targetSubjectCode && studentMarkObj[targetSubjectCode]) ? studentMarkObj[targetSubjectCode] : (studentMarkObj[sch.subject] || Object.values(studentMarkObj)[0]);
                        if (subVal && typeof subVal === 'object') {
                            // Strictly check for verified OMR evaluation data
                            const hasRealAnswers = subVal.answers && typeof subVal.answers === 'object' && Object.keys(subVal.answers).length > 0;
                            const isVerifiedOmr = !subVal.isAbsent && hasRealAnswers && !!subVal.omrEvaluatedAt;

                            if (isVerifiedOmr && subVal.mcq !== undefined && subVal.mcq !== null && !isNaN(parseInt(subVal.mcq))) {
                                correctScore = parseInt(subVal.mcq);
                                hasRealMark = true;
                                savedAnswers = subVal.answers;
                                if (subVal.set) savedSet = normalizeSet(subVal.set);
                                if (subVal.percentage) savedPct = subVal.percentage;
                                if (subVal.status) savedStatus = subVal.status;
                                if (subVal.fileName) savedFileName = subVal.fileName;
                            }
                        }
                    }

                    const totalQ = 30;
                    let pct = '0.0';
                    let status = 'পেন্ডিং';
                    let wrongCount = 0;
                    let blankCount = totalQ;
                    const studentAnswers = {};

                    if (hasRealMark && savedAnswers && Object.keys(savedAnswers).length > 0) {
                        correctScore = Math.max(0, Math.min(30, correctScore));
                        for (let q = 1; q <= 30; q++) {
                            studentAnswers[q] = savedAnswers[q] || savedAnswers[String(q)] || null;
                        }
                        const calcScore = calculateStudentScore(studentAnswers, savedSet || 'ক');
                        correctScore = calcScore.correct;
                        wrongCount = calcScore.wrong;
                        blankCount = calcScore.blank;
                        pct = savedPct || ((correctScore / totalQ) * 100).toFixed(1);
                        status = savedStatus || (correctScore >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ');
                        totalLoadedWithMarks++;
                    } else {
                        // No OMR evaluated yet - strictly 0 marks, 0 wrong, 30 blank, status Pending
                        correctScore = 0;
                        wrongCount = 0;
                        blankCount = totalQ;
                        pct = '0.0';
                        status = 'পেন্ডিং';
                    }

                    const setChoice = (hasRealMark && savedSet) ? savedSet : '';
                    const enName = (student.name || student.nameEn || '').trim();

                    const fallbackReg = '2211' + String(student.roll || idx + 1).padStart(3, '0');
                    const studentRegId = toEnglishDigits(student.regNo || student.studentId || student.id || fallbackReg).trim();
                    return {
                        id: studentRegId,
                        regNo: studentRegId,
                        studentId: studentRegId,
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
                        fileName: hasRealMark ? savedFileName : '',
                        answers: studentAnswers,
                        isRealScanned: hasRealMark
                    };
                });

                // Sort imported students sequentially by Registration Number
                sortStudentsByRegNo(importedStudents);
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
            window.saveAndEntryExamMarks = async function () {
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
                    const proceed = confirm(`⚠️ পেন্ডিং তালিকায় এখনও ${toBengaliNumber(pendingCount)} টি অমিল ওএমআর শিট রয়েছে।\n\nআপনি কি বর্তমান ${toBengaliNumber(evaluatedStudents.length)} জন শিক্ষার্থীর মূল্যায়নকৃত নম্বর Exam List-এ সংরক্ষণ ও স্থায়ী এন্ট্রি করতে চান?`);
                    if (!proceed) return;
                }

                // Check imported exam info
                let examInfo = state.importedExamInfo;
                if (!examInfo) {
                    try {
                        examInfo = safeJsonParse('school_active_omr_imported_exam', null);
                    } catch (e) { }
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
                    } catch (e) { }

                    let targetSch = schedules.find(s => String(s.id) === String(schId));
                    if (targetSch) {
                        targetSch.marksEntryTime = nowFormatted;
                        targetSch.hasMarks = true;
                        targetSch.hasMcqMarks = true;
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
                        }).catch(() => { });
                    }

                    // 2. Load all school students to guarantee matching master student records
                    let allStudents = [];
                    try {
                        if (typeof loadStudents === 'function') {
                            allStudents = loadStudents() || [];
                        } else {
                            allStudents = safeJsonParse('school_students', []);
                        }
                    } catch (e) { }

                    // 3. Update student marks in school_student_marks
                    let savedMarks = {};
                    try {
                        if (typeof loadStudentMarks === 'function') {
                            savedMarks = loadStudentMarks() || {};
                        } else {
                            savedMarks = safeJsonParse('school_student_marks', {});
                        }
                    } catch (e) { }

                    const subMap = (typeof loadSubjects === 'function') ? loadSubjects() : safeJsonParse('school_subjects', {});
                    const schClass = targetSch ? targetSch.class : (examInfo.class || '');
                    const classSubjects = subMap[schClass] || [];
                    const subObj = classSubjects.find(s => s.name && targetSch && s.name.trim().toLowerCase() === (targetSch.subject || '').trim().toLowerCase());
                    const activeExamSubjectCode = subObj ? subObj.code : ((targetSch && (targetSch.subjectCode || targetSch.subject)) || examInfo.subject || 'MCQ');
                    
                    const targetSubjectKeys = new Set([
                        activeExamSubjectCode,
                        targetSch ? targetSch.subject : null,
                        targetSch ? targetSch.subjectCode : null,
                        examInfo.subject
                    ].filter(Boolean));

                    const examVal = targetSch ? targetSch.term : (examInfo.examName || 'Exam');

                    state.students.forEach(student => {
                        const rawReg = toEnglishDigits(student.id || student.regNo || '').trim();
                        const rawRoll = toEnglishDigits(student.roll || '').trim();
                        const isPending = (student.status === 'পেন্ডিং' && !student.isRealScanned && (!student.correct || student.correct === 0));
                        const isAbsent = isPending;
                        const mcqScore = isAbsent ? 0 : (typeof student.correct === 'number' ? student.correct : (parseInt(student.correct, 10) || 0));

                        // Strict Step 1: Find master student record by Registration Number / Student ID / ID first (Unique Exact Match)
                        let masterSt = allStudents.find(st =>
                            isRegNoMatch(st.regNo, rawReg) ||
                            isRegNoMatch(st.studentId, rawReg) ||
                            isRegNoMatch(st.id, rawReg)
                        );

                        // Strict Step 2: Fallback ONLY if no match found by RegNo: Match by Class + Section + Roll
                        if (!masterSt) {
                            const sSec = (student.section || '').trim().toLowerCase();
                            const sCls = mapClassToNumber(student.class);
                            masterSt = allStudents.find(st =>
                                mapClassToNumber(st.class) === sCls &&
                                (String(st.section || '').trim().toLowerCase() === sSec) &&
                                toEnglishDigits(String(st.roll || '')).trim() === rawRoll
                            );
                        }

                        // Strict Step 3: Fallback ONLY if still no match and section is not specified/All: Match by Class + Roll
                        if (!masterSt) {
                            const sCls = mapClassToNumber(student.class);
                            masterSt = allStudents.find(st =>
                                mapClassToNumber(st.class) === sCls &&
                                toEnglishDigits(String(st.roll || '')).trim() === rawRoll
                            );
                        }

                        const targetStudentIds = new Set();
                        if (masterSt) {
                            if (masterSt.id !== undefined && masterSt.id !== null) targetStudentIds.add(String(masterSt.id));
                            if (masterSt.studentId) targetStudentIds.add(String(masterSt.studentId));
                            if (masterSt.regNo) targetStudentIds.add(String(masterSt.regNo));
                        }
                        if (student.id) targetStudentIds.add(String(student.id));
                        if (student.regNo) targetStudentIds.add(String(student.regNo));
                        if (student.studentId) targetStudentIds.add(String(student.studentId));
                        if (rawReg) targetStudentIds.add(rawReg);

                        targetStudentIds.forEach(stId => {
                            const keysToUpdate = [
                                `marks_${stId}_${schId}`,
                                `marks_${stId}_${examVal}`
                            ];

                            keysToUpdate.forEach(k => {
                                savedMarks[k] = savedMarks[k] || {};

                                targetSubjectKeys.forEach(sKey => {
                                    const existingData = savedMarks[k][sKey] || {};
                                    const cqVal = (existingData.cq !== undefined && !isNaN(parseInt(existingData.cq))) ? parseInt(existingData.cq) : (existingData.cq || 0);
                                    const pracVal = (existingData.practical !== undefined && !isNaN(parseInt(existingData.practical))) ? parseInt(existingData.practical) : (existingData.practical || 0);
                                    const numCq = typeof cqVal === 'number' ? cqVal : (parseInt(cqVal, 10) || 0);
                                    const numPrac = typeof pracVal === 'number' ? pracVal : (parseInt(pracVal, 10) || 0);
                                    const totalVal = numCq + (isAbsent ? 0 : mcqScore) + numPrac;

                                    savedMarks[k][sKey] = {
                                        total: totalVal,
                                        isAbsent: isAbsent,
                                        cq: cqVal,
                                        mcq: isAbsent ? 0 : mcqScore,
                                        practical: pracVal,
                                        set: student.set || 'ক',
                                        answers: isAbsent ? {} : (student.answers || {}),
                                        percentage: isAbsent ? '0.0' : (student.percentage || ((mcqScore / 30) * 100).toFixed(1)),
                                        status: isAbsent ? 'পেন্ডিং' : student.status,
                                        fileName: isAbsent ? '' : (student.fileName || ''),
                                        omrEvaluatedAt: isAbsent ? null : (student.evaluatedAt || nowIso)
                                    };
                                });
                            });
                        });
                    });

                    savedMarks[`timestamp_${schId}`] = nowFormatted;

                    localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
                    fetch('/api/db/set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'school_student_marks', value: JSON.stringify(savedMarks) })
                    }).catch(() => { });

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
                        students: state.students.map(s => {
                            const isAb = (s.status === 'পেন্ডিং' && !s.isRealScanned) || (!s.correct && !s.evaluatedAt);
                            return {
                                ...s,
                                correct: isAb ? 0 : s.correct,
                                wrong: isAb ? 0 : s.wrong,
                                blank: isAb ? 30 : s.blank,
                                percentage: isAb ? '0.0' : s.percentage,
                                status: isAb ? 'পেন্ডিং' : s.status,
                                answers: isAb ? {} : (s.answers || {}),
                                fileName: isAb ? '' : (s.fileName || ''),
                                isRealScanned: !isAb && !!s.isRealScanned
                            };
                        }),
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
                    } catch (e) { }

                    // Update active cache
                    state.importedExamInfo = examInfo;
                    try {
                        localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(examInfo));
                    } catch (e) { }

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
                    } catch (e) { }

                } catch (err) {
                    console.error('Error in saveAndEntryExamMarks:', err);
                    if (btn) {
                        btn.innerHTML = originalBtnHtml;
                        btn.disabled = false;
                    }
                    showToast('সংরক্ষণ করার সময় ত্রুটি ঘটেছে: ' + err.message, 'danger');
                }
            };

            window.loadOmrFromExamsApi = async function () {
                try {
                    const res = await fetch('/api/exams');
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data) && data.length > 0) {
                            const latest = data[0];
                            if (latest.students && latest.students.length > 0) {
                                state.students = sortStudentsByRegNo(latest.students);
                                state.students.forEach(st => {
                                    st.id = toEnglishDigits(st.id || st.regNo || '').trim();
                                    st.regNo = st.id;
                                    if (st.studentId) st.studentId = toEnglishDigits(st.studentId).trim();
                                });
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
                } catch (e) {
                    console.warn('Could not auto-load exams:', e);
                }
                return false;
            };

            // Subview Lifecycle Initializer
            window.initOmrReaderView = function () {
                if (typeof updateMultiSetStatusUI === 'function') {
                    updateMultiSetStatusUI();
                }
            };

            if (typeof updateMultiSetStatusUI === 'function') {
                updateMultiSetStatusUI();
            }

        })();
    