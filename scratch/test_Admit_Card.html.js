
// BLOCK 4

        // Helper to check if designation represents Headmaster / Head Teacher
        function isHeadmasterDesignation(designation) {
            if (!designation) return false;
            const des = String(designation).trim().toLowerCase();
            if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
                return false;
            }
            return des.includes('প্রধান শিক্ষক') ||
                des.includes('প্রধান শিক্ষিকা') ||
                des.includes('headmaster') ||
                des.includes('head master') ||
                des.includes('headteacher') ||
                des.includes('head teacher') ||
                des.includes('principal') ||
                des.includes('অধ্যক্ষ') ||
                des.includes('সুপারিনটেনডেন্ট') ||
                des.includes('superintendent');
        }

        // Helper to retrieve Head Teacher profile and signature by Department or Class
        function getHeadmasterByDepartment(deptOrClass) {
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            if (!Array.isArray(staffList) || staffList.length === 0) {
                return null;
            }

            const checkIsHm = (s) => {
                if (!s) return false;
                if (typeof isHeadmasterDesignation === 'function') {
                    return isHeadmasterDesignation(s.designation || s.designationBn || s.post);
                }
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
                    return false;
                }
                return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('headteacher') || des.includes('head teacher') || des.includes('principal') || des.includes('অধ্যক্ষ') || des.includes('সুপারিনটেনডেন্ট') || des.includes('superintendent');
            };

            let targetDept = '';
            if (deptOrClass) {
                const d = String(deptOrClass).trim().toLowerCase();
                const primaryKeywords = ['primary', 'primary level', 'প্রাথমিক', 'play', 'nursery', 'kg', 'one', 'two', 'three', 'four', 'five', 'প্লে', 'নার্সারি', 'কেজি', 'প্রথম', 'দ্বিতীয়', 'দ্বিতীয়', 'তৃতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', '1', '2', '3', '4', '5'];
                const highKeywords = ['high', 'high level', 'মাধ্যমিক', 'উচ্চ', 'six', 'seven', 'eight', 'nine', 'ten', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম', '6', '7', '8', '9', '10'];

                if (primaryKeywords.some(k => d === k || d.includes(k))) {
                    targetDept = 'primary level';
                } else if (highKeywords.some(k => d === k || d.includes(k))) {
                    targetDept = 'high level';
                } else {
                    targetDept = d;
                }
            }

            // 1. Primary priority: Headmaster specifically assigned to targetDept
            if (targetDept) {
                const hm = staffList.find(s => {
                    if (!checkIsHm(s)) return false;
                    const sDept = String(s.department || s.dept || '').trim().toLowerCase();
                    return sDept === targetDept || sDept.includes(targetDept) || targetDept.includes(sDept);
                });
                if (hm) return hm;
            }

            // 2. Fallback: Any registered headmaster in the staff list
            const anyHm = staffList.find(s => checkIsHm(s));
            return anyHm || null;
        }

        const classTranslations = {

            "Play": "প্লে",

            "Nursery": "নার্সারি",

            "KG": "কেজি",

            "One": "প্রথম",

            "Two": "দ্বিতীয়",

            "Three": "তৃতীয়",

            "Four": "চতুর্থ",

            "Five": "পঞ্চম",

            "Six": "ষষ্ঠ",

            "Seven": "সপ্তম",

            "Eight": "অষ্টম",

            "Nine": "নবম",

            "Ten": "দশম"

        };



        const sectionTranslations = {

            "A": "ক",

            "B": "খ",

            "C": "গ",

            "D": "ঘ",

            "E": "ঙ"

        };



        const shiftTranslations = {

            "Morning Shift": "সকাল",

            "Afternoon Shift": "বিকাল",

            "Morning": "সকাল",

            "Afternoon": "বিকাল"

        };



        function getShiftFormattedName(studentShift, studentClass) {

            const storedTimes = localStorage.getItem('school_shift_times');

            let shiftTimes = [];

            try {

                if (storedTimes) shiftTimes = JSON.parse(storedTimes);

            } catch (e) { }



            let dept = 'High Level';

            if (studentClass) {

                const cLower = String(studentClass).toLowerCase();

                if (['play', 'nursery', 'kg', 'one', 'two', 'three', 'four', 'five', '1', '2', '3', '4', '5'].includes(cLower)) {

                    dept = 'Primary Level';

                }

            }



            if (Array.isArray(shiftTimes) && shiftTimes.length > 0) {

                let match = null;

                if (studentShift) {

                    match = shiftTimes.find(t => t.shift === studentShift || t.id === studentShift);

                }

                if (!match && studentShift) {

                    const isMorning = /morning|sokal|প্রভাতি/i.test(studentShift);

                    const isAfternoon = /afternoon|bikal|দিবা|বিকাল/i.test(studentShift);

                    if (isMorning) match = shiftTimes.find(t => t.dept === dept && (/morning|sokal|প্রভাতি/i.test(t.shift) || (t.shiftBn && /প্রভাতি|সকাল/i.test(t.shiftBn))));

                    if (isAfternoon) match = shiftTimes.find(t => t.dept === dept && (/afternoon|bikal|দিবা|বিকাল/i.test(t.shift) || (t.shiftBn && /দিবা|বিকাল/i.test(t.shiftBn))));

                    if (!match && isMorning) match = shiftTimes.find(t => /morning|sokal|প্রভাতি/i.test(t.shift) || (t.shiftBn && /প্রভাতি|সকাল/i.test(t.shiftBn)));

                    if (!match && isAfternoon) match = shiftTimes.find(t => /afternoon|bikal|দিবা|বিকাল/i.test(t.shift) || (t.shiftBn && /দিবা|বিকাল/i.test(t.shiftBn)));

                }

                if (!match) {

                    match = shiftTimes.find(t => t.dept === dept);

                    if (!match) match = shiftTimes[0];

                }



                if (match) {

                    if (match.shiftBn && match.shiftBn.trim()) {

                        return match.shiftBn.trim();

                    }

                    if (match.shift && match.shift.trim()) {

                        if (/afternoon/i.test(match.shift)) return "বিকাল";

                        if (/morning/i.test(match.shift)) return "সকাল";

                        return match.shift.trim();

                    }

                }

            }



            if (studentShift) {

                if (shiftTranslations[studentShift]) return shiftTranslations[studentShift];

                if (/afternoon|bikal|দিবা|বিকাল/i.test(studentShift)) return "বিকাল";

                if (/morning|sokal|প্রভাতি/i.test(studentShift)) return "সকাল";

                return studentShift;

            }



            return "সকাল";

        }



        function getShiftTimeRange(entryShift) {

            if (!entryShift) return "১০:০০ - ১:০০";

            try {

                const storedTimes = localStorage.getItem('school_shift_times');

                if (storedTimes) {

                    const shiftTimes = JSON.parse(storedTimes);

                    if (Array.isArray(shiftTimes)) {

                        let match = shiftTimes.find(t => t.shift === entryShift);

                        if (!match) {

                            const isMorning = /morning|sokal|প্রভাতি/i.test(entryShift);

                            const isAfternoon = /afternoon|bikal|দিবা/i.test(entryShift);

                            if (isMorning) match = shiftTimes.find(t => /morning|sokal|প্রভাতি/i.test(t.shift) || (t.shiftBn && /প্রভাতি|সকাল/i.test(t.shiftBn)));

                            if (isAfternoon) match = shiftTimes.find(t => /afternoon|bikal|দিবা/i.test(t.shift) || (t.shiftBn && /দিবা|বিকাল/i.test(t.shiftBn)));

                        }

                        if (match && match.startTime && match.endTime) {

                            return `${match.startTime} - ${match.endTime}`;

                        }

                    }

                }

            } catch (e) { }



            if (/morning|sokal|প্রভাতি/i.test(entryShift)) return "১০:০০ - ১:০০";

            if (/afternoon|bikal|দিবা/i.test(entryShift)) return "১:৩০ - ৪:৩০";

            return "১০:০০ - ১:০০";

        }



        const subjectTranslations = {

            "Bangla Bhashar Byakaran and Nirmiti": "বাংলা ব্যাকরণ ও নির্মিতি",

            "Bangla 2nd": "বাংলা ২য় পত্র",

            "Bangla 1st": "বাংলা ১ম পত্র",

            "Bangla Sahitya": "বাংলা সাহিত্য",

            "English For Today": "ইংরেজি ১ম পত্র",

            "English 1st": "ইংরেজি ১ম পত্র",

            "English Grammar and Composition": "ইংরেজি ২য় পত্র",

            "English 2nd": "ইংরেজি ২য় পত্র",

            "Mathematics": "গণিত",

            "Math": "গণিত",

            "Information And Communication Technology": "তথ্য ও যোগাযোগ প্রযুক্তি",

            "ICT": "তথ্য ও যোগাযোগ প্রযুক্তি",

            "Science": "বিজ্ঞান",

            "Physics": "পদার্থবিজ্ঞান",

            "Chemistry": "রসায়ন",

            "Biology": "জীববিজ্ঞান",

            "Higher Mathematics": "উচ্চতর গণিত",

            "Bangladesh And Global Studies": "বাংলাদেশ ও বিশ্বপরিচয়",

            "BGS": "বাংলাদেশ ও বিশ্বপরিচয়",

            "Islam And Moral Education": "ইসলাম ও নৈতিক শিক্ষা",

            "Islam & Moral Education": "ইসলাম ও নৈতিক শিক্ষা",

            "Islam": "ইসলাম ও নৈতিক শিক্ষা",

            "Islamic Studies": "ইসলাম ও নৈতিক শিক্ষা",

            "Hinduism And Moral Education": "হিন্দুধর্ম ও নৈতিক শিক্ষা",

            "Hinduism & Moral Education": "হিন্দুধর্ম ও নৈতিক শিক্ষা",

            "Hindu Religion Studies": "হিন্দুধর্ম ও নৈতিক শিক্ষা",

            "Hindu Religion": "হিন্দুধর্ম ও নৈতিক শিক্ষা",

            "Hindu": "হিন্দুধর্ম ও নৈতিক শিক্ষা",

            "Christianity And Moral Education": "খ্রিস্টধর্ম ও নৈতিক শিক্ষা",

            "Christian Religion and Moral Education": "খ্রিস্টধর্ম ও নৈতিক শিক্ষা",

            "Buddhism And Moral Education": "বৌদ্ধধর্ম ও নৈতিক শিক্ষা",

            "Buddhist Religion and Moral Education": "বৌদ্ধধর্ম ও নৈতিক শিক্ষা",

            "Arts And Crafts": "চারু ও কারুকলা",

            "Physical Education and Health": "শারীরিক শিক্ষা ও স্বাস্থ্য",

            "Work And Life Oriented Education": "কর্ম ও জীবনমুখী শিক্ষা",

            "Agriculture Studies/Higher Mathematics": "কৃষি শিক্ষা/উচ্চতর গণিত",

            "Agriculture Studies / Higher Mathematics": "কৃষি শিক্ষা/উচ্চতর গণিত",

            "Agri/H.Math": "কৃষি শিক্ষা/উচ্চতর গণিত",

            "AGRI/H.MATH": "কৃষি শিক্ষা/উচ্চতর গণিত",

            "Higher Mathematics": "উচ্চতর গণিত",

            "HMATH": "উচ্চতর গণিত",

            "Agriculture Studies": "কৃষি শিক্ষা",

            "AGRI": "কৃষি শিক্ষা",

            "Home Science": "গার্হস্থ্য বিজ্ঞান",

            "Accounting": "হিসাববিজ্ঞান",

            "Finance And Banking": "ফিন্যান্স ও ব্যাংকিং",

            "Business Entrepreneurship": "ব্যবসায় উদ্যোগ",

            "History": "ইতিহাস",

            "Geography": "भूগোল",

            "Civics": "পৌরনীতি",

            "Economics": "অর্থনীতি"

        };



        function translateSubject(subject) {

            if (!subject) return "";

            const cleaned = subject.trim().replace(/\s+/g, ' ');

            const lower = cleaned.toLowerCase();



            for (const key in subjectTranslations) {

                if (key.toLowerCase() === lower) {

                    return subjectTranslations[key];

                }

            }



            if (lower.includes("bangla 1st") || lower.includes("bangla sahitya") || lower.includes("বাংলা ১ম")) {

                return "বাংলা ১ম পত্র";

            }

            if (lower.includes("bangla 2nd") || lower.includes("grammar") && lower.includes("bangla") || lower.includes("byakaran") || lower.includes("বাংলা ২য়")) {

                return "বাংলা ২য় পত্র";

            }

            if (lower.includes("english 1st") || lower.includes("today") || lower.includes("ইংরেজি ১ম")) {

                return "ইংরেজি ১ম পত্র";

            }

            if (lower.includes("english 2nd") || lower.includes("grammar") && lower.includes("english") || lower.includes("ইংরেজি ২য়")) {

                return "ইংরেজি ২য় পত্র";

            }

            if (lower.includes("math") || lower.includes("গণিত")) {

                if (lower.includes("higher") || lower.includes("উচ্চতর")) {

                    return "উচ্চতর গণিত";

                }

                return "গণিত";

            }

            if (lower.includes("ict") || lower.includes("information") || lower.includes("তথ্য")) {

                return "তথ্য ও যোগাযোগ প্রযুক্তি";

            }

            if (lower.includes("physics") || lower.includes("পদার্থ")) {

                return "পদার্থবিজ্ঞান";

            }

            if (lower.includes("chemistry") || lower.includes("রসায়ন") || lower.includes("রসায়ন")) {

                return "রসায়ন";

            }

            if (lower.includes("biology") || lower.includes("জীব")) {

                return "জীববিজ্ঞান";

            }

            if (lower.includes("agriculture") || lower.includes("কৃষি")) {

                return "কৃষি শিক্ষা";

            }

            if (lower.includes("home science") || lower.includes("গার্হস্থ্য")) {

                return "গার্হস্থ্য বিজ্ঞান";

            }

            if (lower.includes("bgs") || lower.includes("global") || lower.includes("বিশ্বপরিচয়") || lower.includes("বিশ্বপরিচয়")) {

                return "বাংলাদেশ ও বিশ্বপরিচয়";

            }

            if (lower.includes("islam") || lower.includes("ইসলাম")) {

                return "ইসলাম ও নৈতিক শিক্ষা";

            }

            if (lower.includes("hindu") || lower.includes("हिंदू") || lower.includes("হিন্দু")) {

                return "হিন্দুধর্ম ও নৈতিক শিক্ষা";

            }

            if (lower.includes("religion") || lower.includes("ধর্ম")) {

                return "ধর্ম ও নৈতিক শিক্ষা";

            }

            if (lower.includes("accounting") || lower.includes("হিসাব")) {

                return "হিসাববিজ্ঞান";

            }

            if (lower.includes("finance") || lower.includes("ফিন্যান্স")) {

                return "ফিন্যান্স ও ব্যাংকিং";

            }

            if (lower.includes("business") || lower.includes("ব্যবসায়") || lower.includes("ব্যবসায়")) {

                return "ব্যবসায় উদ্যোগ";

            }

            if (lower.includes("history") || lower.includes("ইতিহাস")) {

                return "ইতিহাস";

            }

            if (lower.includes("geography") || lower.includes("ভূগোল")) {

                return "ভূগোল";

            }

            if (lower.includes("civics") || lower.includes("পৌরনীতি")) {

                return "পৌরনীতি";

            }

            if (lower.includes("economics") || lower.includes("অর্থনীতি")) {

                return "অর্থনীতি";

            }

            if (lower.includes("science") || lower.includes("বিজ্ঞান")) {

                return "বিজ্ঞান";

            }



            return subject;

        }



        function saveCustomInstructionHeader(element, lang) {

            if (!element) return;

            const text = element.innerText.trim();

            try {

                localStorage.setItem('school_admit_instruction_header_' + lang, text);

            } catch (e) { }

        }



        function saveCustomInstructionsHTML(element, lang) {

            if (!element) return;

            const html = element.innerHTML.trim();

            try {

                localStorage.setItem('school_admit_instructions_html_' + lang, html);

            } catch (e) { }

        }



        function toggleRulesEditorModal() {

            const panel = document.getElementById('rules-editor-panel');

            if (!panel) return;

            if (panel.style.display === 'none' || !panel.style.display) {

                panel.style.display = 'block';

                loadRulesEditorValues();

            } else {

                panel.style.display = 'none';

            }

        }



        function loadRulesEditorValues() {

            const lang = document.getElementById('filter-lang')?.value || 'bn';

            const defaultHeader = lang === 'en' ? 'Rules & Instructions for Candidates:' : (lang === 'both' ? 'পরীক্ষার্থীদের জন্য নিয়মাবলী (Rules & Instructions):' : 'পরীক্ষার্থীদের জন্য নিয়মাবলী:');

            const defaultRules = lang === 'en' ?

                "1. No candidate will be allowed without an Admit Card.\n2. Mobile phones or digital watches are strictly prohibited.\n3. Write Subject Code and Roll Number correctly on the answer sheet.\n4. Any attempt at unfair means will lead to cancellation of exam." :

                "১. প্রবেশপত্র ব্যতিত কোনো পরীক্ষার্থীকে পরীক্ষা কক্ষে প্রবেশ করতে দেয়া হবে না।\n২. পরীক্ষা কক্ষে কোনো প্রকার মোবাইল ফোন বা ডিজিটাল ঘড়ি আনা সম্পূর্ণ নিষিদ্ধ।\n৩. উত্তরপত্রের কভার পৃষ্ঠায় বিষয় কোড ও রোল নম্বর সঠিকভাবে লিখতে হবে।\n৪. অসদুপায় অবলম্বনের চেষ্টা করলে পরীক্ষা বাতিল করা হবে।";



            let customHeader = '';

            let customHTML = '';

            try {

                customHeader = localStorage.getItem('school_admit_instruction_header_' + lang) || '';

                customHTML = localStorage.getItem('school_admit_instructions_html_' + lang) || '';

            } catch (e) { }



            document.getElementById('rules-heading-input').value = customHeader || defaultHeader;



            if (customHTML) {

                const tempDiv = document.createElement('div');

                tempDiv.innerHTML = customHTML;

                const lis = tempDiv.querySelectorAll('li');

                if (lis.length > 0) {

                    document.getElementById('rules-body-input').value = Array.from(lis).map(li => li.innerText.trim()).join('\n');

                } else {

                    document.getElementById('rules-body-input').value = tempDiv.innerText.trim();

                }

            } else {

                document.getElementById('rules-body-input').value = defaultRules;

            }

        }



        function saveCustomRulesFromModal() {

            const lang = document.getElementById('filter-lang')?.value || 'bn';

            const headVal = document.getElementById('rules-heading-input').value.trim();

            const bodyVal = document.getElementById('rules-body-input').value.trim();



            if (headVal) {

                localStorage.setItem('school_admit_instruction_header_' + lang, headVal);

            }



            if (bodyVal) {

                const lines = bodyVal.split('\n').filter(l => l.trim() !== '');

                const html = lines.map(l => `<li>${l.trim()}</li>`).join('');

                localStorage.setItem('school_admit_instructions_html_' + lang, html);

            }



            renderAdmitCards();

            alert('পরীক্ষার্থীদের নিয়মাবলী সফলভাবে আপডেট করা হয়েছে!');

        }



        function resetCustomRules() {

            const lang = document.getElementById('filter-lang')?.value || 'bn';

            localStorage.removeItem('school_admit_instruction_header_' + lang);

            localStorage.removeItem('school_admit_instructions_html_' + lang);

            loadRulesEditorValues();

            renderAdmitCards();

            alert('ডিফল্ট নিয়মাবলী পুনঃস্থাপন করা হয়েছে!');

        }



        window.saveCustomInstructionHeader = saveCustomInstructionHeader;

        window.saveCustomInstructionsHTML = saveCustomInstructionsHTML;

        window.toggleRulesEditorModal = toggleRulesEditorModal;

        window.loadRulesEditorValues = loadRulesEditorValues;

        window.saveCustomRulesFromModal = saveCustomRulesFromModal;

        window.resetCustomRules = resetCustomRules;



        // --- PAGE VIEW & SHEET NAVIGATION STATE ---
        let currentSheetIndex = 0;
        let currentViewMode = 'page'; // 'page' or 'all'
        let currentZoomScale = 1.0;
        let totalSheetsCount = 0;

        function setViewMode(mode) {
            currentViewMode = mode;
            const btnPage = document.getElementById('btn-mode-page');
            const btnAll = document.getElementById('btn-mode-all');

            if (mode === 'page') {
                if (btnPage) {
                    btnPage.classList.add('btn-mode-active');
                    btnPage.style.background = '#059669';
                }
                if (btnAll) {
                    btnAll.classList.remove('btn-mode-active');
                    btnAll.style.background = '#64748b';
                }
            } else {
                if (btnPage) {
                    btnPage.classList.remove('btn-mode-active');
                    btnPage.style.background = '#64748b';
                }
                if (btnAll) {
                    btnAll.classList.add('btn-mode-active');
                    btnAll.style.background = '#059669';
                }
            }
            updateSheetDisplayVisibility();
        }

        function updateSheetDisplayVisibility() {
            const sheets = document.querySelectorAll('.sheet-duplex-set');
            sheets.forEach((sheet, idx) => {
                if (currentViewMode === 'all') {
                    sheet.style.display = 'flex';
                } else {
                    sheet.style.display = (idx === currentSheetIndex) ? 'flex' : 'none';
                }
                if (idx === currentSheetIndex) {
                    sheet.classList.add('active-sheet');
                } else {
                    sheet.classList.remove('active-sheet');
                }
            });

            updatePaginationButtons();
        }

        function updatePaginationButtons() {
            const btnFirst = document.getElementById('btn-first-sheet');
            const btnPrev = document.getElementById('btn-prev-sheet');
            const btnNext = document.getElementById('btn-next-sheet');
            const btnLast = document.getElementById('btn-last-sheet');
            const select = document.getElementById('sheet-jump-select');

            if (btnFirst) btnFirst.disabled = (currentSheetIndex === 0 || totalSheetsCount <= 1);
            if (btnPrev) btnPrev.disabled = (currentSheetIndex === 0 || totalSheetsCount <= 1);
            if (btnNext) btnNext.disabled = (currentSheetIndex >= totalSheetsCount - 1 || totalSheetsCount <= 1);
            if (btnLast) btnLast.disabled = (currentSheetIndex >= totalSheetsCount - 1 || totalSheetsCount <= 1);

            if (select && select.value !== String(currentSheetIndex)) {
                select.value = currentSheetIndex;
            }
        }

        function goToSheet(index) {
            if (totalSheetsCount === 0) return;
            currentSheetIndex = Math.max(0, Math.min(index, totalSheetsCount - 1));
            updateSheetDisplayVisibility();

            const activeSheet = document.getElementById('sheet-set-' + currentSheetIndex);
            if (activeSheet && currentViewMode === 'all') {
                activeSheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function changeSheet(delta) {
            goToSheet(currentSheetIndex + delta);
        }

        function goToLastSheet() {
            goToSheet(totalSheetsCount - 1);
        }

        function setZoomLevel(scale) {
            const zoomContainer = document.getElementById('cards-zoom-container');
            const zoomLabel = document.getElementById('zoom-level-label');
            const btnFit = document.getElementById('btn-zoom-fit');
            const btn100 = document.getElementById('btn-zoom-100');

            if (scale === 'fit') {
                const availableWidth = window.innerWidth - 60;
                const targetWidth = (currentViewMode === 'page' && window.innerWidth >= 900) ? 1680 : 820;
                const fitScale = Math.min(1.0, Math.max(0.42, (availableWidth / targetWidth)));
                currentZoomScale = Math.round(fitScale * 100) / 100;
                if (btnFit) btnFit.classList.add('active-zoom');
                if (btn100) btn100.classList.remove('active-zoom');
            } else {
                currentZoomScale = Math.max(0.35, Math.min(1.5, parseFloat(scale)));
                if (btnFit) btnFit.classList.remove('active-zoom');
                if (btn100) {
                    if (currentZoomScale === 1.0) btn100.classList.add('active-zoom');
                    else btn100.classList.remove('active-zoom');
                }
            }

            if (zoomContainer) {
                zoomContainer.style.transform = `scale(${currentZoomScale})`;
            }
            if (zoomLabel) {
                zoomLabel.innerText = `${Math.round(currentZoomScale * 100)}%`;
            }
        }

        function adjustZoom(delta) {
            setZoomLevel(Math.round((currentZoomScale + delta) * 10) / 10);
        }

        function printAllSheets() {
            const container = document.getElementById('dynamic-cards-container');
            const sheets = container ? container.querySelectorAll('.sheet-duplex-set') : [];

            if (!container || sheets.length === 0) {
                alert('প্রিন্ট বা সেভ করার মতো কোনো প্রবেশপত্র পাওয়া যায়নি!');
                return;
            }

            const printWin = window.open('', '_blank');
            if (!printWin) {
                alert('পপ-আপ ব্লক করা হয়েছে! দয়া করে আপনার ব্রাউজারে পপ-আপ অনুমোদন (Allow Pop-ups) করুন।');
                return;
            }

            let stylesHtml = '';
            document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
                if (el.id === 'routine-print-style') return;
                stylesHtml += el.outerHTML;
            });

            let cardsContentHtml = '';
            sheets.forEach(sheet => {
                const clone = sheet.cloneNode(true);
                clone.style.display = 'flex';
                cardsContentHtml += clone.outerHTML;
            });

            const examVal = document.getElementById('filter-exam')?.value || 'admit_cards';
            const classVal = document.getElementById('filter-class')?.value || 'all';
            const pageTitle = `Admit_Cards_${classVal}_${examVal}`;

            const docHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Galada&family=Poppins:wght@400;600;700;800;900&family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Noto+Rashi+Hebrew:wght@600;700;800;900&display=swap" rel="stylesheet">
    ${stylesHtml}
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Noto Sans Bengali', sans-serif;
            color: #1e293b;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .preview-sticky-toolbar {
            position: sticky;
            top: 0;
            z-index: 99999;
            width: 100%;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1.5px solid #334155;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            box-sizing: border-box;
            color: #ffffff;
        }

        .toolbar-info {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.05rem;
            font-weight: 800;
        }

        .toolbar-badge {
            background: #0284c7;
            color: #ffffff;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .tb-btn {
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.92rem;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            text-decoration: none;
        }

        .tb-btn:hover {
            transform: translateY(-1px);
        }

        .tb-btn-save {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .tb-btn-print {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }

        .tb-btn-close {
            background: #334155;
            color: #e2e8f0;
        }
        .tb-btn-close:hover {
            background: #ef4444;
            color: #ffffff;
        }

        .preview-pages-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 0 60px 0;
            gap: 24px;
            box-sizing: border-box;
        }

        .preview-pages-wrapper .sheet-duplex-set {
            display: flex !important;
            margin-bottom: 25px !important;
        }

        .preview-pages-wrapper .sheet-badge,
        .preview-pages-wrapper .sheet-summary-banner {
            display: none !important;
        }

        /* Floating Print Button (Screen Only) */
        .floating-print-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            padding: 12px 22px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 8px 25px rgba(2, 132, 199, 0.48), 0 2px 6px rgba(0,0,0,0.15);
            border: 2px solid rgba(255, 255, 255, 0.85);
            cursor: pointer;
            z-index: 999999;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            outline: none;
            font-size: 0.95rem;
            font-weight: 800;
            font-family: inherit;
        }

        .floating-print-btn:hover {
            background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
            transform: translateY(-4px) scale(1.03);
            box-shadow: 0 12px 30px rgba(2, 132, 199, 0.65), 0 4px 10px rgba(0,0,0,0.2);
        }

        .floating-print-btn:active {
            transform: translateY(0) scale(0.97);
        }

        .floating-print-btn svg {
            width: 22px;
            height: 22px;
            stroke: #ffffff;
            stroke-width: 2.2;
            fill: none;
            flex-shrink: 0;
            transition: transform 0.2s ease;
        }

        .floating-print-btn:hover svg {
            transform: scale(1.12);
        }

        @keyframes printSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0mm !important;
            }

            html, body {
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 auto !important;
                width: 210mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-sizing: border-box !important;
                visibility: visible !important;
            }

            .floating-print-btn,
            .preview-sticky-toolbar,
            .sheet-badge,
            .sheet-summary-banner,
            .no-print {
                display: none !important;
                visibility: hidden !important;
            }

            .preview-pages-wrapper {
                padding: 0 !important;
                margin: 0 auto !important;
                gap: 0 !important;
                display: block !important;
                width: 100% !important;
                max-width: 210mm !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper .sheet-duplex-set {
                margin: 0 auto !important;
                padding: 0 !important;
                display: block !important;
                width: 100% !important;
                max-width: 210mm !important;
                page-break-inside: auto !important;
                break-inside: auto !important;
                page-break-after: auto !important;
                break-after: auto !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper .sheet-duplex-grid,
            .preview-pages-wrapper .sheet-column {
                display: block !important;
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 210mm !important;
                visibility: visible !important;
            }

            .a4-page {
                box-shadow: none !important;
                border: none !important;
                margin: 0 auto !important;
                padding: 6mm 8mm !important;
                width: 210mm !important;
                max-width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                background: #ffffff !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper > .sheet-duplex-set:last-child .sheet-column:last-child .a4-page,
            .a4-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }

            .card {
                width: 100% !important;
                height: 137mm !important;
                max-height: 137mm !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                overflow: hidden !important;
                background: #ffffff !important;
                visibility: visible !important;
            }
        }
    </style>
</head>
<body>
    <!-- Floating Print Button (Screen Only) -->
    <button type="button" class="floating-print-btn no-print" onclick="triggerHardcopyPrint()" title="প্রবেশপত্র ও রুটিন প্রিন্ট করুন (Ctrl + P)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>প্রিন্ট করুন (Print)</span>
    </button>

    <div class="preview-sticky-toolbar no-print">
        <div class="toolbar-info">
            <span>🪪 প্রবেশপত্র ও রুটিন প্রিন্ট প্রিভিউ</span>
            <span class="toolbar-badge">মোট শিট: ${sheets.length} টি (${sheets.length * 2} পৃষ্ঠা)</span>
        </div>
        <div class="toolbar-actions">
            <button id="btn-win-save" class="tb-btn tb-btn-save" onclick="saveAsPDF()" title="সরাসরি PDF ফাইল আকারে সেভ / ডাউনলোড করুন">
                💾 Save (PDF সেভ করুন)
            </button>
            <button id="btn-win-print" class="tb-btn tb-btn-print" onclick="triggerHardcopyPrint()" title="প্রিন্টারে সরাসরি প্রিন্ট দিন (Ctrl + P)">
                🖨️ প্রিন্ট করুন (Print)
            </button>
            <button class="tb-btn tb-btn-close" onclick="window.close()" title="উইন্ডো বন্ধ করুন">
                ✖ বন্ধ করুন
            </button>
        </div>
    </div>

    <div class="preview-pages-wrapper">
        ${cardsContentHtml}
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
    <script>
        async function saveAsPDF() {
            const btn = document.getElementById('btn-win-save');
            const originalText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = '⚡ PDF প্রস্তুত হচ্ছে...';
                btn.disabled = true;
            }

            try {
                const pages = document.querySelectorAll('.a4-page');
                const JsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;

                if (JsPDFConstructor && typeof html2canvas !== 'undefined') {
                    const pdf = new JsPDFConstructor({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                        compress: true
                    });

                    const batchSize = 3;
                    for (let i = 0; i < pages.length; i += batchSize) {
                        if (btn) {
                            btn.innerHTML = '⚡ প্রস্তুত হচ্ছে (' + Math.min(i + batchSize, pages.length) + '/' + pages.length + ')...';
                        }

                        const batchPromises = [];
                        for (let j = i; j < Math.min(i + batchSize, pages.length); j++) {
                            batchPromises.push((async (pageIndex) => {
                                const pageEl = pages[pageIndex];
                                const canvas = await html2canvas(pageEl, {
                                    scale: 1.25,
                                    useCORS: true,
                                    allowTaint: true,
                                    logging: false,
                                    backgroundColor: '#ffffff',
                                    removeContainer: true,
                                    imageTimeout: 0
                                });
                                return { index: pageIndex, dataUrl: canvas.toDataURL('image/jpeg', 0.78) };
                            })(j));
                        }

                        const batchResults = await Promise.all(batchPromises);
                        batchResults.sort((a, b) => a.index - b.index);

                        batchResults.forEach(res => {
                            if (res.index > 0) {
                                pdf.addPage('a4', 'portrait');
                            }
                            pdf.addImage(res.dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
                        });
                    }

                    pdf.save('${pageTitle}.pdf');

                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                    return;
                }

                triggerHardcopyPrint();
            } catch (err) {
                console.error('PDF save error:', err);
                triggerHardcopyPrint();
            } finally {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        }

        async function triggerHardcopyPrint() {
            const btn = document.getElementById('btn-win-print');
            const floatingBtn = document.querySelector('.floating-print-btn');
            const originalText = btn ? btn.innerHTML : '';
            const originalFloatingHtml = floatingBtn ? floatingBtn.innerHTML : '';

            if (btn) {
                btn.innerHTML = '⏳ প্রিন্ট প্রস্তুত হচ্ছে...';
                btn.disabled = true;
            }
            if (floatingBtn) {
                floatingBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation: printSpin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><span>প্রস্তুত হচ্ছে...</span>';
                floatingBtn.style.pointerEvents = 'none';
            }

            try {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }
            } catch (e) { }

            // Ensure all images (logo, signature, photo) are fully loaded
            const imgs = Array.from(document.images);
            await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));

            // Short paint settling delay
            await new Promise(r => setTimeout(r, 200));

            window.focus();
            window.print();

            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
                if (floatingBtn) {
                    floatingBtn.innerHTML = originalFloatingHtml;
                    floatingBtn.style.pointerEvents = 'auto';
                }
            }, 1000);
        }

        // Add Ctrl+P / Cmd+P listener
        window.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                triggerHardcopyPrint();
            }
        });
    <\/script>
