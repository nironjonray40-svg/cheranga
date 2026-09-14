
        // --- DYNAMIC STUDENT DATABASE & PORTAL LOGIC ---
        let uploadedStudentPhotoData = "";
        let editingStudentId = null;
        let currentListPage = 1;
        let listRowsPerPage = 20;

        // Safe JSON parser to prevent errors from empty database or null storage values
        function safeJsonParse(key, defaultValue) {
            try {
                const stored = localStorage.getItem(key);
                if (stored && stored !== 'null' && stored !== 'undefined') {
                    const parsed = JSON.parse(stored);
                    if (parsed !== null && parsed !== undefined) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error(`Error parsing ${key} from localStorage:`, e);
            }
            return defaultValue;
        }

        // Preview uploaded photo for ID Card and Form avatar
        function previewStudentPhoto(obj) {
            console.log("previewStudentPhoto triggered", obj);
            let file = null;

            // 1. Direct lookup in input files
            const fileInput = document.getElementById('student-photo');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                file = fileInput.files[0];
            }
            // 2. Fallbacks based on passed object type
            else if (obj instanceof File) {
                file = obj;
            } else if (obj && obj.target && obj.target.files && obj.target.files[0]) {
                file = obj.target.files[0];
            } else if (obj && obj.files && obj.files[0]) {
                file = obj.files[0];
            }

            console.log("File detected:", file);
            if (file) {
                // Instantly generate and assign native Object URL for synchronous preview
                const objectURL = URL.createObjectURL(file);

                const formImg = document.getElementById('form-avatar-img');
                const formPlaceholder = document.getElementById('form-avatar-placeholder');
                const statusText = document.getElementById('upload-status-text');

                if (formImg) {
                    console.log("Setting formImg source and showing it instantly");
                    formImg.src = objectURL;
                    formImg.style.display = "block";
                }
                if (formPlaceholder) {
                    console.log("Hiding formPlaceholder");
                    formPlaceholder.style.display = "none";
                }
                if (statusText) {
                    statusText.innerText = "ছবি সফলভাবে লোড হয়েছে";
                    statusText.style.color = "var(--neon-green)";
                }

                // Read as Data URL in the background to preserve data for localStorage saving
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log("FileReader loaded result successfully in background");
                    uploadedStudentPhotoData = e.target.result || reader.result;

                    // ID Card Display (for modal previews)
                    const img = document.getElementById('id-card-photo');
                    const placeholder = document.getElementById('id-card-photo-placeholder');
                    if (img) {
                        img.src = uploadedStudentPhotoData;
                        img.style.display = "block";
                    }
                    if (placeholder) {
                        placeholder.style.display = "none";
                    }
                };
                reader.onerror = function (err) {
                    console.error("FileReader error in background:", err);
                };
                reader.readAsDataURL(file);
            } else {
                console.error("No file detected in previewStudentPhoto");
            }
        }

        function loadClassSections() {
            const defaultSections = [
                { class: "Class 6", section: "A", capacity: 50 },
                { class: "Class 6", section: "B", capacity: 50 },
                { class: "Class 7", section: "A", capacity: 50 },
                { class: "Class 7", section: "B", capacity: 50 },
                { class: "Class 8", section: "A", capacity: 45 },
                { class: "Class 8", section: "B", capacity: 45 },
                { class: "Class 9", section: "A", capacity: 45 },
                { class: "Class 9", section: "B", capacity: 45 },
                { class: "Class 9", section: "C", capacity: 45 },
                { class: "Class 10", section: "A", capacity: 40 },
                { class: "Class 10", section: "B", capacity: 40 }
            ];
            const parsed = safeJsonParse('school_class_sections', null);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(s => s && typeof s === 'object' && s.class && s.section);
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return defaultSections;
        }

        function populateStudentPortalSectionDropdown(className) {
            const sectionSelect = document.getElementById('student-section');
            if (!sectionSelect) return;

            const sections = loadClassSections();
            const classSections = sections.filter(s => isSameClass(s.class, className));

            if (classSections.length === 0) {
                sectionSelect.innerHTML = '<option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>';
            } else {
                const currentVal = sectionSelect.value;
                sectionSelect.innerHTML = classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
                if (currentVal && classSections.some(s => isSameSection(s.section, currentVal))) {
                    sectionSelect.value = currentVal;
                } else if (classSections.length > 0) {
                    sectionSelect.value = classSections[0].section;
                }
            }
        }

        // Auto assign roll number if configured
        function handleClassSelectChange() {
            const classVal = document.getElementById('student-class').value;

            // Populate sections for this class dynamically
            populateStudentPortalSectionDropdown(classVal);

            // Show/Hide Group option based on Class (only for Nine and Ten) - Always hidden per user request
            const groupContainer = document.getElementById('group-select-container');
            const groupSelect = document.getElementById('student-roll');
            if (groupContainer && groupSelect) {
                groupContainer.style.display = "none";
                groupSelect.required = false;
                if (!groupSelect.value) {
                    groupSelect.value = "General";
                }
            }

            // Show/Hide Optional Subject option based on Class (only for Nine and Ten)
            const optionalContainer = document.getElementById('optional-subject-container');
            const optionalSelect = document.getElementById('student-optional-subject');
            if (optionalContainer && optionalSelect) {
                if (classVal === "Nine" || classVal === "Ten" || classVal === "Class 9" || classVal === "Class 10") {
                    optionalContainer.style.display = "block";
                    optionalSelect.required = true;
                    populateOptionalSubjects(classVal);
                } else {
                    optionalContainer.style.display = "none";
                    optionalSelect.required = false;
                    optionalSelect.value = "";
                    optionalSelect.innerHTML = '<option value="">No Optional Subject</option>';
                }
            }

            // Update live card preview values
            updateCardPreview();
        }

        // Apply ID card glow theme on load
        function applyIdCardTheme() {
            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const theme = idRegSettings.idTheme || 'cyan';
            const cardEl = document.getElementById('printable-id-card');
            if (cardEl) {
                cardEl.style.borderColor = `var(--neon-${theme})`;
                cardEl.style.boxShadow = `0 0 20px var(--neon-${theme})`;
            }
        }

        // Update ID Card display dynamically in real time
        function updateCardPreview() {
            const name = document.getElementById('student-name').value || "Student Name";
            const className = document.getElementById('student-class').value || "-";
            const roll = document.getElementById('student-roll').value || "-";
            const blood = document.getElementById('student-blood').value || "-";
            const phone = document.getElementById('student-phone').value || "-";

            const nameEl = document.getElementById('card-display-name');
            if (nameEl) nameEl.innerText = name;
            const classEl = document.getElementById('card-display-class');
            if (classEl) classEl.innerText = className;
            const rollEl = document.getElementById('card-display-roll');
            if (rollEl) rollEl.innerText = roll;
            const bloodEl = document.getElementById('card-display-blood');
            if (bloodEl) bloodEl.innerText = blood;
            const phoneEl = document.getElementById('card-display-phone');
            if (phoneEl) phoneEl.innerText = phone;
        }

        // Update Student ID & Registration preview inputs in real time
        function updateIdRegPreviews() {
            const className = document.getElementById('student-class').value;
            const sectionName = document.getElementById('student-section')?.value || 'A';
            const students = loadStudents();

            if (editingStudentId) {
                const s = students.find(x => x.id === editingStudentId);
                if (s && isSameClass(s.class, className) && isSameSection(s.section, sectionName)) {
                    const idField = document.getElementById('student-id-preview');
                    if (idField) idField.value = s.studentId || "-";
                    const regField = document.getElementById('student-reg-preview');
                    if (regField) regField.value = s.regNo || "-";

                    const cardId = document.getElementById('card-display-id');
                    if (cardId) cardId.innerText = s.studentId || "-";
                    const cardReg = document.getElementById('card-display-reg');
                    if (cardReg) cardReg.innerText = s.regNo || "-";
                    return;
                }
            }

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const prefix = getClassIdPrefix(className);

            // Calculate class and section-specific serial number (starting from 001 per section)
            const effectiveSec = sectionName || 'A';
            const classSecStudents = students.filter(s => isSameClass(s.class, className) && isSameSection(s.section, effectiveSec));
            let maxSerial = 0;
            classSecStudents.forEach(s => {
                if (editingStudentId && s.id === editingStudentId) return;

                if (s.studentId) {
                    const last3 = s.studentId.slice(-3);
                    const serial = parseInt(last3, 10);
                    if (!isNaN(serial) && serial > maxSerial) {
                        maxSerial = serial;
                    }
                }
            });
            const nextSerial = maxSerial > 0 ? maxSerial + 1 : classSecStudents.length + 1;
            const serialStr = String(nextSerial).padStart(3, '0');
            const studentIdNumber = `${prefix}${serialStr}`;

            // Calculate class-specific registration number with 3-digit sequential serial (starting from 001 per class)
            const regPrefix = getClassRegPrefix(className);
            const classStudentsForReg = students.filter(s => isSameClass(s.class, className));
            let maxRegSerial = 0;
            classStudentsForReg.forEach(s => {
                if (editingStudentId && s.id === editingStudentId) return;

                if (s.regNo) {
                    if (s.regNo.startsWith(regPrefix)) {
                        const suffix = s.regNo.slice(regPrefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    } else {
                        const last3 = s.regNo.slice(-3);
                        const serial = parseInt(last3, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                }
            });
            const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : classStudentsForReg.length + 1;
            const regSerialStr = String(nextRegSerial).padStart(3, '0');
            const registrationNumber = `${regPrefix}${regSerialStr}`;

            const idField = document.getElementById('student-id-preview');
            if (idField) idField.value = studentIdNumber;
            const regField = document.getElementById('student-reg-preview');
            if (regField) regField.value = registrationNumber;

            const cardId = document.getElementById('card-display-id');
            if (cardId) cardId.innerText = studentIdNumber;
            const cardReg = document.getElementById('card-display-reg');
            if (cardReg) cardReg.innerText = registrationNumber;
        }

        // Synchronize Address elements
        function handleAddressSyncToggle(checked) {
            const present = document.getElementById('present-address').value;
            const permField = document.getElementById('permanent-address');
            if (checked) {
                permField.value = present;
                permField.readOnly = true;
                permField.style.opacity = "0.7";
            } else {
                permField.readOnly = false;
                permField.style.opacity = "1";
            }
        }

        function syncAddress() {
            const isSame = document.getElementById('same-address-chk').checked;
            if (isSame) {
                document.getElementById('permanent-address').value = document.getElementById('present-address').value;
            }
        }

        // Trigger hidden input click
        function triggerFileInput() {
            document.getElementById('student-photo').click();
        }

        // Reset Admission form and preview values
        function resetAdmissionForm() {
            document.getElementById('id-card-form').reset();
            uploadedStudentPhotoData = "";

            // Reset photo previews
            const img = document.getElementById('id-card-photo');
            const placeholder = document.getElementById('id-card-photo-placeholder');
            if (img) {
                img.src = "";
                img.style.display = "none";
            }
            if (placeholder) {
                placeholder.style.display = "block";
            }

            const formImg = document.getElementById('form-avatar-img');
            const formPlaceholder = document.getElementById('form-avatar-placeholder');
            const statusText = document.getElementById('upload-status-text');
            if (formImg) {
                formImg.src = "";
                formImg.style.display = "none";
            }
            if (formPlaceholder) {
                formPlaceholder.style.display = "flex";
            }
            if (statusText) {
                statusText.innerText = "কোনো ছবি নির্বাচন করা হয়নি";
                statusText.style.color = "var(--muted-text)";
            }

            // Reset address readOnly
            const permField = document.getElementById('permanent-address');
            if (permField) {
                permField.readOnly = false;
                permField.style.opacity = "1";
            }

            // Re-load defaults & ID/Reg previews
            handleClassSelectChange();
            updateIdRegPreviews();
            updateCardPreview();

            editingStudentId = null;
            const submitBtnText = document.querySelector('#id-card-form button[type="submit"] span');
            if (submitBtnText) submitBtnText.textContent = "💾 ভর্তি তথ্য সংরক্ষণ করুন";

            const formTitle = document.getElementById('portal-title');
            if (formTitle) formTitle.textContent = "স্টুডেন্ট পোর্টাল - ভর্তি ফরম";
            const formSubtitle = document.getElementById('portal-subtitle');
            if (formSubtitle) formSubtitle.textContent = `শিক্ষাবর্ষ - ${new Date().getFullYear()}`;
        }

        // Generate ID Card and save student to database
        function generateIDCard(event) {
            event.preventDefault();

            const name = document.getElementById('student-name').value;
            const nameBn = document.getElementById('student-name-bn').value;
            const className = document.getElementById('student-class').value;
            const section = document.getElementById('student-section').value;

            // Assign Group dynamically from Class & Section for Nine and Ten to match hidden field
            let roll = "General";
            if (className === "Nine" || className === "Ten" || className === "Class 9" || className === "Class 10") {
                if (section === "A") roll = "Science";
                else if (section === "B") roll = "Humanities";
                else if (section === "C") roll = "Business Studies";
            }
            const session = document.getElementById('student-session').value;
            const dob = document.getElementById('student-dob').value;
            const gender = document.getElementById('student-gender').value;
            const religion = document.getElementById('student-religion').value;
            const blood = document.getElementById('student-blood').value;
            const phone = document.getElementById('student-phone').value;
            const email = document.getElementById('student-email').value;
            const fatherName = document.getElementById('father-name').value;
            const fatherOccup = document.getElementById('father-occupation').value;
            const fatherPhone = document.getElementById('father-phone').value;
            const motherName = document.getElementById('mother-name').value;
            const motherOccup = document.getElementById('mother-occupation').value;
            const motherPhone = document.getElementById('mother-phone').value;
            const presentAddress = document.getElementById('present-address').value;
            const permanentAddress = document.getElementById('permanent-address').value;

            if (editingStudentId) {
                const students = loadStudents();
                const s = students.find(x => x.id === editingStudentId);
                if (s) {
                    const idFieldVal = document.getElementById('student-id-preview')?.value;
                    const regFieldVal = document.getElementById('student-reg-preview')?.value;
                    if (idFieldVal && idFieldVal !== "-") s.studentId = idFieldVal;
                    if (regFieldVal && regFieldVal !== "-") s.regNo = regFieldVal;

                    s.name = name;
                    s.nameBn = nameBn;
                    s.class = className;
                    s.section = section;
                    s.roll = roll;
                    s.session = session;
                    s.dob = dob;
                    s.gender = gender;
                    s.religion = religion;
                    s.blood = blood;
                    s.phone = phone;
                    s.email = email;
                    s.fatherName = fatherName;
                    s.fatherOccup = fatherOccup;
                    s.fatherPhone = fatherPhone;
                    s.motherName = motherName;
                    s.motherOccup = motherOccup;
                    s.motherPhone = motherPhone;
                    s.presentAddress = presentAddress;
                    s.permanentAddress = permanentAddress;
                    if (uploadedStudentPhotoData) {
                        s.photo = uploadedStudentPhotoData;
                    }
                    s.optionalSubject = (className === "Nine" || className === "Ten" || className === "Class 9" || className === "Class 10")
                        ? (document.getElementById('student-optional-subject') ? document.getElementById('student-optional-subject').value : "")
                        : "";
                }
                localStorage.setItem('school_students', JSON.stringify(students));

                // Notify main.js sync if exists by triggering setItem
                window.dispatchEvent(new Event('storage'));

                editingStudentId = null;
                alert(`শিক্ষার্থী "${name}" এর প্রোফাইল সফলভাবে আপডেট করা হয়েছে!`);

                resetAdmissionForm();
                renderStudentList();
                renderPromotionList();

                window.history.pushState({}, '', '?view=list');
                switchPortalView('list');
                return;
            }

            // Load settings & check photo constraint
            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            if (idRegSettings.requirePhoto && !uploadedStudentPhotoData) {
                alert("ত্রুটি: ভর্তি ফরমটি জমা দিতে শিক্ষার্থীর ছবি আপলোড করা আবশ্যক।");
                return;
            }

            const prefix = getClassIdPrefix(className);

            // Calculate class and section-specific serial number (starting from 001 per section)
            const students = loadStudents();
            const effectiveSec = section || 'A';
            const classSecStudents = students.filter(s => isSameClass(s.class, className) && isSameSection(s.section, effectiveSec));
            let maxSerial = 0;
            classSecStudents.forEach(s => {
                if (s.studentId) {
                    const last3 = s.studentId.slice(-3);
                    const serial = parseInt(last3, 10);
                    if (!isNaN(serial) && serial > maxSerial) {
                        maxSerial = serial;
                    }
                }
            });
            const nextSerial = maxSerial > 0 ? maxSerial + 1 : classSecStudents.length + 1;
            const serialStr = String(nextSerial).padStart(3, '0');
            const studentIdNumber = `${prefix}${serialStr}`;

            // Calculate class-specific registration number with 3-digit sequential serial (starting from 001 per class)
            const regPrefix = getClassRegPrefix(className);
            const classStudentsForReg = students.filter(s => isSameClass(s.class, className));
            let maxRegSerial = 0;
            classStudentsForReg.forEach(s => {
                if (s.regNo) {
                    if (s.regNo.startsWith(regPrefix)) {
                        const suffix = s.regNo.slice(regPrefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    } else {
                        const last3 = s.regNo.slice(-3);
                        const serial = parseInt(last3, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                }
            });
            const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : classStudentsForReg.length + 1;
            const regSerialStr = String(nextRegSerial).padStart(3, '0');
            const registrationNumber = `${regPrefix}${regSerialStr}`;

            // Save student in Local Database
            const newStudent = {
                id: Date.now().toString(),
                studentId: studentIdNumber,
                regNo: registrationNumber,
                name: name,
                nameBn: nameBn,
                class: className,
                section: section,
                roll: String(nextSerial),
                session: session,
                dob: dob,
                gender: gender,
                religion: religion,
                blood: blood,
                phone: phone,
                email: email,
                fatherName: fatherName,
                fatherOccup: fatherOccup,
                fatherPhone: fatherPhone,
                motherName: motherName,
                motherOccup: motherOccup,
                motherPhone: motherPhone,
                presentAddress: presentAddress,
                permanentAddress: permanentAddress,
                photo: uploadedStudentPhotoData || "",
                optionalSubject: (className === "Nine" || className === "Ten" || className === "Class 9" || className === "Class 10")
                    ? (document.getElementById('student-optional-subject') ? document.getElementById('student-optional-subject').value : "")
                    : ""
            };

            students.push(newStudent);
            localStorage.setItem('school_students', JSON.stringify(students));

            // Smooth effect
            const card = document.getElementById('printable-id-card');
            if (card) {
                card.style.transform = "scale(1.05)";
                setTimeout(() => card.style.transform = "scale(1)", 300);
            }

            // Reset Form (but keep photo variables clean)
            resetAdmissionForm();

            alert(`শিক্ষার্থী "${name}" এর ভর্তি প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে!`);

            // Re-render sub-lists in case user switches views
            renderStudentList();
            renderPromotionList();

            // Redirect automatically to Student List
            window.history.pushState({}, '', '?view=list');
            switchPortalView('list');
        }

        // Database helpers
        function loadStudents() {
            const students = safeJsonParse('school_students', []);
            return Array.isArray(students) ? students : [];
        }

        function saveStudents(students) {
            if (!Array.isArray(students)) return;
            const jsonStr = JSON.stringify(students);
            localStorage.setItem('school_students', jsonStr);

            // Direct sync with SQLite backend server if online
            if (typeof fetch === 'function') {
                fetch('/api/db/set', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_students',
                        value: jsonStr
                    })
                }).catch(e => {
                    console.log('Background DB sync notice:', e);
                });
            }

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('dbSynced', { detail: { key: 'school_students' } }));
        }

        // Back button handler for Add / Edit Student form
        function handleStudentFormBack() {
            editingStudentId = null;
            resetAdmissionForm();
            window.history.pushState({}, '', '?view=list');
            switchPortalView('list');
        }

        // --- SUBVIEWS SWITCHING MECHANISM ---
        function switchPortalView(viewName) {
            const validViews = ['add', 'list', 'promote', 'online-admissions', 'admissions'];
            const targetViewName = (viewName === 'admissions' || viewName === 'online-admissions' || viewName === 'online-admission') ? 'online-admissions' : (validViews.includes(viewName) ? viewName : 'list');

            if (typeof window.checkResourceAccessPermission === 'function') {
                const check = window.checkResourceAccessPermission('student-portal.html?view=' + targetViewName);
                if (!check.allowed) {
                    const targetView = document.getElementById('subview-' + targetViewName) || document.querySelector('.portal-container');
                    if (targetView && typeof window.renderNotAccessPermissionsScreen === 'function') {
                        document.querySelectorAll('.portal-sub-view').forEach(view => {
                            view.classList.remove('active');
                            view.style.display = 'none';
                        });
                        targetView.classList.add('active');
                        targetView.style.display = 'block';
                        window.renderNotAccessPermissionsScreen(targetView, check);
                    }
                    return;
                }
            }

            // Hide all sub-views
            const subviews = document.querySelectorAll('.portal-sub-view');
            subviews.forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none';
            });

            // Toggle target sub-view
            const targetView = document.getElementById('subview-' + targetViewName);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block';
            }

            // Update page headings based on subview
            const titleEl = document.getElementById('portal-title');
            const subtitleEl = document.getElementById('portal-subtitle');
            const titleWrapper = document.querySelector('.section-title-wrapper');

            if (targetViewName === 'list' || targetViewName === 'add' || targetViewName === 'online-admissions') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                if (targetViewName === 'list') {
                    renderStudentList();
                } else if (targetViewName === 'online-admissions') {
                    renderOnlineAdmissionsList();
                } else {
                    if (editingStudentId) {
                        if (titleEl) titleEl.textContent = "Student Portal - Edit Student Details";
                        if (subtitleEl) subtitleEl.textContent = "Modify registered student profile information";
                        // Prevent generating new ID/Reg, retrieve existing ones
                        const students = loadStudents();
                        const s = students.find(x => x.id === editingStudentId);
                        if (s) {
                            const idPrev = document.getElementById('student-id-preview');
                            const regPrev = document.getElementById('student-reg-preview');
                            if (idPrev) idPrev.value = s.studentId || '-';
                            if (regPrev) regPrev.value = s.regNo || '-';
                        }
                    } else {
                        if (titleEl) titleEl.textContent = "স্টুডেন্ট পোর্টাল - ভর্তি ফরম";
                        if (subtitleEl) subtitleEl.textContent = `শিক্ষাবর্ষ - ${new Date().getFullYear()}`;
                        updateIdRegPreviews();
                    }
                    updateCardPreview();
                }
            } else {
                if (titleWrapper) titleWrapper.style.display = '';
                if (targetViewName === 'promote') {
                    if (titleEl) titleEl.textContent = "Student Portal - Promotion & Demotion";
                    if (subtitleEl) subtitleEl.textContent = "Manage mass student promotions and class adjustments";
                    renderPromotionList();
                }
            }
        }

        function updateStudentStatsSummary(filtered) {
            const statsContainer = document.getElementById('list-stats-summary');
            if (!statsContainer) return;

            const totalCount = filtered.length;
            if (totalCount === 0) {
                statsContainer.innerHTML = `<span class="saas-stat-pill" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;">মোট: ০ জন</span>`;
                return;
            }

            const maleCount = filtered.filter(s => s.gender === 'Male').length;
            const femaleCount = filtered.filter(s => s.gender === 'Female').length;
            const otherGenderCount = filtered.filter(s => s.gender === 'Other').length;

            const islamCount = filtered.filter(s => s.religion === 'Islam').length;
            const hinduCount = filtered.filter(s => s.religion === 'Hindu (হিন্দু)').length;
            const buddhistCount = filtered.filter(s => s.religion === 'Buddhism').length;
            const christianCount = filtered.filter(s => s.religion === 'Christianity').length;
            const otherRelCount = filtered.filter(s => s.religion === 'Others').length;

            let statsHTML = `
                <span class="saas-stat-pill" style="background: #0f172a; color: #ffffff;">
                    <span>👥</span> মোট: ${totalCount} জন
                </span>
                <span class="saas-stat-pill" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                    <span>👦</span> ছাত্র: ${maleCount}
                </span>
                <span class="saas-stat-pill" style="background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;">
                    <span>👧</span> ছাত্রী: ${femaleCount}
                </span>
            `;

            if (otherGenderCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #f8fafc; color: #475569; border: 1px solid #e2e8f0;">অন্যান্য: ${otherGenderCount}</span>`;
            }

            if (islamCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">ইসলাম: ${islamCount}</span>`;
            }
            if (hinduCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">হিন্দু: ${hinduCount}</span>`;
            }
            if (buddhistCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe;">বৌদ্ধ: ${buddhistCount}</span>`;
            }
            if (christianCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">খ্রিস্টান: ${christianCount}</span>`;
            }
            if (otherRelCount > 0) {
                statsHTML += `<span class="saas-stat-pill" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;">অন্যান্য: ${otherRelCount}</span>`;
            }

            statsContainer.innerHTML = statsHTML;
        }

        // --- STUDENT ROSTER LIST RENDERING ---
        function handleStudentClassFilterChange() {
            // Update section, gender, and religion dropdowns based on selected class
            populateStudentPortalFilterDropdowns(true);
            currentListPage = 1;
            renderStudentList();
        }

        function renderStudentList() {
            const searchInput = document.getElementById('student-search-input');
            const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const classFilter = document.getElementById('student-class-filter') ? document.getElementById('student-class-filter').value : '';
            const sectionFilter = document.getElementById('student-section-filter') ? document.getElementById('student-section-filter').value : '';
            const genderFilter = document.getElementById('student-gender-filter') ? document.getElementById('student-gender-filter').value : '';
            const religionFilter = document.getElementById('student-religion-filter') ? document.getElementById('student-religion-filter').value : '';
            const container = document.getElementById('student-list-rows');
            if (!container) return;

            const students = loadStudents();
            const filtered = students.filter(s => {
                if (!s) return false;
                const nameVal = (s.name || '').toLowerCase();
                const nameBnVal = (s.nameBn || '').toLowerCase();
                const idVal = (s.studentId || '').toLowerCase();
                const classVal = (s.class || '').toLowerCase();
                const secVal = (s.section || '').toLowerCase();
                const rollVal = String(s.roll || '').toLowerCase();
                const fatherVal = (s.fatherName || '').toLowerCase();
                const motherVal = (s.motherName || '').toLowerCase();
                const phoneVal = (s.fatherPhone || s.phone || s.motherPhone || '').toLowerCase();

                const matchesSearch = !searchVal ||
                    nameVal.includes(searchVal) ||
                    nameBnVal.includes(searchVal) ||
                    idVal.includes(searchVal) ||
                    classVal.includes(searchVal) ||
                    secVal.includes(searchVal) ||
                    rollVal.includes(searchVal) ||
                    fatherVal.includes(searchVal) ||
                    motherVal.includes(searchVal) ||
                    phoneVal.includes(searchVal);
                const matchesClass = !classFilter || isSameClass(s.class, classFilter);
                const matchesSection = !sectionFilter || isSameSection(s.section, sectionFilter);
                const matchesGender = !genderFilter || 
                    (s.gender && (
                        s.gender.toLowerCase() === genderFilter.toLowerCase() ||
                        (genderFilter.toLowerCase() === 'male' && s.gender.includes('ছাত্র') && !s.gender.includes('ছাত্রী')) ||
                        (genderFilter.toLowerCase() === 'female' && s.gender.includes('ছাত্রী'))
                    ));
                const matchesReligion = !religionFilter || 
                    (s.religion && (
                        s.religion.toLowerCase() === religionFilter.toLowerCase() ||
                        (religionFilter.includes('Hindu') && s.religion.includes('Hindu')) ||
                        (religionFilter.includes('Islam') && s.religion.includes('Islam'))
                    ));
                return matchesSearch && matchesClass && matchesSection && matchesGender && matchesReligion;
            });

            // Sort filtered students by Class hierarchy order, Section, and Student ID/Roll (001, 002...)
            const classHierarchy = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            filtered.sort((a, b) => {
                const classA = (a.class || '').replace('Class ', '').trim();
                const classB = (b.class || '').replace('Class ', '').trim();
                const idxA = classHierarchy.indexOf(classA) !== -1 ? classHierarchy.indexOf(classA) : 99;
                const idxB = classHierarchy.indexOf(classB) !== -1 ? classHierarchy.indexOf(classB) : 99;
                if (idxA !== idxB) return idxA - idxB;

                const secA = (a.section || 'A').toString().trim();
                const secB = (b.section || 'A').toString().trim();
                if (secA !== secB) return secA.localeCompare(secB);

                const rollA = parseInt((a.studentId ? a.studentId.slice(-3) : '') || a.roll || '0', 10);
                const rollB = parseInt((b.studentId ? b.studentId.slice(-3) : '') || b.roll || '0', 10);
                if (!isNaN(rollA) && !isNaN(rollB) && rollA !== rollB) return rollA - rollB;

                const idA = a.studentId || '';
                const idB = b.studentId || '';
                return idA.localeCompare(idB, undefined, { numeric: true });
            });

            // Update bottom summary badges
            updateStudentStatsSummary(filtered);

            if (filtered.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding: 42px 20px !important;">
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                                <div style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <div style="font-weight: 700; color: #334155; font-size: 1.05rem;">কোনো শিক্ষার্থী পাওয়া যায়নি</div>
                                <div style="color: #64748b; font-size: 0.88rem;">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন (No matching students found)</div>
                            </div>
                        </td>
                    </tr>
                `;
                document.getElementById('list-pagination-info').innerText = "পাতা: ০ এর ০";
                ['list-page-first', 'list-page-prev', 'list-page-next', 'list-page-last'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.disabled = true;
                        btn.style.opacity = "0.3";
                        btn.style.cursor = "not-allowed";
                    }
                });
                // Reset select all checkbox and bulk actions bar
                const selectAllChk = document.getElementById('select-all-students-chk');
                if (selectAllChk) selectAllChk.checked = false;
                updateDeleteSelectedBtn();
                return;
            }

            // Calculate pagination variables
            const totalStudents = filtered.length;
            let limit = listRowsPerPage === 'all' ? totalStudents : parseInt(listRowsPerPage, 10);
            const totalPages = Math.ceil(totalStudents / limit);

            // Capping current page
            currentListPage = Math.max(1, Math.min(currentListPage, totalPages));

            // Slicing students
            let startOffset = (currentListPage - 1) * limit;
            let endOffset = listRowsPerPage === 'all' ? totalStudents : startOffset + limit;
            const paginatedStudents = filtered.slice(startOffset, endOffset);

            let html = '';
            paginatedStudents.forEach((s, index) => {
                const isSelected = selectedStudentIds.has(String(s.id));
                const photoHTML = s.photo
                    ? `<img src="${s.photo}" class="student-list-photo" alt="Photo" loading="lazy">`
                    : `<div class="student-list-photo-placeholder"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                const studentId = s.studentId || '-';
                const regNoDisplay = s.regNo || (s.studentId ? `${getClassRegPrefix(s.class)}${String(s.studentId.slice(-3)).padStart(3, '0')}` : '');
                const sectionClean = s.section ? s.section.replace(/^Section\s*/i, '').replace(/^শাখা\s*/i, '').trim() : '';
                const sectionDisplay = sectionClean ? ` (${sectionClean})` : '';
                const fatherName = s.fatherName || '—';
                const motherName = s.motherName || '—';
                const fatherPhone = s.fatherPhone || s.phone || '';
                const motherPhone = s.motherPhone || s.phone || '';

                const fatherPhoneHTML = fatherPhone
                    ? `<a href="tel:${fatherPhone}" class="saas-phone-pill" title="Call Father"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${fatherPhone}</a>`
                    : `<span style="color:#94a3b8; font-size:0.80rem; font-style:italic;">No phone</span>`;

                const motherPhoneHTML = motherPhone
                    ? `<a href="tel:${motherPhone}" class="saas-phone-pill" title="Call Mother"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${motherPhone}</a>`
                    : `<span style="color:#94a3b8; font-size:0.80rem; font-style:italic;">No phone</span>`;

                html += `
                    <tr class="${isSelected ? 'saas-row-selected' : ''}">
                        <td style="text-align: center; padding: 10px 6px;">
                            <input type="checkbox" class="student-select-chk" value="${s.id}" ${isSelected ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #0284c7; cursor: pointer; vertical-align: middle;" onchange="toggleStudentSelection('${s.id}', this.checked)" title="এই শিক্ষার্থী নির্বাচন করুন">
                        </td>
                        <td style="text-align: center;">
                            <span class="saas-sl-badge">${startOffset + index + 1}</span>
                        </td>
                        <td style="text-align: center;">
                            <div class="saas-avatar-wrap">${photoHTML}</div>
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div><span class="saas-id-badge" title="Student ID">${studentId}</span></div>
                            ${regNoDisplay ? `<div><span class="saas-reg-badge" title="রেজিস্ট্রেশন নম্বর (Registration No): ${regNoDisplay}" style="color: #000000 !important; font-weight: 800;">${regNoDisplay}</span></div>` : ''}
                        </td>
                        <td style="text-align: left;">
                            <div class="saas-name-title">${s.nameBn || s.name}</div>
                            <div class="saas-class-badge">${s.class}${sectionDisplay}</div>
                        </td>
                        <td style="text-align: left;">
                            <div class="saas-guardian-name">${fatherName}</div>
                            ${fatherPhoneHTML}
                        </td>
                        <td style="text-align: left;">
                            <div class="saas-guardian-name">${motherName}</div>
                            ${motherPhoneHTML}
                        </td>
                        <td style="text-align: center;">
                            <div class="saas-action-group">
                                <button class="action-btn-sm btn-view-card" title="ID Card" onclick="viewModalCard('${s.id}')">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="pointer-events:none;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V18z"/></svg>
                                    <span>Card</span>
                                </button>
                                <button class="action-btn-sm btn-view-profile" title="Profile" onclick="viewModalProfile('${s.id}')">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="pointer-events:none;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                    <span>Profile</span>
                                </button>
                                <button class="action-btn-sm btn-edit-student" title="Edit" onclick="editStudent('${s.id}')">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="pointer-events:none;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    <span>Edit</span>
                                </button>
                                <button class="action-btn-sm btn-delete-student" title="Delete" onclick="deleteStudent('${s.id}')">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="pointer-events:none;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;

            // Reset header select-all checkbox and update actions bar visibility
            const selectAllChk = document.getElementById('select-all-students-chk');
            if (selectAllChk) selectAllChk.checked = false;
            updateDeleteSelectedBtn();

            // Update DOM pagination states
            document.getElementById('list-pagination-info').innerText = `পাতা: ${currentListPage} এর ${totalPages}`;

            ['list-page-first', 'list-page-prev'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.disabled = (currentListPage === 1);
                    btn.style.opacity = (currentListPage === 1) ? "0.3" : "1";
                    btn.style.cursor = (currentListPage === 1) ? "not-allowed" : "pointer";
                }
            });

            ['list-page-next', 'list-page-last'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.disabled = (currentListPage === totalPages);
                    btn.style.opacity = (currentListPage === totalPages) ? "0.3" : "1";
                    btn.style.cursor = (currentListPage === totalPages) ? "not-allowed" : "pointer";
                }
            });
        }

        // Rearrange all student IDs according to class prefix rules and branch-specific serials (001, 002, 003...)
        function rearrangeStudentIdsByClass(silent = false) {
            const students = loadStudents();
            if (!students || students.length === 0) {
                if (!silent) alert("কোনো শিক্ষার্থী পাওয়া যায়নি।");
                return;
            }

            // Group students by class AND section
            const grouped = {};
            students.forEach(s => {
                const c = s.class || 'Unknown';
                const sec = s.section || 'A';
                const key = `${c}___${sec}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(s);
            });

            let updatedCount = 0;
            // Rearrange per class and section group (001, 002, 003...)
            Object.keys(grouped).forEach(key => {
                const parts = key.split('___');
                const cName = parts[0];
                const secName = parts[1] || 'A';
                const prefix = getClassIdPrefix(cName);

                const list = grouped[key];
                // Sort by numeric roll or current studentId serial, keeping stable order
                list.sort((a, b) => {
                    const rollA = parseInt((a.studentId ? a.studentId.slice(-3) : '') || a.roll || '0', 10);
                    const rollB = parseInt((b.studentId ? b.studentId.slice(-3) : '') || b.roll || '0', 10);
                    if (!isNaN(rollA) && !isNaN(rollB) && rollA !== rollB) return rollA - rollB;
                    return (a.name || '').localeCompare(b.name || '');
                });

                list.forEach((s, idx) => {
                    const serialStr = String(idx + 1).padStart(3, '0');
                    const newId = `${prefix}${serialStr}`;
                    const newRoll = String(idx + 1);
                    if (s.studentId !== newId || s.roll !== newRoll) {
                        s.studentId = newId;
                        s.roll = newRoll;
                        updatedCount++;
                    }
                });
            });

            const classHierarchy = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            const flattened = [];
            const sortedKeys = Object.keys(grouped).sort((a, b) => {
                const partsA = a.split('___');
                const partsB = b.split('___');
                const cleanClassA = partsA[0].replace('Class ', '').trim();
                const cleanClassB = partsB[0].replace('Class ', '').trim();
                const idxA = classHierarchy.indexOf(cleanClassA) !== -1 ? classHierarchy.indexOf(cleanClassA) : 99;
                const idxB = classHierarchy.indexOf(cleanClassB) !== -1 ? classHierarchy.indexOf(cleanClassB) : 99;

                if (idxA !== idxB) {
                    return idxA - idxB;
                }

                const secA = partsA[1] || '';
                const secB = partsB[1] || '';
                return secA.localeCompare(secB);
            });

            sortedKeys.forEach(key => {
                flattened.push(...grouped[key]);
            });

            saveStudents(flattened);
            renderStudentList();

            if (!silent) {
                alert(`High Level ও Primary Level এর প্রতিটি শ্রেণির শাখা (Section) অনুসারে সকল শিক্ষার্থীর Student ID ও Roll ০০১ থেকে ধারাবাহিকভাবে সাজানো হয়েছে। (মোট ${updatedCount} টি আইডি আপডেট হয়েছে)`);
            }
        }

        function toggleSearchInput() {
            const container = document.getElementById('search-input-container');
            const input = document.getElementById('student-search-input');
            if (!container) return;

            if (container.style.display === 'none' || container.style.display === '') {
                container.style.display = 'block';
                if (input) input.focus();
            } else {
                if (input && input.value) {
                    input.value = '';
                    currentListPage = 1;
                    renderStudentList();
                }
                container.style.display = 'none';
            }
        }

        function changeListRowsPerPage(val) {
            listRowsPerPage = val;
            currentListPage = 1;
            renderStudentList();
        }

        function changeListPage(delta) {
            currentListPage += delta;
            renderStudentList();
        }

        function goToListPage(page) {
            if (page === 1) {
                currentListPage = 1;
            } else if (page === -1) {
                const searchVal = document.getElementById('student-search-input').value.toLowerCase();
                const classFilter = document.getElementById('student-class-filter').value;
                const sectionFilter = document.getElementById('student-section-filter').value;
                const students = loadStudents();
                const filtered = students.filter(s => {
                    if (!s) return false;
                    const nameVal = (s.name || '').toLowerCase();
                    const idVal = (s.studentId || '').toLowerCase();
                    const classVal = (s.class || '').toLowerCase();
                    const rollVal = String(s.roll || '').toLowerCase();

                    const matchesSearch = nameVal.includes(searchVal) ||
                        idVal.includes(searchVal) ||
                        classVal.includes(searchVal) ||
                        rollVal.includes(searchVal);
                    const matchesClass = !classFilter || s.class === classFilter;
                    const matchesSection = !sectionFilter || s.section === sectionFilter;
                    return matchesSearch && matchesClass && matchesSection;
                });
                const limit = listRowsPerPage === 'all' ? filtered.length : parseInt(listRowsPerPage, 10);
                const totalPages = Math.ceil(filtered.length / limit);
                currentListPage = Math.max(1, totalPages);
            }
            renderStudentList();
        }

        // Selection & Delete Helpers (Student Directory Multi-Select)
        const selectedStudentIds = new Set();

        function toggleStudentSelection(studentId, isChecked) {
            if (isChecked) {
                selectedStudentIds.add(String(studentId));
            } else {
                selectedStudentIds.delete(String(studentId));
            }
            updateDeleteSelectedBtn();
        }

        function toggleSelectAllStudents(checked) {
            const checkboxes = document.querySelectorAll('#student-list-rows .student-select-chk');
            checkboxes.forEach(chk => {
                chk.checked = checked;
                if (checked) {
                    selectedStudentIds.add(String(chk.value));
                } else {
                    selectedStudentIds.delete(String(chk.value));
                }
            });
            updateDeleteSelectedBtn();
        }

        function clearStudentSelection() {
            selectedStudentIds.clear();
            const selectAllChk = document.getElementById('select-all-students-chk');
            if (selectAllChk) selectAllChk.checked = false;
            const checkboxes = document.querySelectorAll('#student-list-rows .student-select-chk');
            checkboxes.forEach(chk => {
                chk.checked = false;
                const tr = chk.closest('tr');
                if (tr) tr.classList.remove('saas-row-selected');
            });
            updateDeleteSelectedBtn();
        }

        function updateDeleteSelectedBtn() {
            const count = selectedStudentIds.size;
            const bar = document.getElementById('bulk-actions-bar');
            const countLabel = document.getElementById('bulk-select-count');
            const topBtn = document.getElementById('btn-delete-selected-top');
            const topCount = document.getElementById('top-delete-selected-count');
            const selectAllChk = document.getElementById('select-all-students-chk');

            // Update row highlight classes and header checkbox state on current page
            const pageCheckboxes = document.querySelectorAll('#student-list-rows .student-select-chk');
            if (pageCheckboxes.length > 0) {
                let allChecked = true;
                pageCheckboxes.forEach(chk => {
                    const isChecked = selectedStudentIds.has(String(chk.value));
                    chk.checked = isChecked;
                    const tr = chk.closest('tr');
                    if (tr) {
                        if (isChecked) tr.classList.add('saas-row-selected');
                        else tr.classList.remove('saas-row-selected');
                    }
                    if (!isChecked) allChecked = false;
                });
                if (selectAllChk) selectAllChk.checked = allChecked;
            } else {
                if (selectAllChk) selectAllChk.checked = false;
            }

            if (bar && countLabel) {
                if (count > 0) {
                    bar.style.display = 'flex';
                    countLabel.innerText = `${count} জন শিক্ষার্থী সিলেক্ট করা হয়েছে`;
                } else {
                    bar.style.display = 'none';
                }
            }

            if (topBtn) {
                if (count > 0) {
                    topBtn.style.display = 'inline-flex';
                    if (topCount) topCount.innerText = count;
                } else {
                    topBtn.style.display = 'none';
                }
            }
        }

        function deleteSelectedStudents() {
            const count = selectedStudentIds.size;
            if (count === 0) {
                alert("দয়া করে মুছে ফেলার জন্য অন্তত একজন শিক্ষার্থী সিলেক্ট করুন। (Please select at least one student to delete)");
                return;
            }

            if (confirm(`আপনি কি নিশ্চিত যে সিলেক্ট করা ${count} জন শিক্ষার্থীর তথ্য ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান?\n\nসতর্কতা: এই কাজটি করলে তাদের সমস্ত ভর্তি তথ্য চিরতরে মুছে যাবে এবং এটি আর ফিরিয়ে আনা যাবে না।`)) {
                const students = loadStudents();
                const updated = students.filter(s => !selectedStudentIds.has(String(s.id)));

                saveStudents(updated);
                selectedStudentIds.clear();

                alert(`সাফল্য: ${count} জন শিক্ষার্থীর তথ্য ডাটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে!`);
                renderStudentList();
                if (typeof renderPromotionList === 'function') renderPromotionList();
            }
        }

        function deleteAllStudents() {
            const students = loadStudents();
            if (students.length === 0) {
                alert("ডাটাবেজে কোনো শিক্ষার্থীর তথ্য নেই।");
                return;
            }

            if (confirm(`আপনি কি নিশ্চিত যে ডাটাবেজের সকল (${students.length} জন) শিক্ষার্থীর তথ্য একসাথে মুছে ফেলতে চান?`)) {
                if (confirm("সতর্কতা: এই কাজটি করলে সমস্ত শিক্ষার্থীর ভর্তি তথ্য চিরতরে মুছে যাবে এবং এটি আর ফিরিয়ে আনা যাবে না। আপনি কি সত্যিই ডিলিট করতে চান?")) {
                    saveStudents([]);
                    selectedStudentIds.clear();

                    alert("সাফল্য: সকল শিক্ষার্থীর তথ্য ডাটাবেজ থেকে মুছে ফেলা হয়েছে!");
                    renderStudentList();
                    if (typeof renderPromotionList === 'function') renderPromotionList();
                }
            }
        }

        // Bulk Tools Helpers for Modal (Synced directly from "Add Student" Form & School Database)
        function populateBulkModalEditFields(classVal) {
            // Helper to sync from a source select in Add Student form
            function syncFromAddFormSelect(sourceId, targetId, cleanLabelRegex = null) {
                const source = document.getElementById(sourceId);
                const target = document.getElementById(targetId);
                if (source && target) {
                    const prevVal = target.value;
                    let html = '<option value="">-- অপরিবর্তিত --</option>';
                    Array.from(source.options).forEach(opt => {
                        if (opt.value !== "" && !opt.disabled) {
                            let label = opt.innerHTML;
                            if (cleanLabelRegex) {
                                label = label.replace(cleanLabelRegex, '');
                            }
                            html += `<option value="${opt.value}">${label}</option>`;
                        }
                    });
                    target.innerHTML = html;
                    if (prevVal && Array.from(target.options).some(o => o.value === prevVal)) {
                        target.value = prevVal;
                    }
                }
            }

            // 1. Classes for Left Panel Filter (from Add Student Form #student-class or loadClasses())
            const classFilter = document.getElementById('bulk-modal-class-filter');
            if (classFilter) {
                const addClassSelect = document.getElementById('student-class');
                const prevClassVal = classFilter.value;
                let cHtml = '<option value="">-- শ্রেণী নির্বাচন --</option>';
                if (addClassSelect && addClassSelect.options.length > 0) {
                    Array.from(addClassSelect.options).forEach(opt => {
                        if (opt.value !== "" && !opt.disabled) {
                            cHtml += `<option value="${opt.value}">${opt.innerHTML}</option>`;
                        }
                    });
                } else {
                    const classes = loadClasses();
                    classes.forEach(c => {
                        cHtml += `<option value="${c}">${c}</option>`;
                    });
                }
                classFilter.innerHTML = cHtml;
                if (prevClassVal) classFilter.value = prevClassVal;
            }

            // 2. Gender Dropdown (Synced from Add Student form #student-gender)
            syncFromAddFormSelect('student-gender', 'bulk-modal-gender');

            // 3. Religion Dropdown (Synced from Add Student form #student-religion)
            syncFromAddFormSelect('student-religion', 'bulk-modal-religion');

            // 4. Blood Group Dropdown (Synced from Add Student form #student-blood)
            syncFromAddFormSelect('student-blood', 'bulk-modal-blood');

            // 5. Group Dropdown (Synced from Add Student form #student-roll)
            const groupContainer = document.getElementById('bulk-modal-group-container');
            const groupSelect = document.getElementById('bulk-modal-group');
            if (groupSelect) {
                syncFromAddFormSelect('student-roll', 'bulk-modal-group');
                if (groupContainer) {
                    if (classVal === "Nine" || classVal === "Ten" || classVal === "Class 9" || classVal === "Class 10") {
                        groupContainer.style.display = 'block';
                    } else {
                        groupContainer.style.display = 'none';
                    }
                }
            }

            // 6. Section Dropdown (Synced for selected class from Add Student config & sections)
            const sectionSelect = document.getElementById('bulk-modal-section');
            if (sectionSelect) {
                const prevSec = sectionSelect.value;
                let availableSections = [];
                const sectionsConfig = loadClassSections();
                const students = loadStudents();

                if (classVal) {
                    availableSections = Array.from(new Set([
                        ...sectionsConfig.filter(s => isSameClass(s.class, classVal)).map(s => s.section),
                        ...students.filter(s => isSameClass(s.class, classVal)).map(s => s.section).filter(Boolean)
                    ]));
                } else {
                    const addSecSelect = document.getElementById('student-section');
                    if (addSecSelect && addSecSelect.options.length > 0) {
                        Array.from(addSecSelect.options).forEach(opt => {
                            if (opt.value) availableSections.push(opt.value);
                        });
                    }
                    if (availableSections.length === 0) {
                        availableSections = Array.from(new Set([
                            ...sectionsConfig.map(s => s.section),
                            ...students.map(s => s.section).filter(Boolean)
                        ]));
                    }
                }
                if (availableSections.length === 0) {
                    availableSections = ['A', 'B', 'C', 'D'];
                }
                availableSections.sort();

                let sHtml = '<option value="">-- অপরিবর্তিত --</option>';
                availableSections.forEach(sec => {
                    const cleanSec = sec.replace(/^Section\s*/i, '').replace(/^শাখা\s*/i, '').trim();
                    sHtml += `<option value="${cleanSec}">Section ${cleanSec}</option>`;
                });
                sectionSelect.innerHTML = sHtml;
                if (prevSec && Array.from(sectionSelect.options).some(o => o.value === prevSec)) {
                    sectionSelect.value = prevSec;
                }
            }

            // 7. Optional Subjects Dropdown (Synced from Add Student form #student-optional-subject & loadSubjects)
            const optionalSelect = document.getElementById('bulk-modal-optional');
            if (optionalSelect) {
                const prevOpt = optionalSelect.value;
                let optHtml = '<option value="">-- অপরিবর্তিত --</option>';
                const subjectsMap = loadSubjects();
                const classSubjects = subjectsMap[classVal] || [];
                const optionalSubjects = classSubjects.filter(sub => sub.isOptional === true);

                if (optionalSubjects.length > 0) {
                    optionalSubjects.forEach(sub => {
                        let shortName = sub.name.replace('Higher Mathematics', 'Higher Math').replace('Agriculture Studies', 'Agriculture');
                        optHtml += `<option value="${sub.name}">${shortName}</option>`;
                    });
                } else if (classVal === "Nine" || classVal === "Ten" || classVal === "Class 9" || classVal === "Class 10") {
                    optHtml += `
                        <option value="Higher Mathematics">Higher Math</option>
                        <option value="Biology">Biology</option>
                        <option value="Agriculture Studies">Agriculture</option>
                        <option value="Home Science">Home Science</option>
                    `;
                } else {
                    const addOptSelect = document.getElementById('student-optional-subject');
                    if (addOptSelect && addOptSelect.options.length > 0) {
                        Array.from(addOptSelect.options).forEach(opt => {
                            if (opt.value && !opt.disabled) {
                                let shortName = opt.innerHTML.replace('Higher Mathematics', 'Higher Math').replace('Agriculture Studies', 'Agriculture');
                                optHtml += `<option value="${opt.value}">${shortName}</option>`;
                            }
                        });
                    }
                    if (optHtml === '<option value="">-- অপরিবর্তিত --</option>') {
                        optHtml += '<option value="" disabled>No Optional Subject</option>';
                    }
                }
                optionalSelect.innerHTML = optHtml;
                if (prevOpt && Array.from(optionalSelect.options).some(o => o.value === prevOpt)) {
                    optionalSelect.value = prevOpt;
                }
            }

            // 8. Session Field / Datalist (Synced from Add Student form #student-session & database)
            const addSession = document.getElementById('student-session');
            const sessionInput = document.getElementById('bulk-modal-session');
            const sessionDatalist = document.getElementById('bulk-session-datalist');
            const students = loadStudents();
            const dbSessions = Array.from(new Set(students.map(s => s.session).filter(Boolean)));
            const defaultSession = addSession ? (addSession.value || '2026') : '2026';
            if (!dbSessions.includes(defaultSession)) dbSessions.push(defaultSession);
            dbSessions.sort().reverse();
            if (sessionDatalist) {
                sessionDatalist.innerHTML = dbSessions.map(s => `<option value="${s}">${s}</option>`).join('');
            }
            if (sessionInput && !sessionInput.placeholder) {
                sessionInput.placeholder = `যেমন: ${defaultSession}`;
            }
        }

        function openBulkToolsModal() {
            const modal = document.getElementById('bulk-tools-modal');
            if (!modal) return;

            modal.style.display = 'flex';

            // Populate all Section 2 options dynamically from Student Directory data
            populateBulkModalEditFields('');

            // Reset fields
            if (document.getElementById('bulk-modal-gender')) document.getElementById('bulk-modal-gender').value = "";
            if (document.getElementById('bulk-modal-religion')) document.getElementById('bulk-modal-religion').value = "";
            if (document.getElementById('bulk-modal-section')) document.getElementById('bulk-modal-section').value = "";
            if (document.getElementById('bulk-modal-blood')) document.getElementById('bulk-modal-blood').value = "";
            if (document.getElementById('bulk-modal-session')) document.getElementById('bulk-modal-session').value = "";
            if (document.getElementById('bulk-modal-group')) document.getElementById('bulk-modal-group').value = "";
            if (document.getElementById('bulk-modal-optional')) document.getElementById('bulk-modal-optional').value = "";

            // Reset student rows
            renderBulkModalStudents();
        }

        function closeBulkToolsModal(event) {
            const modal = document.getElementById('bulk-tools-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }

        function populateBulkModalOptionalSubjects(classVal) {
            populateBulkModalEditFields(classVal);
        }

        function populateBulkModalSectionDropdown(classVal) {
            populateBulkModalEditFields(classVal);
        }

        function renderBulkModalStudents() {
            const classVal = document.getElementById('bulk-modal-class-filter').value;
            const container = document.getElementById('bulk-modal-student-rows');
            const summary = document.getElementById('bulk-modal-selection-summary');
            if (!container) return;

            // Reset select-all checkbox
            const selectAllChk = document.getElementById('bulk-modal-select-all');
            if (selectAllChk) selectAllChk.checked = false;

            if (!classVal) {
                container.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: var(--muted-text); font-style: italic;">
                            অনুগ্রহ করে প্রথমে একটি শ্রেণী নির্বাচন করুন।
                        </td>
                    </tr>
                `;
                if (summary) summary.innerText = "কোনo শিক্ষার্থী সিলেক্ট করা হয়নি";

                // Reset sections dropdown if no class is selected
                populateBulkModalSectionDropdown('');
                return;
            }

            // Populate optional subjects and sections for selected class dynamically
            populateBulkModalOptionalSubjects(classVal);
            populateBulkModalSectionDropdown(classVal);

            const students = loadStudents();
            const classStudents = students.filter(s => s.class === classVal);

            if (classStudents.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: var(--muted-text); font-style: italic;">
                            এই শ্রেণীতে কোনো শিক্ষার্থী নিবন্ধিত নেই।
                        </td>
                    </tr>
                `;
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            let html = '';
            classStudents.forEach((s, idx) => {
                const name = s.nameBn || s.name;
                const studentId = s.studentId || '-';
                html += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="toggleBulkModalRowCheckbox(event, this)">
                        <td style="padding: 8px; text-align: center;">
                            <input type="checkbox" class="bulk-modal-student-chk" value="${s.id}" style="transform: scale(1.1); cursor: pointer;" onchange="updateBulkModalSelectionSummary()">
                        </td>
                        <td style="padding: 8px; color: var(--muted-text); font-size: 0.9rem;">${idx + 1}</td>
                        <td style="padding: 8px; color: var(--neon-cyan); font-family: monospace; font-size: 0.9rem;">${studentId}</td>
                        <td style="padding: 8px; color: #fff; font-size: 0.95rem;">${name}</td>
                    </tr>
                `;
            });
            container.innerHTML = html;
            updateBulkModalSelectionSummary();
        }

        function toggleBulkModalRowCheckbox(event, tr) {
            if (event.target.closest('input[type="checkbox"]')) {
                return;
            }
            const chk = tr.querySelector('.bulk-modal-student-chk');
            if (chk) {
                chk.checked = !chk.checked;
                updateBulkModalSelectionSummary();
            }
        }

        function toggleBulkModalSelectAll(checked) {
            const checkboxes = document.querySelectorAll('.bulk-modal-student-chk');
            checkboxes.forEach(chk => chk.checked = checked);
            updateBulkModalSelectionSummary();
        }

        function updateBulkModalSelectionSummary() {
            const checkedBoxes = document.querySelectorAll('.bulk-modal-student-chk:checked');
            const count = checkedBoxes.length;
            const summary = document.getElementById('bulk-modal-selection-summary');
            if (summary) {
                if (count > 0) {
                    summary.innerHTML = `<span style="color: var(--neon-cyan); font-weight: bold;">${count}</span> জন শিক্ষার্থী সিলেক্ট করা হয়েছে`;
                } else {
                    summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                }
            }
        }

        function applyBulkModalChanges() {
            const checkedBoxes = document.querySelectorAll('.bulk-modal-student-chk:checked');
            const count = checkedBoxes.length;
            if (count === 0) {
                alert("দয়া করে এক বা একাধিক শিক্ষার্থী নির্বাচন করুন।");
                return;
            }

            const newGender = document.getElementById('bulk-modal-gender')?.value || '';
            const newReligion = document.getElementById('bulk-modal-religion')?.value || '';
            const newSection = document.getElementById('bulk-modal-section')?.value || '';
            const newBlood = document.getElementById('bulk-modal-blood')?.value || '';
            const newSession = (document.getElementById('bulk-modal-session')?.value || '').trim();
            const newGroup = document.getElementById('bulk-modal-group')?.value || '';
            const newOptional = document.getElementById('bulk-modal-optional')?.value || '';

            if (!newGender && !newReligion && !newSection && !newBlood && !newSession && !newGroup && !newOptional) {
                alert("দয়া করে পরিবর্তন করার জন্য কমপক্ষে একটি তথ্য সিলেক্ট করুন।");
                return;
            }

            if (confirm(`আপনি কি নিশ্চিত যে সিলেক্ট করা ${count} জন শিক্ষার্থীর তথ্য পরিবর্তন করতে চান?`)) {
                const selectedIds = Array.from(checkedBoxes).map(chk => chk.value);
                const students = loadStudents();
                let updatedCount = 0;

                students.forEach(s => {
                    if (selectedIds.includes(s.id)) {
                        if (newGender) s.gender = newGender;
                        if (newReligion) s.religion = newReligion;
                        if (newSection) s.section = newSection;
                        if (newBlood) s.blood = newBlood;
                        if (newSession) s.session = newSession;
                        if (newGroup) {
                            s.roll = newGroup;
                            s.group = newGroup;
                        }
                        if (newOptional) s.optionalSubject = newOptional;
                        updatedCount++;
                    }
                });

                // Persist directly into primary student storage
                localStorage.setItem('school_students', JSON.stringify(students));

                // Dispatch storage event to sync with SQLite backend
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('dbSynced'));

                alert(`সাফল্য: ${updatedCount} জন শিক্ষার্থীর মূল প্রোফাইলের তথ্য সফলভাবে পরিবর্তন ও সংরক্ষণ করা হয়েছে!`);
                
                // Close modal
                closeBulkToolsModal();

                // Re-render student roster table, stats, and top filter options
                populateStudentPortalFilterDropdowns(true);
                renderStudentList();
                if (typeof renderPromotionList === 'function') {
                    renderPromotionList();
                }
            }
        }

        // =========================================================================
        // --- ID / ROLL & CLASS / SECTION SHIFT MANAGER LOGIC ---
        // =========================================================================
        let idShiftWorkingStudents = [];

        function normalizeClassName(cls) {
            if (!cls) return '';
            return String(cls).trim().toLowerCase();
        }

        function getClassNumericCode(className) {
            const norm = normalizeClassName(className);

            // Map text names (English & Bengali) to two-digit strings
            if (norm.includes('twelve') || norm.includes('দ্বাদশ') || norm === '12') return '12';
            if (norm.includes('eleven') || norm.includes('একাদশ') || norm === '11') return '11';
            if (norm.includes('ten') || norm.includes('দশম') || norm === '10') return '10';
            if (norm.includes('nine') || norm.includes('নবম') || norm === '9') return '09';
            if (norm.includes('eight') || norm.includes('অষ্টম') || norm === '8') return '08';
            if (norm.includes('seven') || norm.includes('সপ্তম') || norm === '7') return '07';
            if (norm.includes('six') || norm.includes('ষষ্ঠ') || norm === '6') return '06';
            if (norm.includes('five') || norm.includes('পঞ্চম') || norm === '5') return '05';
            if (norm.includes('four') || norm.includes('চতুর্থ') || norm === '4') return '04';
            if (norm.includes('three') || norm.includes('তৃতীয়') || norm.includes('তৃতীয়') || norm === '3') return '03';
            if (norm.includes('two') || norm.includes('দ্বিতীয়') || norm.includes('দ্বিতীয়') || norm === '2') return '02';
            if (norm.includes('one') || norm.includes('প্রথম') || norm === '1') return '01';
            if (norm.includes('nursery') || norm.includes('নার্সারি')) return '12';
            if (norm.includes('play') || norm.includes('প্লে')) return '11';
            if (norm.includes('kg') || norm.includes('কেজি')) return '00';

            // Check direct numeric extraction
            const digits = norm.replace(/\D/g, '');
            if (digits) {
                return digits.padStart(2, '0');
            }

            return '00';
        }

        function isSameClass(c1, c2) {
            if (!c1 && !c2) return true;
            if (!c1 || !c2) return false;
            if (String(c1).trim().toLowerCase() === String(c2).trim().toLowerCase()) return true;
            return getClassNumericCode(c1) === getClassNumericCode(c2);
        }

        function isSameSection(s1, s2) {
            const norm1 = String(s1 || 'A').trim().toUpperCase();
            const norm2 = String(s2 || 'A').trim().toUpperCase();
            return norm1 === norm2;
        }

        function getClassIdPrefix(className) {
            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);

            const targetNorm = normalizeClassName(className);
            const targetCode = getClassNumericCode(className);

            let prefix = null;

            if (Array.isArray(classPrefixes)) {
                // 1. Exact match
                let found = classPrefixes.find(p => p && p.class === className);
                // 2. Case-insensitive / trimmed match
                if (!found) {
                    found = classPrefixes.find(p => p && normalizeClassName(p.class) === targetNorm);
                }
                // 3. Normalized class numeric code match (e.g. "Class 6" matches "Class Six")
                if (!found) {
                    found = classPrefixes.find(p => p && getClassNumericCode(p.class) === targetCode);
                }
                if (found && typeof found.prefix === 'string') {
                    prefix = found.prefix;
                }
            } else if (classPrefixes && typeof classPrefixes === 'object') {
                if (typeof classPrefixes[className] === 'string') {
                    prefix = classPrefixes[className];
                } else {
                    for (const key of Object.keys(classPrefixes)) {
                        if ((normalizeClassName(key) === targetNorm || getClassNumericCode(key) === targetCode) && typeof classPrefixes[key] === 'string') {
                            prefix = classPrefixes[key];
                            break;
                        }
                    }
                }
            }

            if (prefix === null) {
                const globalPfx = (idRegSettings.idPrefix !== undefined && idRegSettings.idPrefix !== null && idRegSettings.idPrefix !== '') ? idRegSettings.idPrefix : '26';
                prefix = `${globalPfx}${targetCode}`;
            }
            return prefix;
        }

        function getClassRegPrefix(className) {
            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const classRegPrefixes = safeJsonParse('school_class_reg_prefixes', []);
            const classIdPrefixes = safeJsonParse('school_class_id_prefixes', []);

            const targetNorm = normalizeClassName(className);
            const targetCode = getClassNumericCode(className);

            let prefix = null;

            // 1. Check school_class_reg_prefixes
            if (Array.isArray(classRegPrefixes)) {
                let found = classRegPrefixes.find(p => p && p.class === className);
                if (!found) found = classRegPrefixes.find(p => p && normalizeClassName(p.class) === targetNorm);
                if (!found) found = classRegPrefixes.find(p => p && getClassNumericCode(p.class) === targetCode);
                if (found && typeof found.prefix === 'string' && found.prefix.trim() !== '') {
                    prefix = found.prefix.trim();
                }
            } else if (classRegPrefixes && typeof classRegPrefixes === 'object') {
                if (typeof classRegPrefixes[className] === 'string' && classRegPrefixes[className].trim() !== '') {
                    prefix = classRegPrefixes[className].trim();
                }
            }

            // 2. Check regPrefix inside school_class_id_prefixes
            if (prefix === null && Array.isArray(classIdPrefixes)) {
                let found = classIdPrefixes.find(p => p && p.class === className);
                if (!found) found = classIdPrefixes.find(p => p && normalizeClassName(p.class) === targetNorm);
                if (!found) found = classIdPrefixes.find(p => p && getClassNumericCode(p.class) === targetCode);
                if (found && typeof found.regPrefix === 'string' && found.regPrefix.trim() !== '') {
                    prefix = found.regPrefix.trim();
                }
            }

            // 3. Fallback default: global regPrefix or current year (e.g. 2026) + class numeric code
            if (prefix === null) {
                const currentYear = new Date().getFullYear().toString();
                const globalReg = (idRegSettings.regPrefix !== undefined && idRegSettings.regPrefix !== null && idRegSettings.regPrefix !== '') 
                    ? idRegSettings.regPrefix.replace(/[^0-9a-zA-Z-]/g, '')
                    : currentYear;
                prefix = `${globalReg}${targetCode}`;
            }
            return prefix;
        }

        function openIdShiftModal() {
            const modal = document.getElementById('id-shift-modal');
            if (!modal) return;

            // Load a fresh deep copy of students into our working buffer
            idShiftWorkingStudents = JSON.parse(JSON.stringify(loadStudents()));

            const classes = loadClasses();

            // Populate source class dropdown
            const srcClassSelect = document.getElementById('id-shift-source-class');
            if (srcClassSelect) {
                srcClassSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');

                // Pick active class filter on the main portal if available, else first class
                const mainClassFilter = document.getElementById('student-class-filter')?.value;
                if (mainClassFilter && classes.includes(mainClassFilter)) {
                    srcClassSelect.value = mainClassFilter;
                } else if (classes.length > 0) {
                    srcClassSelect.value = classes[0];
                }
            }

            // Populate target class dropdown
            const targetClassSelect = document.getElementById('id-shift-target-class');
            if (targetClassSelect) {
                targetClassSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
                if (srcClassSelect && srcClassSelect.value) {
                    targetClassSelect.value = srcClassSelect.value;
                }
            }

            // Populate sections
            handleIdShiftSourceClassChange();
            populateIdShiftTargetSections();

            // Reset search
            const searchInput = document.getElementById('id-shift-search');
            if (searchInput) searchInput.value = '';

            modal.style.display = 'flex';
        }

        function closeIdShiftModal(event) {
            const modal = document.getElementById('id-shift-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            idShiftWorkingStudents = [];
        }

        function handleIdShiftSourceClassChange() {
            const srcClass = document.getElementById('id-shift-source-class')?.value || '';
            const srcSecSelect = document.getElementById('id-shift-source-section');
            if (!srcSecSelect) return;

            const allSections = loadClassSections();
            const classSections = allSections.filter(s => s.class === srcClass);

            if (classSections.length === 0) {
                srcSecSelect.innerHTML = '<option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>';
            } else {
                srcSecSelect.innerHTML = classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
            }

            // Also check main section filter if matching
            const mainSecFilter = document.getElementById('student-section-filter')?.value;
            if (mainSecFilter && Array.from(srcSecSelect.options).some(opt => opt.value === mainSecFilter)) {
                srcSecSelect.value = mainSecFilter;
            }

            renderIdShiftStudents();
        }

        function populateIdShiftTargetSections() {
            const targetClass = document.getElementById('id-shift-target-class')?.value || '';
            const targetSecSelect = document.getElementById('id-shift-target-section');
            if (!targetSecSelect) return;

            const allSections = loadClassSections();
            const classSections = allSections.filter(s => s.class === targetClass);

            if (classSections.length === 0) {
                targetSecSelect.innerHTML = '<option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>';
            } else {
                targetSecSelect.innerHTML = classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
            }
        }

        let idShiftDraggedStudentId = null;

        function handleIdShiftDragStart(e, studentId) {
            idShiftDraggedStudentId = studentId;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', studentId);
            const tr = document.getElementById(`id-shift-row-${studentId}`);
            if (tr) {
                tr.style.opacity = '0.4';
                tr.classList.add('id-shift-dragging');
            }
        }

        function handleIdShiftDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const tr = e.target.closest('tr');
            if (tr && tr.dataset.id && tr.dataset.id !== idShiftDraggedStudentId) {
                const rect = tr.getBoundingClientRect();
                const dropBelow = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                tr.style.borderTop = dropBelow ? '' : '3px solid #0284c7';
                tr.style.borderBottom = dropBelow ? '3px solid #0284c7' : '';
                tr.style.background = '#f0f9ff';
            }
        }

        function handleIdShiftDragLeave(e) {
            const tr = e.target.closest('tr');
            if (tr) {
                tr.style.borderTop = '';
                tr.style.borderBottom = '';
                tr.style.background = '';
            }
        }

        function handleIdShiftDrop(e, targetStudentId) {
            e.preventDefault();
            const tr = e.target.closest('tr');
            if (tr) {
                tr.style.borderTop = '';
                tr.style.borderBottom = '';
                tr.style.background = '';
            }

            if (!idShiftDraggedStudentId || idShiftDraggedStudentId === targetStudentId) {
                return;
            }

            const draggedIdx = idShiftWorkingStudents.findIndex(s => s.id === idShiftDraggedStudentId);
            const targetIdx = idShiftWorkingStudents.findIndex(s => s.id === targetStudentId);

            if (draggedIdx !== -1 && targetIdx !== -1) {
                const [movedStudent] = idShiftWorkingStudents.splice(draggedIdx, 1);
                
                const rect = tr ? tr.getBoundingClientRect() : null;
                const dropBelow = rect ? (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5 : false;
                
                let newTargetIdx = idShiftWorkingStudents.findIndex(s => s.id === targetStudentId);
                if (dropBelow) {
                    newTargetIdx += 1;
                }
                
                idShiftWorkingStudents.splice(newTargetIdx, 0, movedStudent);

                // Automatically re-sequence Student ID and Roll for the current class & section
                const srcClass = document.getElementById('id-shift-source-class')?.value || '';
                const srcSec = document.getElementById('id-shift-source-section')?.value || '';
                if (srcClass) {
                    const prefix = getClassIdPrefix(srcClass);
                    const classStudents = idShiftWorkingStudents.filter(s => isSameClass(s.class, srcClass) && isSameSection(s.section, srcSec));
                    classStudents.forEach((s, idx) => {
                        s.studentId = `${prefix}${String(idx + 1).padStart(3, '0')}`;
                        s.roll = String(idx + 1);
                    });
                }

                renderIdShiftStudents();
            }
        }

        function handleIdShiftDragEnd(e) {
            idShiftDraggedStudentId = null;
            const rows = document.querySelectorAll('#id-shift-student-rows tr');
            rows.forEach(r => {
                r.style.opacity = '1';
                r.style.borderTop = '';
                r.style.borderBottom = '';
                r.style.background = '';
                r.classList.remove('id-shift-dragging');
            });
        }

        function renderIdShiftStudents() {
            const srcClass = document.getElementById('id-shift-source-class')?.value || '';
            const srcSec = document.getElementById('id-shift-source-section')?.value || '';
            const searchVal = (document.getElementById('id-shift-search')?.value || '').toLowerCase().trim();
            const container = document.getElementById('id-shift-student-rows');
            const summary = document.getElementById('id-shift-selection-summary');
            if (!container) return;

            // Reset select-all checkbox
            const selectAllChk = document.getElementById('id-shift-select-all');
            if (selectAllChk) selectAllChk.checked = false;

            if (!srcClass) {
                container.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 25px; color: #94a3b8; font-style: italic;">দয়া করে একটি শ্রেণী নির্বাচন করুন।</td></tr>`;
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            // Filter working students
            const classStudents = idShiftWorkingStudents.filter(s => {
                if (s.class !== srcClass) return false;
                const sSec = s.section || 'A';
                if (srcSec && sSec !== srcSec) return false;
                if (searchVal) {
                    const name = (s.name || '').toLowerCase();
                    const nameBn = (s.nameBn || '').toLowerCase();
                    const sid = (s.studentId || '').toLowerCase();
                    return name.includes(searchVal) || nameBn.includes(searchVal) || sid.includes(searchVal);
                }
                return true;
            });

            if (classStudents.length === 0) {
                container.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 25px; color: #94a3b8; font-style: italic;">এই শ্রেণী ও শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি।</td></tr>`;
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            let html = '';
            classStudents.forEach((s, idx) => {
                const name = s.nameBn ? `${s.name || ''} (${s.nameBn})` : (s.name || '-');
                const photoSrc = s.photo || '';
                const photoHTML = photoSrc
                    ? `<img src="${photoSrc}" style="width: 36px; height: 42px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;">`
                    : `<div style="width: 36px; height: 42px; background: #e2e8f0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: #64748b; font-size: 0.8rem;">👤</div>`;

                const fatherInfo = s.fatherName ? `${s.fatherName} (${s.fatherPhone || s.phone || '-'})` : (s.phone || '-');

                html += `
                    <tr id="id-shift-row-${s.id}" data-id="${s.id}" draggable="true"
                        ondragstart="handleIdShiftDragStart(event, '${s.id}')"
                        ondragover="handleIdShiftDragOver(event)"
                        ondragleave="handleIdShiftDragLeave(event)"
                        ondrop="handleIdShiftDrop(event, '${s.id}')"
                        ondragend="handleIdShiftDragEnd(event)"
                        style="border-bottom: 1px solid #e2e8f0; cursor: default; transition: background 0.15s ease;"
                        onclick="toggleIdShiftRowCheckbox(event, this)">
                        <td style="padding: 8px 4px; text-align: center; cursor: grab; user-select: none;" class="id-shift-drag-handle" title="মাউস দিয়ে চেপে ধরে উপরে-নিচে টেনে সাজান (Drag & Drop)" onclick="event.stopPropagation()">
                            <span style="font-size: 1.2rem; color: #64748b; font-weight: bold; display: inline-block; cursor: grab;">☰</span>
                        </td>
                        <td style="padding: 8px; text-align: center;">
                            <input type="checkbox" class="id-shift-chk" value="${s.id}" style="transform: scale(1.15); cursor: pointer;" onchange="updateIdShiftSelectionSummary()">
                        </td>
                        <td style="padding: 8px; text-align: center; color: #334155; font-weight: 600; font-size: 0.9rem;">${idx + 1}</td>
                        <td style="padding: 6px 8px; text-align: center;">${photoHTML}</td>
                        <td style="padding: 6px 8px; text-align: center;" onclick="event.stopPropagation()">
                            <input type="text" class="id-shift-input" data-id="${s.id}" value="${s.studentId || ''}"
                                placeholder="Student ID"
                                style="width: 145px; padding: 7px 10px; font-weight: 700; font-family: monospace; font-size: 0.95rem; color: #004d40; border: 1.5px solid #0d9488; border-radius: 6px; text-align: center; background: #f0fdfa; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);"
                                oninput="handleIdShiftInputChange('${s.id}', this.value)">
                        </td>
                        <td style="padding: 8px; color: #0f172a; font-weight: 600; font-size: 0.95rem;">${name}</td>
                        <td style="padding: 8px; text-align: center;">
                            <span style="background: #0284c7; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${s.class}</span>
                        </td>
                        <td style="padding: 8px; text-align: center;">
                            <span style="background: #8b5cf6; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${s.section || 'A'}</span>
                        </td>
                        <td style="padding: 8px; color: #475569; font-size: 0.85rem;">${fatherInfo}</td>
                    </tr>
                `;
            });

            container.innerHTML = html;
            updateIdShiftSelectionSummary();
        }

        function toggleIdShiftRowCheckbox(event, tr) {
            if (event.target.closest('input')) return;
            const chk = tr.querySelector('.id-shift-chk');
            if (chk) {
                chk.checked = !chk.checked;
                updateIdShiftSelectionSummary();
            }
        }

        function toggleIdShiftSelectAll(checked) {
            const checkboxes = document.querySelectorAll('.id-shift-chk');
            checkboxes.forEach(chk => chk.checked = checked);
            updateIdShiftSelectionSummary();
        }

        function updateIdShiftSelectionSummary() {
            const checkedBoxes = document.querySelectorAll('.id-shift-chk:checked');
            const count = checkedBoxes.length;
            const summary = document.getElementById('id-shift-selection-summary');
            if (summary) {
                if (count > 0) {
                    summary.innerHTML = `<span style="color: #38bdf8; font-weight: bold; font-size: 1rem;">${count}</span> জন শিক্ষার্থী সিলেক্ট করা হয়েছে`;
                } else {
                    summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                }
            }
        }

        function handleIdShiftInputChange(studentId, val) {
            const s = idShiftWorkingStudents.find(x => x.id === studentId);
            if (s) {
                s.studentId = val.trim();
                const last3 = s.studentId.slice(-3);
                if (/^\d+$/.test(last3)) {
                    s.roll = String(parseInt(last3, 10));
                }
            }
        }

        // Auto sequence IDs for students currently in selected source class & section
        function autoGenerateIdShiftSequentialIds() {
            const srcClass = document.getElementById('id-shift-source-class')?.value || '';
            const srcSec = document.getElementById('id-shift-source-section')?.value || '';
            if (!srcClass) return;

            const prefix = getClassIdPrefix(srcClass);
            const classStudents = idShiftWorkingStudents.filter(s => isSameClass(s.class, srcClass) && isSameSection(s.section, srcSec));

            if (classStudents.length === 0) {
                alert("এই শ্রেণী ও শাখায় কোনো শিক্ষার্থী নেই।");
                return;
            }

            if (confirm(`আপনি কি "${srcClass} (${srcSec})" এর সকল শিক্ষার্থীর Student ID/Roll প্রিফিক্স "${prefix}" অনুসারে ক্রমানুসারে (০০১, ০০২, ০০৩...) সাজাতে চান?`)) {
                classStudents.sort((a, b) => {
                    const rollA = parseInt((a.studentId ? a.studentId.slice(-3) : '') || a.roll || '0', 10);
                    const rollB = parseInt((b.studentId ? b.studentId.slice(-3) : '') || b.roll || '0', 10);
                    if (!isNaN(rollA) && !isNaN(rollB) && rollA !== rollB) return rollA - rollB;
                    return (a.name || '').localeCompare(b.name || '');
                });

                classStudents.forEach((s, idx) => {
                    s.studentId = `${prefix}${String(idx + 1).padStart(3, '0')}`;
                    s.roll = String(idx + 1);
                });
                renderIdShiftStudents();
                alert(`সাফল্য: "${srcClass} (${srcSec})" এর ${classStudents.length} জন শিক্ষার্থীর ID/Roll সফলভাবে ০০১ থেকে ধারাবাহিকভাবে সাজানো হয়েছে!`);
            }
        }

        // Transfer selected students to target class & section with auto or manual ID
        function transferSelectedIdShiftStudents() {
            const checkedBoxes = document.querySelectorAll('.id-shift-chk:checked');
            const count = checkedBoxes.length;
            if (count === 0) {
                alert("দয়া করে স্থানান্তর করার জন্য এক বা একাধিক শিক্ষার্থী সিলেক্ট করুন।");
                return;
            }

            const targetClass = document.getElementById('id-shift-target-class')?.value || '';
            const targetSec = document.getElementById('id-shift-target-section')?.value || '';
            const srcClass = document.getElementById('id-shift-source-class')?.value || '';
            const srcSec = document.getElementById('id-shift-source-section')?.value || '';

            if (!targetClass || !targetSec) {
                alert("দয়া করে স্থানান্তর করার লক্ষ্য শ্রেণী ও শাখা নির্বাচন করুন।");
                return;
            }

            if (isSameClass(targetClass, srcClass) && isSameSection(targetSec, srcSec)) {
                alert("সিলেক্টকৃত শিক্ষার্থীরা ইতিমধ্যে এই শ্রেণী ও শাখায় রয়েছে। অনুগ্রহ করে অন্য কোনো শ্রেণী বা শাখা নির্বাচন করুন।");
                return;
            }

            const isAutoId = document.getElementById('id-shift-auto-generate-chk')?.checked;
            const selectedIds = Array.from(checkedBoxes).map(chk => chk.value);

            if (!confirm(`আপনি কি নিশ্চিত যে সিলেক্ট করা ${count} জন শিক্ষার্থীকে "${targetClass} (${targetSec})" শাখায় স্থানান্তর করতে চান?`)) {
                return;
            }

            const targetPrefix = getClassIdPrefix(targetClass);

            // Find highest existing serial in target class & section among students NOT being transferred
            let maxSerial = 0;
            idShiftWorkingStudents.forEach(s => {
                if (isSameClass(s.class, targetClass) && isSameSection(s.section, targetSec) && !selectedIds.includes(s.id)) {
                    if (s.studentId) {
                        const last3 = s.studentId.slice(-3);
                        const num = parseInt(last3, 10);
                        if (!isNaN(num) && num > maxSerial) {
                            maxSerial = num;
                        }
                    }
                }
            });

            let currentSerial = maxSerial + 1;

            selectedIds.forEach(id => {
                const s = idShiftWorkingStudents.find(x => x.id === id);
                if (s) {
                    s.class = targetClass;
                    s.section = targetSec;
                    if (isAutoId) {
                        s.studentId = `${targetPrefix}${String(currentSerial).padStart(3, '0')}`;
                        s.roll = String(currentSerial);
                        currentSerial++;
                    }
                }
            });

            alert(`সাফল্য: ${count} জন শিক্ষার্থীকে "${targetClass} (${targetSec})" শাখায় স্থানান্তর করা হয়েছে।\nআপনি এখন গন্তব্য শাখায় গিয়ে তথ্য যাচাই বা প্রয়োজনে ম্যানুয়ালী আইডি পরিবর্তন করতে পারেন।`);

            // Switch the modal source selectors to the target class and section so user sees the transferred students!
            const srcClassSelect = document.getElementById('id-shift-source-class');
            if (srcClassSelect) srcClassSelect.value = targetClass;

            handleIdShiftSourceClassChange();

            const srcSecSelect = document.getElementById('id-shift-source-section');
            if (srcSecSelect) srcSecSelect.value = targetSec;

            renderIdShiftStudents();
        }

        // Save all changes made in ID & Shift Manager to database
        function saveIdShiftChanges() {
            if (!idShiftWorkingStudents || idShiftWorkingStudents.length === 0) {
                closeIdShiftModal();
                return;
            }

            if (confirm("আপনি কি সকল শিক্ষার্থীর Student ID/Roll এবং ক্লাস-শাখা পরিবর্তনের তথ্য স্থায়ীভাবে সংরক্ষণ করতে চান?")) {
                saveStudents(idShiftWorkingStudents);

                // Dispatch storage event to sync with backend SQLite
                window.dispatchEvent(new Event('storage'));

                alert("সাফল্য: সকল শিক্ষার্থীর Student ID/Roll ও ক্লাস-শাখা পরিবর্তন সফলভাবে ডেটাবেজে সংরক্ষণ করা হয়েছে!");
                closeIdShiftModal();

                // Re-render portal components
                renderStudentList();
                if (typeof renderPromotionList === 'function') {
                    renderPromotionList();
                }
            }
        }

        // Roster XLSX Export Method
        function exportStudentsToExcel() {
            try {
                const searchInput = document.getElementById('student-search-input');
                const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

                const classFilterEl = document.getElementById('student-class-filter');
                const classFilter = classFilterEl ? classFilterEl.value : '';

                const sectionFilterEl = document.getElementById('student-section-filter');
                const sectionFilter = sectionFilterEl ? sectionFilterEl.value : '';

                const genderFilterEl = document.getElementById('student-gender-filter');
                const genderFilter = genderFilterEl ? genderFilterEl.value : '';

                const religionFilterEl = document.getElementById('student-religion-filter');
                const religionFilter = religionFilterEl ? religionFilterEl.value : '';

                const students = loadStudents();

                // Filter students currently matching the list filters
                const filtered = students.filter(s => {
                    if (!s) return false;
                    const nameVal = (s.name || '').toLowerCase();
                    const idVal = (s.studentId || '').toLowerCase();
                    const classVal = (s.class || '').toLowerCase();
                    const rollVal = String(s.roll || '').toLowerCase();

                    const matchesSearch = nameVal.includes(searchVal) ||
                        idVal.includes(searchVal) ||
                        classVal.includes(searchVal) ||
                        rollVal.includes(searchVal);

                    const matchesClass = !classFilter || s.class === classFilter;
                    const matchesSection = !sectionFilter || s.section === sectionFilter;
                    const matchesGender = !genderFilter || s.gender === genderFilter;
                    const matchesReligion = !religionFilter || s.religion === religionFilter;
                    return matchesSearch && matchesClass && matchesSection && matchesGender && matchesReligion;
                });

                if (filtered.length === 0) {
                    alert("ত্রুটি: এক্সপোর্ট করার জন্য কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।");
                    return;
                }

                if (typeof XLSX === 'undefined') {
                    alert("ত্রুটি: Excel এক্সপোর্ট করার লাইব্রেরি (XLSX) ব্রাউজারে লোড হতে পারেনি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করুন বা পেজটি রিলোড করুন।");
                    return;
                }

                const excelHeaders = [
                    "স্টুডেন্ট আইডি (Student ID)",
                    "রেজিস্ট্রেশন নম্বর (Registration No)",
                    "শিক্ষার্থীর নাম (Name in English)",
                    "শিক্ষার্থীর নাম (বাংলায়)",
                    "শিক্ষার্থীর ছবি (Photo URL/Base64)",
                    "শ্রেণী (Class)",
                    "শাখা (Section)",
                    "ঐচ্ছিক বিষয় (Optional Subject)",
                    "শিক্ষাবর্ষ (Session)",
                    "জন্ম তারিখ (Date of Birth)",
                    "লিঙ্গ (Gender)",
                    "ধর্ম (Religion)",
                    "রক্তের গ্রুপ (Blood Group)",
                    "পিতার নাম (Father's Name)",
                    "পিতার পেশা (Father's Occupation)",
                    "পিতার মোবাইল নম্বর (Father's Mobile)",
                    "মাতার নাম (Mother's Name)",
                    "মাতার পেশা (Mother's Occupation)",
                    "মাতার মোবাইল নম্বর (Mother's Mobile)",
                    "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)",
                    "ইমেইল ঠিকানা (Email Address)",
                    "বর্তমান ঠিকানা (Present Address)",
                    "স্থায়ী ঠিকানা (Permanent Address)"
                ];

                const rows = filtered.map(s => {
                    let relVal = s.religion || "";
                    if (relVal === "Hinduism") relVal = "Hindu (হিন্দু)";
                    let photoVal = s.photo || "";
                    if (photoVal.length > 32767) {
                        photoVal = photoVal.substring(0, 32767);
                    }
                    return {
                        "স্টুডেন্ট আইডি (Student ID)": s.studentId || "",
                        "রেজিস্ট্রেশন নম্বর (Registration No)": s.regNo || "",
                        "শিক্ষার্থীর নাম (Name in English)": s.name || "",
                        "শিক্ষার্থীর নাম (বাংলায়)": s.nameBn || "",
                        "শিক্ষার্থীর ছবি (Photo URL/Base64)": photoVal,
                        "শ্রেণী (Class)": s.class || "",
                        "শাখা (Section)": s.section || "",
                        "ঐচ্ছিক বিষয় (Optional Subject)": s.optionalSubject || "",
                        "শিক্ষাবর্ষ (Session)": s.session || "",
                        "জন্ম তারিখ (Date of Birth)": s.dob || "",
                        "লিঙ্গ (Gender)": s.gender || "",
                        "ধর্ম (Religion)": relVal,
                        "রক্তের গ্রুপ (Blood Group)": s.blood || "",
                        "পিতার নাম (Father's Name)": s.fatherName || "",
                        "পিতার পেশা (Father's Occupation)": s.fatherOccup || "",
                        "পিতার মোবাইল নম্বর (Father's Mobile)": s.fatherPhone || s.phone || "",
                        "মাতার নাম (Mother's Name)": s.motherName || "",
                        "মাতার পেশা (Mother's Occupation)": s.motherOccup || "",
                        "মাতার মোবাইল নম্বর (Mother's Mobile)": s.motherPhone || s.phone || "",
                        "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)": s.phone || "",
                        "ইমেইল ঠিকানা (Email Address)": s.email || "",
                        "বর্তমান ঠিকানা (Present Address)": s.presentAddress || "",
                        "স্থায়ী ঠিকানা (Permanent Address)": s.permanentAddress || ""
                    };
                });

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(rows, { header: excelHeaders });
                XLSX.utils.book_append_sheet(wb, ws, "Students Export");
                XLSX.writeFile(wb, "creative_model_school_students.xlsx");
            } catch (err) {
                console.error("Export Error: ", err);
                alert("এক্সপোর্ট করার সময় ত্রুটি ঘটেছে: " + err.message);
            }
        }

        // Delete Single Student
        function deleteStudent(id) {
            const students = loadStudents();
            const student = students.find(s => String(s.id) === String(id));
            if (!student) return;

            const nameToDisplay = student.nameBn || student.name || 'শিক্ষার্থী';
            if (confirm(`আপনি কি নিশ্চিত যে শিক্ষার্থী "${nameToDisplay}" এর তথ্য ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
                const updated = students.filter(s => String(s.id) !== String(id));
                selectedStudentIds.delete(String(id));
                saveStudents(updated);
                renderStudentList();
                if (typeof renderPromotionList === 'function') renderPromotionList();
            }
        }

        // Import Modal and Download/Upload handling
        function openImportModal() {
            resetImportModalView();
            const modal = document.getElementById('student-import-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }

        // Close Import Modal
        function closeImportModal(event) {
            const modal = document.getElementById('student-import-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }

        function downloadStudentTemplate() {
            const excelHeaders = [
                "স্টুডেন্ট আইডি (Student ID)",
                "রেজিস্ট্রেশন নম্বর (Registration No)",
                "শ্রেণী (Class)",
                "শাখা (Section)",
                "শিক্ষার্থীর নাম (Name in English)",
                "শিক্ষার্থীর নাম (বাংলায়)",
                "শিক্ষার্থীর ছবি (Photo URL/Base64)",
                "ঐচ্ছিক বিষয় (Optional Subject)",
                "শিক্ষাবর্ষ (Session)",
                "জন্ম তারিখ (Date of Birth)",
                "লিঙ্গ (Gender)",
                "ধর্ম (Religion)",
                "রক্তের গ্রুপ (Blood Group)",
                "পিতার নাম (Father's Name)",
                "পিতার পেশা (Father's Occupation)",
                "পিতার মোবাইল নম্বর (Father's Mobile)",
                "মাতার নাম (Mother's Name)",
                "মাতার পেশা (Mother's Occupation)",
                "মাতার মোবাইল নম্বর (Mother's Mobile)",
                "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)",
                "ইমেইল ঠিকানা (Email Address)",
                "বর্তমান ঠিকানা (Present Address)",
                "স্থায়ী ঠিকানা (Permanent Address)"
            ];

            const sampleData = [
                {
                    "স্টুডেন্ট আইডি (Student ID)": "266001",
                    "রেজিস্ট্রেশন নম্বর (Registration No)": "20266001",
                    "শ্রেণী (Class)": "Class Six",
                    "শাখা (Section)": "A",
                    "শিক্ষার্থীর নাম (Name in English)": "Rafi Ahmed",
                    "শিক্ষার্থীর নাম (বাংলায়)": "রাফি আহমেদ",
                    "শিক্ষার্থীর ছবি (Photo URL/Base64)": "",
                    "ঐচ্ছিক বিষয় (Optional Subject)": "Higher Mathematics",
                    "শিক্ষাবর্ষ (Session)": "2026",
                    "জন্ম তারিখ (Date of Birth)": "2010-05-15",
                    "লিঙ্গ (Gender)": "Male",
                    "ধর্ম (Religion)": "Islam",
                    "রক্তের গ্রুপ (Blood Group)": "A+",
                    "পিতার নাম (Father's Name)": "Karim Ahmed",
                    "পিতার পেশা (Father's Occupation)": "Business",
                    "পিতার মোবাইল নম্বর (Father's Mobile)": "01712345678",
                    "মাতার নাম (Mother's Name)": "Rahima Begum",
                    "মাতার পেশা (Mother's Occupation)": "Housewife",
                    "মাতার মোবাইল নম্বর (Mother's Mobile)": "01711122233",
                    "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)": "01712345678",
                    "ইমেইল ঠিকানা (Email Address)": "rafi@example.com",
                    "বর্তমান ঠিকানা (Present Address)": "Dhaka, Bangladesh",
                    "স্থায়ী ঠিকানা (Permanent Address)": "Dhaka, Bangladesh"
                }
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: excelHeaders });
            XLSX.utils.book_append_sheet(wb, ws, "Students Template");
            XLSX.writeFile(wb, "student_admission_template.xlsx");
        }

        function triggerImportFileInput() {
            const input = document.getElementById('import-students-file');
            if (input) input.click();
        }

        // Drag and drop handlers for Import modal
        function handleImportDragOver(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = document.getElementById('import-drop-zone');
            if (zone) zone.style.background = 'rgba(8, 145, 178, 0.2)';
        }

        function handleImportDragLeave(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = document.getElementById('import-drop-zone');
            if (zone) zone.style.background = 'rgba(255, 255, 255, 0.03)';
        }

        function handleImportDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = document.getElementById('import-drop-zone');
            if (zone) zone.style.background = 'rgba(255, 255, 255, 0.03)';
            if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                importStudentsFromFile({ files: event.dataTransfer.files, value: '' });
            }
        }

        function importStudentsFromFile(input) {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            if (typeof XLSX === 'undefined') {
                alert("ত্রুটি: এক্সেল প্রসেসিং লাইব্রেরি (XLSX) এখনও লোড হয়নি। দয়া করে পেজটি একবার রিফ্রেশ করুন।");
                if (input.value !== undefined) input.value = '';
                return;
            }

            // Verify it is an Excel file
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                alert("ত্রুটি: দয়া করে শুধুমাত্র .xlsx অথবা .xls ফরম্যাটের এক্সেল ফাইল আপলোড করুন।");
                if (input.value !== undefined) input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                let workbook;
                try {
                    const data = new Uint8Array(e.target.result);
                    workbook = XLSX.read(data, { type: 'array' });
                } catch (parseErr) {
                    console.warn("XLSX array parsing failed, attempting binary read...", parseErr);
                    try {
                        workbook = XLSX.read(e.target.result, { type: 'binary' });
                    } catch (binErr) {
                        console.error("XLSX parsing completely failed:", binErr);
                        alert("ত্রুটি: এক্সেল ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে ফাইলটির ফরম্যাট চেক করুন।");
                        if (input.value !== undefined) input.value = '';
                        return;
                    }
                }

                try {
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    if (!rawRows || rawRows.length === 0) {
                        alert("ত্রুটি: ফাইলটিতে কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।");
                        if (input.value !== undefined) input.value = '';
                        return;
                    }

                    // Mapping for both Exported files from Student Directory and Template files
                    const headerKeyMap = {
                        "স্টুডেন্ট আইডি (Student ID)": "studentId",
                        "স্টুডেন্ট আইডি (Student ID - Auto from Advance)": "studentId",
                        "স্টুডেন্ট আইডি (Student ID - প্রতিটি শাখা অনুযায়ী ০০১ থেকে শুরু)": "studentId",
                        "Student ID": "studentId",
                        "Student ID/Roll": "studentId",
                        "StudentID": "studentId",
                        "ID": "studentId",
                        "আইডি": "studentId",
                        "স্টুডেন্ট আইডি": "studentId",
                        "রেজিস্ট্রেশন নম্বর (Registration No)": "regNo",
                        "Registration No": "regNo",
                        "Registration Number": "regNo",
                        "Reg No": "regNo",
                        "RegNo": "regNo",
                        "রেজি: নং": "regNo",
                        "রেজিস্ট্রেশন নং": "regNo",
                        "রেজিস্ট্রেশন নম্বর": "regNo",
                        "শিক্ষার্থীর নাম (Name in English)": "name",
                        "Student Name": "name",
                        "Student Name (English)": "name",
                        "Name in English": "name",
                        "Name (English)": "name",
                        "Name": "name",
                        "নাম": "name",
                        "শিক্ষার্থীর নাম": "name",
                        "শিক্ষার্থীর নাম (বাংলায়)": "nameBn",
                        "Name in Bengali": "nameBn",
                        "Name (Bangla)": "nameBn",
                        "Name (Bengali)": "nameBn",
                        "Name in Bangla": "nameBn",
                        "নাম (বাংলা)": "nameBn",
                        "নাম (বাংলায়)": "nameBn",
                        "শিক্ষার্থীর ছবি (Photo URL/Base64)": "photo",
                        "শিক্ষার্থীর ছবি (Photo)": "photo",
                        "ছবি (Photo)": "photo",
                        "Photo": "photo",
                        "Photo URL": "photo",
                        "ছবি": "photo",
                        "শ্রেণী (Class)": "class",
                        "Class": "class",
                        "শ্রেণী": "class",
                        "শ্রেণি": "class",
                        "শাখা (Section)": "section",
                        "Section": "section",
                        "শাখা": "section",
                        "গ্রুপ (Group)": "roll",
                        "গ্রুপ/বিভাগ (Department/Group)": "roll",
                        "বিভাগ (Department)": "roll",
                        "Department": "roll",
                        "Department (Group)": "roll",
                        "Group": "roll",
                        "ঐচ্ছিক বিষয় (Optional Subject)": "optionalSubject",
                        "Optional Subject": "optionalSubject",
                        "ঐচ্ছিক বিষয়": "optionalSubject",
                        "শিক্ষাবর্ষ (Session)": "session",
                        "Session": "session",
                        "Year": "session",
                        "শিক্ষাবর্ষ": "session",
                        "সেশন": "session",
                        "জন্ম তারিখ (Date of Birth)": "dob",
                        "Date of Birth": "dob",
                        "DOB": "dob",
                        "জন্ম তারিখ": "dob",
                        "লিঙ্গ (Gender)": "gender",
                        "Gender": "gender",
                        "লিঙ্গ": "gender",
                        "ধর্ম (Religion)": "religion",
                        "Religion": "religion",
                        "ধর্ম": "religion",
                        "রক্তের গ্রুপ (Blood Group)": "blood",
                        "Blood Group": "blood",
                        "Blood": "blood",
                        "রক্তের গ্রুপ": "blood",
                        "পিতার নাম (Father's Name)": "fatherName",
                        "Father's Name": "fatherName",
                        "Father Name": "fatherName",
                        "পিতার নাম": "fatherName",
                        "পিতা": "fatherName",
                        "পিতার পেশা (Father's Occupation)": "fatherOccup",
                        "পিতার পেশা (Occupation)": "fatherOccup",
                        "Father's Occupation": "fatherOccup",
                        "Father Occupation": "fatherOccup",
                        "পিতার পেশা": "fatherOccup",
                        "পিতার মোবাইল নম্বর (Father's Mobile)": "fatherPhone",
                        "Father's Mobile": "fatherPhone",
                        "Father Mobile": "fatherPhone",
                        "পিতার মোবাইল": "fatherPhone",
                        "পিতার ফোন": "fatherPhone",
                        "মাতার নাম (Mother's Name)": "motherName",
                        "Mother's Name": "motherName",
                        "Mother Name": "motherName",
                        "মাতার নাম": "motherName",
                        "মাতা": "motherName",
                        "মাতার পেশা (Mother's Occupation)": "motherOccup",
                        "মাতার পেশা (Occupation)": "motherOccup",
                        "Mother's Occupation": "motherOccup",
                        "Mother Occupation": "motherOccup",
                        "মাতার পেশা": "motherOccup",
                        "মাতার মোবাইল নম্বর (Mother's Mobile)": "motherPhone",
                        "Mother's Mobile": "motherPhone",
                        "Mother Mobile": "motherPhone",
                        "মাতার মোবাইল": "motherPhone",
                        "মাতার ফোন": "motherPhone",
                        "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)": "phone",
                        "Guardian's Phone": "phone",
                        "Guardian Phone": "phone",
                        "অভিভাবকের মোবাইল": "phone",
                        "মোবাইল নম্বর": "phone",
                        "মোবাইল": "phone",
                        "Phone": "phone",
                        "Mobile": "phone",
                        "ইমেইল ঠিকানা (Email Address)": "email",
                        "Email Address": "email",
                        "Email": "email",
                        "ইমেইল": "email",
                        "বর্তমান ঠিকানা (Present Address)": "presentAddress",
                        "Present Address": "presentAddress",
                        "বর্তমান ঠিকানা": "presentAddress",
                        "স্থায়ী ঠিকানা (Permanent Address)": "permanentAddress",
                        "Permanent Address": "permanentAddress",
                        "স্থায়ী ঠিকানা": "permanentAddress"
                    };

                    tempImportedStudents = [];
                    rawRows.forEach(row => {
                        const studentObj = {};
                        studentObj.photo = "";

                        Object.keys(row).forEach(header => {
                            const cleanHeader = String(header || '').trim();
                            let dbKey = headerKeyMap[cleanHeader];
                            if (!dbKey) {
                                const lowerHeader = cleanHeader.toLowerCase();
                                const foundKey = Object.keys(headerKeyMap).find(k => k.toLowerCase() === lowerHeader);
                                if (foundKey) dbKey = headerKeyMap[foundKey];
                            }
                            if (dbKey) {
                                studentObj[dbKey] = String(row[header] !== undefined && row[header] !== null ? row[header] : '').trim();
                            }
                        });

                        // Populate English name / Bengali name if either is present
                        if (!studentObj.name && studentObj.nameBn) studentObj.name = studentObj.nameBn;
                        if (!studentObj.nameBn && studentObj.name) studentObj.nameBn = studentObj.name;

                        // Standard validation: check if the student has a name
                        if (studentObj.name || studentObj.nameBn) {
                            // Assign Group (roll) dynamically from Class & Section for Nine and Ten to match Add Student form
                            const cls = studentObj.class || "";
                            const sec = studentObj.section || "";
                            if (cls === "Nine" || cls === "Ten" || cls === "Class 9" || cls === "Class 10") {
                                if (sec === "A") studentObj.roll = "Science";
                                else if (sec === "B") studentObj.roll = "Humanities";
                                else if (sec === "C") studentObj.roll = "Business Studies";
                                else studentObj.roll = "General";
                            } else {
                                studentObj.roll = "General";
                            }

                            // Normalize religion value to match "Hindu (হিন্দু)" or "Islam"
                            let religionVal = studentObj.religion || "Islam";
                            if (religionVal.toLowerCase().includes('hindu')) {
                                religionVal = "Hindu (হিন্দু)";
                            } else if (religionVal.toLowerCase().includes('islam') || religionVal.toLowerCase().includes('muslim')) {
                                religionVal = "Islam";
                            } else if (religionVal.toLowerCase().includes('buddh')) {
                                religionVal = "Buddhism (বৌদ্ধ)";
                            } else if (religionVal.toLowerCase().includes('christ')) {
                                religionVal = "Christianity (খ্রিস্টান)";
                            } else {
                                religionVal = "Others (অন্যান্য)";
                            }
                            studentObj.religion = religionVal;

                            if (!studentObj.session) studentObj.session = new Date().getFullYear().toString();
                            if (!studentObj.gender) studentObj.gender = "Male";
                            if (!studentObj.blood) studentObj.blood = "A+";
                            tempImportedStudents.push(studentObj);
                        }
                    });

                    if (tempImportedStudents.length === 0) {
                        alert("ত্রুটি: ফাইলটিতে কোনো বৈধ শিক্ষার্থীর নাম পাওয়া যায়নি। কলাম শিরোনামগুলো মিলছে কিনা নিশ্চিত করুন।");
                        if (input.value !== undefined) input.value = '';
                        return;
                    }

                    // Pre-generate or preserve Student IDs and Registration numbers for preview according to official policy
                    recalculateTempIdsAndRegs();

                    // Switch modal view to Preview state
                    const uploadView = document.getElementById('import-upload-view');
                    const previewView = document.getElementById('import-preview-view');
                    const container = document.getElementById('import-modal-container');

                    if (uploadView) uploadView.style.display = 'none';
                    if (previewView) {
                        previewView.style.display = 'flex';
                        previewView.style.flexDirection = 'column';
                    }
                    if (container) {
                        container.style.maxWidth = '98%';
                        container.style.width = '98%';
                        container.style.height = '90vh';
                        container.style.display = 'flex';
                        container.style.flexDirection = 'column';
                    }

                    populateImportModalClassDropdown('');
                    renderImportPreview();

                    // Clear the file input so same file can be selected again
                    if (input.value !== undefined) input.value = '';
                } catch (processingErr) {
                    console.error("Error processing imported student data:", processingErr);
                    alert("ত্রুটি: শিক্ষার্থীর তথ্য প্রসেস করার সময় সমস্যা হয়েছে। বিস্তারিত কনসোলে দেখুন।");
                }
            };
            reader.readAsArrayBuffer(file);
        }

        // Department & Class Controls for Import Preview Window
        function populateImportModalClassDropdown(deptVal) {
            const selectEl = document.getElementById('import-class-select');
            if (!selectEl) return;

            const currentVal = selectEl.value;
            const classes = loadClasses();
            const { primary, high } = groupClassesByDepartment(classes);

            let html = '<option value="">শ্রেণী নির্বাচন করুন (Select)</option>';

            if (!deptVal || deptVal === '') {
                if (primary.length > 0) {
                    html += `<optgroup label="প্রাইমারী লেভেল (Primary Level)">`;
                    html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="হাই লেভেল (High Level)">`;
                    html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
            } else if (deptVal === 'Primary Level') {
                html += `<optgroup label="প্রাইমারী লেভেল (Primary Level)">`;
                html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                html += `</optgroup>`;
            } else if (deptVal === 'High Level') {
                html += `<optgroup label="হাই লেভেল (High Level)">`;
                html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                html += `</optgroup>`;
            }

            selectEl.innerHTML = html;
            if (currentVal && classes.includes(currentVal)) {
                selectEl.value = currentVal;
            }
        }

        let isImportModalFullscreen = false;

        function toggleImportModalFullscreen(event) {
            if (event) event.stopPropagation();
            const container = document.getElementById('import-modal-container');
            const btn = document.getElementById('import-fullscreen-btn');
            if (!container) return;

            isImportModalFullscreen = !isImportModalFullscreen;

            if (isImportModalFullscreen) {
                container.style.maxWidth = '100vw';
                container.style.width = '100vw';
                container.style.height = '100vh';
                container.style.maxHeight = '100vh';
                container.style.borderRadius = '0';
                container.style.margin = '0';
                container.style.padding = '20px';
                if (btn) btn.innerHTML = '🗗 Exit Fullscreen';
            } else {
                const previewView = document.getElementById('import-preview-view');
                const isPreviewActive = previewView && previewView.style.display !== 'none';
                container.style.maxWidth = isPreviewActive ? '98%' : '600px';
                container.style.width = isPreviewActive ? '98%' : '90%';
                container.style.height = isPreviewActive ? '90vh' : 'auto';
                container.style.maxHeight = isPreviewActive ? '90vh' : 'none';
                container.style.borderRadius = '16px';
                container.style.margin = 'auto';
                container.style.padding = '';
                if (btn) btn.innerHTML = '⛶ Fullscreen';
            }
        }

        function handleImportDeptChange() {
            const deptVal = document.getElementById('import-dept-filter') ? document.getElementById('import-dept-filter').value : '';
            populateImportModalClassDropdown(deptVal);
        }

        function handleImportBatchClassChange() {
            const classVal = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';
            populateImportSectionDropdown(classVal);
        }

        function populateImportSectionDropdown(className) {
            const sectionSelect = document.getElementById('import-section-select');
            if (!sectionSelect) return;

            if (!className) {
                sectionSelect.innerHTML = '<option value="">শাখা নির্বাচন করুন (Select)</option>';
                return;
            }

            const sections = loadClassSections();
            const classSections = sections.filter(s => s.class === className);

            if (classSections.length === 0) {
                sectionSelect.innerHTML = '<option value="">No Section Available</option>';
            } else {
                sectionSelect.innerHTML = '<option value="">শাখা নির্বাচন করুন (Select)</option>' +
                    classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
            }
        }

        function applyBatchClassToAllImported() {
            const classVal = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';
            const sectionVal = document.getElementById('import-section-select') ? document.getElementById('import-section-select').value : '';

            if (!classVal && !sectionVal) {
                alert("অনুগ্রহ করে প্রযোজ্য করার জন্য শ্রেণী (Class) অথবা শাখা (Section) নির্বাচন করুন।");
                return;
            }

            if (tempImportedStudents && tempImportedStudents.length > 0) {
                tempImportedStudents.forEach(s => {
                    if (classVal) {
                        s.class = classVal;
                    }
                    if (sectionVal) {
                        s.section = sectionVal;
                    }

                    // Assign Group dynamically from Class & Section for Nine and Ten to match hidden field
                    const cls = s.class || "";
                    const sec = s.section || "";
                    if (cls === "Nine" || cls === "Ten" || cls === "Class 9" || cls === "Class 10") {
                        if (sec === "A") s.roll = "Science";
                        else if (sec === "B") s.roll = "Humanities";
                        else if (sec === "C") s.roll = "Business Studies";
                        else s.roll = "General";
                    } else {
                        s.roll = "General";
                    }

                    s.studentId = ""; // Reset generated ID to force recalculation based on new class
                });

                recalculateTempIdsAndRegs();
                renderImportPreview();
            }
        }

        // Preview state table methods
        function renderImportPreview() {
            const tbody = document.getElementById('import-preview-tbody');
            if (!tbody) return;

            let html = "";
            tempImportedStudents.forEach((s, index) => {
                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff !important;">
                        <td style="text-align: center; color: #000000 !important; font-family: monospace; font-weight: 700; padding: 6px;">${index + 1}</td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-family: monospace; font-weight: 700 !important; margin: 0; width: 100%;" value="${s.studentId || ''}" placeholder="(Auto)" oninput="updateTempStudent(${index}, 'studentId', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-family: monospace; font-weight: 700 !important; margin: 0; width: 100%;" value="${s.regNo || ''}" placeholder="(Auto)" oninput="updateTempStudent(${index}, 'regNo', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.name || ''}" oninput="updateTempStudent(${index}, 'name', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.85rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.photo || ''}" placeholder="Photo URL/Base64" oninput="updateTempStudent(${index}, 'photo', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.class || ''}" placeholder="Class" oninput="updateTempStudent(${index}, 'class', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.section || ''}" placeholder="Section" oninput="updateTempStudent(${index}, 'section', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.fatherName || ''}" placeholder="Father Name" oninput="updateTempStudent(${index}, 'fatherName', this.value)">
                        </td>
                        <td style="padding: 6px;">
                            <input type="text" class="form-control" style="background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; padding: 6px 10px; font-size: 0.9rem; font-weight: 600 !important; margin: 0; width: 100%;" value="${s.phone || ''}" oninput="updateTempStudent(${index}, 'phone', this.value)">
                        </td>
                        <td style="text-align: center; padding: 6px;">
                            <button class="action-btn-sm btn-delete-student" style="margin: 0; display: inline-flex; justify-content: center; align-items: center;" title="Remove" onclick="deleteTempImportRow(${index})">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="pointer-events:none;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
            document.getElementById('import-preview-count').innerText = `Total: ${tempImportedStudents.length} students`;
        }

        function updateTempStudent(index, field, value) {
            if (tempImportedStudents[index]) {
                tempImportedStudents[index][field] = value;

                // Recalculate group dynamically from class/section
                if (field === 'class' || field === 'section') {
                    const cls = tempImportedStudents[index].class || "";
                    const sec = tempImportedStudents[index].section || "";
                    if (cls === "Nine" || cls === "Ten" || cls === "Class 9" || cls === "Class 10") {
                        if (sec === "A") tempImportedStudents[index].roll = "Science";
                        else if (sec === "B") tempImportedStudents[index].roll = "Humanities";
                        else if (sec === "C") tempImportedStudents[index].roll = "Business Studies";
                        else tempImportedStudents[index].roll = "General";
                    } else {
                        tempImportedStudents[index].roll = "General";
                    }
                }

                // If class, session or section changed, regenerate IDs
                if (field === 'class' || field === 'session' || field === 'section') {
                    // Clear generated ID to allow recalculation
                    tempImportedStudents[index].studentId = "";
                    recalculateTempIdsAndRegs();
                    renderImportPreview();
                }
            }
        }

        function deleteTempImportRow(index) {
            tempImportedStudents.splice(index, 1);
            renderImportPreview();
        }

        function addTempImportRow() {
            const newStudent = {
                name: "",
                nameBn: "",
                class: "",
                section: "",
                roll: "General",
                session: new Date().getFullYear().toString(),
                dob: "",
                gender: "Male",
                religion: "Islam",
                blood: "A+",
                phone: "",
                email: "",
                fatherName: "",
                fatherOccup: "",
                fatherPhone: "",
                motherName: "",
                motherOccup: "",
                motherPhone: "",
                presentAddress: "",
                permanentAddress: "",
                photo: "",
                optionalSubject: ""
            };
            tempImportedStudents.push(newStudent);
            recalculateTempIdsAndRegs();
            renderImportPreview();

            // Scroll preview table container to bottom to show new row
            setTimeout(() => {
                const container = document.querySelector('#import-preview-tbody').parentNode.parentNode;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 50);
        }

        function generateTempStudentIdAndReg(s, index, list) {
            const existing = loadStudents();
            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const className = s.class || (document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : "") || "Class 6";
            const sectionName = s.section || (document.getElementById('import-section-select') ? document.getElementById('import-section-select').value : "") || "A";
            const prefix = getClassIdPrefix(className);
            const regPrefix = getClassRegPrefix(className);

            // 1. Generate Student ID if blank (per class & section: 001, 002, 003...)
            if (!s.studentId || String(s.studentId).trim() === "") {
                let maxSerial = 0;
                existing.forEach(st => {
                    if (isSameClass(st.class, className) && isSameSection(st.section, sectionName)) {
                        if (st.studentId) {
                            const last3 = String(st.studentId).slice(-3);
                            const serial = parseInt(last3, 10);
                            if (!isNaN(serial) && serial > maxSerial) {
                                maxSerial = serial;
                            }
                        }
                    }
                });

                for (let i = 0; i < index; i++) {
                    const prevSt = list[i];
                    if (prevSt && isSameClass(prevSt.class, className) && isSameSection(prevSt.section, sectionName)) {
                        if (prevSt.studentId) {
                            const last3 = String(prevSt.studentId).slice(-3);
                            const serial = parseInt(last3, 10);
                            if (!isNaN(serial) && serial > maxSerial) {
                                maxSerial = serial;
                            }
                        }
                    }
                }

                let classSecStudentsCount = existing.filter(st => isSameClass(st.class, className) && isSameSection(st.section, sectionName)).length;
                let prevPreviewCount = 0;
                for (let i = 0; i < index; i++) {
                    if (list[i] && isSameClass(list[i].class, className) && isSameSection(list[i].section, sectionName)) {
                        prevPreviewCount++;
                    }
                }
                const baseIdSerial = maxSerial > 0 ? (maxSerial + 1) : (classSecStudentsCount > 0 ? classSecStudentsCount + 1 : 1);
                const nextSerial = baseIdSerial + prevPreviewCount;
                const nextSerialStr = String(nextSerial).padStart(3, '0');
                s.studentId = `${prefix}${nextSerialStr}`;
                if (!s.roll || String(s.roll).trim() === "") {
                    s.roll = String(nextSerial);
                }
            }

            // 2. Generate Registration No if blank (per class, with 3 digits)
            if (!s.regNo || String(s.regNo).trim() === "") {
                const classExisting = existing.filter(st => isSameClass(st.class, className));

                let maxRegSerial = 0;
                classExisting.forEach(st => {
                    if (st.regNo) {
                        const cleanReg = String(st.regNo).trim();
                        if (cleanReg.startsWith(regPrefix)) {
                            const suffix = cleanReg.slice(regPrefix.length);
                            const serial = parseInt(suffix, 10);
                            if (!isNaN(serial) && serial > maxRegSerial) {
                                maxRegSerial = serial;
                            }
                        } else {
                            const match = cleanReg.match(/(\d+)$/);
                            if (match) {
                                const serial = parseInt(match[1], 10);
                                if (!isNaN(serial) && serial > maxRegSerial) {
                                    maxRegSerial = serial;
                                }
                            }
                        }
                    }
                });

                let prevRegPreviewCount = 0;
                for (let i = 0; i < index; i++) {
                    const prevSt = list[i];
                    if (prevSt && isSameClass(prevSt.class, className)) {
                        prevRegPreviewCount++;
                    }
                }

                // If existing students exist in this class, start from next serial; otherwise start from 1 (001)
                const baseRegSerial = maxRegSerial > 0 ? (maxRegSerial + 1) : (classExisting.length > 0 ? classExisting.length + 1 : 1);
                const nextRegSerial = baseRegSerial + prevRegPreviewCount;
                const regSerialStr = String(nextRegSerial).padStart(3, '0');
                s.regNo = `${regPrefix}${regSerialStr}`;
            }
        }

        function recalculateTempIdsAndRegs() {
            tempImportedStudents.forEach((s, idx) => {
                generateTempStudentIdAndReg(s, idx, tempImportedStudents);
            });
        }

        function forceRecalculateImportedStudentIds() {
            if (!tempImportedStudents || tempImportedStudents.length === 0) {
                alert("প্রিভিউতে কোনো শিক্ষার্থী নেই।");
                return;
            }

            const existing = loadStudents();
            const selectedClass = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';
            const selectedSection = document.getElementById('import-section-select') ? document.getElementById('import-section-select').value : '';

            // Keep track of assigned serials per class and section within the preview batch
            const classSecBatchCounters = {};

            tempImportedStudents.forEach((s) => {
                const className = s.class || selectedClass || "Class 6";
                const sectionName = s.section || selectedSection || "A";
                const key = `${normalizeClassName(className)}_${String(sectionName).trim().toUpperCase()}`;
                const prefix = getClassIdPrefix(className);

                if (classSecBatchCounters[key] === undefined) {
                    const classSecExisting = existing.filter(st => isSameClass(st.class, className) && isSameSection(st.section, sectionName));
                    let maxSerial = 0;

                    classSecExisting.forEach(st => {
                        if (st.studentId) {
                            const cleanId = String(st.studentId).trim();
                            if (cleanId.startsWith(prefix)) {
                                const suffix = cleanId.slice(prefix.length);
                                const num = parseInt(suffix, 10);
                                if (!isNaN(num) && num > maxSerial) {
                                    maxSerial = num;
                                }
                            } else {
                                const match = cleanId.match(/(\d+)$/);
                                if (match) {
                                    const num = parseInt(match[1], 10);
                                    if (!isNaN(num) && num > maxSerial) {
                                        maxSerial = num;
                                    }
                                }
                            }
                        }
                    });

                    // If existing students exist in this class & section, start from next serial; otherwise start from 1 (001)
                    if (maxSerial > 0) {
                        classSecBatchCounters[key] = maxSerial + 1;
                    } else if (classSecExisting.length > 0) {
                        classSecBatchCounters[key] = classSecExisting.length + 1;
                    } else {
                        classSecBatchCounters[key] = 1; // Start from 001 if no existing students
                    }
                }

                const currentSerial = classSecBatchCounters[key];
                const serialStr = String(currentSerial).padStart(3, '0');
                s.studentId = `${prefix}${serialStr}`;
                s.roll = String(currentSerial);

                classSecBatchCounters[key] = currentSerial + 1;
            });

            renderImportPreview();
        }

        function forceRecalculateImportedStudentRegNos() {
            if (!tempImportedStudents || tempImportedStudents.length === 0) {
                alert("প্রিভিউতে কোনো শিক্ষার্থী নেই।");
                return;
            }

            const existing = loadStudents();
            const selectedClass = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';

            // Keep track of assigned serials per class within the preview batch
            const classBatchCounters = {};

            tempImportedStudents.forEach((s) => {
                const className = s.class || selectedClass || "Class 6";
                const regPrefix = getClassRegPrefix(className);

                if (classBatchCounters[className] === undefined) {
                    // Find highest existing registration serial in this class from database
                    const classExisting = existing.filter(st => isSameClass(st.class, className));
                    let maxRegSerial = 0;

                    classExisting.forEach(st => {
                        if (st.regNo) {
                            const cleanReg = String(st.regNo).trim();
                            if (cleanReg.startsWith(regPrefix)) {
                                const suffix = cleanReg.slice(regPrefix.length);
                                const num = parseInt(suffix, 10);
                                if (!isNaN(num) && num > maxRegSerial) {
                                    maxRegSerial = num;
                                }
                            } else {
                                const match = cleanReg.match(/(\d+)$/);
                                if (match) {
                                    const num = parseInt(match[1], 10);
                                    if (!isNaN(num) && num > maxRegSerial) {
                                        maxRegSerial = num;
                                    }
                                }
                            }
                        }
                    });

                    // If existing students exist in this class, start from next serial; otherwise start from 1 (001)
                    if (maxRegSerial > 0) {
                        classBatchCounters[className] = maxRegSerial + 1;
                    } else if (classExisting.length > 0) {
                        classBatchCounters[className] = classExisting.length + 1;
                    } else {
                        classBatchCounters[className] = 1; // Start from 001 if no existing students
                    }
                }

                const currentSerial = classBatchCounters[className];
                const regSerialStr = String(currentSerial).padStart(3, '0');
                s.regNo = `${regPrefix}${regSerialStr}`;

                // Increment for next student in same class
                classBatchCounters[className] = currentSerial + 1;
            });

            renderImportPreview();
        }

        function saveImportedStudents() {
            // Validate: check that at least one student has a name
            const validStudents = tempImportedStudents.filter(s => s && ((s.name && s.name.trim() !== "") || (s.nameBn && s.nameBn.trim() !== "")));
            if (validStudents.length === 0) {
                alert("ত্রুটি: সংরক্ষণের জন্য কোনো বৈধ শিক্ষার্থীর নাম পাওয়া যায়নি। অনুগ্রহ করে অন্তত একজনের নাম লিখুন।");
                return;
            }

            const selectedClass = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';
            const selectedDept = document.getElementById('import-dept-filter') ? document.getElementById('import-dept-filter').value : '';

            // Apply selected Header Class & Department only if explicitly selected and student lacks class
            validStudents.forEach(s => {
                if (!s.name && s.nameBn) s.name = s.nameBn;
                if (!s.nameBn && s.name) s.nameBn = s.name;
                if (!s.class && selectedClass) {
                    s.class = selectedClass;
                }
                if (!s.roll && selectedDept) {
                    s.roll = selectedDept === 'Primary Level' ? 'Primary' : 'High';
                }
            });

            // Recalculate IDs for any updated class/section
            recalculateTempIdsAndRegs();

            const existing = loadStudents();
            let importedCount = 0;
            let updatedCount = 0;

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});

            validStudents.forEach(s => {
                if (!s.id) {
                    s.id = Date.now().toString() + '-' + Math.floor(Math.random() * 100000) + '-' + importedCount;
                }

                const className = s.class || "Class 6";
                const sectionName = s.section || "A";
                const prefix = getClassIdPrefix(className);

                // Deduplication: Match by unique ID, or by (Student ID + Class + Section), or by (Name + Father's Name + Mother's Name + Class + Section)
                const idx = existing.findIndex(x =>
                    x.id === s.id ||
                    (x.studentId && s.studentId && x.studentId === s.studentId && isSameClass(x.class, className) && isSameSection(x.section, sectionName)) ||
                    (x.name && s.name && x.name.trim().toLowerCase() === s.name.trim().toLowerCase() &&
                        x.fatherName && s.fatherName && x.fatherName.trim().toLowerCase() === s.fatherName.trim().toLowerCase() &&
                        x.motherName && s.motherName && x.motherName.trim().toLowerCase() === s.motherName.trim().toLowerCase() &&
                        isSameClass(x.class, className) && isSameSection(x.section, sectionName))
                );

                if (idx !== -1) {
                    existing[idx] = { ...existing[idx], ...s };
                    updatedCount++;
                } else {
                    // Generate studentId if missing (per class & section)
                    if (!s.studentId || s.studentId.trim() === "") {
                        const classSecStudents = existing.filter(st => isSameClass(st.class, className) && isSameSection(st.section, sectionName));
                        let maxSerial = 0;
                        classSecStudents.forEach(st => {
                            if (st.studentId) {
                                const last3 = st.studentId.slice(-3);
                                const serial = parseInt(last3, 10);
                                if (!isNaN(serial) && serial > maxSerial) {
                                    maxSerial = serial;
                                }
                            }
                        });
                        const nextSerial = maxSerial > 0 ? maxSerial + 1 : classSecStudents.length + 1;
                        const nextSerialStr = String(nextSerial).padStart(3, '0');
                        s.studentId = `${prefix}${nextSerialStr}`;
                        if (!s.roll || s.roll.trim() === "") s.roll = String(nextSerial);
                    }

                    // Generate regNo if missing (per class, with 3 digits)
                    if (!s.regNo || s.regNo.trim() === "") {
                        const regPrefix = getClassRegPrefix(className);
                        const classExisting = existing.filter(st => isSameClass(st.class, className));
                        let maxRegSerial = 0;
                        classExisting.forEach(st => {
                            if (st.regNo) {
                                if (st.regNo.startsWith(regPrefix)) {
                                    const suffix = st.regNo.slice(regPrefix.length);
                                    const serial = parseInt(suffix, 10);
                                    if (!isNaN(serial) && serial > maxRegSerial) {
                                        maxRegSerial = serial;
                                    }
                                } else {
                                    const last3 = st.regNo.slice(-3);
                                    const serial = parseInt(last3, 10);
                                    if (!isNaN(serial) && serial > maxRegSerial) {
                                        maxRegSerial = serial;
                                    }
                                }
                            }
                        });
                        const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : 1;
                        const regSerialStr = String(nextRegSerial).padStart(3, '0');
                        s.regNo = `${regPrefix}${regSerialStr}`;
                    }

                    existing.push(s);
                    importedCount++;
                }
            });

            saveStudents(existing);

            alert(`সাফল্য: ${importedCount} জন নতুন শিক্ষার্থী যুক্ত করা হয়েছে এবং ${updatedCount} জন শিক্ষার্থীর তথ্য আপডেট করা হয়েছে!`);

            resetImportModalView();
            closeImportModal();
            renderStudentList();
            if (typeof renderPromotionList === 'function') renderPromotionList();
        }

        function resetImportModalView() {
            tempImportedStudents = [];
            isImportModalFullscreen = false;
            const fullscreenBtn = document.getElementById('import-fullscreen-btn');
            if (fullscreenBtn) fullscreenBtn.innerHTML = '⛶ Fullscreen';

            const uploadView = document.getElementById('import-upload-view');
            const previewView = document.getElementById('import-preview-view');
            const container = document.getElementById('import-modal-container');

            if (uploadView) uploadView.style.display = 'block';
            if (previewView) previewView.style.display = 'none';
            if (container) {
                container.style.maxWidth = '600px';
                container.style.width = '90%';
                container.style.height = 'auto';
                container.style.display = 'block';
                container.style.flexDirection = '';
            }

            const fileInput = document.getElementById('import-students-file');
            if (fileInput) fileInput.value = '';

            const deptFilter = document.getElementById('import-dept-filter');
            if (deptFilter) deptFilter.value = '';
            populateImportModalClassDropdown('');
        }

        // Edit Student
        function editStudent(id) {
            const students = loadStudents();
            const s = students.find(x => x.id === id);
            if (!s) return;

            editingStudentId = s.id;

            // Load data into form inputs
            document.getElementById('student-class').value = s.class || '';

            // Populate sections dropdown if dynamic
            handleClassSelectChange();
            document.getElementById('student-section').value = s.section || '';
            document.getElementById('student-roll').value = s.roll || '';
            document.getElementById('student-session').value = s.session || '';
            document.getElementById('student-name').value = s.name || '';
            document.getElementById('student-name-bn').value = s.nameBn || '';
            document.getElementById('student-dob').value = s.dob || '';
            document.getElementById('student-gender').value = s.gender || '';
            document.getElementById('student-religion').value = s.religion || '';
            document.getElementById('student-blood').value = s.blood || '';
            document.getElementById('student-phone').value = s.phone || '';
            document.getElementById('student-email').value = s.email || '';
            document.getElementById('father-name').value = s.fatherName || '';
            document.getElementById('father-occupation').value = s.fatherOccup || '';
            document.getElementById('father-phone').value = s.fatherPhone || '';
            document.getElementById('mother-name').value = s.motherName || '';
            document.getElementById('mother-occupation').value = s.motherOccup || '';
            document.getElementById('mother-phone').value = s.motherPhone || '';
            document.getElementById('present-address').value = s.presentAddress || '';
            document.getElementById('permanent-address').value = s.permanentAddress || '';

            // Handle optional subject loading
            populateOptionalSubjects(s.class || '', s.roll || '');
            const optionalSelect = document.getElementById('student-optional-subject');
            if (optionalSelect) {
                optionalSelect.value = s.optionalSubject || '';
            }

            // Populate ID & Registration inputs
            document.getElementById('student-id-preview').value = s.studentId || '-';
            document.getElementById('student-reg-preview').value = s.regNo || '-';

            // Photo preview handling (Form and ID Card preview)
            uploadedStudentPhotoData = s.photo || '';
            const formImg = document.getElementById('form-avatar-img');
            const formPlaceholder = document.getElementById('form-avatar-placeholder');
            const statusText = document.getElementById('upload-status-text');
            const cardImg = document.getElementById('id-card-photo');
            const cardPlaceholder = document.getElementById('id-card-photo-placeholder');

            if (s.photo) {
                if (formImg) {
                    formImg.src = s.photo;
                    formImg.style.display = "block";
                }
                if (formPlaceholder) {
                    formPlaceholder.style.display = "none";
                }
                if (statusText) {
                    statusText.innerText = "ছবি সফলভাবে লোড হয়েছে";
                    statusText.style.color = "var(--neon-green)";
                }
                if (cardImg) {
                    cardImg.src = s.photo;
                    cardImg.style.display = "block";
                }
                if (cardPlaceholder) {
                    cardPlaceholder.style.display = "none";
                }
            } else {
                if (formImg) {
                    formImg.src = "";
                    formImg.style.display = "none";
                }
                if (formPlaceholder) {
                    formPlaceholder.style.display = "flex";
                }
                if (statusText) {
                    statusText.innerText = "কোনো ছবি নির্বাচন করা হয়নি";
                    statusText.style.color = "var(--muted-text)";
                }
                if (cardImg) {
                    cardImg.src = "";
                    cardImg.style.display = "none";
                }
                if (cardPlaceholder) {
                    cardPlaceholder.style.display = "block";
                }
            }

            // Sync same address checkbox
            const sameAddrCheckbox = document.getElementById('same-address-chk');
            if (sameAddrCheckbox) {
                sameAddrCheckbox.checked = (s.presentAddress && s.permanentAddress && s.presentAddress === s.permanentAddress);
                const permAddrField = document.getElementById('permanent-address');
                if (permAddrField) {
                    permAddrField.readOnly = sameAddrCheckbox.checked;
                    permAddrField.style.opacity = sameAddrCheckbox.checked ? "0.7" : "1";
                }
            }

            // Change button texts and form titles to reflect Edit mode
            const submitBtnText = document.querySelector('#id-card-form button[type="submit"] span');
            if (submitBtnText) submitBtnText.textContent = "💾 শিক্ষার্থীর তথ্য আপডেট করুন";

            // Switch to form view
            switchPortalView('add');

            // Scroll to top of form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- ID CARD MODAL DISPLAY ---
        function viewModalCard(id) {
            const students = loadStudents();
            const s = students.find(s => s.id === id);
            if (!s) return;

            const modal = document.getElementById('id-card-modal');
            const placeholder = document.getElementById('modal-card-placeholder');

            const photoHTML = s.photo
                ? `<img src="${s.photo}" alt="Student Photo">`
                : `<svg viewBox="0 0 24 24" style="width: 50px; height: 50px; fill: var(--muted-text);"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const theme = idRegSettings.idTheme || 'cyan';
            const studentId = s.studentId || `CMS-${1000 + students.indexOf(s) + 1}`;
            const regNo = s.regNo || `REG2026-${1000 + students.indexOf(s) + 1}`;

            placeholder.innerHTML = `
                <div class="id-card" style="margin: 0 auto; transform: scale(1.1); margin-bottom: 20px; border-color: var(--neon-${theme}); box-shadow: 0 0 20px var(--neon-${theme});">
                    <div class="id-photo-container">
                        ${photoHTML}
                    </div>
                    <div class="id-details">
                        <div class="id-school-name">Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School</div>
                        <div class="id-name">${s.name}</div>
                        <div class="id-meta">Student ID: <strong>${studentId}</strong></div>
                        <div class="id-meta">Reg No: <strong>${regNo}</strong></div>
                        <div class="id-meta">Class: <strong>${s.class}</strong></div>
                        <div class="id-meta">Group: <strong>${s.roll}</strong></div>
                        <div class="id-meta">Blood Group: <strong>${s.blood}</strong></div>
                        <div class="id-meta">Emergency Contact: <strong>${s.phone}</strong></div>
                    </div>
                    <div class="id-barcode"></div>
                </div>
            `;
            modal.style.display = 'flex';
        }

        function closeModal(event) {
            document.getElementById('id-card-modal').style.display = 'none';
        }

        function printModalIDCard() {
            const cardHTML = document.querySelector('#modal-card-placeholder').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Student ID Card</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; }
                        .id-card {
                            width: 380px;
                            height: 220px;
                            border-radius: 16px;
                            background: linear-gradient(135deg, #1e1145 0%, #0d0822 100%);
                            border: 2px solid #22d3ee;
                            box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
                            position: relative;
                            overflow: hidden;
                            padding: 20px;
                            display: grid;
                            grid-template-columns: 1fr 2fr;
                            align-items: center;
                            gap: 15px;
                            color: #fff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .id-photo-container {
                            width: 90px;
                            height: 110px;
                            border: 2px solid #f472b6;
                            border-radius: 8px;
                            overflow: hidden;
                            background: rgba(255,255,255,0.05);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .id-photo-container img { width: 100%; height: 100%; object-fit: cover; }
                        .id-school-name { font-size: 0.95rem; font-weight: 700; color: #22d3ee; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 4px; }
                        .id-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 5px; }
                        .id-meta { font-size: 0.8rem; color: #a1a1aa; margin-bottom: 3px; }
                        .id-meta strong { color: #fff; }
                        .id-barcode { position: absolute; bottom: 12px; right: 20px; height: 25px; width: 120px; background: repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 5px, #fff 5px, #fff 6px, transparent 6px, transparent 10px); opacity: 0.7; }
                    </style>
                </head>
                <body>
                    ${cardHTML}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    <\/script>
                
    <!-- ========================================================================= -->
    <!-- ONLINE ADMISSION MODALS: DETAILS, ENROLL, EDIT & PRINT                    -->
    <!-- ========================================================================= -->

    <!-- 1. FULL DETAILS MODAL -->
    <div id="admission-details-modal" class="modal-overlay" onclick="closeOnlineAdmissionDetails()">
        <div class="modal-container" onclick="event.stopPropagation()"
            style="max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: #0f172a; border: 1.5px solid #334155; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        🎓
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;" id="adm-modal-title">অনলাইন ভর্তি আবেদনপত্র — বিস্তারিত তথ্য</h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.82rem; color: #94a3b8;" id="adm-modal-subtitle"></p>
                    </div>
                </div>
                <button type="button" class="modal-close-btn" onclick="closeOnlineAdmissionDetails()" style="color: #ffffff; background: none; border: none; font-size: 1.6rem; cursor: pointer;">×</button>
            </div>

            <div id="adm-modal-body" style="flex: 1; overflow-y: auto; padding-right: 6px;">
                <!-- Populated dynamically via openOnlineAdmissionDetails() -->
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #334155; padding-top: 14px; margin-top: 16px; flex-wrap: wrap; gap: 10px;" id="adm-modal-actions">
                <!-- Actions -->
            </div>
        </div>
    </div>

    <!-- 2. ENROLL / ADMIT STUDENT MODAL -->
    <div id="admission-enroll-modal" class="modal-overlay" onclick="closeEnrollModal()">
        <div class="modal-container" onclick="event.stopPropagation()"
            style="max-width: 580px; width: 92%; padding: 24px; border-radius: 14px; background: #0f172a; border: 1.5px solid #334155; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #334155; padding-bottom: 12px; margin-bottom: 18px;">
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #22c55e; display: flex; align-items: center; gap: 8px;">
                    🎓 শিক্ষার্থী ভর্তি নিশ্চিতকরণ ও রোল/আইডি প্রদান
                </h3>
                <button type="button" class="modal-close-btn" onclick="closeEnrollModal()" style="color: #fff; background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>

            <form id="admission-enroll-form" onsubmit="confirmEnrollStudent(event)">
                <input type="hidden" id="enroll-app-id">
                
                <div style="background: rgba(255,255,255,0.04); border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;">
                    <div style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;" id="enroll-student-name"></div>
                    <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 3px;" id="enroll-student-info"></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div class="form-group">
                        <label for="enroll-class" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">ভর্তি শ্রেণি (Class) *</label>
                        <select id="enroll-class" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569;" onchange="handleEnrollClassChange()">
                            <!-- Options -->
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="enroll-section" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;"> শাখা (Section) *</label>
                        <select id="enroll-section" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569;" onchange="generateEnrollAutoIdRoll()">
                            <option value="A">Section A</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div class="form-group">
                        <label for="enroll-roll" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">শ্রেণি রোল (Roll No) *</label>
                        <input type="text" id="enroll-roll" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569; font-weight: 700;">
                    </div>

                    <div class="form-group">
                        <label for="enroll-id" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">Student ID (আইডি) *</label>
                        <input type="text" id="enroll-id" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569; font-weight: 700; font-family: monospace;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="enroll-reg" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">রেজিস্ট্রেশন নম্বর (Registration No)</label>
                    <input type="text" id="enroll-reg" class="form-control" style="background: #1e293b; color: #fff; border: 1px solid #475569;">
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn-outline-portal" onclick="closeEnrollModal()" style="padding: 10px 18px; border: 1px solid #475569; background: #334155; color: #fff; border-radius: 8px; cursor: pointer;">
                        বাতিল
                    </button>
                    <button type="submit" class="btn-primary" style="padding: 10px 24px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(22,163,74,0.4);">
                        ✅ ভর্তি সম্পন্ন করুন ও রোস্টারে যুক্ত করুন
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. HIDDEN PRINT VOUCHER CONTAINER -->
    <div id="admission-voucher-print-area" style="display: none;"></div>

</body>
                </html>
            `);
            printWindow.document.close();
        }

        // --- STUDENT PROFILE SLIP MODAL ---
        function viewModalProfile(id) {
            const students = loadStudents();
            const s = students.find(s => s.id === id);
            if (!s) return;

            const modal = document.getElementById('student-profile-modal');
            const placeholder = document.getElementById('modal-profile-placeholder');

            const photoHTML = s.photo
                ? `<img src="${s.photo}" alt="Student Photo">`
                : `<div style="display:flex; justify-content:center; align-items:center; height:100%; background:#f1f5f9;"><svg viewBox="0 0 24 24" style="width: 50px; height: 50px; fill: #94a3b8;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

            const schoolSettings = safeJsonParse('school_settings', {});
            const schoolName = schoolSettings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const schoolAddress = schoolSettings.schoolAddress || "Sector-10, Uttara, Dhaka-1230, Bangladesh";

            // Fallback for optional fields
            const nameBn = s.nameBn || s.name || '-';
            const dob = s.dob || '-';
            const gender = s.gender || '-';
            const religion = s.religion || '-';
            const email = s.email || '-';
            const section = s.section || '-';
            const session = s.session || '2026';
            const fatherName = s.fatherName || '-';
            const fatherOccup = s.fatherOccup || '-';
            const fatherPhone = s.fatherPhone || s.phone || '-';
            const motherName = s.motherName || '-';
            const motherOccup = s.motherOccup || '-';
            const motherPhone = s.motherPhone || s.phone || '-';
            const presentAddress = s.presentAddress || '-';
            const permanentAddress = s.permanentAddress || '-';

            const groupHTML = (s.roll && s.roll !== '-' && s.roll.toLowerCase() !== 'general')
                ? `<div class="cv-badge-row"><span class="cv-badge-lbl">Group:</span> <span class="cv-badge-val">${s.roll}</span></div>`
                : '';

            placeholder.innerHTML = `
                <div class="cv-document-wrapper">
                    <div class="cv-header">
                        <div class="cv-logo-side">
                            <div class="school-logo-container" style="position:static; width:70px; height:70px; padding:0; box-shadow:none;">
                                <!-- Logo loaded by JS -->
                            </div>
                        </div>
                        <div class="cv-title-side">
                            <h1 class="cv-school-name">${schoolName}</h1>
                            <p class="cv-school-address">${schoolAddress}</p>
                            <h2 class="cv-document-title">Admission Form - ${session}</h2>
                        </div>
                    </div>
                    
                    <div class="cv-profile-hero">
                        <div class="cv-student-photo-box">
                            ${photoHTML}
                        </div>
                        <div class="cv-basic-badge">
                            <div class="cv-badge-row"><span class="cv-badge-lbl">Student ID:</span> <span class="cv-badge-val" style="color:#00838f;">${s.studentId || '-'}</span></div>
                            <div class="cv-badge-row"><span class="cv-badge-lbl">Reg No:</span> <span class="cv-badge-val" style="font-family: monospace;">${s.regNo || '-'}</span></div>
                            <div class="cv-badge-row"><span class="cv-badge-lbl">Class:</span> <span class="cv-badge-val">${s.class} (${section})</span></div>
                            ${groupHTML}
                        </div>
                    </div>

                    <div class="cv-details-section">
                        <h3 class="cv-section-title">Personal Information</h3>
                        <table class="cv-details-table">
                            <tr>
                                <td>Full Name (English)</td>
                                <td>: ${s.name}</td>
                                <td>Full Name (Bangla)</td>
                                <td>: ${nameBn}</td>
                            </tr>
                            <tr>
                                <td>Registration No</td>
                                <td style="font-family: monospace;">: ${s.regNo || '-'}</td>
                                <td>Date of Birth</td>
                                <td>: ${dob}</td>
                            </tr>
                            <tr>
                                <td>Gender</td>
                                <td>: ${gender}</td>
                                <td>Religion</td>
                                <td>: ${religion}</td>
                            </tr>
                            <tr>
                                <td>Blood Group</td>
                                <td>: ${s.blood || '-'}</td>
                                <td>Mobile Number</td>
                                <td>: ${s.phone || '-'}</td>
                            </tr>
                            <tr>
                                <td>Email Address</td>
                                <td>: ${email}</td>
                                <td>Optional Subject</td>
                                <td>: ${s.optionalSubject || '-'}</td>
                            </tr>
                        </table>

                        <h3 class="cv-section-title">Parents & Guardian Information</h3>
                        <table class="cv-details-table">
                            <tr>
                                <td>Father's Name</td>
                                <td>: ${fatherName}</td>
                                <td>Father's Occupation</td>
                                <td>: ${fatherOccup}</td>
                            </tr>
                            <tr>
                                <td>Father's Phone</td>
                                <td>: ${fatherPhone}</td>
                                <td>Mother's Name</td>
                                <td>: ${motherName}</td>
                            </tr>
                            <tr>
                                <td>Mother's Occupation</td>
                                <td>: ${motherOccup}</td>
                                <td>Mother's Phone</td>
                                <td>: ${motherPhone}</td>
                            </tr>
                        </table>

                        <h3 class="cv-section-title">Address Details</h3>
                        <table class="cv-details-table">
                            <tr>
                                <td>Present Address</td>
                                <td colspan="3">: ${presentAddress}</td>
                            </tr>
                            <tr>
                                <td>Permanent Address</td>
                                <td colspan="3">: ${permanentAddress}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="cv-footer-signatures">
                        <div class="cv-signature-col">
                            <div class="cv-signature-line"></div>
                            <div class="cv-signature-label">শিক্ষার্থীর স্বাক্ষর</div>
                        </div>
                        <div class="cv-signature-col">
                            <div class="cv-signature-line"></div>
                            <div class="cv-signature-label">অভিভাবকের স্বাক্ষর</div>
                        </div>
                        <div class="cv-signature-col">
                            <div class="cv-signature-line"></div>
                            <div class="cv-signature-label">অধ্যক্ষ/প্রধান শিক্ষকের স্বাক্ষর</div>
                        </div>
                    </div>
                </div>
            `;

            // Load school logo in the preview slip
            const customLogo = localStorage.getItem('school_logo');
            const logoContainer = placeholder.querySelector('.school-logo-container');
            if (logoContainer) {
                if (customLogo) {
                    logoContainer.innerHTML = `<img src="${customLogo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
                } else {
                    logoContainer.innerHTML = `
                        <svg viewBox="0 0 24 24" style="fill: var(--neon-cyan); width:100%; height:100%;">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5.89 12.55L12 15.88l6.11-3.33c.6.3 1.89.88 1.89 1.45 0 .58-1.29 1.15-1.89 1.45L12 18.78l-6.11-3.33C5.29 15.15 4 14.58 4 14c0-.58 1.29-1.15 1.89-1.45z"/>
                        </svg>
                    `;
                }
            }

            modal.style.display = 'flex';
        }

        function closeProfileModal(event) {
            document.getElementById('student-profile-modal').style.display = 'none';
        }

        function printModalProfile() {
            const slipHTML = document.querySelector('#modal-profile-placeholder').innerHTML;
            const printWindow = window.open('', '_blank');

            printWindow.document.write(`
                <html>
                <head>
                    <title>Student Admission Profile - Print</title>
                    <link href="https://fonts.googleapis.com/css2?family=Agbalumo&family=Noto+Rashi+Hebrew:wght@100..900&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
                    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
                    <style>
                        @page {
                            size: A4;
                            margin: 0.3in;
                        }
                        body {
                            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', 'SolaimanLipi', serif;
                            margin: 0;
                            padding: 0;
                            background: #fff;
                            color: #000;
                        }
                        .cv-document-wrapper {
                            padding: 0px !important;
                            border: none !important;
                            box-shadow: none !important;
                            min-height: 10.3in;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            box-sizing: border-box;
                        }
                        .cv-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 2px solid #1e3a8a;
                            padding-bottom: 12px;
                            margin-bottom: 20px;
                        }
                        .cv-logo-side {
                            width: 75px;
                            height: 75px;
                        }
                        .cv-logo-side img, .cv-logo-side svg {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            border-radius: 50%;
                        }
                        .cv-title-side {
                            text-align: right;
                            flex-grow: 1;
                            padding-left: 15px;
                        }
                        .cv-school-name {
                            font-size: 1.68rem;
                            font-weight: 700;
                            color: #008000 !important;
                            margin: 0;
                        }
                        .cv-school-address {
                            font-size: 0.95rem;
                            color: #4b5563 !important;
                            margin: 4px 0 0 0;
                        }
                        .cv-document-title {
                            font-size: 1.16rem;
                            font-weight: 600;
                            color: #0000ff !important;
                            margin: 5px 0 0 0;
                            text-transform: uppercase;
                        }
                        .cv-profile-hero {
                            display: flex;
                            gap: 25px;
                            align-items: center;
                            background: #f8fafc !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            border: 1px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 15px;
                            margin-bottom: 20px;
                        }
                        .cv-student-photo-box {
                            width: 110px;
                            height: 140px;
                            border: 1.5px solid #1e3a8a;
                            border-radius: 6px;
                            overflow: hidden;
                            background: #f1f5f9;
                        }
                        .cv-student-photo-box img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .cv-basic-badge {
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                        }
                        .cv-badge-row {
                            font-size: 1.0rem;
                        }
                        .cv-badge-lbl {
                            font-weight: 600;
                            color: #475569;
                            display: inline-block;
                            width: 95px;
                        }
                        .cv-badge-val {
                            font-weight: 700;
                            color: #0f172a;
                        }
                        .cv-section-title {
                            font-size: 1.1rem;
                            font-weight: 700;
                            color: #1e3a8a;
                            border-bottom: 1.5px solid #e2e8f0;
                            padding-bottom: 4px;
                            margin-top: 18px;
                            margin-bottom: 10px;
                            text-transform: uppercase;
                        }
                        .cv-details-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 12px;
                        }
                        .cv-details-table td {
                            padding: 6px 4px;
                            font-size: 0.95rem;
                            vertical-align: top;
                            border-bottom: 1px solid #f1f5f9;
                        }
                        .cv-details-table td:nth-child(odd) {
                            font-weight: 600;
                            color: #475569;
                            width: 23%;
                        }
                        .cv-details-table td:nth-child(even) {
                            font-weight: 700;
                            color: #0f172a;
                            width: 27%;
                        }
                        .cv-footer-signatures {
                            display: flex;
                            justify-content: space-between;
                            margin-top: auto;
                            padding-top: 1in;
                            padding-bottom: 0.2in;
                        }
                        .cv-signature-col {
                            text-align: center;
                            width: 28%;
                        }
                        .cv-signature-line {
                            border-top: 1.5px dashed #64748b;
                            margin-bottom: 8px;
                        }
                        .cv-signature-label {
                            font-size: 0.9rem;
                            font-weight: 600;
                            color: #334155;
                        }
                        .school-logo-container {
                            width: 70px;
                            height: 70px;
                        }
                        .school-logo-container img {
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            object-fit: cover;
                        }
                    </style>
                </head>
                <body>
                    ${slipHTML}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }

        // --- PROMOTION & DEMOTION PANEL LOGIC ---
        function populatePromotionDropdowns() {
            const classes = loadClasses();
            const { primary, high } = groupClassesByDepartment(classes);

            const renderOptions = () => {
                let html = '';
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">`;
                    html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">`;
                    html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                return html;
            };

            const srcSelect = document.getElementById('promote-class-select');
            if (srcSelect) {
                const currentVal = srcSelect.value;
                srcSelect.innerHTML = renderOptions();
                if (currentVal && classes.includes(currentVal)) {
                    srcSelect.value = currentVal;
                } else if (classes.length > 0) {
                    srcSelect.value = classes[0];
                }
            }

            const targetSelect = document.getElementById('promote-target-class-select');
            if (targetSelect) {
                const currentVal = targetSelect.value;
                let targetOptions = renderOptions();
                targetOptions += `<optgroup label="Other"><option value="Alumni">Alumni (গ্র্যাজুয়েট/প্রাক্তন)</option></optgroup>`;
                targetSelect.innerHTML = targetOptions;
                if (currentVal && (classes.includes(currentVal) || currentVal === 'Alumni')) {
                    targetSelect.value = currentVal;
                }
            }

            handlePromoteSourceClassChange();
            populatePromoteTargetSections();
        }

        function handlePromoteSourceClassChange() {
            const srcClass = document.getElementById('promote-class-select')?.value || '';
            const srcSecSelect = document.getElementById('promote-section-select');
            if (srcSecSelect) {
                const allSections = loadClassSections();
                const classSections = allSections.filter(s => isSameClass(s.class, srcClass));
                let html = '<option value="">সকল শাখা</option>';
                if (classSections.length === 0) {
                    html += '<option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>';
                } else {
                    html += classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
                }
                srcSecSelect.innerHTML = html;
            }

            // Smart suggest next class for target
            const classes = loadClasses();
            const currentIdx = classes.findIndex(c => isSameClass(c, srcClass));
            const targetSelect = document.getElementById('promote-target-class-select');
            if (targetSelect && currentIdx !== -1) {
                if (currentIdx + 1 < classes.length) {
                    targetSelect.value = classes[currentIdx + 1];
                } else {
                    targetSelect.value = 'Alumni';
                }
            }

            populatePromoteTargetSections();
            renderPromotionList();
        }

        function populatePromoteTargetSections() {
            const targetClass = document.getElementById('promote-target-class-select')?.value || '';
            const targetSecSelect = document.getElementById('promote-target-section-select');
            if (!targetSecSelect) return;

            if (targetClass === 'Alumni') {
                targetSecSelect.innerHTML = '<option value="A">Section A</option>';
                return;
            }

            const allSections = loadClassSections();
            const classSections = allSections.filter(s => isSameClass(s.class, targetClass));
            if (classSections.length === 0) {
                targetSecSelect.innerHTML = '<option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>';
            } else {
                targetSecSelect.innerHTML = classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
            }
        }

        function renderPromotionList() {
            const srcClass = document.getElementById('promote-class-select')?.value || '';
            const srcSec = document.getElementById('promote-section-select')?.value || '';
            const searchVal = (document.getElementById('promote-search-input')?.value || '').toLowerCase().trim();
            const container = document.getElementById('promote-list-rows');
            const summary = document.getElementById('promote-selection-summary');
            if (!container) return;

            // Reset Select All
            const selectAll = document.getElementById('select-all-promotions');
            if (selectAll) selectAll.checked = false;

            if (!srcClass) {
                container.innerHTML = `<tr><td colspan="9" style="text-align:center; color: #94a3b8; font-style:italic; padding: 25px;">দয়া করে একটি শ্রেণী নির্বাচন করুন।</td></tr>`;
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            const students = loadStudents();
            const filtered = students.filter(s => {
                if (!isSameClass(s.class, srcClass)) return false;
                if (srcSec && !isSameSection(s.section, srcSec)) return false;
                if (searchVal) {
                    const name = (s.name || '').toLowerCase();
                    const nameBn = (s.nameBn || '').toLowerCase();
                    const sid = (s.studentId || '').toLowerCase();
                    const roll = String(s.roll || '').toLowerCase();
                    return name.includes(searchVal) || nameBn.includes(searchVal) || sid.includes(searchVal) || roll.includes(searchVal);
                }
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; color: #64748b !important; font-style:italic; padding: 25px !important;">
                            ${srcClass} ${srcSec ? `(শাখা: ${srcSec})` : ''} এ কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
                        </td>
                    </tr>
                `;
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            let html = '';
            filtered.forEach((s, idx) => {
                const photoHTML = s.photo
                    ? `<img src="${s.photo}" class="student-list-photo" alt="Photo" style="width: 38px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">`
                    : `<div class="student-list-photo-placeholder" style="width: 38px; height: 44px; border-radius: 6px;"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                const studentId = s.studentId || '-';
                const regNoDisplay = s.regNo || (s.studentId ? `${getClassRegPrefix(s.class)}${String(s.studentId.slice(-3)).padStart(3, '0')}` : '');
                const sectionDisplay = s.section ? ` - ${s.section}` : '';
                const fatherName = s.fatherName || '-';
                const motherName = s.motherName || '-';
                const fatherPhone = s.fatherPhone || s.phone || '-';
                const motherPhone = s.motherPhone || s.phone || '-';

                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="text-align: center; padding: 10px;">
                            <input type="checkbox" class="chk-control promote-student-chk" value="${s.id}" style="transform: scale(1.2); cursor: pointer;" onchange="updatePromotionSelectionSummary()">
                        </td>
                        <td style="color: #475569 !important; font-weight: 700; font-family: monospace; font-size: 1.1rem; text-align: center;">${idx + 1}</td>
                        <td style="text-align: center;">${photoHTML}</td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div style="color: #0284c7 !important; font-weight: 800; font-family: monospace; font-size: 1.16rem;">${studentId}</div>
                            ${regNoDisplay ? `<div><span class="saas-reg-badge" title="রেজিস্ট্রেশন নম্বর (Registration No): ${regNoDisplay}" style="color: #000000 !important; font-weight: 800;">${regNoDisplay}</span></div>` : ''}
                        </td>
                        <td style="text-align: left; padding-left: 14px !important;">
                            <div class="student-list-maintext" style="color: #0f172a !important; font-size: 1.19rem !important; font-weight: 700 !important; line-height: 1.3;">${s.nameBn || s.name}</div>
                            <div class="student-list-subtext" style="color: #059669 !important; font-size: 1.01rem !important; font-weight: 600 !important; margin-top: 2px;">${s.class}${sectionDisplay}</div>
                        </td>
                        <td style="text-align: left; padding-left: 14px !important;">
                            <div class="student-list-maintext" style="color: #0f172a !important; font-size: 1.12rem !important; font-weight: 600 !important; line-height: 1.3;">${fatherName}</div>
                            <div class="student-list-subtext" style="color: #2563eb !important; font-family: monospace; font-size: 1.01rem !important; font-weight: 600; margin-top: 2px;">${fatherPhone}</div>
                        </td>
                        <td style="text-align: left; padding-left: 14px !important;">
                            <div class="student-list-maintext" style="color: #0f172a !important; font-size: 1.12rem !important; font-weight: 600 !important; line-height: 1.3;">${motherName}</div>
                            <div class="student-list-subtext" style="color: #2563eb !important; font-family: monospace; font-size: 1.01rem !important; font-weight: 600; margin-top: 2px;">${motherPhone}</div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;
            updatePromotionSelectionSummary();
        }

        function toggleSelectAllPromotions(checked) {
            const checkboxes = document.querySelectorAll('.promote-student-chk');
            checkboxes.forEach(chk => chk.checked = checked);
            updatePromotionSelectionSummary();
        }

        function updatePromotionSelectionSummary() {
            const checkedBoxes = document.querySelectorAll('.promote-student-chk:checked');
            const count = checkedBoxes.length;
            const summary = document.getElementById('promote-selection-summary');
            if (summary) {
                if (count > 0) {
                    summary.innerHTML = `<span style="color: #38bdf8; font-weight: bold; font-size: 1rem;">${count}</span> জন শিক্ষার্থী সিলেক্ট করা হয়েছে`;
                } else {
                    summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                }
            }
        }

        function loadSubjects() {
            const parsed = safeJsonParse('school_subjects', {});
            return parsed && typeof parsed === 'object' ? parsed : {};
        }

        function populateOptionalSubjects(classVal) {
            const optionalSelect = document.getElementById('student-optional-subject');
            if (!optionalSelect) return;

            const currentVal = optionalSelect.value;

            const subjectsMap = loadSubjects();
            const classSubjects = subjectsMap[classVal] || [];
            const optionalSubjects = classSubjects.filter(sub => sub.isOptional === true);

            if (optionalSubjects.length === 0) {
                // Fallback default optional subjects for Nine and Ten if none in DB
                if (classVal === "Nine" || classVal === "Ten" || classVal === "Class 9" || classVal === "Class 10") {
                    optionalSelect.innerHTML = `
                        <option value="" disabled>Select Optional Subject</option>
                        <option value="Higher Mathematics">Higher Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="Agriculture Studies">Agriculture Studies</option>
                        <option value="Home Science">Home Science</option>
                    `;
                } else {
                    optionalSelect.innerHTML = '<option value="">No Optional Subject</option>';
                }
            } else {
                optionalSelect.innerHTML = `
                    <option value="" disabled>Select Optional Subject</option>
                    ${optionalSubjects.map(sub => `<option value="${sub.name}">${sub.name}</option>`).join('')}
                `;
            }

            if (currentVal) {
                const optionExists = Array.from(optionalSelect.options).some(opt => opt.value === currentVal);
                if (optionExists) {
                    optionalSelect.value = currentVal;
                } else {
                    optionalSelect.value = "";
                }
            } else {
                optionalSelect.value = "";
            }
        }

        function loadClasses() {
            const defaultClasses = ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
            const parsed = safeJsonParse('school_classes', null);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(c => c && typeof c === 'string' && c.trim() !== '');
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return defaultClasses;
        }

        function populateStudentPortalClassDropdowns() {
            const classes = loadClasses();
            const { primary, high } = groupClassesByDepartment(classes);

            const renderGroupOptions = (includeAll = false, allText = "") => {
                let html = includeAll ? `<option value="">${allText}</option>` : '';
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">`;
                    html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">`;
                    html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                return html;
            };

            const studentClassSelect = document.getElementById('student-class');
            if (studentClassSelect) {
                const currentVal = studentClassSelect.value;
                studentClassSelect.innerHTML = renderGroupOptions(false);
                if (currentVal && classes.includes(currentVal)) {
                    studentClassSelect.value = currentVal;
                }
            }

            populatePromotionDropdowns();
            populateImportModalClassDropdown('');

            // Populate filters dynamically based on database data
            populateStudentPortalFilterDropdowns();
        }

        function populateStudentPortalFilterDropdowns(preserveSelections = true) {
            const students = loadStudents();
            const sectionsConfig = loadClassSections();
            const allConfiguredClasses = loadClasses();

            // 1. Classes actually present in student data (or configured classes if database is empty)
            const dbClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
            const uniqueClasses = dbClasses.length > 0 ? dbClasses : allConfiguredClasses;

            // Sort classes using standard school hierarchy
            uniqueClasses.sort((a, b) => {
                const idxA = allConfiguredClasses.findIndex(c => isSameClass(c, a));
                const idxB = allConfiguredClasses.findIndex(c => isSameClass(c, b));
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });

            // 1. Populate Class Filter
            const classFilter = document.getElementById('student-class-filter');
            let selectedClass = classFilter ? classFilter.value : '';
            if (classFilter) {
                const currentVal = classFilter.value;
                let cHtml = `<option value="">Class</option>`;
                uniqueClasses.forEach(c => {
                    cHtml += `<option value="${c}">${c}</option>`;
                });
                classFilter.innerHTML = cHtml;
                if (preserveSelections && currentVal) {
                    const matchedClass = uniqueClasses.find(c => isSameClass(c, currentVal));
                    if (matchedClass) {
                        classFilter.value = matchedClass;
                        selectedClass = matchedClass;
                    } else {
                        classFilter.value = "";
                        selectedClass = "";
                    }
                }
            }

            // 2. Populate Section Filter (dynamically filtered by the selected Class)
            const sectionFilter = document.getElementById('student-section-filter');
            if (sectionFilter) {
                const currentSec = sectionFilter.value;
                let availableSections = [];

                if (selectedClass) {
                    // Only sections that students in this specific class actually have
                    availableSections = Array.from(new Set([
                        ...students.filter(s => isSameClass(s.class, selectedClass)).map(s => s.section).filter(Boolean),
                        ...sectionsConfig.filter(s => isSameClass(s.class, selectedClass)).map(s => s.section).filter(Boolean)
                    ]));
                } else {
                    // All sections present in student table
                    availableSections = Array.from(new Set([
                        ...students.map(s => s.section).filter(Boolean),
                        ...sectionsConfig.map(s => s.section).filter(Boolean)
                    ]));
                }

                if (availableSections.length === 0) {
                    availableSections = ['A', 'B', 'C', 'D'];
                }
                availableSections.sort();

                let sHtml = `<option value="">Section</option>`;
                availableSections.forEach(sec => {
                    const cleanSec = sec.replace(/^Section\s*/i, '').replace(/^ শাখা\s*/i, '').trim();
                    sHtml += `<option value="${cleanSec}">${cleanSec}</option>`;
                });
                sectionFilter.innerHTML = sHtml;

                if (preserveSelections && currentSec) {
                    const matchedSec = availableSections.find(s => isSameSection(s, currentSec));
                    if (matchedSec) {
                        sectionFilter.value = matchedSec.replace(/^Section\s*/i, '').replace(/^ শাখা\s*/i, '').trim();
                    } else {
                        sectionFilter.value = "";
                    }
                }
            }

            // 3. Populate Gender Filter (dynamically filtered by selected Class / table records)
            const genderFilter = document.getElementById('student-gender-filter');
            if (genderFilter) {
                const currentGen = genderFilter.value;
                const relevantStudents = selectedClass ? students.filter(s => isSameClass(s.class, selectedClass)) : students;
                const dbGenders = Array.from(new Set(relevantStudents.map(s => s.gender).filter(Boolean)));
                const standardGenders = ['Male', 'Female', 'Other'];
                const allGenders = Array.from(new Set([...dbGenders, ...standardGenders]));

                let gHtml = `<option value="">Gender</option>`;
                allGenders.forEach(g => {
                    let label = g;
                    if (g.toLowerCase() === 'male' || g === 'ছাত্র') label = 'Male (ছাত্র)';
                    else if (g.toLowerCase() === 'female' || g === 'ছাত্রী') label = 'Female (ছাত্রী)';
                    else if (g.toLowerCase() === 'other' || g === 'অন্যান্য') label = 'Other (অন্যান্য)';
                    gHtml += `<option value="${g}">${label}</option>`;
                });
                genderFilter.innerHTML = gHtml;

                if (preserveSelections && currentGen) {
                    const matchedGen = allGenders.find(g => g.toLowerCase() === currentGen.toLowerCase());
                    if (matchedGen) {
                        genderFilter.value = matchedGen;
                    } else {
                        genderFilter.value = "";
                    }
                }
            }

            // 4. Populate Religion Filter (dynamically filtered by selected Class / table records)
            const religionFilter = document.getElementById('student-religion-filter');
            if (religionFilter) {
                const currentRel = religionFilter.value;
                const relevantStudents = selectedClass ? students.filter(s => isSameClass(s.class, selectedClass)) : students;
                const dbReligions = Array.from(new Set(relevantStudents.map(s => s.religion).filter(Boolean)));
                const standardReligions = ['Islam', 'Hindu (হিন্দু)', 'Buddhism', 'Christianity', 'Others'];
                const allReligions = Array.from(new Set([...dbReligions, ...standardReligions]));

                let rHtml = `<option value="">Religion</option>`;
                allReligions.forEach(r => {
                    let label = r;
                    if (r === 'Islam') label = 'Islam (ইসলাম)';
                    else if (r === 'Hindu (হিন্দু)' || r === 'Hindu') label = 'Hindu (হিন্দু)';
                    else if (r === 'Buddhism') label = 'Buddhism (বৌদ্ধ)';
                    else if (r === 'Christianity') label = 'Christianity (খ্রিস্টান)';
                    else if (r === 'Others') label = 'Others (অন্যান্য)';
                    rHtml += `<option value="${r}">${label}</option>`;
                });
                religionFilter.innerHTML = rHtml;

                if (preserveSelections && currentRel) {
                    const matchedRel = allReligions.find(r => r.toLowerCase() === currentRel.toLowerCase() || (currentRel.includes('Hindu') && r.includes('Hindu')));
                    if (matchedRel) {
                        religionFilter.value = matchedRel;
                    } else {
                        religionFilter.value = "";
                    }
                }
            }
        }

        // Execute Promotion or Demotion to target class & section with auto ID/Roll calculation
        function executePromotionAction(actionType) {
            const checkedBoxes = document.querySelectorAll('.promote-student-chk:checked');
            const count = checkedBoxes.length;
            if (count === 0) {
                alert("দয়া করে প্রমোশন বা ডিমোশন করার জন্য এক বা একাধিক শিক্ষার্থী নির্বাচন করুন।");
                return;
            }

            const targetClass = document.getElementById('promote-target-class-select')?.value || '';
            const targetSec = document.getElementById('promote-target-section-select')?.value || 'A';
            const srcClass = document.getElementById('promote-class-select')?.value || '';
            const srcSec = document.getElementById('promote-section-select')?.value || '';

            if (!targetClass) {
                alert("দয়া করে লক্ষ্য গন্তব্য শ্রেণী নির্বাচন করুন।");
                return;
            }

            const actionName = actionType === 'promote' ? 'প্রমোশন (Promotion)' : 'ডিমোশন (Demotion)';
            const isAutoId = document.getElementById('promote-auto-id-chk')?.checked;
            const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

            if (!confirm(`আপনি কি নিশ্চিত যে সিলেক্টকৃত ${count} জন শিক্ষার্থীকে "${targetClass} (শাখা: ${targetSec})" এ ${actionName} করতে চান?`)) {
                return;
            }

            const students = loadStudents();
            const targetPrefix = getClassIdPrefix(targetClass);

            // Find highest existing serial in target class & section among students NOT being transferred
            let maxSerial = 0;
            students.forEach(s => {
                if (isSameClass(s.class, targetClass) && isSameSection(s.section, targetSec) && !selectedIds.includes(s.id)) {
                    if (s.studentId) {
                        const last3 = s.studentId.slice(-3);
                        const num = parseInt(last3, 10);
                        if (!isNaN(num) && num > maxSerial) {
                            maxSerial = num;
                        }
                    }
                }
            });

            let currentSerial = maxSerial + 1;

            students.forEach(s => {
                if (selectedIds.includes(s.id)) {
                    s.class = targetClass;
                    s.section = targetSec;
                    if (isAutoId) {
                        s.studentId = `${targetPrefix}${String(currentSerial).padStart(3, '0')}`;
                        s.roll = String(currentSerial);
                        currentSerial++;
                    }
                }
            });

            // Save to localStorage & SQLite backend
            saveStudents(students);

            alert(`সাফল্য: ${count} জন শিক্ষার্থীকে "${targetClass} (শাখা: ${targetSec})" এ সফলভাবে ${actionName} করা হয়েছে!`);

            // Re-render
            renderPromotionList();
            renderStudentList();
        }

        // Backward compatibility handler
        function handlePromotion(direction) {
            executePromotionAction(direction > 0 ? 'promote' : 'demote');
        }

        // Check view param in url on DOM load
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'list';
            switchPortalView(view);
        }

        // Sync class, section and student changes from the server database
        window.addEventListener('dbSynced', () => {
            populateStudentPortalClassDropdowns();
            if (typeof populateStudentPortalFilterDropdowns === 'function') populateStudentPortalFilterDropdowns();
            if (typeof populateOnlineAdmissionClassDropdown === 'function') populateOnlineAdmissionClassDropdown();
            handleClassSelectChange();
            updateIdRegPreviews();
            if (typeof renderStudentList === 'function') renderStudentList();
            if (typeof renderPromotionList === 'function') renderPromotionList();
            if (typeof renderOnlineAdmissionsList === 'function') renderOnlineAdmissionsList();
        });

        window.addEventListener('storage', () => {
            if (typeof renderStudentList === 'function') renderStudentList();
            if (typeof renderPromotionList === 'function') renderPromotionList();
            if (typeof renderOnlineAdmissionsList === 'function') renderOnlineAdmissionsList();
        });

        // Intercept dropdown & subview clicks dynamically
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href') || '';
            if (href.includes('view=')) {
                try {
                    const url = new URL(link.href, window.location.href);
                    const isPortalPage = url.pathname.endsWith('student-portal') ||
                                         url.pathname.endsWith('student-portal.html') ||
                                         url.pathname === window.location.pathname;
                    if (isPortalPage) {
                        const view = url.searchParams.get('view');
                        if (view && ['list', 'add', 'promote', 'online-admissions', 'admissions'].includes(view)) {
                            e.preventDefault();
                            window.history.pushState({}, '', `?view=${view}`);
                            switchPortalView(view);
                            const navMenu = document.getElementById('nav-menu-list');
                            if (navMenu) navMenu.classList.remove('active');
                        }
                    }
                } catch (err) { }
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            populateStudentPortalClassDropdowns();
            checkURLParameters();
            applyIdCardTheme();
            handleClassSelectChange();
            updateIdRegPreviews();
            updateCardPreview();

            // Recheck if URL hash or search parameters change without reloading (for dynamic browser clicks)
            window.addEventListener('popstate', checkURLParameters);

            // Drag and drop photo uploads
            const dropzone = document.getElementById('dropzone');
            if (dropzone) {
                dropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzone.classList.add('dragover');
                });
                dropzone.addEventListener('dragleave', () => {
                    dropzone.classList.remove('dragover');
                });
                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('dragover');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const input = document.getElementById('student-photo');
                        if (input) {
                            input.files = e.dataTransfer.files;
                            previewStudentPhoto(file);
                        }
                    }
                });
            }
        });
    
        // =========================================================================
        // ONLINE ADMISSION APPLICATIONS MANAGEMENT ENGINE (ERP STUDENT PORTAL)
        // =========================================================================

        let currentAdmPage = 1;
        let selectedOnlineAdmIds = new Set();

        function loadOnlineAdmissions() {
            try {
                const stored = localStorage.getItem('school_admission_applications');
                if (!stored) return [];
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Failed to load school_admission_applications:", e);
                return [];
            }
        }

        function saveOnlineAdmissions(apps) {
            if (!Array.isArray(apps)) return;
            const jsonStr = JSON.stringify(apps);
            localStorage.setItem('school_admission_applications', jsonStr);

            // Direct sync with SQLite backend server
            if (typeof fetch === 'function') {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_admission_applications',
                        value: jsonStr
                    })
                }).catch(e => console.log('Background DB sync notice:', e));
            }

            // Cross-tab real-time broadcast
            if (window.BroadcastChannel) {
                try {
                    const bc = new BroadcastChannel('school_realtime_db_channel');
                    bc.postMessage({ type: 'set', key: 'school_admission_applications', value: jsonStr, ver: Date.now() });
                    bc.close();
                } catch (e) {}
            }

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('dbSynced', { detail: { key: 'school_admission_applications' } }));
        }

        function populateOnlineAdmissionClassDropdown() {
            const select = document.getElementById('adm-class-filter');
            const enrollSelect = document.getElementById('enroll-class');
            if (!select && !enrollSelect) return;

            const classes = safeJsonParse('school_classes', [
                "Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
                "Six", "Seven", "Eight", "Nine", "Ten"
            ]);

            if (select) {
                const currentVal = select.value;
                select.innerHTML = '<option value="">সকল শ্রেণি (All Classes)</option>';
                classes.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c;
                    opt.textContent = c;
                    select.appendChild(opt);
                });
                if (currentVal) select.value = currentVal;
            }

            if (enrollSelect) {
                enrollSelect.innerHTML = '<option value="">-- শ্রেণি নির্বাচন করুন --</option>';
                classes.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c;
                    opt.textContent = c;
                    enrollSelect.appendChild(opt);
                });
            }
        }

        function toggleAdmSearchInput() {
            const container = document.getElementById('adm-search-input-container');
            const input = document.getElementById('adm-search-input');
            if (!container) return;
            if (container.style.display === 'none') {
                container.style.display = 'block';
                if (input) input.focus();
            } else {
                if (input && input.value) {
                    input.value = '';
                    currentAdmPage = 1;
                    renderOnlineAdmissionsList();
                }
                container.style.display = 'none';
            }
        }

        function updateOnlineAdmissionStats(apps) {
            if (!apps) apps = loadOnlineAdmissions();
            const total = apps.length;
            const pending = apps.filter(a => !a.status || a.status === 'Submitted' || a.status === 'Pending').length;
            const admitted = apps.filter(a => a.status === 'Admitted' || a.status === 'Approved').length;
            const rejected = apps.filter(a => a.status === 'Rejected').length;

            const totalEl = document.getElementById('stat-adm-total');
            const pendingEl = document.getElementById('stat-adm-pending');
            const admittedEl = document.getElementById('stat-adm-admitted');
            const rejectedEl = document.getElementById('stat-adm-rejected');
            const badgeBtn = document.getElementById('online-admission-badge-count-btn');

            if (totalEl) totalEl.textContent = total.toLocaleString('bn-BD');
            if (pendingEl) pendingEl.textContent = pending.toLocaleString('bn-BD');
            if (admittedEl) admittedEl.textContent = admitted.toLocaleString('bn-BD');
            if (rejectedEl) rejectedEl.textContent = rejected.toLocaleString('bn-BD');
            if (badgeBtn) badgeBtn.textContent = total.toLocaleString('bn-BD');
        }

        function renderOnlineAdmissionsList() {
            const tbody = document.getElementById('online-admission-list-rows');
            if (!tbody) return;

            populateOnlineAdmissionClassDropdown();
            const apps = loadOnlineAdmissions();
            updateOnlineAdmissionStats(apps);

            const searchVal = (document.getElementById('adm-search-input')?.value || '').toLowerCase().trim();
            const classVal = (document.getElementById('adm-class-filter')?.value || '').toLowerCase().trim();
            const sessionVal = (document.getElementById('adm-session-filter')?.value || '').trim();
            const statusVal = (document.getElementById('adm-status-filter')?.value || '').trim();
            const genderVal = (document.getElementById('adm-gender-filter')?.value || '').trim();
            const rowsPerPageVal = parseInt(document.getElementById('adm-rows-per-page')?.value || '25', 10);

            const filtered = apps.filter(a => {
                if (!a) return false;
                const trackingId = (a.trackingId || '').toLowerCase();
                const nameBn = (a.student?.nameBn || '').toLowerCase();
                const nameEn = (a.student?.nameEn || '').toLowerCase();
                const fatherBn = (a.parents?.fatherBn || '').toLowerCase();
                const guardianName = (a.guardian?.name || '').toLowerCase();
                const phone = (a.guardian?.phone || a.parents?.fatherPhone || '').toLowerCase();
                const birthReg = (a.student?.birthReg || '').toLowerCase();
                const targetCls = (a.targetClass || '').toLowerCase();
                const session = String(a.session || '');
                const status = a.status || 'Submitted';
                const gender = a.student?.gender || 'ছাত্র';

                const matchesSearch = !searchVal ||
                    trackingId.includes(searchVal) ||
                    nameBn.includes(searchVal) ||
                    nameEn.includes(searchVal) ||
                    fatherBn.includes(searchVal) ||
                    guardianName.includes(searchVal) ||
                    phone.includes(searchVal) ||
                    birthReg.includes(searchVal);

                const matchesClass = !classVal || targetCls.includes(classVal);
                const matchesSession = !sessionVal || session === sessionVal;
                const matchesStatus = !statusVal || status === statusVal;
                const matchesGender = !genderVal || gender === genderVal;

                return matchesSearch && matchesClass && matchesSession && matchesStatus && matchesGender;
            });

            const totalCount = filtered.length;
            const totalPages = Math.ceil(totalCount / rowsPerPageVal) || 1;
            if (currentAdmPage > totalPages) currentAdmPage = totalPages;
            if (currentAdmPage < 1) currentAdmPage = 1;

            const startIndex = (currentAdmPage - 1) * rowsPerPageVal;
            const endIndex = Math.min(startIndex + rowsPerPageVal, totalCount);
            const pageRows = filtered.slice(startIndex, endIndex);

            // Pagination info text
            const infoEl = document.getElementById('adm-pagination-info');
            if (infoEl) {
                if (totalCount === 0) {
                    infoEl.textContent = 'কোনো অনলাইন ভর্তি আবেদন পাওয়া যায়নি';
                } else {
                    infoEl.textContent = `মোট ${totalCount.toLocaleString('bn-BD')} টি আবেদনের মধ্যে ${(startIndex + 1).toLocaleString('bn-BD')} থেকে ${endIndex.toLocaleString('bn-BD')} দেখানো হচ্ছে`;
                }
            }

            // Pagination buttons
            renderOnlineAdmissionsPagination(totalPages);

            if (pageRows.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 1rem;">
                            <div style="font-size: 2.5rem; margin-bottom: 8px;">📭</div>
                            <strong>কোনো অনলাইন ভর্তি আবেদন পাওয়া যায়নি</strong>
                            <p style="font-size: 0.85rem; margin: 4px 0 0 0; color: #64748b;">CMS ওয়েবসাইট থেকে শিক্ষার্থীরা অনলাইনে আবেদন দাখিল করলে এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত ও প্রদর্শিত হবে।</p>
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            pageRows.forEach((a, idx) => {
                const sl = startIndex + idx + 1;
                const isSelected = selectedOnlineAdmIds.has(a.id);
                const trackingId = a.trackingId || `APP-${sl}`;
                const nameBn = a.student?.nameBn || '-';
                const nameEn = a.student?.nameEn || '';
                const targetClass = a.targetClass || '-';
                const shift = a.shift || 'দিবা শাখা';
                const group = (a.group && a.group !== 'প্রযোজ্য নয়' && a.group !== 'সাধারণ') ? ` (${a.group})` : '';
                const guardianName = a.guardian?.name || a.parents?.fatherBn || '-';
                const phone = a.guardian?.phone || a.parents?.fatherPhone || '-';
                const birthReg = a.student?.birthReg || '-';
                const dob = a.student?.dob || '-';
                const address = a.address?.present || a.address?.permanent || '-';
                const formattedDate = a.formattedDate || (a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('bn-BD') : '-');
                
                // Photo
                let photoHtml = '';
                if (a.photo && a.photo.startsWith('data:image')) {
                    photoHtml = `<img src="${a.photo}" alt="Photo" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1.5px solid #cbd5e1; cursor: pointer;" onclick="previewAdmissionPhotoModal('${a.photo}', '${nameBn}')">`;
                } else {
                    photoHtml = `<div style="width: 38px; height: 38px; border-radius: 8px; background: #e0f2fe; color: #0284c7; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.88rem; border: 1.5px solid #bae6fd;">${(nameEn || nameBn || 'S').charAt(0).toUpperCase()}</div>`;
                }

                // Status Badge
                let statusBadge = '';
                const status = a.status || 'Submitted';
                if (status === 'Admitted') {
                    statusBadge = `<span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">🟢 ভর্তি নিশ্চিত</span>`;
                } else if (status === 'Approved') {
                    statusBadge = `<span style="background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">✔️ অনুমোদিত</span>`;
                } else if (status === 'Rejected') {
                    statusBadge = `<span style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">🔴 বাতিল</span>`;
                } else {
                    statusBadge = `<span style="background: #fef9c3; color: #854d0e; border: 1px solid #fde047; padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">⏳ অপেক্ষমাণ</span>`;
                }

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" class="${isSelected ? 'row-selected' : ''}">
                        <td style="text-align: center; padding: 10px 6px;">
                            <input type="checkbox" class="adm-row-chk" data-id="${a.id}" ${isSelected ? 'checked' : ''}
                                style="width: 17px; height: 17px; accent-color: #0284c7; cursor: pointer; vertical-align: middle;"
                                onchange="toggleOnlineAdmissionSelection('${a.id}', this.checked)">
                        </td>
                        <td style="text-align: center; font-weight: 700; color: #64748b; font-size: 0.85rem;">${sl}</td>
                        <td style="text-align: center;">
                            <div style="font-family: monospace; font-weight: 800; color: #0284c7; font-size: 0.92rem;">${trackingId}</div>
                            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">${formattedDate}</div>
                        </td>
                        <td style="text-align: center;">${photoHtml}</td>
                        <td>
                            <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">${nameBn}</div>
                            <div style="font-size: 0.82rem; color: #475569;">${nameEn || ''}</div>
                            <div style="margin-top: 3px;">
                                <span style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-size: 0.76rem; font-weight: 700; padding: 1px 7px; border-radius: 4px;">${targetClass}${group}</span>
                                <span style="background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; font-size: 0.74rem; padding: 1px 5px; border-radius: 4px; margin-left: 3px;">${shift}</span>
                            </div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: #1e293b; font-size: 0.88rem;">${guardianName}</div>
                            <div style="font-size: 0.82rem; color: #0284c7; margin-top: 2px;">
                                <a href="tel:${phone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">📞 ${phone}</a>
                            </div>
                        </td>
                        <td>
                            <div style="font-size: 0.82rem; color: #334155; font-family: monospace;">${birthReg}</div>
                            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">🎂 ${dob}</div>
                        </td>
                        <td>
                            <div style="font-size: 0.82rem; color: #475569; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${address}">
                                ${address}
                            </div>
                        </td>
                        <td style="text-align: center;">${statusBadge}</td>
                        <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
                                <button type="button" class="btn-action-view" onclick="openOnlineAdmissionDetails('${a.id}')" title="বিস্তারিত দেখুন" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">
                                    👁️ ভিউ
                                </button>
                                <button type="button" class="btn-action-print" onclick="printOnlineAdmissionVoucher('${a.id}')" title="আবেদনপত্র ও রসিদ প্রিন্ট করুন" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">
                                    🖨️ প্রিন্ট
                                </button>
                                <button type="button" class="btn-action-enroll" onclick="openEnrollModal('${a.id}')" title="শিক্ষার্থীকে মূল তালিকায় ভর্তি করান" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; font-weight: 700;">
                                    🎓 ভর্তি
                                </button>
                                <button type="button" class="btn-action-delete" onclick="deleteOnlineAdmission('${a.id}')" title="আবেদন মুছে ফেলুন" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
            updateAdmDeleteSelectedButton();
        }

        function renderOnlineAdmissionsPagination(totalPages) {
            const container = document.getElementById('adm-pagination-controls');
            if (!container) return;
            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            html += `<button type="button" class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;" onclick="goOnlineAdmPage(1)" ${currentAdmPage === 1 ? 'disabled style="opacity:0.5;"' : ''}>⏮</button>`;
            html += `<button type="button" class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;" onclick="goOnlineAdmPage(${currentAdmPage - 1})" ${currentAdmPage === 1 ? 'disabled style="opacity:0.5;"' : ''}>◀</button>`;

            let startPage = Math.max(1, currentAdmPage - 2);
            let endPage = Math.min(totalPages, currentAdmPage + 2);
            for (let p = startPage; p <= endPage; p++) {
                const isActive = (p === currentAdmPage);
                html += `<button type="button" class="btn-primary" style="padding: 5px 11px; font-size: 0.85rem; background: ${isActive ? '#0284c7' : '#ffffff'}; color: ${isActive ? '#ffffff' : '#334155'}; border: 1px solid ${isActive ? '#0284c7' : '#cbd5e1'}; font-weight: ${isActive ? '700' : '500'}; border-radius: 6px; cursor: pointer;" onclick="goOnlineAdmPage(${p})">${p}</button>`;
            }

            html += `<button type="button" class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;" onclick="goOnlineAdmPage(${currentAdmPage + 1})" ${currentAdmPage === totalPages ? 'disabled style="opacity:0.5;"' : ''}>▶</button>`;
            html += `<button type="button" class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;" onclick="goOnlineAdmPage(${totalPages})" ${currentAdmPage === totalPages ? 'disabled style="opacity:0.5;"' : ''}>⏭</button>`;

            container.innerHTML = html;
        }

        function goOnlineAdmPage(p) {
            currentAdmPage = p;
            renderOnlineAdmissionsList();
        }

        function toggleSelectAllOnlineAdmissions(checked) {
            const chks = document.querySelectorAll('.adm-row-chk');
            chks.forEach(c => {
                c.checked = checked;
                const id = c.getAttribute('data-id');
                if (checked) selectedOnlineAdmIds.add(id);
                else selectedOnlineAdmIds.delete(id);
            });
            updateAdmDeleteSelectedButton();
        }

        function toggleOnlineAdmissionSelection(id, checked) {
            if (checked) selectedOnlineAdmIds.add(id);
            else selectedOnlineAdmIds.delete(id);
            updateAdmDeleteSelectedButton();
        }

        function updateAdmDeleteSelectedButton() {
            const btn = document.getElementById('btn-adm-delete-selected');
            const countEl = document.getElementById('adm-delete-selected-count');
            const count = selectedOnlineAdmIds.size;
            if (btn) {
                btn.style.display = count > 0 ? 'inline-flex' : 'none';
            }
            if (countEl) {
                countEl.textContent = count.toLocaleString('bn-BD');
            }
        }

        function deleteSelectedOnlineAdmissions() {
            const count = selectedOnlineAdmIds.size;
            if (count === 0) return;
            if (confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${count} টি অনলাইন ভর্তি আবেদন মুছে ফেলতে চান?`)) {
                let apps = loadOnlineAdmissions();
                apps = apps.filter(a => !selectedOnlineAdmIds.has(a.id));
                selectedOnlineAdmIds.clear();
                saveOnlineAdmissions(apps);
                renderOnlineAdmissionsList();
                alert(`সফল: ${count} টি আবেদন মুছে ফেলা হয়েছে।`);
            }
        }

        function deleteOnlineAdmission(id) {
            const apps = loadOnlineAdmissions();
            const app = apps.find(a => a.id === id);
            const name = app?.student?.nameBn || app?.trackingId || 'আবেদনকারী';
            if (confirm(`আপনি কি "${name}" এর ভর্তি আবেদনটি মুছে ফেলতে চান?`)) {
                const updated = apps.filter(a => a.id !== id);
                selectedOnlineAdmIds.delete(id);
                saveOnlineAdmissions(updated);
                renderOnlineAdmissionsList();
                closeOnlineAdmissionDetails();
            }
        }

        function openOnlineAdmissionDetails(id) {
            const apps = loadOnlineAdmissions();
            const a = apps.find(x => x.id === id);
            if (!a) return;

            const modal = document.getElementById('admission-details-modal');
            const titleEl = document.getElementById('adm-modal-title');
            const subEl = document.getElementById('adm-modal-subtitle');
            const body = document.getElementById('adm-modal-body');
            const actions = document.getElementById('adm-modal-actions');
            if (!modal || !body) return;

            titleEl.textContent = `ভর্তি আবেদন — ${a.student?.nameBn || ''} (${a.trackingId || ''})`;
            subEl.textContent = `দাখিলের তারিখ: ${a.formattedDate || (a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('bn-BD') : '')}`;

            const st = a.student || {};
            const pa = a.parents || {};
            const gd = a.guardian || {};
            const addr = a.address || {};
            const prev = a.previous || {};

            let photoHtml = '';
            if (a.photo && a.photo.startsWith('data:image')) {
                photoHtml = `<img src="${a.photo}" style="width: 100px; height: 115px; object-fit: cover; border-radius: 8px; border: 2px solid #38bdf8;">`;
            } else {
                photoHtml = `<div style="width: 100px; height: 115px; border-radius: 8px; background: #1e293b; color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border: 2px solid #334155;">🎓</div>`;
            }

            body.innerHTML = `
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px; margin-bottom: 20px; align-items: start; background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid #334155;">
                    <div style="text-align: center;">
                        ${photoHtml}
                        <div style="margin-top: 6px; font-size: 0.78rem; color: #94a3b8;">ট্র্যাকিং আইডি</div>
                        <div style="font-family: monospace; font-weight: 800; color: #38bdf8; font-size: 0.90rem;">${a.trackingId || '-'}</div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 1.25rem; color: #ffffff; font-weight: 800;">${st.nameBn || '-'}</h4>
                        <div style="color: #94a3b8; font-size: 0.92rem; margin-bottom: 8px;">${st.nameEn || ''}</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; padding: 2px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">শ্রেণি: ${a.targetClass || '-'}</span>
                            <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid #a855f7; padding: 2px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">শিফট: ${a.shift || 'দিবা শাখা'}</span>
                            <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid #22c55e; padding: 2px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">গ্রুপ: ${a.group || 'সাধারণ'}</span>
                            <span style="background: rgba(251, 146, 60, 0.15); color: #fb923c; border: 1px solid #f97316; padding: 2px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">সেশন: ${a.session || '2026'}</span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                    <!-- Card 1: Personal -->
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px;">
                        <h5 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 0.92rem; border-bottom: 1px solid #334155; padding-bottom: 6px;">👤 শিক্ষার্থীর ব্যক্তিগত তথ্য</h5>
                        <div style="font-size: 0.85rem; line-height: 1.7; color: #cbd5e1;">
                            <div><strong>জন্ম নিবন্ধন:</strong> ${st.birthReg || '-'}</div>
                            <div><strong>জন্ম তারিখ:</strong> ${st.dob || '-'}</div>
                            <div><strong>লিঙ্গ:</strong> ${st.gender || '-'} | <strong>ধর্ম:</strong> ${st.religion || '-'}</div>
                            <div><strong>রক্তের গ্রুপ:</strong> ${st.bloodGroup || '-'}</div>
                            <div><strong>জাতীয়তা:</strong> ${st.nationality || 'বাংলাদেশী'}</div>
                            <div><strong>প্রতিবন্ধিতা:</strong> ${st.disability || 'প্রযোজ্য নয়'}</div>
                        </div>
                    </div>

                    <!-- Card 2: Parents -->
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px;">
                        <h5 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 0.92rem; border-bottom: 1px solid #334155; padding-bottom: 6px;">👨‍👩‍👧 পিতা ও মাতার তথ্য</h5>
                        <div style="font-size: 0.85rem; line-height: 1.7; color: #cbd5e1;">
                            <div><strong>পিতার নাম:</strong> ${pa.fatherBn || '-'} (${pa.fatherEn || ''})</div>
                            <div><strong>পিতার পেশা ও মোবাইল:</strong> ${pa.fatherJob || '-'} | <a href="tel:${pa.fatherPhone}" style="color: #38bdf8;">${pa.fatherPhone || '-'}</a></div>
                            <div><strong>পিতার NID:</strong> ${pa.fatherNid || '-'}</div>
                            <div><strong>মাতার নাম:</strong> ${pa.motherBn || '-'} (${pa.motherEn || ''})</div>
                            <div><strong>মাতার পেশা ও মোবাইল:</strong> ${pa.motherJob || '-'} | ${pa.motherPhone || '-'}</div>
                            <div><strong>মাতার NID:</strong> ${pa.motherNid || '-'}</div>
                            <div><strong>পারিবারিক বাৎসরিক আয়:</strong> ${pa.familyIncome || '-'}</div>
                        </div>
                    </div>

                    <!-- Card 3: Guardian & Contact -->
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px;">
                        <h5 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 0.92rem; border-bottom: 1px solid #334155; padding-bottom: 6px;">🛡️ অভিভাবকের তথ্য</h5>
                        <div style="font-size: 0.85rem; line-height: 1.7; color: #cbd5e1;">
                            <div><strong>অভিভাবকের নাম:</strong> ${gd.name || '-'} (${gd.relation || 'পিতা'})</div>
                            <div><strong>মোবাইল নম্বর:</strong> <a href="tel:${gd.phone}" style="color: #38bdf8; font-weight: 700;">${gd.phone || '-'}</a></div>
                            <div><strong>NID নম্বর:</strong> ${gd.nid || '-'}</div>
                            <div><strong>ইমেইল:</strong> ${gd.email || '-'}</div>
                        </div>
                    </div>

                    <!-- Card 4: Address -->
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px;">
                        <h5 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 0.92rem; border-bottom: 1px solid #334155; padding-bottom: 6px;">📍 ঠিকানা সংক্রান্ত তথ্য</h5>
                        <div style="font-size: 0.85rem; line-height: 1.7; color: #cbd5e1;">
                            <div><strong>বর্তমান ঠিকানা:</strong> ${addr.present || '-'}</div>
                            <div style="margin-top: 4px;"><strong>স্থায়ী ঠিকানা:</strong> ${addr.permanent || '-'}</div>
                        </div>
                    </div>

                    <!-- Card 5: Previous School & Extras -->
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px;">
                        <h5 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 0.92rem; border-bottom: 1px solid #334155; padding-bottom: 6px;">🏫 পূর্ববর্তী শিক্ষাগত তথ্য</h5>
                        <div style="font-size: 0.85rem; line-height: 1.7; color: #cbd5e1;">
                            <div><strong>পূর্ববর্তী বিদ্যালয়:</strong> ${prev.school || '-'}</div>
                            <div><strong>শ্রেণি ও রোল:</strong> ${prev.classRoll || '-'} | <strong>পাসের সন:</strong> ${prev.year || '-'}</div>
                            <div><strong>প্রাপ্ত জিপিএ:</strong> ${prev.gpa || '-'} | <strong>টিসি নং:</strong> ${prev.tc || '-'}</div>
                            <div><strong>কোটা:</strong> ${a.quota || 'সাধারণ'} | <strong>সহশিক্ষা:</strong> ${a.extracurricular || '-'}</div>
                        </div>
                    </div>
                </div>
            `;

            actions.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 0.85rem; color: #94a3b8;">অবস্থা পরিবর্তন:</span>
                    <select id="adm-details-status-select" class="form-control" style="width: 140px; padding: 6px 10px; background: #1e293b; color: #fff; border: 1px solid #475569;" onchange="updateOnlineAdmissionStatus('${a.id}', this.value)">
                        <option value="Submitted" ${a.status === 'Submitted' || !a.status ? 'selected' : ''}>⏳ অপেক্ষমাণ</option>
                        <option value="Approved" ${a.status === 'Approved' ? 'selected' : ''}>✔️ অনুমোদিত</option>
                        <option value="Admitted" ${a.status === 'Admitted' ? 'selected' : ''}>🟢 ভর্তি নিশ্চিত</option>
                        <option value="Rejected" ${a.status === 'Rejected' ? 'selected' : ''}>🔴 বাতিল</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" class="btn-primary" onclick="printOnlineAdmissionVoucher('${a.id}')" style="padding: 8px 16px; font-size: 0.88rem; background: #0284c7;">
                        🖨️ রসিদ ও ফরম প্রিন্ট
                    </button>
                    <button type="button" class="btn-primary" onclick="closeOnlineAdmissionDetails(); openEnrollModal('${a.id}');" style="padding: 8px 18px; font-size: 0.88rem; background: #16a34a; font-weight: 700;">
                        🎓 ভর্তি কনফার্ম করুন
                    </button>
                    <button type="button" class="btn-danger" onclick="deleteOnlineAdmission('${a.id}')" style="padding: 8px 14px; font-size: 0.88rem;">
                        🗑️ মুছে ফেলুন
                    </button>
                    <button type="button" class="btn-outline-portal" onclick="closeOnlineAdmissionDetails()" style="padding: 8px 14px; font-size: 0.88rem; border: 1px solid #475569; color: #fff;">
                        বন্ধ করুন
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        function closeOnlineAdmissionDetails() {
            const modal = document.getElementById('admission-details-modal');
            if (modal) modal.classList.remove('active');
        }

        function updateOnlineAdmissionStatus(id, newStatus) {
            const apps = loadOnlineAdmissions();
            const app = apps.find(a => a.id === id);
            if (app) {
                app.status = newStatus;
                saveOnlineAdmissions(apps);
                renderOnlineAdmissionsList();
            }
        }

        function openEnrollModal(id) {
            const apps = loadOnlineAdmissions();
            const a = apps.find(x => x.id === id);
            if (!a) return;

            const modal = document.getElementById('admission-enroll-modal');
            if (!modal) return;

            document.getElementById('enroll-app-id').value = a.id;
            document.getElementById('enroll-student-name').textContent = `${a.student?.nameBn || ''} (${a.student?.nameEn || ''})`;
            document.getElementById('enroll-student-info').textContent = `আবেদনের ট্র্যাকিং আইডি: ${a.trackingId || ''} • শ্রেণি: ${a.targetClass || ''} • অভিভাবক: ${a.guardian?.name || a.parents?.fatherBn || ''} (${a.guardian?.phone || a.parents?.fatherPhone || ''})`;

            populateOnlineAdmissionClassDropdown();

            const clsSelect = document.getElementById('enroll-class');
            if (clsSelect) {
                // Select matching class
                for (let i = 0; i < clsSelect.options.length; i++) {
                    if (isSameClass(clsSelect.options[i].value, a.targetClass)) {
                        clsSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            handleEnrollClassChange();
            modal.classList.add('active');
        }

        function closeEnrollModal() {
            const modal = document.getElementById('admission-enroll-modal');
            if (modal) modal.classList.remove('active');
        }

        function handleEnrollClassChange() {
            const cls = document.getElementById('enroll-class')?.value || '';
            const secSelect = document.getElementById('enroll-section');
            if (!secSelect) return;

            const sectionMap = safeJsonParse('school_class_sections', {});
            const sections = sectionMap[cls] || ['A', 'B', 'C'];

            secSelect.innerHTML = '';
            sections.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = `Section ${s}`;
                secSelect.appendChild(opt);
            });

            generateEnrollAutoIdRoll();
        }

        function generateEnrollAutoIdRoll() {
            const cls = document.getElementById('enroll-class')?.value || '';
            const sec = document.getElementById('enroll-section')?.value || 'A';
            const students = loadStudents();

            const classStudents = students.filter(s => isSameClass(s.class, cls) && isSameSection(s.section, sec));
            const nextSerial = classStudents.length + 1;
            const prefix = getClassIdPrefix(cls);

            const rollField = document.getElementById('enroll-roll');
            const idField = document.getElementById('enroll-id');
            const regField = document.getElementById('enroll-reg');

            if (rollField) rollField.value = String(nextSerial);
            if (idField) idField.value = `${prefix}${String(nextSerial).padStart(3, '0')}`;
            if (regField) regField.value = `REG-${new Date().getFullYear()}-${String(students.length + 1).padStart(4, '0')}`;
        }

        function confirmEnrollStudent(e) {
            e.preventDefault();
            const appId = document.getElementById('enroll-app-id').value;
            const targetCls = document.getElementById('enroll-class').value;
            const targetSec = document.getElementById('enroll-section').value;
            const assignedRoll = document.getElementById('enroll-roll').value.trim();
            const assignedId = document.getElementById('enroll-id').value.trim();
            const assignedReg = document.getElementById('enroll-reg').value.trim();

            if (!targetCls) {
                alert('অনুগ্রহ করে শ্রেণি নির্বাচন করুন।');
                return;
            }

            const apps = loadOnlineAdmissions();
            const app = apps.find(x => x.id === appId);
            if (!app) {
                alert('আবেদনপত্র খুঁজে পাওয়া যায়নি।');
                return;
            }

            const students = loadStudents();
            
            // Check for duplicate ID
            const existingStudent = students.find(s => s.studentId && s.studentId === assignedId);
            if (existingStudent) {
                if (!confirm(`সতর্কতা: স্টুডেন্ট আইডি "${assignedId}" ইতোমধ্যে একজন শিক্ষার্থীর (${existingStudent.name || existingStudent.nameBn}) ক্ষেত্রে বিদ্যমান। আপনি কি তবুও এটি সংরক্ষণ করতে চান?`)) {
                    return;
                }
            }

            // Create Student Roster Object
            const newStudent = {
                id: 'STU-' + Date.now(),
                studentId: assignedId,
                regNo: assignedReg,
                name: app.student?.nameEn || app.student?.nameBn || 'STUDENT',
                nameBn: app.student?.nameBn || app.student?.nameEn || '',
                photo: app.photo || '',
                class: targetCls,
                section: targetSec,
                roll: assignedRoll,
                optionalSubject: (app.optionalSubject && app.optionalSubject !== 'প্রযোজ্য নয়') ? app.optionalSubject : '',
                session: app.session || '2026',
                dob: app.student?.dob || '',
                gender: app.student?.gender || 'ছাত্র',
                religion: app.student?.religion || 'ইসলাম',
                blood: app.student?.bloodGroup || '',
                fatherName: app.parents?.fatherBn || app.parents?.fatherEn || '',
                fatherOccup: app.parents?.fatherJob || '',
                fatherPhone: app.parents?.fatherPhone || '',
                motherName: app.parents?.motherBn || app.parents?.motherEn || '',
                motherOccup: app.parents?.motherJob || '',
                motherPhone: app.parents?.motherPhone || '',
                phone: app.guardian?.phone || app.parents?.fatherPhone || '',
                email: app.guardian?.email || '',
                presentAddress: app.address?.present || '',
                permanentAddress: app.address?.permanent || ''
            };

            students.push(newStudent);
            saveStudents(students);

            // Update Application status to Admitted
            app.status = 'Admitted';
            app.enrolledAt = new Date().toISOString();
            app.assignedStudentId = assignedId;
            app.assignedRoll = assignedRoll;
            app.assignedClass = targetCls;
            app.assignedSection = targetSec;
            saveOnlineAdmissions(apps);

            closeEnrollModal();
            renderOnlineAdmissionsList();
            if (typeof renderStudentList === 'function') renderStudentList();

            alert(`🎉 অভিনন্দন! শিক্ষার্থী "${newStudent.nameBn || newStudent.name}" সফলভাবে ${targetCls} (শাখা ${targetSec}, রোল ${assignedRoll}) এ ভর্তি সম্পন্ন হয়েছে এবং মূল শিক্ষার্থী তালিকায় যুক্ত করা হয়েছে!`);
        }

        function printOnlineAdmissionVoucher(id) {
            const apps = loadOnlineAdmissions();
            const app = apps.find(a => a.id === id);
            if (!app) return;

            const printArea = document.getElementById('admission-voucher-print-area');
            if (!printArea) return;

            printArea.innerHTML = buildAdmissionVoucherHtml(app);
            printArea.style.display = 'block';

            setTimeout(() => {
                window.print();
                setTimeout(() => {
                    printArea.style.display = 'none';
                }, 1000);
            }, 300);
        }

        function previewAdmissionPhotoModal(src, title) {
            const modal = document.getElementById('student-profile-modal');
            const placeholder = document.getElementById('modal-profile-placeholder');
            if (modal && placeholder) {
                placeholder.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h4 style="color: #ffffff; margin-bottom: 12px;">${title || 'শিক্ষার্থীর ছবি'}</h4>
                        <img src="${src}" style="max-width: 280px; max-height: 350px; border-radius: 12px; border: 3px solid #38bdf8; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                    </div>
                `;
                modal.classList.add('active');
            }
        }

        function exportOnlineAdmissionsToExcel() {
            const apps = loadOnlineAdmissions();
            if (apps.length === 0) {
                alert('কোনো অনলাইন ভর্তি আবেদন পাওয়া যায়নি।');
                return;
            }

            const exportData = apps.map((a, idx) => ({
                "Sl": idx + 1,
                "ট্র্যাকিং আইডি (Tracking ID)": a.trackingId || '',
                "আবেদনের তারিখ (Date)": a.formattedDate || '',
                "শিক্ষার্থীর নাম (বাংলায়)": a.student?.nameBn || '',
                "শিক্ষার্থীর নাম (English)": a.student?.nameEn || '',
                "ভর্তি ইচ্ছুক শ্রেণি (Class)": a.targetClass || '',
                "শিফট (Shift)": a.shift || '',
                "গ্রুপ (Group)": a.group || '',
                "ঐচ্ছিক বিষয় (Optional Subject)": a.optionalSubject || '',
                "জন্ম নিবন্ধন নম্বর (Birth Reg)": a.student?.birthReg || '',
                "জন্ম তারিখ (DOB)": a.student?.dob || '',
                "লিঙ্গ (Gender)": a.student?.gender || '',
                "ধর্ম (Religion)": a.student?.religion || '',
                "রক্তের গ্রুপ (Blood)": a.student?.bloodGroup || '',
                "পিতার নাম (বাংলা)": a.parents?.fatherBn || '',
                "পিতার নাম (English)": a.parents?.fatherEn || '',
                "পিতার পেশা": a.parents?.fatherJob || '',
                "পিতার মোবাইল": a.parents?.fatherPhone || '',
                "মাতার নাম (বাংলা)": a.parents?.motherBn || '',
                "মাতার পেশা": a.parents?.motherJob || '',
                "মাতার মোবাইল": a.parents?.motherPhone || '',
                "অভিভাবকের নাম": a.guardian?.name || '',
                "অভিভাবকের মোবাইল": a.guardian?.phone || '',
                "বর্তমান ঠিকানা": a.address?.present || '',
                "স্থায়ী ঠিকানা": a.address?.permanent || '',
                "পূর্ববর্তী বিদ্যালয়": a.previous?.school || '',
                "পূর্ববর্তী জিপিএ": a.previous?.gpa || '',
                "অবস্থা (Status)": a.status || 'Submitted'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Online Admissions");
            XLSX.writeFile(wb, "Online_Admission_Applications.xlsx");
        }

        // Build Official Printable 2-Page A4 Voucher HTML for Student Portal
        function buildAdmissionVoucherHtml(record) {
            if (!record) return '';
            const settings = safeJsonParse('school_settings', {});
            const schoolBn = settings.schoolSubtitle || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const schoolEn = settings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const schoolAddr = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const schoolPhone = settings.schoolPhone || "+8801794918384";
            const schoolLogo = getLatestSchoolLogo();

            let schoolEiin = "124915";
            let schoolCode = "465056";
            if (settings.schoolOther) {
                const eiinM = settings.schoolOther.match(/EIIN\\\\s*:\\\\s*([0-9]+)/i);
                if (eiinM && eiinM[1]) schoolEiin = eiinM[1];
                const codeM = settings.schoolOther.match(/(?:কোড|code)\\\\s*:\\\\s*([0-9]+)/i);
                if (codeM && codeM[1]) schoolCode = codeM[1];
            }

            const trackingId = record.trackingId || `APP-${Date.now()}`;
            const formattedDate = record.formattedDate || new Date().toLocaleDateString('bn-BD');
            const targetClass = record.targetClass || '-';
            const session = record.session || '2026';
            const shift = record.shift || 'দিবা শাখা';
            const displayGroup = record.group || 'সাধারণ';
            const displayOptional = record.optionalSubject || 'প্রযোজ্য নয়';
            const medium = record.medium || 'বাংলা মাধ্যম';
            const appType = record.appType || 'নতুন ভর্তি';

            const st = record.student || {};
            const pa = record.parents || {};
            const gd = record.guardian || {};
            const addr = record.address || {};
            const prev = record.previous || {};

            const nameBn = st.nameBn || '-';
            const nameEn = st.nameEn || '-';
            const birthReg = st.birthReg || '-';
            const dob = st.dob || '-';
            const gender = st.gender || '-';
            const religion = st.religion || '-';
            const bloodGroup = st.bloodGroup || 'জানা নেই';
            const nationality = st.nationality || 'বাংলাদেশী';
            const disability = st.disability || 'প্রযোজ্য নয়';

            const fatherBn = pa.fatherBn || '-';
            const fatherEn = pa.fatherEn || '';
            const fatherNid = pa.fatherNid || '-';
            const fatherJob = pa.fatherJob || '-';
            const fatherPhone = pa.fatherPhone || '-';

            const motherBn = pa.motherBn || '-';
            const motherEn = pa.motherEn || '';
            const motherNid = pa.motherNid || '-';
            const motherJob = pa.motherJob || '-';
            const motherPhone = pa.motherPhone || '-';
            const familyIncome = pa.familyIncome || '-';

            const guardianName = gd.name || fatherBn;
            const guardianRelation = gd.relation || 'পিতা';
            const guardianNid = gd.nid || fatherNid;
            const guardianPhone = gd.phone || fatherPhone;
            const guardianEmail = gd.email || '-';

            const presAddress = addr.present || '-';
            const permAddress = addr.permanent || '-';

            const prevSchool = prev.school || '-';
            const prevClassRoll = prev.classRoll || '-';
            const prevYear = prev.year || '-';
            const prevGpa = prev.gpa || '-';
            const prevTc = prev.tc || '-';

            const quota = record.quota || 'সাধারণ';
            const extracurricular = record.extracurricular || '-';

            let photoImg = '';
            if (record.photo && record.photo.startsWith('data:image')) {
                photoImg = `<img src="${record.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                photoImg = `<div style="font-size: 0.72rem; color: #64748b; text-align: center; padding: 20px 4px; line-height: 1.3;">পাসপোর্ট সাইজ ছবি</div>`;
            }

            return `
                <div class="print-page-a4" style="background: #ffffff; color: #000000; padding: 20mm 15mm; font-family: 'SolaimanLipi', 'Inter', sans-serif; font-size: 13px; line-height: 1.4; page-break-after: always; box-sizing: border-box; width: 210mm; min-height: 297mm; margin: 0 auto;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0052ff; padding-bottom: 10px; margin-bottom: 12px;">
                        <div style="width: 65px; height: 65px; display: flex; align-items: center; justify-content: center;">
                            ${schoolLogo ? `<img src="${schoolLogo}" style="max-width: 65px; max-height: 65px;">` : '🏫'}
                        </div>
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800;">${schoolBn}</h2>
                            <h4 style="margin: 2px 0 0 0; color: #475569; font-size: 13px; font-weight: 600;">${schoolEn}</h4>
                            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">${schoolAddr} | মোবা: ${schoolPhone} | EIIN: ${schoolEiin}, কোড: ${schoolCode}</p>
                            <div style="display: inline-block; background: #0052ff; color: #ffffff; padding: 2px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; margin-top: 4px;">
                                অনলাইন ভর্তি আবেদনপত্র — শিক্ষাবর্ষ ${session} [প্রতিষ্ঠান কপি]
                            </div>
                        </div>
                        <div style="width: 75px; height: 90px; border: 1.5px solid #cbd5e1; border-radius: 4px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center;">
                            ${photoImg}
                        </div>
                    </div>

                    <!-- Meta Bar -->
                    <div style="display: flex; justify-content: space-between; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; font-weight: 700; border: 1px solid #cbd5e1;">
                        <div>ট্র্যাকিং আইডি: <span style="font-family: monospace; color: #0052ff; font-size: 14px;">${trackingId}</span></div>
                        <div>ভর্তি শ্রেণি: <span style="color: #0f172a;">${targetClass}</span> | শিফট: ${shift}</div>
                        <div>আবেদনের তারিখ: ${formattedDate}</div>
                    </div>

                    <!-- Tables -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">
                        <tr style="background: #e2e8f0; font-weight: 700;">
                            <td colspan="4" style="border: 1px solid #94a3b8; padding: 5px 8px; color: #0f172a;">১. শিক্ষার্থীর ব্যক্তিগত ও ভর্তি সংক্রান্ত তথ্য</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 22%; font-weight: 600;">শিক্ষার্থীর নাম (বাংলা)</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 28%; font-weight: 700;">${nameBn}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 22%; font-weight: 600;">শিক্ষার্থীর নাম (English)</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 28%;">${nameEn}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">জন্ম নিবন্ধন নম্বর</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-family: monospace;">${birthReg}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">জন্ম তারিখ ও লিঙ্গ</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${dob} (${gender})</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">ধর্ম ও রক্তের গ্রুপ</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${religion} | ${bloodGroup}</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">গ্রুপ ও ঐচ্ছিক বিষয়</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${displayGroup} | ${displayOptional}</td>
                        </tr>
                    </table>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">
                        <tr style="background: #e2e8f0; font-weight: 700;">
                            <td colspan="4" style="border: 1px solid #94a3b8; padding: 5px 8px; color: #0f172a;">২. পিতা, মাতা ও অভিভাবকের তথ্য</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 22%; font-weight: 600;">পিতার নাম</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 28%;">${fatherBn} (${fatherJob})</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 22%; font-weight: 600;">পিতার মোবাইল ও NID</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 28%;">${fatherPhone} | ${fatherNid}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">মাতার নাম</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${motherBn} (${motherJob})</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">মাতার মোবাইল ও NID</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${motherPhone} | ${motherNid}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">বৈধ অভিভাবক ও সম্পর্ক</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px;">${guardianName} (${guardianRelation})</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">অভিভাবকের মোবাইল</td>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 700; color: #0052ff;">${guardianPhone}</td>
                        </tr>
                    </table>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">
                        <tr style="background: #e2e8f0; font-weight: 700;">
                            <td colspan="4" style="border: 1px solid #94a3b8; padding: 5px 8px; color: #0f172a;">৩. ঠিকানা ও পূর্ববর্তী শিক্ষাগত তথ্য</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 22%; font-weight: 600;">বর্তমান ঠিকানা</td>
                            <td colspan="3" style="border: 1px solid #cbd5e1; padding: 4px 8px;">${presAddress}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">স্থায়ী ঠিকানা</td>
                            <td colspan="3" style="border: 1px solid #cbd5e1; padding: 4px 8px;">${permAddress}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; font-weight: 600;">পূর্ববর্তী বিদ্যালয় ও জিপিএ</td>
                            <td colspan="3" style="border: 1px solid #cbd5e1; padding: 4px 8px;">${prevSchool} (রোল: ${prevClassRoll}, পাসের সন: ${prevYear}, GPA: ${prevGpa})</td>
                        </tr>
                    </table>

                    <!-- Signatures -->
                    <div style="display: flex; justify-content: space-between; margin-top: 45px; text-align: center; font-size: 11px;">
                        <div style="border-top: 1px dashed #475569; width: 140px; padding-top: 4px;">আবেদনকারীর স্বাক্ষর</div>
                        <div style="border-top: 1px dashed #475569; width: 140px; padding-top: 4px;">অভিভাবকের স্বাক্ষর</div>
                        <div style="border-top: 1px dashed #475569; width: 150px; padding-top: 4px;">ভর্তি কমিটির স্বাক্ষর</div>
                        <div style="border-top: 1px dashed #475569; width: 140px; padding-top: 4px;">প্রধান শিক্ষকের স্বাক্ষর</div>
                    </div>
                </div>
            `;
        }

    