</body>
</html>`;

            printWin.document.open();
            printWin.document.write(docHtml);
            printWin.document.close();
        }

        function printCurrentSheet() {
            const activeSheet = document.querySelector('.sheet-duplex-set.active-sheet') || document.querySelector('.sheet-duplex-set');

            if (!activeSheet) {
                alert('প্রিন্ট করার মতো কোনো প্রবেশপত্র পাওয়া যায়নি!');
                return;
            }

            const printWin = window.open('', '_blank');
            if (!printWin) {
                alert('পপ-আপ ব্লক করা হয়েছে! দয়া করে আপনার ব্রাউজারে পপ-আপ অনুমোদন (Allow Pop-ups) করুন।');
                return;
            }

            let stylesHtml = '';
            document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
                if (el.id === 'routine-print-style') return;
                stylesHtml += el.outerHTML;
            });

            const examVal = document.getElementById('filter-exam')?.value || 'admit_cards';
            const classVal = document.getElementById('filter-class')?.value || 'all';
            const pageTitle = `Admit_Card_${classVal}_${examVal}_Current`;

            const docHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Galada&family=Poppins:wght@400;600;700;800;900&family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Noto+Rashi+Hebrew:wght@600;700;800;900&display=swap" rel="stylesheet">
    ${stylesHtml}
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Noto Sans Bengali', sans-serif;
            color: #1e293b;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .preview-sticky-toolbar {
            position: sticky;
            top: 0;
            z-index: 99999;
            width: 100%;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1.5px solid #334155;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            box-sizing: border-box;
            color: #ffffff;
        }

        .toolbar-info {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.05rem;
            font-weight: 800;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .tb-btn {
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.92rem;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            text-decoration: none;
        }

        .tb-btn:hover {
            transform: translateY(-1px);
        }

        .tb-btn-save {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .tb-btn-print {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }

        .tb-btn-close {
            background: #334155;
            color: #e2e8f0;
        }
        .tb-btn-close:hover {
            background: #ef4444;
            color: #ffffff;
        }

        .preview-pages-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 0 60px 0;
            gap: 24px;
            box-sizing: border-box;
        }

        .preview-pages-wrapper .sheet-duplex-set {
            display: flex !important;
            margin-bottom: 25px !important;
        }

        .preview-pages-wrapper .sheet-badge,
        .preview-pages-wrapper .sheet-summary-banner {
            display: none !important;
        }

        /* Floating Print Button (Screen Only) */
        .floating-print-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            padding: 12px 22px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 8px 25px rgba(2, 132, 199, 0.48), 0 2px 6px rgba(0,0,0,0.15);
            border: 2px solid rgba(255, 255, 255, 0.85);
            cursor: pointer;
            z-index: 999999;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            outline: none;
            font-size: 0.95rem;
            font-weight: 800;
            font-family: inherit;
        }

        .floating-print-btn:hover {
            background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
            transform: translateY(-4px) scale(1.03);
            box-shadow: 0 12px 30px rgba(2, 132, 199, 0.65), 0 4px 10px rgba(0,0,0,0.2);
        }

        .floating-print-btn:active {
            transform: translateY(0) scale(0.97);
        }

        .floating-print-btn svg {
            width: 22px;
            height: 22px;
            stroke: #ffffff;
            stroke-width: 2.2;
            fill: none;
            flex-shrink: 0;
            transition: transform 0.2s ease;
        }

        .floating-print-btn:hover svg {
            transform: scale(1.12);
        }

        @keyframes printSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0mm !important;
            }

            html, body {
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 auto !important;
                width: 210mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-sizing: border-box !important;
                visibility: visible !important;
            }

            .floating-print-btn,
            .preview-sticky-toolbar,
            .sheet-badge,
            .sheet-summary-banner,
            .no-print {
                display: none !important;
                visibility: hidden !important;
            }

            .preview-pages-wrapper {
                padding: 0 !important;
                margin: 0 auto !important;
                gap: 0 !important;
                display: block !important;
                width: 100% !important;
                max-width: 210mm !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper .sheet-duplex-set {
                margin: 0 auto !important;
                padding: 0 !important;
                display: block !important;
                width: 100% !important;
                max-width: 210mm !important;
                page-break-inside: auto !important;
                break-inside: auto !important;
                page-break-after: auto !important;
                break-after: auto !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper .sheet-duplex-grid,
            .preview-pages-wrapper .sheet-column {
                display: block !important;
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 210mm !important;
                visibility: visible !important;
            }

            .a4-page {
                box-shadow: none !important;
                border: none !important;
                margin: 0 auto !important;
                padding: 6mm 8mm !important;
                width: 210mm !important;
                max-width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                background: #ffffff !important;
                visibility: visible !important;
            }

            .preview-pages-wrapper > .sheet-duplex-set:last-child .sheet-column:last-child .a4-page,
            .a4-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }

            .card {
                width: 100% !important;
                height: 137mm !important;
                max-height: 137mm !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                overflow: hidden !important;
                background: #ffffff !important;
                visibility: visible !important;
            }
        }
    </style>
</head>
<body>
    <!-- Floating Print Button (Screen Only) -->
    <button type="button" class="floating-print-btn no-print" onclick="triggerHardcopyPrint()" title="প্রবেশপত্র ও রুটিন প্রিন্ট করুন (Ctrl + P)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>প্রিন্ট করুন (Print)</span>
    </button>

    <div class="preview-sticky-toolbar no-print">
        <div class="toolbar-info">
            <span>🪪 বর্তমান প্রবেশপত্র পাতা প্রিভিউ (১টি শিট - ২ পৃষ্ঠা)</span>
        </div>
        <div class="toolbar-actions">
            <button id="btn-win-save-curr" class="tb-btn tb-btn-save" onclick="saveAsPDF()" title="সরাসরি PDF ফাইল আকারে সেভ / ডাউনলোড করুন">
                💾 Save (PDF সেভ করুন)
            </button>
            <button id="btn-win-print-curr" class="tb-btn tb-btn-print" onclick="triggerHardcopyPrint()" title="প্রিন্টারে সরাসরি প্রিন্ট দিন (Ctrl + P)">
                🖨️ প্রিন্ট করুন (Print)
            </button>
            <button class="tb-btn tb-btn-close" onclick="window.close()" title="উইন্ডো বন্ধ করুন">
                ✖ বন্ধ করুন
            </button>
        </div>
    </div>

    <div class="preview-pages-wrapper">
        ${activeSheet.outerHTML}
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
    <script>
        async function saveAsPDF() {
            const btn = document.getElementById('btn-win-save-curr');
            const originalText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = '⚡ PDF প্রস্তুত হচ্ছে...';
                btn.disabled = true;
            }

            try {
                const pages = document.querySelectorAll('.a4-page');
                const JsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;

                if (JsPDFConstructor && typeof html2canvas !== 'undefined') {
                    const pdf = new JsPDFConstructor({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                        compress: true
                    });

                    for (let i = 0; i < pages.length; i++) {
                        const pageEl = pages[i];
                        const canvas = await html2canvas(pageEl, {
                            scale: 1.25,
                            useCORS: true,
                            allowTaint: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            removeContainer: true,
                            imageTimeout: 0
                        });
                        const imgData = canvas.toDataURL('image/jpeg', 0.78);
                        if (i > 0) {
                            pdf.addPage('a4', 'portrait');
                        }
                        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
                    }

                    pdf.save('${pageTitle}.pdf');

                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                    return;
                }

                triggerHardcopyPrint();
            } catch (err) {
                console.error('PDF save error:', err);
                triggerHardcopyPrint();
            } finally {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        }

        async function triggerHardcopyPrint() {
            const btn = document.getElementById('btn-win-print-curr');
            const floatingBtn = document.querySelector('.floating-print-btn');
            const originalText = btn ? btn.innerHTML : '';
            const originalFloatingHtml = floatingBtn ? floatingBtn.innerHTML : '';

            if (btn) {
                btn.innerHTML = '⏳ প্রিন্ট লোড হচ্ছে...';
                btn.disabled = true;
            }
            if (floatingBtn) {
                floatingBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation: printSpin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><span>প্রস্তুত হচ্ছে...</span>';
                floatingBtn.style.pointerEvents = 'none';
            }

            try {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }
            } catch (e) { }

            // Ensure all images (logo, signature, photo) are fully loaded
            const imgs = Array.from(document.images);
            await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));

            // Short paint settling delay
            await new Promise(r => setTimeout(r, 200));

            window.focus();
            window.print();

            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
                if (floatingBtn) {
                    floatingBtn.innerHTML = originalFloatingHtml;
                    floatingBtn.style.pointerEvents = 'auto';
                }
            }, 1000);
        }

        // Add Ctrl+P / Cmd+P listener
        window.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                triggerHardcopyPrint();
            }
        });
    <\/script>
</body>
</html>`;

            printWin.document.open();
            printWin.document.write(docHtml);
            printWin.document.close();
        }

        window.goToSheet = goToSheet;
        window.changeSheet = changeSheet;
        window.goToLastSheet = goToLastSheet;
        window.setViewMode = setViewMode;
        window.setZoomLevel = setZoomLevel;
        window.adjustZoom = adjustZoom;
        window.printAllSheets = printAllSheets;
        window.printCurrentSheet = printCurrentSheet;

        async function downloadAdmitCardPDF() {
            const container = document.getElementById('dynamic-cards-container');
            const sheets = container ? container.querySelectorAll('.sheet-duplex-set') : [];
            const pages = container ? container.querySelectorAll('.a4-page') : [];

            if (!container || pages.length === 0) {
                alert('ডাউনলোড করার মতো কোনো প্রবেশপত্র পাওয়া যায়নি!');
                return;
            }

            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready;
                } catch (e) { }
            }

            const examVal = document.getElementById('filter-exam')?.value || 'admit_cards';
            const classVal = document.getElementById('filter-class')?.value || 'all';
            const safeExamName = (examVal === 'all' ? 'Admit_Cards' : examVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');
            const safeClassName = (classVal === 'all' ? 'All_Classes' : classVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');
            const fileName = `Admit_Card_${safeClassName}_${safeExamName}.pdf`;

            const btn = document.getElementById('btn-download-pdf');
            const originalBtnText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = '⚡ দ্রুত প্রস্তুত হচ্ছে...';
                btn.disabled = true;
            }

            const originalDisplayStyles = [];
            sheets.forEach(s => {
                originalDisplayStyles.push(s.style.display);
                s.style.display = 'flex';
            });

            // Reset zoom container transform temporarily during PDF capture
            const zoomContainer = document.getElementById('cards-zoom-container');
            const originalZoomTransform = zoomContainer ? zoomContainer.style.transform : '';
            if (zoomContainer) zoomContainer.style.transform = 'none';

            try {
                const JsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;

                if (JsPDFConstructor && typeof html2canvas !== 'undefined') {
                    const pdf = new JsPDFConstructor({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                        compress: true
                    });

                    const batchSize = 3;
                    for (let i = 0; i < pages.length; i += batchSize) {
                        if (btn) {
                            btn.innerHTML = `⚡ সুপার-ফাস্ট প্রস্তুত হচ্ছে (${Math.min(i + batchSize, pages.length)}/${pages.length})...`;
                        }

                        const batchPromises = [];
                        for (let j = i; j < Math.min(i + batchSize, pages.length); j++) {
                            batchPromises.push((async (pageIndex) => {
                                const pageEl = pages[pageIndex];
                                const canvas = await html2canvas(pageEl, {
                                    scale: 1.25,
                                    useCORS: true,
                                    allowTaint: true,
                                    logging: false,
                                    backgroundColor: '#ffffff',
                                    removeContainer: true,
                                    imageTimeout: 0
                                });
                                return { index: pageIndex, dataUrl: canvas.toDataURL('image/jpeg', 0.78) };
                            })(j));
                        }

                        const batchResults = await Promise.all(batchPromises);
                        batchResults.sort((a, b) => a.index - b.index);

                        batchResults.forEach(res => {
                            if (res.index > 0) {
                                pdf.addPage('a4', 'portrait');
                            }
                            pdf.addImage(res.dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
                        });
                    }

                    pdf.save(fileName);

                    if (btn) {
                        btn.innerHTML = originalBtnText;
                        btn.disabled = false;
                    }

                    // Restore display styles & zoom
                    sheets.forEach((s, idx) => {
                        s.style.display = originalDisplayStyles[idx];
                    });
                    if (zoomContainer) zoomContainer.style.transform = originalZoomTransform;
                    return;
                }

                if (typeof html2pdf !== 'undefined') {
                    const opt = {
                        margin: 0,
                        filename: fileName,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            logging: false,
                            backgroundColor: '#ffffff'
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['css', 'legacy'] }
                    };

                    await html2pdf().set(opt).from(container).save();

                    if (btn) {
                        btn.innerHTML = originalBtnText;
                        btn.disabled = false;
                    }
                    sheets.forEach((s, idx) => {
                        s.style.display = originalDisplayStyles[idx];
                    });
                    if (zoomContainer) zoomContainer.style.transform = originalZoomTransform;
                    return;
                }

                throw new Error('PDF Engine not loaded');
            } catch (err) {
                console.error('PDF Generation Error:', err);
                if (btn) {
                    btn.innerHTML = originalBtnText;
                    btn.disabled = false;
                }
                sheets.forEach((s, idx) => {
                    s.style.display = originalDisplayStyles[idx];
                });
                if (zoomContainer) zoomContainer.style.transform = originalZoomTransform;
                alert('সরাসরি ব্রাউজার প্রিন্ট ডায়ালগ থেকে "Destination: Save as PDF" সিলেক্ট করে সংরক্ষণ করতে পারেন।');
                window.print();
            }
        }

        window.downloadAdmitCardPDF = downloadAdmitCardPDF;

        function translateExamName(name) {

            if (!name) return "পরীক্ষা ২০২৬";

            let translated = name;

            translated = translated.replace(/Half-Yearly Examination/gi, "অর্ধ-বার্ষিক পরীক্ষা");

            translated = translated.replace(/Yearly Examination/gi, "বার্ষিক পরীক্ষা");

            translated = translated.replace(/Annual Examination/gi, "বার্ষিক পরীক্ষা");

            translated = translated.replace(/First Term Exam/gi, "প্রথম সাময়িক পরীক্ষা");

            return translated;

        }



        function updateAdmitCardFontSize(val) {

            const fontVal = parseFloat(val) || 13;

            const sizeValSpan = document.getElementById('font-size-val');

            if (sizeValSpan) sizeValSpan.innerText = `${fontVal}px`;



            const sliderEl = document.getElementById('font-size-slider');

            if (sliderEl) sliderEl.value = fontVal;



            const scale = fontVal / 13;



            let styleEl = document.getElementById('dynamic-admit-font-style');

            if (!styleEl) {

                styleEl = document.createElement('style');

                styleEl.id = 'dynamic-admit-font-style';

                document.head.appendChild(styleEl);

            }



            styleEl.innerHTML = `

                .card {

                    font-size: ${fontVal}px !important;

                }

                .info-table td {

                    font-size: calc(13.39px * ${scale}) !important;

                    padding: 0px 2px !important;

                    vertical-align: middle !important;

                }

                .info-table tr.name-row td {

                    vertical-align: middle !important;

                }

                .info-table tr.name-row td:last-child {

                    font-size: calc(18.5px * ${scale}) !important;

                    font-weight: 700 !important;

                    vertical-align: middle !important;

                }

                .info-table tr.name-bn td:last-child {

                    font-size: calc(21.25px * ${scale}) !important;

                    font-weight: 800 !important;

                    vertical-align: middle !important;

                }

                .info-table tr.name-row td.label,

                .info-table tr.name-row td.colon {

                    font-size: calc(13.15px * ${scale}) !important;

                    font-weight: 600 !important;

                    vertical-align: middle !important;

                }

                .shift-box {
                    font-size: calc(19.8px * ${scale}) !important;
                    font-family: 'Galada', cursive, sans-serif !important;
                }

                .info-table td.label {

                    font-size: calc(12.88px * ${scale}) !important;

                }

                .header-text h1 {

                    font-size: calc(18.95px * ${scale}) !important;

                    white-space: normal !important;

                    word-wrap: break-word !important;

                    line-height: 1.25 !important;

                    width: 100% !important;

                    text-align: center !important;

                }

                .header-text p {

                    font-size: calc(13.34px * ${scale}) !important;

                }

                .exam-subtitle {

                    font-size: calc(19.65px * ${scale}) !important;

                }

                .exam-title {

                    font-size: calc(21.03px * ${scale}) !important;

                }

                .instructions-box {

                    font-size: calc(10.5px * ${scale}) !important;

                }

                .instructions-box h4 {

                    font-size: calc(14.72px * ${scale}) !important;

                }

                .routine-header h2 {

                    font-size: calc(18px * ${scale}) !important;

                }

                .routine-table th, .routine-table td {

                    font-size: calc(12.5px * ${scale}) !important;

                    padding: calc(3px * ${scale}) calc(5px * ${scale}) !important;

                }

                .sig-line {

                    font-size: calc(14.02px * ${scale}) !important;

                }

            `;



            try {

                localStorage.setItem('admit_card_font_size', fontVal);

            } catch (e) { }

        }



        // Initialize and populate filters
        document.addEventListener('DOMContentLoaded', () => {
            const isInIframe = window.self !== window.top;
            const backBtn = document.getElementById('btn-back-to-seat-plan');
            if (isInIframe && backBtn) {
                backBtn.style.display = 'none';
            }

            populateClassFilter();
            populateExamFilter();
            populateShiftFilter();

            const savedFontSize = localStorage.getItem('admit_card_font_size') || '13';
            updateAdmitCardFontSize(savedFontSize);

            renderAdmitCards();

            // Auto-fit zoom if running inside preview iframe or on narrow screens
            if (isInIframe || window.innerWidth < 1400) {
                setTimeout(() => {
                    setZoomLevel('fit');
                }, 100);
            }
        });



        function refreshAdmitCardsData() {

            populateExamFilter();

            populateShiftFilter();

            renderAdmitCards();

        }

        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'school_seat_plans_store' || e.key === 'school_exam_routines' || e.key === 'school_shift_times' || e.key === 'school_exam_types' || e.key === 'school_students' || e.key === 'school_staff') {
                refreshAdmitCardsData();
            }
        });

        window.addEventListener('dbSynced', refreshAdmitCardsData);



        function isExamMatching(planExam, selectedExam) {
            if (!selectedExam || selectedExam === 'all' || selectedExam === 'All') return true;
            if (!planExam) return false;
            const p = planExam.toLowerCase().trim();
            const s = selectedExam.toLowerCase().trim();
            if (p === s || p.includes(s) || s.includes(p)) return true;
            const pTrans = (translateExamName(planExam) || '').toLowerCase().trim();
            const sTrans = (translateExamName(selectedExam) || '').toLowerCase().trim();
            return pTrans === sTrans || p === sTrans || pTrans === s || pTrans.includes(sTrans) || sTrans.includes(pTrans);
        }

        function getRoutineForStudent(student, routines, selectedExam = 'all') {
            if (!student || !student.class) return null;

            const className = (student.class || '').trim();
            const sectionName = (student.section || '').trim();
            const groupName = (student.roll || '').trim();

            const isNineOrTen = /nine|ten|9|10|নবম|দশম/i.test(className);

            // Filter routines that match the class name
            const matchingClassRoutines = routines.filter(r => {
                if (!r || !r.class) return false;
                const rc = r.class.toLowerCase().trim();
                const sc = className.toLowerCase().trim();
                return rc === sc || rc.startsWith(sc + ' ') || rc.startsWith(sc + '-') || rc.includes(sc);
            });

            if (matchingClassRoutines.length === 0) return null;

            let candidateRoutines = matchingClassRoutines;

            // For Class 9 and 10 (or whenever section/department is specified in routine class e.g. "Nine - বিজ্ঞান")
            if (isNineOrTen || matchingClassRoutines.some(r => r.class && (r.class.includes('-') || r.class.includes('(')))) {
                const secLower = sectionName.toLowerCase();
                const grpLower = groupName.toLowerCase();

                let sectionMatched = [];

                // 1. Check student.section first (primary requirement)
                if (secLower.includes('ব্যবসায়') || secLower.includes('বাণিজ্য') || secLower.includes('business') || secLower.includes('commerce')) {
                    sectionMatched = matchingClassRoutines.filter(r => {
                        const rc = (r.class || '').toLowerCase();
                        return rc.includes('ব্যবসায়') || rc.includes('বাণিজ্য') || rc.includes('business') || rc.includes('commerce');
                    });
                } else if (secLower.includes('বিজ্ঞান') || secLower.includes('science')) {
                    sectionMatched = matchingClassRoutines.filter(r => {
                        const rc = (r.class || '').toLowerCase();
                        return rc.includes('বিজ্ঞান') || rc.includes('science');
                    });
                } else if (secLower.includes('মানবিক') || secLower.includes('humanities') || secLower.includes('arts')) {
                    sectionMatched = matchingClassRoutines.filter(r => {
                        const rc = (r.class || '').toLowerCase();
                        return rc.includes('মানবিক') || rc.includes('humanities') || rc.includes('arts');
                    });
                } else if (sectionName) {
                    const direct = matchingClassRoutines.filter(r => (r.class || '').toLowerCase().includes(secLower));
                    if (direct.length > 0) {
                        sectionMatched = direct;
                    }
                }

                // 2. Fallback to student.roll (group) if section didn't match
                if (sectionMatched.length === 0) {
                    if (grpLower.includes('ব্যবসায়') || grpLower.includes('বাণিজ্য') || grpLower.includes('business')) {
                        sectionMatched = matchingClassRoutines.filter(r => {
                            const rc = (r.class || '').toLowerCase();
                            return rc.includes('ব্যবসায়') || rc.includes('বাণিজ্য') || rc.includes('business');
                        });
                    } else if (grpLower.includes('বিজ্ঞান') || grpLower.includes('science')) {
                        sectionMatched = matchingClassRoutines.filter(r => {
                            const rc = (r.class || '').toLowerCase();
                            return rc.includes('বিজ্ঞান') || rc.includes('science');
                        });
                    } else if (grpLower.includes('মানবিক') || grpLower.includes('humanities')) {
                        sectionMatched = matchingClassRoutines.filter(r => {
                            const rc = (r.class || '').toLowerCase();
                            return rc.includes('মানবিক') || rc.includes('humanities');
                        });
                    }
                }

                if (sectionMatched.length > 0) {
                    candidateRoutines = sectionMatched;
                }
            }

            // Filter by Exam Name if selected
            let targetExam = selectedExam;
            let filteredRoutines = [];

            if (selectedExam !== 'all') {
                filteredRoutines = candidateRoutines.filter(r => !r.examName || isExamMatching(r.examName, selectedExam));
                if (filteredRoutines.length === 0) {
                    filteredRoutines = candidateRoutines;
                } else {
                    targetExam = selectedExam;
                }
            } else {
                const examNameCounts = {};
                candidateRoutines.forEach(r => {
                    if (r.examName) examNameCounts[r.examName] = (examNameCounts[r.examName] || 0) + 1;
                });
                if (Object.keys(examNameCounts).length > 0) {
                    targetExam = Object.keys(examNameCounts).reduce((a, b) => examNameCounts[a] > examNameCounts[b] ? a : b);
                    filteredRoutines = candidateRoutines.filter(r => r.examName === targetExam);
                } else {
                    targetExam = candidateRoutines[0].examName || "পরীক্ষা ২০২৬";
                    filteredRoutines = candidateRoutines;
                }
            }

            return {
                examName: targetExam,
                schedule: filteredRoutines.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
            };
        }

        function getRoutineForClass(className, routines, selectedExam = 'all', sectionName = '', groupName = '') {
            return getRoutineForStudent({ class: className, section: sectionName, roll: groupName }, routines, selectedExam);
        }

        function populateClassFilter() {
            const classSelect = document.getElementById('filter-class');
            if (!classSelect) return;
            const currentSelected = classSelect.value;
            classSelect.innerHTML = '<option value="all">All Classes</option>';

            let classesList = [];
            try {
                classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');
            } catch (e) { }

            if (classesList.length === 0) {
                classesList = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            }

            classesList.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls;
                opt.innerText = classTranslations[cls] || cls;
                classSelect.appendChild(opt);
            });

            if (currentSelected && [...classSelect.options].some(o => o.value === currentSelected)) {
                classSelect.value = currentSelected;
            }
        }

        function populateExamFilter() {
            const examSelect = document.getElementById('filter-exam');
            if (!examSelect) return;
            const currentSelected = examSelect.value;

            examSelect.innerHTML = '<option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>';

            let routines = [];

            let seatPlansStore = {};

            let examTypes = [];

            try {

                routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');

                seatPlansStore = JSON.parse(localStorage.getItem('school_seat_plans_store') || '{}');

                examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');

            } catch (e) { }



            const examSet = new Set();



            // 1. Gather exam names from Saved Seat Plans Store (সংরক্ষিত সিটপ্ল্যান তালিকা)

            if (seatPlansStore && typeof seatPlansStore === 'object') {

                Object.values(seatPlansStore).forEach(plan => {

                    if (plan && plan.examName && plan.examName.trim() !== '' && plan.examName !== 'All') {

                        examSet.add(plan.examName.trim());

                    }

                });

            }



            // 2. Gather exam names from Saved Exam Routines

            if (Array.isArray(routines)) {

                routines.forEach(r => {

                    if (r && r.examName && r.examName.trim() !== '') {

                        examSet.add(r.examName.trim());

                    }

                });

            }



            // 3. Gather exam names from configured exam types

            if (Array.isArray(examTypes)) {

                examTypes.forEach(t => {

                    if (t && t.name && t.name.trim() !== '') {

                        examSet.add(t.name.trim());

                    }

                });

            }



            const examNames = [...examSet];

            examNames.forEach(exam => {

                const opt = document.createElement('option');

                opt.value = exam;

                const translated = translateExamName(exam);

                opt.innerText = (translated !== exam) ? `${translated} (${exam})` : exam;

                examSelect.appendChild(opt);

            });



            if (currentSelected && [...examSelect.options].some(o => o.value === currentSelected)) {

                examSelect.value = currentSelected;

            }

        }



        function populateShiftFilter() {

            const shiftSelect = document.getElementById('filter-shift');

            if (!shiftSelect) return;

            const currentSelected = shiftSelect.value;



            shiftSelect.innerHTML = '<option value="all">All Shifts</option>';



            let shiftTimes = [];

            try {

                shiftTimes = JSON.parse(localStorage.getItem('school_shift_times') || '[]');

            } catch (e) { }



            const shiftsSet = new Set();

            if (Array.isArray(shiftTimes)) {

                shiftTimes.forEach(st => {

                    if (st && st.shift && st.shift.trim()) shiftsSet.add(st.shift.trim());

                });

            }

            if (shiftsSet.size === 0) {

                shiftsSet.add('Morning Shift');

                shiftsSet.add('Afternoon Shift');

            }



            shiftsSet.forEach(shift => {

                const opt = document.createElement('option');

                opt.value = shift;

                const item = Array.isArray(shiftTimes) ? shiftTimes.find(t => t.shift === shift) : null;

                const bn = item && item.shiftBn ? item.shiftBn : (shiftTranslations[shift] || shift);

                opt.innerText = bn ? `${shift} (${bn})` : shift;

                shiftSelect.appendChild(opt);

            });



            if (currentSelected && [...shiftSelect.options].some(o => o.value === currentSelected)) {

                shiftSelect.value = currentSelected;

            }

        }



        window.populateExamFilter = populateExamFilter;

        window.populateShiftFilter = populateShiftFilter;

        window.renderAdmitCards = renderAdmitCards;



        function getRoutineForClass(className, routines, selectedExam = 'all') {

            const reqClass = (className || '').toLowerCase().trim();

            const classRoutines = routines.filter(r => (r.class || '').toLowerCase().trim() === reqClass || (r.class || '').toLowerCase().includes(reqClass) || reqClass.includes((r.class || '').toLowerCase()));

            if (classRoutines.length === 0) return null;



            let targetExam = selectedExam;

            let filteredRoutines = [];



            if (selectedExam !== 'all') {

                filteredRoutines = classRoutines.filter(r => !r.examName || r.examName === selectedExam || r.examName.trim() === selectedExam.trim());

                if (filteredRoutines.length === 0) {

                    filteredRoutines = classRoutines;

                } else {

                    targetExam = selectedExam;

                }

            } else {

                const examNameCounts = {};

                classRoutines.forEach(r => {

                    if (r.examName) examNameCounts[r.examName] = (examNameCounts[r.examName] || 0) + 1;

                });

                if (Object.keys(examNameCounts).length > 0) {

                    targetExam = Object.keys(examNameCounts).reduce((a, b) => examNameCounts[a] > examNameCounts[b] ? a : b);

                    filteredRoutines = classRoutines.filter(r => r.examName === targetExam);

                } else {

                    targetExam = classRoutines[0].examName || "পরীক্ষা ২০২৬";

                    filteredRoutines = classRoutines;

                }

            }



            return {

                examName: targetExam,

                schedule: filteredRoutines.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))

            };

        }



        function resetAllAdmitCardFilters() {

            if (document.getElementById('filter-class')) document.getElementById('filter-class').value = 'all';

            if (document.getElementById('filter-exam')) document.getElementById('filter-exam').value = 'all';

            if (document.getElementById('filter-shift')) document.getElementById('filter-shift').value = 'all';

            if (document.getElementById('search-student')) document.getElementById('search-student').value = '';

            renderAdmitCards();

        }

        window.resetAllAdmitCardFilters = resetAllAdmitCardFilters;



        
        function buildStudentLookupMap() {
            const map = {
                byId: new Map(),
                byReg: new Map(),
                byNameClass: new Map()
            };
            try {
                const list = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(list)) {
                    list.forEach(s => {
                        if (!s) return;
                        if (s.id) map.byId.set(String(s.id).trim(), s);
                        if (s.regNo) map.byReg.set(String(s.regNo).trim(), s);
                        const cKey = String(s.class || '').trim().toLowerCase();
                        const nKey = String(s.name || '').trim().toLowerCase();
                        const nbKey = String(s.nameBn || '').trim().toLowerCase();
                        const rKey = String(s.roll || '').trim();
                        if (cKey && nKey) map.byNameClass.set(`${cKey}___${nKey}`, s);
                        if (cKey && nbKey) map.byNameClass.set(`${cKey}___${nbKey}`, s);
                        if (cKey && rKey) map.byNameClass.set(`${cKey}___roll_${rKey}`, s);
                    });
                }
            } catch (e) {}
            return map;
        }

        function resolveAttendanceLiveStudent(st, studentLookupMap = null) {
            if (!st || typeof st !== 'object') return st;
            const lookup = studentLookupMap || (typeof window !== 'undefined' && window.__currentStudentLookupMap) || buildStudentLookupMap();
            let live = null;
            if (st.id && lookup.byId && lookup.byId.has(String(st.id).trim())) {
                live = lookup.byId.get(String(st.id).trim());
            } else if (st.regNo && lookup.byReg && lookup.byReg.has(String(st.regNo).trim())) {
                live = lookup.byReg.get(String(st.regNo).trim());
            } else {
                const cKey = String(st.class || st.className || '').trim().toLowerCase();
                const nKey = String(st.name || '').trim().toLowerCase();
                const nbKey = String(st.nameBn || '').trim().toLowerCase();
                const rKey = String(st.roll || '').trim();
                if (cKey && nKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nKey}`);
                } else if (cKey && nbKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nbKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nbKey}`);
                } else if (cKey && rKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___roll_${rKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___roll_${rKey}`);
                }
            }

            let finalId = '';
            if (live) {
                finalId = live.studentId || (live.roll && !isNaN(parseInt(live.roll)) ? String(parseInt(live.roll)).padStart(4, '0') : '');
            }
            if (!finalId) {
                finalId = st.studentId || '';
            }
            if (!finalId || finalId.startsWith('178') || finalId.length > 10) {
                if (st.roll && !isNaN(parseInt(st.roll))) {
                    finalId = String(parseInt(st.roll)).padStart(4, '0');
                } else if (st.regNo && String(st.regNo).trim()) {
                    finalId = String(st.regNo).trim();
                } else {
                    finalId = '-';
                }
            }

            return {
                ...st,
                studentId: finalId,
                roll: live ? (live.roll || st.roll) : st.roll,
                regNo: live ? (live.regNo || st.regNo) : st.regNo,
                name: live ? (live.name || st.name) : st.name,
                nameBn: live ? (live.nameBn || st.nameBn) : st.nameBn,
                class: live ? (live.class || st.class) : st.class,
                section: live ? (live.section || st.section) : st.section,
                gender: live ? (live.gender || st.gender) : st.gender,
                religion: live ? (live.religion || st.religion) : st.religion,
                optionalSubject: live ? (live.optionalSubject || st.optionalSubject) : st.optionalSubject
            };
        }

        function renderAdmitCards() {
            const classSelect = document.getElementById('filter-class');
            const examSelect = document.getElementById('filter-exam');
            const shiftSelect = document.getElementById('filter-shift');
            const langSelect = document.getElementById('filter-lang');
            const searchInput = document.getElementById('search-student');

            const classVal = classSelect ? classSelect.value : 'all';
            const examVal = examSelect ? examSelect.value : 'all';
            const shiftVal = shiftSelect ? shiftSelect.value : 'all';
            const langVal = langSelect ? langSelect.value : 'bn';
            const searchVal = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '';

            const container = document.getElementById('dynamic-cards-container');
            if (!container) return;
            container.innerHTML = '';

            // Load from localStorage
            let students = [];
            let routines = [];
            let seatAllocations = {};
            let rooms = [];
            let buildings = [];
            let settings = {};
            let schoolLogo = '';
            let subjectsData = {};
            let seatPlansStore = {};

            try {
                students = JSON.parse(localStorage.getItem('school_students') || '[]');
                routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
                seatAllocations = JSON.parse(localStorage.getItem('school_seat_allocations') || localStorage.getItem('school_saved_seat_allocations') || '{}');
                rooms = JSON.parse(localStorage.getItem('school_rooms') || '[]');
                buildings = JSON.parse(localStorage.getItem('school_buildings') || '[]');
                settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
                schoolLogo = localStorage.getItem('school_logo') || '';
                subjectsData = JSON.parse(localStorage.getItem('school_subjects') || '{}');
                seatPlansStore = JSON.parse(localStorage.getItem('school_seat_plans_store') || '{}');
            } catch (e) {
                console.error("Error loading data from localStorage:", e);
            }

            // Fallback demo students if database is empty so cards always preview
            if (!Array.isArray(students) || students.length === 0) {
                students = [
                    { id: "s1", studentId: "2606001", name: "Md. Tanvir Ahmed", nameBn: "মো: তানভীর আহমেদ", class: "Six", section: "A", roll: "(প্রযোজ্য না)", regNo: "260001", religion: "Islam" },
                    { id: "s2", studentId: "2606002", name: "Sushanto Kumar Ray", nameBn: "সুশান্ত কুমার রায়", class: "Six", section: "A", roll: "(প্রযোজ্য না)", regNo: "260002", religion: "Hindu (হিন্দু)" }
                ];
            }

            const schoolName = settings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const schoolAddress = settings.schoolAddress || "জলঢাকা, নীলফামালী।";

            // Map student seats
            const studentSeats = {};
            const roomMap = {};
            rooms.forEach(r => {
                const b = buildings.find(build => build.id === r.buildingId);
                roomMap[r.id] = {
                    roomNo: r.number,
                    buildingName: b ? b.name : "Academic Bhaban"
                };
            });

            // Loop through all saved plans in school_seat_plans_store
            for (const planId in seatPlansStore) {
                const plan = seatPlansStore[planId];
                if (plan && plan.allocations) {
                    if (examVal !== 'all' && !isExamMatching(plan.examName, examVal)) {
                        continue;
                    }
                    const allocations = plan.allocations;
                    for (const roomId in allocations) {
                        const item = allocations[roomId];
                        let benchList = [];
                        let bldgName = roomMap[roomId]?.buildingName || "Academic Bhaban";
                        let roomNo = roomMap[roomId]?.roomNo || roomId;
                        let shift = plan.shift || "";

                        if (Array.isArray(item)) {
                            benchList = item;
                        } else if (item && typeof item === 'object') {
                            benchList = item.benches || [];
                            if (item.building && item.building.name) bldgName = item.building.name;
                            if (item.room && item.room.number) roomNo = item.room.number;
                            if (item.shift) shift = item.shift;
                        }

                        if (Array.isArray(benchList)) {
                            benchList.forEach(bench => {
                                if (bench.left) {
                                    const info = { roomNo, buildingName: bldgName, shift: shift, examName: plan.examName || "" };
                                    if (bench.left.id) studentSeats[bench.left.id] = info;
                                    if (bench.left.studentId) studentSeats[bench.left.studentId] = info;
                                    if (bench.left.regNo) studentSeats[bench.left.regNo] = info;
                                }
                                if (bench.right) {
                                    const info = { roomNo, buildingName: bldgName, shift: shift, examName: plan.examName || "" };
                                    if (bench.right.id) studentSeats[bench.right.id] = info;
                                    if (bench.right.studentId) studentSeats[bench.right.studentId] = info;
                                    if (bench.right.regNo) studentSeats[bench.right.regNo] = info;
                                }
                            });
                        }
                    }
                }
            }

            // Fallback to active unsaved seat allocations
            for (const roomId in seatAllocations) {
                const item = seatAllocations[roomId];
                let benchList = [];
                let bldgName = roomMap[roomId]?.buildingName || "Academic Bhaban";
                let roomNo = roomMap[roomId]?.roomNo || roomId;
                let shift = item.shift || "";

                if (Array.isArray(item)) {
                    benchList = item;
                } else if (item && typeof item === 'object') {
                    benchList = item.benches || [];
                    if (item.building && item.building.name) bldgName = item.building.name;
                    if (item.room && item.room.number) roomNo = item.room.number;
                    if (item.shift) shift = item.shift;
                }

                if (Array.isArray(benchList)) {
                    benchList.forEach(bench => {
                        if (bench.left) {
                            const targetId = bench.left.id;
                            const targetStdId = bench.left.studentId;
                            const targetRegNo = bench.left.regNo;
                            const info = { roomNo, buildingName: bldgName, shift };
                            if (targetId && !studentSeats[targetId]) studentSeats[targetId] = info;
                            if (targetStdId && !studentSeats[targetStdId]) studentSeats[targetStdId] = info;
                            if (targetRegNo && !studentSeats[targetRegNo]) studentSeats[targetRegNo] = info;
                        }
                        if (bench.right) {
                            const targetId = bench.right.id;
                            const targetStdId = bench.right.studentId;
                            const targetRegNo = bench.right.regNo;
                            const info = { roomNo, buildingName: bldgName, shift };
                            if (targetId && !studentSeats[targetId]) studentSeats[targetId] = info;
                            if (targetStdId && !studentSeats[targetStdId]) studentSeats[targetStdId] = info;
                            if (targetRegNo && !studentSeats[targetRegNo]) studentSeats[targetRegNo] = info;
                        }
                    });
                }
            }

            const isShiftMatching = (selected, studentShift) => {
                if (selected === 'all') return true;
                if (!studentShift) return true;
                const sel = selected.toLowerCase();
                const std = studentShift.toLowerCase();
                if (sel === std) return true;
                if (sel.includes('morning') || sel.includes('সকাল')) {
                    return std.includes('morning') || std.includes('সকাল') || std.includes('প্রভাতি');
                }
                if (sel.includes('afternoon') || sel.includes('বিকাল')) {
                    return std.includes('afternoon') || std.includes('বিকাল') || std.includes('দিবা');
                }
                return true;
            };

            // Filter students
            let filteredStudents = students.filter(student => {
                if (classVal !== 'all') {
                    const sc = (student.class || '').toLowerCase().trim();
                    const cv = classVal.toLowerCase().trim();
                    if (sc !== cv && !sc.includes(cv) && !cv.includes(sc)) return false;
                }

                // Shift filter (needs to lookup from student's routine shift or studentSeats)
                const classRoutine = getRoutineForStudent(student, routines, examVal);
                const seatInfo = studentSeats[student.id] || studentSeats[student.studentId] || (student.regNo ? studentSeats[student.regNo] : null);
                const studentShift = (seatInfo && seatInfo.shift) || (classRoutine && classRoutine.schedule.length > 0 ? classRoutine.schedule[0].shift : "");

                if (!isShiftMatching(shiftVal, studentShift)) return false;

                // Search query
                if (searchVal) {
                    const matchId = student.studentId && student.studentId.toLowerCase().includes(searchVal);
                    const matchName = student.name && student.name.toLowerCase().includes(searchVal);
                    const matchNameBn = student.nameBn && student.nameBn.toLowerCase().includes(searchVal);
                    if (!matchId && !matchName && !matchNameBn) return false;
                }

                return true;
            });

            // Update stats counter
            const statsEl = document.getElementById('print-stats');
            if (statsEl) statsEl.innerText = `Total Cards: ${filteredStudents.length}`;

            totalSheetsCount = Math.ceil(filteredStudents.length / 2);

            const navBar = document.getElementById('admit-page-navigation-bar');
            if (filteredStudents.length === 0) {
                if (navBar) navBar.style.display = 'none';
                container.innerHTML = `
                    <div class="no-print" style="text-align: center; padding: 40px; font-weight: 700; color: #dc2626; font-size: 1.15rem; background: #fff; max-width: 210mm; margin: 0 auto; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                        বর্তমানে সিলেক্ট করা ফিল্টারে কোনো শিক্ষার্থী বা প্রবেশপত্র পাওয়া যায়নি।<br><br>
                        <button onclick="resetAllAdmitCardFilters()" style="background: #0284c7; color: #ffffff; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 800; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
                            🔄 সকল ফিল্টার রিসেট করে সব প্রবেশপত্র দেখুন (Show All Admit Cards)
                        </button>
                    </div>
                `;
                return;
            } else {
                if (navBar) navBar.style.display = 'flex';
            }

            if (currentSheetIndex >= totalSheetsCount) {
                currentSheetIndex = Math.max(0, totalSheetsCount - 1);
            }

            // Populate Sheet Jump Dropdown
            const jumpSelect = document.getElementById('sheet-jump-select');
            if (jumpSelect) {
                jumpSelect.innerHTML = '';
                for (let s = 0; s < totalSheetsCount; s++) {
                    const stdA = filteredStudents[s * 2];
                    const stdB = (s * 2 + 1 < filteredStudents.length) ? filteredStudents[s * 2 + 1] : null;
                    const opt = document.createElement('option');
                    opt.value = s;
                    const nameA = stdA ? (stdA.nameBn || stdA.name) : '';
                    const nameB = stdB ? (stdB.nameBn || stdB.name) : '';
                    const rollA = stdA ? (stdA.roll || stdA.studentId) : '';
                    const rollB = stdB ? (stdB.roll || stdB.studentId) : '';

                    if (stdB) {
                        opt.innerText = `পাতা ${s + 1}/${totalSheetsCount}: ${nameA} (${rollA}) + ${nameB} (${rollB})`;
                    } else {
                        opt.innerText = `পাতা ${s + 1}/${totalSheetsCount}: ${nameA} (${rollA})`;
                    }
                    jumpSelect.appendChild(opt);
                }
                jumpSelect.value = currentSheetIndex;
            }

            // Generate Dual A4 format per sheet
            for (let i = 0; i < filteredStudents.length; i += 2) {
                const sheetIndex = i / 2;
                const studentA = filteredStudents[i];
                const studentB = i + 1 < filteredStudents.length ? filteredStudents[i + 1] : null;

                const seatA = studentSeats[studentA.id] || studentSeats[studentA.studentId] || (studentA.regNo ? studentSeats[studentA.regNo] : null);
                const targetExamA = (examVal !== 'all') ? examVal : (seatA && seatA.examName ? seatA.examName : (routines.length > 0 ? (routines[0].examName || "পরীক্ষা ২০২৬") : "পরীক্ষা ২০২৬"));
                const classRoutineA = getRoutineForStudent(studentA, routines, targetExamA);
                const examNameA = translateExamName(targetExamA);
                const shiftA = (seatA && seatA.shift) ? seatA.shift : (classRoutineA && classRoutineA.schedule.length > 0 ? classRoutineA.schedule[0].shift : "");

                const seatB = studentB ? (studentSeats[studentB.id] || studentSeats[studentB.studentId] || (studentB.regNo ? studentSeats[studentB.regNo] : null)) : null;
                const targetExamB = studentB ? ((examVal !== 'all') ? examVal : (seatB && seatB.examName ? seatB.examName : (routines.length > 0 ? (routines[0].examName || "পরীক্ষা ২০২৬") : "পরীক্ষা ২০২৬"))) : "";
                const classRoutineB = studentB ? getRoutineForStudent(studentB, routines, targetExamB) : null;
                const examNameB = studentB ? translateExamName(targetExamB) : "";
                const shiftB = studentB ? ((seatB && seatB.shift) ? seatB.shift : (classRoutineB && classRoutineB.schedule.length > 0 ? classRoutineB.schedule[0].shift : "")) : "";

                const sheetSet = document.createElement('div');
                sheetSet.className = 'sheet-duplex-set' + (sheetIndex === currentSheetIndex ? ' active-sheet' : '');
                sheetSet.id = 'sheet-set-' + sheetIndex;
                if (currentViewMode === 'page' && sheetIndex !== currentSheetIndex) {
                    sheetSet.style.display = 'none';
                }

                // PAGE 1: FRONT SIDE (ADMIT CARDS)
                let cardA_HTML = generateFrontCardHTML(studentA, seatA, schoolName, schoolAddress, examNameA, schoolLogo, shiftA, langVal);
                let cardB_HTML = studentB ? generateFrontCardHTML(studentB, seatB, schoolName, schoolAddress, examNameB, schoolLogo, shiftB, langVal) : `<div class="card" style="visibility: hidden;"></div>`;

                const pageFrontHTML = `
                    <div class="a4-page">
                        ${cardA_HTML}
                        ${cardB_HTML}
                    </div>
                `;

                // PAGE 2: REVERSE SIDE (ROUTINE)
                let routineA_HTML = generateBackCardHTML(studentA, classRoutineA ? classRoutineA.schedule : [], examNameA, subjectsData, langVal);
                let routineB_HTML = studentB ? generateBackCardHTML(studentB, classRoutineB ? classRoutineB.schedule : [], examNameB, subjectsData, langVal) : `<div class="card" style="visibility: hidden;"></div>`;

                const pageBackHTML = `
                    <div class="a4-page">
                        ${routineA_HTML}
                        ${routineB_HTML}
                    </div>
                `;

                // Grid layout with 2 A4 formats
                const gridHTML = `
                    <div class="sheet-duplex-grid">
                        <div class="sheet-column">
                            ${pageFrontHTML}
                        </div>
                        <div class="sheet-column">
                            ${pageBackHTML}
                        </div>
                    </div>
                `;

                sheetSet.innerHTML = gridHTML;
                container.appendChild(sheetSet);
            }

            updatePaginationButtons();
        }

        function generateFrontCardHTML(student, seat, schoolName, schoolSubtitle, examNameTranslated, schoolLogo, studentShift, lang = 'bn') {
            const classBn = classTranslations[student.class] || student.class;
            const secBn = sectionTranslations[student.section] || student.section || "";
            const classSecTextBn = `${classBn} ${secBn ? `(${secBn})` : ""}`;
            const classSecTextEn = `${student.class} ${student.section ? `(${student.section})` : ""}`;
            const classDisplay = lang === 'en' ? classSecTextEn : (lang === 'both' ? `${classSecTextBn} / ${classSecTextEn}` : classSecTextBn);

            const roomNo = seat ? seat.roomNo : "";
            const buildingName = seat ? seat.buildingName : "";
            const logoSrc = schoolLogo ? schoolLogo : 'school_logo.svg';

            const shiftFormatted = getShiftFormattedName(studentShift, student.class);
            const shiftBadgeText = (lang === 'en') ?
                (shiftFormatted === 'বিকাল' ? 'Afternoon' : (shiftFormatted === 'সকাল' ? 'Morning' : shiftFormatted)) :
                (lang === 'both' ? `${shiftFormatted} (${shiftFormatted === 'বিকাল' ? 'Afternoon' : 'Morning'})` : shiftFormatted);

            const cardTitle = lang === 'en' ? 'ADMIT CARD' : (lang === 'both' ? 'প্রবেশপত্র (ADMIT CARD)' : 'প্রবেশপত্র');
            const lblNameBn = lang === 'en' ? 'Student Name' : (lang === 'both' ? 'শিক্ষার্থীর নাম (Name)' : 'শিক্ষার্থীর নাম (বাংলা)');
            const lblNameEn = lang === 'en' ? 'Name in English' : (lang === 'both' ? 'Name (English)' : 'Name (English)');
            const lblStdId = lang === 'en' ? 'Student ID' : (lang === 'both' ? 'স্টুডেন্ট আইডি (ID)' : 'স্টুডেন্ট আইডি (ID)');
            const lblRegNo = lang === 'en' ? 'Reg. No' : (lang === 'both' ? 'রেজিস্ট্রেশন নং (Reg. No)' : 'রেজিস্ট্রেশন নং');
            const lblClassSec = lang === 'en' ? 'Class & Section' : (lang === 'both' ? 'শ্রেণী ও শাখা (Class & Sec)' : 'শ্রেণী ও বিভাগ/গ্রুপ');
            const lblBldg = lang === 'en' ? 'Building' : (lang === 'both' ? 'বিল্ডিং (Building)' : 'বিল্ডিং');
            const lblRoom = lang === 'en' ? 'Room No' : (lang === 'both' ? 'রুম নং (Room No)' : 'রুম নং');
            const lblRulesHead = lang === 'en' ? 'Rules & Instructions for Candidates:' : (lang === 'both' ? 'পরীক্ষার্থীদের জন্য নিয়মাবলী (Rules & Instructions):' : 'পরীক্ষার্থীদের জন্য নিয়মাবলী:');

            const rule1 = lang === 'en' ? '1. No candidate will be allowed without an Admit Card.' : '১. প্রবেশপত্র ব্যতিত কোনো পরীক্ষার্থীকে পরীক্ষা কক্ষে প্রবেশ করতে দেয়া হবে না।';
            const rule2 = lang === 'en' ? '2. Mobile phones or digital watches are strictly prohibited.' : '২. পরীক্ষা কক্ষে কোনো প্রকার মোবাইল ফোন বা ডিজিটাল ঘড়ি আনা সম্পূর্ণ নিষিদ্ধ।';
            const rule3 = lang === 'en' ? '3. Write Subject Code and Roll Number correctly on the answer sheet.' : '৩. উত্তরপত্রের কভার পৃষ্ঠায় বিষয় কোড ও রোল নম্বর সঠিকভাবে লিখতে হবে।';
            const rule4 = lang === 'en' ? '4. Any attempt at unfair means will lead to cancellation of exam.' : '৪. অসদুপায় অবলম্বনের চেষ্টা করলে পরীক্ষা বাতিল করা হবে।';

            const sigClass = "শ্রেণী শিক্ষকের স্বাক্ষর";
            const sigStudent = "শিক্ষার্থীর স্বাক্ষর";
            const sigHead = "প্রধান শিক্ষকের স্বাক্ষর";

            const hm = typeof getHeadmasterByDepartment === 'function' ? getHeadmasterByDepartment(student.department || student.dept || student.class) : null;
            const hmSignature = hm ? (hm.signature || '') : '';

            let customHeader = '';
            let customInstructionsHTML = '';
            try {
                customHeader = localStorage.getItem('school_admit_instruction_header_' + lang) || '';
                customInstructionsHTML = localStorage.getItem('school_admit_instructions_html_' + lang) || '';
            } catch (e) { }

            const finalHeader = customHeader || lblRulesHead;
            const defaultRulesHTML = `
                <li>${rule1}</li>
                <li>${rule2}</li>
                <li>${rule3}</li>
                <li>${rule4}</li>
            `;
            const finalRulesHTML = customInstructionsHTML || defaultRulesHTML;

            return `
                <div class="card">
                    <div>
                        <div class="header">
                            <img src="${logoSrc}" alt="Logo" class="header-logo" onerror="this.src='school_logo.svg'">
                            <div class="header-text">
                                <h1>${schoolName}</h1>
                                <p>${schoolSubtitle}</p>
                                <div class="exam-subtitle">${examNameTranslated}</div>
                                <span class="exam-title">${cardTitle}</span>
                            </div>
                            <div class="header-spacer"></div>
                        </div>

                        <div class="main-content">
                            <table class="info-table">
                                <tr class="name-row name-bn">
                                    <td class="label">${lblNameBn}</td>
                                    <td class="colon">:</td>
                                    <td><b>${student.nameBn || student.name}</b></td>
                                </tr>
                                <tr class="name-row name-en">
                                    <td class="label">${lblNameEn}</td>
                                    <td class="colon">:</td>
                                    <td>${student.name}</td>
                                </tr>
                                <tr>
                                    <td class="label">${lblStdId}</td>
                                    <td class="colon">:</td>
                                    <td><b>${student.studentId}</b></td>
                                </tr>
                                <tr>
                                    <td class="label">${lblRegNo}</td>
                                    <td class="colon">:</td>
                                    <td>${student.regNo || "-"}</td>
                                </tr>
                                <tr>
                                    <td class="label">${lblClassSec}</td>
                                    <td class="colon">:</td>
                                    <td>${classDisplay}</td>
                                </tr>
                                 <tr>
                                      <td class="label">${lblBldg}</td>
                                      <td class="colon">:</td>
                                      <td>${buildingName || "-"} <span style="margin-left: 50px; font-size: 1.05em; font-weight: 700;">${lblRoom} : ${roomNo || "-"}</span></td>
                                  </tr>
                            </table>

                             <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                 <div class="photo-box">
                                     ${student.photo ? `<img src="${student.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : `<span>${lang === 'en' ? 'Passport Size<br>Photo' : 'পাসপোর্ট সাইজের<br>ছবি'}</span>`}
                                 </div>
                                 <div class="shift-box">
                                     ${lang === 'en' ? 'Shift' : 'শিফট'} : ${shiftBadgeText}
                                 </div>
                             </div>
                        </div>

                        <div class="instructions-box">
                            <h4 contenteditable="true" onblur="saveCustomInstructionHeader(this, '${lang}')" title="ক্লিক করে হেডিং এডিট করুন">${finalHeader}</h4>
                            <ul contenteditable="true" onblur="saveCustomInstructionsHTML(this, '${lang}')" title="ক্লিক করে নিয়মাবলী এডিট করুন বা নতুন নিয়ম লিখুন">
                                ${finalRulesHTML}
                            </ul>
                        </div>
                    </div>

                    <div class="footer-signatures">
                        <div class="sig-box">
                            <div class="sig-line">${sigClass}</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-line">${sigStudent}</div>
                        </div>
                        <div class="sig-box">
                            ${hmSignature ? `<img src="${hmSignature}" class="sig-img" alt="প্রধান শিক্ষকের স্বাক্ষর">` : '<div style="height: 57px;"></div>'}
                            <div class="sig-line">${sigHead}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        function getStudentReligionCategory(student) {
            if (!student) return 'islam';
            const r = (student.religion || student.religionBn || student.religion_en || '').toLowerCase().trim();
            if (r.includes('hindu') || r.includes('হিন্দু')) return 'hindu';
            if (r.includes('buddh') || r.includes('বৌদ্ধ')) return 'buddhism';
            if (r.includes('christ') || r.includes('খ্রি')) return 'christianity';
            if (r.includes('islam') || r.includes('muslim') || r.includes('ইসলাম') || r.includes('মুস')) return 'islam';
            return 'islam';
        }

        function isReligionSubject(subjectName) {
            if (!subjectName) return false;
            const s = subjectName.toLowerCase();
            return s.includes('islam') || s.includes('hindu') || s.includes('religion') ||
                s.includes('ধর্ম') || s.includes('ইসলাম') || s.includes('হিন্দু') ||
                s.includes('buddh') || s.includes('বৌদ্ধ') ||
                s.includes('christ') || s.includes('খ্রি');
        }

        function isEntryForOtherReligion(entrySub, studentRel) {
            if (!entrySub) return false;
            const s = entrySub.toLowerCase();
            const isIslamEntry = s.includes('islam') || s.includes('ইসলাম');
            const isHinduEntry = s.includes('hindu') || s.includes('হিন্দু');
            const isBuddhEntry = s.includes('buddh') || s.includes('বৌদ্ধ');
            const isChristEntry = s.includes('christ') || s.includes('খ্রি');

            // If it explicitly mentions multiple religions or slash combo
            const isCombo = (isIslamEntry && isHinduEntry) || s.includes('/') || s.includes('combo');
            if (isCombo) return false;

            // If it's a generic "Religion" subject without specifying Hindu/Islam/Buddh/Christ
            const isGenericReligion = (s.includes('religion') || s.includes('ধর্ম')) && !isIslamEntry && !isHinduEntry && !isBuddhEntry && !isChristEntry;
            if (isGenericReligion) return false;

            if (studentRel === 'islam') {
                return isHinduEntry || isBuddhEntry || isChristEntry;
            } else if (studentRel === 'hindu') {
                return isIslamEntry || isBuddhEntry || isChristEntry;
            } else if (studentRel === 'buddhism') {
                return isIslamEntry || isHinduEntry || isChristEntry;
            } else if (studentRel === 'christianity') {
                return isIslamEntry || isHinduEntry || isBuddhEntry;
            }
            return false;
        }

        function getStudentOptionalSubject(student) {
            if (!student) return '';
            return (student.optionalSubject || student.optional || student.optional_subject || student['ঐচ্ছিক বিষয়'] || '').trim();
        }

        function isOptionalComboOrSubject(subName) {
            if (!subName) return false;
            const s = subName.toLowerCase();
            return s.includes('agriculture') || s.includes('agri') || s.includes('কৃষি') ||
                s.includes('higher') || s.includes('hmath') || s.includes('h.math') || s.includes('উচ্চতর') ||
                s.includes('home science') || s.includes('গার্হস্থ্য');
        }

        function isOptionalCombo(subName) {
            if (!subName) return false;
            const s = subName.toLowerCase();
            const hasAgri = s.includes('agriculture') || s.includes('agri') || s.includes('কৃষি');
            const hasHmath = s.includes('higher') || s.includes('hmath') || s.includes('h.math') || s.includes('উচ্চতর');
            return (hasAgri && hasHmath) || s.includes('combo') || (s.includes('/') && (hasAgri || hasHmath));
        }

        function isEntryForOtherOptional(entrySub, studentOpt) {
            if (!entrySub || !studentOpt) return false;
            const s = entrySub.toLowerCase();
            const opt = studentOpt.toLowerCase();

            const isAgriEntry = s.includes('agriculture') || s.includes('agri') || s.includes('কৃষি');
            const isHmathEntry = s.includes('higher') || s.includes('hmath') || s.includes('h.math') || s.includes('উচ্চতর');
            const isHomeEntry = s.includes('home science') || s.includes('গার্হস্থ্য');

            // If it's a combined entry like "Agri/H.Math", it's not for another optional only
            if (isOptionalCombo(entrySub)) return false;

            const studentIsHmath = opt.includes('higher') || opt.includes('hmath') || opt.includes('h.math') || opt.includes('উচ্চতর');
            const studentIsAgri = opt.includes('agriculture') || opt.includes('agri') || opt.includes('কৃষি');
            const studentIsHome = opt.includes('home') || opt.includes('গার্হস্থ্য');

            if (studentIsHmath) {
                return (isAgriEntry && !isHmathEntry) || isHomeEntry;
            } else if (studentIsAgri) {
                return (isHmathEntry && !isAgriEntry) || isHomeEntry;
            } else if (studentIsHome) {
                return isHmathEntry || isAgriEntry;
            }
            return false;
        }

        function resolveSubjectForStudent(entry, student, classSubjects, lang) {
            let rawSubject = entry.subject || '';
            const cleanSub = rawSubject.trim();
            const lowerSub = cleanSub.toLowerCase();

            // Check if it's a religion subject
            const isReligion = isReligionSubject(cleanSub);
            const relCategory = getStudentReligionCategory(student);

            // Check if it's an optional subject for Class 9/10 or has optional subject
            const optSubject = getStudentOptionalSubject(student);
            const isClassNineOrTen = student.class && /nine|ten|9|10|নবম|দশম/i.test(student.class);
            const isOptional = isOptionalComboOrSubject(cleanSub) && (isClassNineOrTen || optSubject);

            let subCode = "";
            let subName = cleanSub;
            let subDisplay = "";

            if (isReligion) {
                if (relCategory === 'islam') {
                    const matched = classSubjects.find(s => {
                        const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                        return n.includes('islam') || n.includes('ইসলাম');
                    });
                    subCode = matched ? (matched.code || "110") : "110";
                    subName = matched ? (matched.name || "Islamic Studies") : "Islamic Studies";
                    const nameBn = "ইসলাম ও নৈতিক শিক্ষা";

                    if (lang === 'en') {
                        subDisplay = "Islam & Moral Education";
                    } else if (lang === 'both') {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Islam & Moral Education</div>`;
                    } else {
                        subDisplay = nameBn;
                    }
                } else if (relCategory === 'hindu') {
                    const matched = classSubjects.find(s => {
                        const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                        return n.includes('hindu') || n.includes('হিন্দু');
                    });
                    subCode = matched ? (matched.code || "111") : "111";
                    subName = matched ? (matched.name || "Hindu Religion Studies") : "Hindu Religion Studies";
                    const nameBn = "হিন্দুধর্ম ও নৈতিক শিক্ষা";

                    if (lang === 'en') {
                        subDisplay = "Hinduism & Moral Education";
                    } else if (lang === 'both') {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Hinduism & Moral Education</div>`;
                    } else {
                        subDisplay = nameBn;
                    }
                } else if (relCategory === 'buddhism') {
                    const matched = classSubjects.find(s => {
                        const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                        return n.includes('buddh') || n.includes('বৌদ্ধ');
                    });
                    subCode = matched ? (matched.code || "112") : "112";
                    subName = matched ? (matched.name || "Buddhism and Moral Education") : "Buddhism and Moral Education";
                    const nameBn = "বৌদ্ধধর্ম ও নৈতিক শিক্ষা";

                    if (lang === 'en') {
                        subDisplay = "Buddhism & Moral Education";
                    } else if (lang === 'both') {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Buddhism & Moral Education</div>`;
                    } else {
                        subDisplay = nameBn;
                    }
                } else if (relCategory === 'christianity') {
                    const matched = classSubjects.find(s => {
                        const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                        return n.includes('christ') || n.includes('খ্রি');
                    });
                    subCode = matched ? (matched.code || "113") : "113";
                    subName = matched ? (matched.name || "Christianity and Moral Education") : "Christianity and Moral Education";
                    const nameBn = "খ্রিস্টধর্ম ও নৈতিক শিক্ষা";

                    if (lang === 'en') {
                        subDisplay = "Christianity & Moral Education";
                    } else if (lang === 'both') {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Christianity & Moral Education</div>`;
                    } else {
                        subDisplay = nameBn;
                    }
                } else {
                    subCode = "110";
                    subName = "Islam and Moral Education";
                    subDisplay = "ইসলাম ও নৈতিক শিক্ষা";
                }
            } else if (isOptional) {
                // Class 9/10 Optional Subject Resolution
                if (optSubject) {
                    const optLower = optSubject.toLowerCase();
                    const isHmath = optLower.includes('higher') || optLower.includes('hmath') || optLower.includes('h.math') || optLower.includes('উচ্চতর');
                    const isAgri = optLower.includes('agriculture') || optLower.includes('agri') || optLower.includes('কৃষি');
                    const isHome = optLower.includes('home') || optLower.includes('গার্হস্থ্য');

                    if (isHmath) {
                        const matched = classSubjects.find(s => {
                            const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                            return n.includes('higher') || n.includes('hmath') || n.includes('উচ্চতর');
                        });
                        subCode = matched ? (matched.code || "505") : "505";
                        subName = matched ? (matched.name || "Higher Mathematics") : "Higher Mathematics";
                        const nameBn = "উচ্চতর গণিত";

                        if (lang === 'en') {
                            subDisplay = "Higher Mathematics";
                        } else if (lang === 'both') {
                            subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Higher Mathematics</div>`;
                        } else {
                            subDisplay = nameBn;
                        }
                    } else if (isAgri) {
                        const matched = classSubjects.find(s => {
                            const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                            return n.includes('agriculture') || n.includes('agri') || n.includes('কৃষি');
                        });
                        subCode = matched ? (matched.code || "109") : "109";
                        subName = matched ? (matched.name || "Agriculture Studies") : "Agriculture Studies";
                        const nameBn = "কৃষি শিক্ষা";

                        if (lang === 'en') {
                            subDisplay = "Agriculture Studies";
                        } else if (lang === 'both') {
                            subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Agriculture Studies</div>`;
                        } else {
                            subDisplay = nameBn;
                        }
                    } else if (isHome) {
                        const matched = classSubjects.find(s => {
                            const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                            return n.includes('home') || n.includes('গার্হস্থ্য');
                        });
                        subCode = matched ? (matched.code || "151") : "151";
                        subName = matched ? (matched.name || "Home Science") : "Home Science";
                        const nameBn = "গার্হস্থ্য বিজ্ঞান";

                        if (lang === 'en') {
                            subDisplay = "Home Science";
                        } else if (lang === 'both') {
                            subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Home Science</div>`;
                        } else {
                            subDisplay = nameBn;
                        }
                    } else {
                        const matchedOpt = classSubjects.find(s => {
                            const n = ((s.name || '') + ' ' + (s.nameBn || '') + ' ' + (s.shortName || '')).toLowerCase();
                            return n.includes(optLower) || optLower.includes((s.name || '').toLowerCase());
                        });
                        if (matchedOpt) {
                            subCode = matchedOpt.code || "";
                            subName = matchedOpt.name || optSubject;
                            const nameBn = matchedOpt.nameBn || translateSubject(subName);
                            if (lang === 'en') {
                                subDisplay = subName;
                            } else if (lang === 'both') {
                                subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">${subName}</div>`;
                            } else {
                                subDisplay = nameBn;
                            }
                        } else {
                            subName = optSubject;
                            subCode = (optLower.includes('higher') || optLower.includes('উচ্চতর')) ? "505" : "109";
                            const nameBn = translateSubject(subName);
                            if (lang === 'en') {
                                subDisplay = subName;
                            } else if (lang === 'both') {
                                subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">${subName}</div>`;
                            } else {
                                subDisplay = nameBn;
                            }
                        }
                    }
                } else {
                    // Fallback when optional subject is not selected for Class 9/10
                    subCode = "109/505";
                    subName = "Agriculture Studies/Higher Mathematics";
                    const nameBn = "কৃষি শিক্ষা/উচ্চতর গণিত";
                    if (lang === 'en') {
                        subDisplay = "Agriculture Studies/Higher Mathematics";
                    } else if (lang === 'both') {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${nameBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">Agriculture Studies/Higher Mathematics</div>`;
                    } else {
                        subDisplay = nameBn;
                    }
                }
            } else {
                // Regular subject matching
                const matchedSub = classSubjects.find(sub => {
                    if (!sub.name) return false;
                    const subNameClean = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const entryNameClean = cleanSub.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return subNameClean === entryNameClean || subNameClean.includes(entryNameClean) || entryNameClean.includes(subNameClean);
                }) || classSubjects.find(sub => {
                    if (!sub.shortName) return false;
                    const shortClean = sub.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const entryClean = cleanSub.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return shortClean === entryClean || shortClean.includes(entryClean) || entryClean.includes(shortClean);
                });

                if (matchedSub) {
                    subCode = matchedSub.code || "";
                    subName = matchedSub.name || cleanSub;
                } else {
                    subCode = entry.id ? entry.id.substring(3, 6) : "কোড";
                    subName = cleanSub;
                }

                subDisplay = translateSubject(subName);
                if (lang === 'en') {
                    subDisplay = subName;
                } else if (lang === 'both') {
                    const subBn = translateSubject(subName);
                    if (subBn !== subName) {
                        subDisplay = `<div style="line-height: 1.05; margin: 0; padding: 0; font-weight: 800;">${subBn}</div><div style="font-size: 0.88em; color: #475569; font-weight: 700; line-height: 1.05; margin: 0; padding: 0;">${subName}</div>`;
                    } else {
                        subDisplay = subBn;
                    }
                }
            }

            return { subCode, subName, subDisplay };
        }

        function generateBackCardHTML(student, routineEntries, examNameTranslated, subjectsData, lang = 'bn') {
            const classBn = classTranslations[student.class] || student.class;
            const classEn = student.class;
            const classSubjects = subjectsData[student.class] || [];
            const studentRel = getStudentReligionCategory(student);
            const studentOpt = getStudentOptionalSubject(student);

            // Filter routine entries for the student (religion & optional subjects)
            let filteredEntries = (routineEntries || []).filter(entry => {
                if (!entry.subject) return true;

                // 1. Religion filtering (if separate rows exist for different religions)
                if (isEntryForOtherReligion(entry.subject, studentRel)) {
                    const hasMatchingRelEntry = routineEntries.some(other =>
                        other !== entry &&
                        !isEntryForOtherReligion(other.subject, studentRel) &&
                        isReligionSubject(other.subject)
                    );
                    if (hasMatchingRelEntry) {
                        return false; // Skip the other religion's separate row
                    }
                }

                // 2. Optional subject filtering (if separate rows exist for different optional subjects)
                if (studentOpt && isEntryForOtherOptional(entry.subject, studentOpt)) {
                    const hasMatchingOptEntry = routineEntries.some(other =>
                        other !== entry &&
                        !isEntryForOtherOptional(other.subject, studentOpt) &&
                        isOptionalComboOrSubject(other.subject)
                    );
                    if (hasMatchingOptEntry) {
                        return false; // Skip the other optional subject's separate row
                    }
                }

                return true;
            });

            let tableRows = '';
            if (filteredEntries.length > 0) {
                tableRows = filteredEntries.map(entry => {
                    let formattedDate = entry.date;
                    try {
                        const dateObj = new Date(entry.date);
                        const daysBn = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
                        const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const dayBn = daysBn[dateObj.getDay()];
                        const dayEn = daysEn[dateObj.getDay()];
                        const parts = entry.date.split('-');

                        if (lang === 'en') {
                            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]} (${dayEn})`;
                        } else if (lang === 'both') {
                            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]} (${dayBn} / ${dayEn})`;
                        } else {
                            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]} (${dayBn})`;
                        }
                    } catch (e) { }

                    const { subCode, subDisplay } = resolveSubjectForStudent(entry, student, classSubjects, lang);

                    return `
                        <tr>
                            <td>${formattedDate}</td>
                            <td>${subCode}</td>
                            <td>${subDisplay}</td>
                            <td>${getShiftTimeRange(entry.shift)}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                tableRows = `<tr><td colspan="4" style="padding: 20px; font-weight: 700; color: #475569;">${lang === 'en' ? 'No Exam Routine Found' : 'রুটিন পাওয়া যায়নি'}</td></tr>`;
            }



            const rHeadTitle = lang === 'en' ? 'Exam Routine & Detailed Instructions' : (lang === 'both' ? 'পরীক্ষার সময়সূচী ও নির্দেশনাবলী (Exam Routine & Instructions)' : 'পরীক্ষার সময়সূচী ও বিস্তারিত নির্দেশনাবলী');

            const thDate = lang === 'en' ? 'Date & Day' : (lang === 'both' ? 'তারিখ ও বার (Date)' : 'তারিখ ও বার');

            const thCode = lang === 'en' ? 'Code' : (lang === 'both' ? 'কোড (Code)' : 'বিষয় কোড');

            const thSub = lang === 'en' ? 'Subject Name' : (lang === 'both' ? 'বিষয় (Subject)' : 'বিষয়');

            const thTime = lang === 'en' ? 'Time' : (lang === 'both' ? 'সময় (Time)' : 'সময়');

            const secBn = sectionTranslations[student.section] || student.section || "";
            const secEn = student.section || "";

            let clsDisp = "";
            if (lang === 'en') {
                clsDisp = `Class: ${classEn}${secEn ? ` - Section: ${secEn}` : ''}`;
            } else if (lang === 'both') {
                clsDisp = `শ্রেণী: ${classBn}${secBn ? ` (${secBn})` : ''} / Class: ${classEn}${secEn ? ` (${secEn})` : ''}`;
            } else {
                clsDisp = `শ্রেণী: ${classBn}${secBn ? ` (শাখা: ${secBn})` : ''}`;
            }

            return `
                <div class="card">
                    <div>
                        <div class="routine-header">
                            <h2>${rHeadTitle}</h2>
                            <p style="font-size: 13.35px;">${examNameTranslated}<br>(${clsDisp})</p>
                        </div>



                        <table class="routine-table">

                            <thead>

                                <tr>

                                    <th>${thDate}</th>

                                    <th>${thCode}</th>

                                    <th>${thSub}</th>

                                    <th>${thTime}</th>

                                </tr>

                            </thead>

                            <tbody>

                                ${tableRows}

                            </tbody>

                        </table>

                    </div>

                </div>

            `;

        }

    