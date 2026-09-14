
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
            const classSections = sections.filter(s => s.class === className);

            if (classSections.length === 0) {
                sectionSelect.innerHTML = '<option value="">No Section Available</option>';
            } else {
                const currentVal = sectionSelect.value;
                sectionSelect.innerHTML = classSections.map(s => `<option value="${s.section}">Section ${s.section}</option>`).join('');
                if (currentVal && classSections.some(s => s.section === currentVal)) {
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
            if (editingStudentId) return;
            const className = document.getElementById('student-class').value;
            const students = loadStudents();

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);

            let prefix = idRegSettings.idPrefix || 'CMS-';
            if (Array.isArray(classPrefixes)) {
                const found = classPrefixes.find(p => p.class === className);
                if (found) prefix = found.prefix;
            } else {
                if (classPrefixes[className]) prefix = classPrefixes[className];
            }

            // Calculate class and section-specific serial number
            const sectionName = document.getElementById('student-section')?.value || 'A';
            const classSecStudents = students.filter(s => s.class === className && s.section === sectionName);
            let maxSerial = 0;
            classSecStudents.forEach(s => {
                if (s.studentId && s.studentId.startsWith(prefix)) {
                    const suffix = s.studentId.slice(prefix.length);
                    const serial = parseInt(suffix, 10);
                    if (!isNaN(serial) && serial > maxSerial) {
                        maxSerial = serial;
                    }
                }
            });
            const nextSerial = maxSerial > 0 ? maxSerial + 1 : classSecStudents.length + 1;
            const serialStr = String(nextSerial).padStart(3, '0');
            const studentIdNumber = `${prefix}${serialStr}`;

            // Calculate global/general registration serial number
            const regPrefix = idRegSettings.regPrefix || 'REG2026-';
            let maxRegSerial = 0;
            students.forEach(s => {
                if (s.regNo && s.regNo.startsWith(regPrefix)) {
                    const suffix = s.regNo.slice(regPrefix.length);
                    if (/^\d{4}$/.test(suffix)) {
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                }
            });
            const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : 1;
            const regSerialStr = String(nextRegSerial).padStart(4, '0');
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

            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);
            let prefix = idRegSettings.idPrefix || 'CMS-';
            if (Array.isArray(classPrefixes)) {
                const found = classPrefixes.find(p => p.class === className);
                if (found) prefix = found.prefix;
            } else {
                if (classPrefixes[className]) prefix = classPrefixes[className];
            }

            // Calculate class-specific serial number
            const students = loadStudents();
            const classStudents = students.filter(s => s.class === className);
            let maxSerial = 0;
            classStudents.forEach(s => {
                if (s.studentId && s.studentId.startsWith(prefix)) {
                    const suffix = s.studentId.slice(prefix.length);
                    const serial = parseInt(suffix, 10);
                    if (!isNaN(serial) && serial > maxSerial) {
                        maxSerial = serial;
                    }
                }
            });
            const nextSerial = maxSerial > 0 ? maxSerial + 1 : classStudents.length + 1;
            const serialStr = String(nextSerial).padStart(3, '0');
            const studentIdNumber = `${prefix}${serialStr}`;

            // Calculate global/general registration serial number
            const regPrefix = idRegSettings.regPrefix || 'REG2026-';
            let maxRegSerial = 0;
            students.forEach(s => {
                if (s.regNo && s.regNo.startsWith(regPrefix)) {
                    const suffix = s.regNo.slice(regPrefix.length);
                    if (/^\d{4}$/.test(suffix)) {
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                }
            });
            const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : 1;
            const regSerialStr = String(nextRegSerial).padStart(4, '0');
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
                roll: roll,
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

        // Back button handler for Add / Edit Student form
        function handleStudentFormBack() {
            editingStudentId = null;
            resetAdmissionForm();
            window.history.pushState({}, '', '?view=list');
            switchPortalView('list');
        }

        // --- SUBVIEWS SWITHING MECHANISM ---
        function switchPortalView(viewName) {
            // Hide all sub-views
            const subviews = document.querySelectorAll('.portal-sub-view');
            subviews.forEach(view => view.classList.remove('active'));

            // Toggle target sub-view
            const targetView = document.getElementById('subview-' + viewName);
            if (targetView) {
                targetView.classList.add('active');
            }            // Update page headings based on subview
            const titleEl = document.getElementById('portal-title');
            const subtitleEl = document.getElementById('portal-subtitle');
            const titleWrapper = document.querySelector('.section-title-wrapper');

            if (viewName === 'list' || viewName === 'add') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                if (viewName === 'list') {
                    renderStudentList();
                } else {
                    if (editingStudentId) {
                        titleEl.textContent = "Student Portal - Edit Student Details";
                        subtitleEl.textContent = "Modify registered student profile information";
                        // Prevent generating new ID/Reg, retrieve existing ones
                        const students = loadStudents();
                        const s = students.find(x => x.id === editingStudentId);
                        if (s) {
                            document.getElementById('student-id-preview').value = s.studentId || '-';
                            document.getElementById('student-reg-preview').value = s.regNo || '-';
                        }
                    } else {
                        titleEl.textContent = "স্টুডেন্ট পোর্টাল - ভর্তি ফরম";
                        subtitleEl.textContent = `শিক্ষাবর্ষ - ${new Date().getFullYear()}`;
                        updateIdRegPreviews();
                    }
                    updateCardPreview();
                }
            } else {
                if (titleWrapper) titleWrapper.style.display = '';
                if (viewName === 'promote') {
                    titleEl.textContent = "Student Portal - Promotion & Demotion";
                    subtitleEl.textContent = "Manage mass student promotions and class adjustments";
                    renderPromotionList();
                }
            }
        }

        function updateStudentStatsSummary(filtered) {
            const statsContainer = document.getElementById('list-stats-summary');
            if (!statsContainer) return;

            const totalCount = filtered.length;
            if (totalCount === 0) {
                statsContainer.innerHTML = `<span style="background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">মোট: ০ জন</span>`;
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
                <span style="background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                    মোট: ${totalCount} জন
                </span>
                <span style="background: #0284c7; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                    ছাত্র: ${maleCount}
                </span>
                <span style="background: #db2777; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                    ছাত্রী: ${femaleCount}
                </span>
            `;

            if (otherGenderCount > 0) {
                statsHTML += `<span style="background: #475569; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">অন্যান্য: ${otherGenderCount}</span>`;
            }

            if (islamCount > 0) {
                statsHTML += `<span style="background: #059669; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">ইসলাম: ${islamCount}</span>`;
            }
            if (hinduCount > 0) {
                statsHTML += `<span style="background: #d97706; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">হিন্দু: ${hinduCount}</span>`;
            }
            if (buddhistCount > 0) {
                statsHTML += `<span style="background: #7c3aed; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">বৌদ্ধ: ${buddhistCount}</span>`;
            }
            if (christianCount > 0) {
                statsHTML += `<span style="background: #2563eb; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">খ্রিস্টান: ${christianCount}</span>`;
            }
            if (otherRelCount > 0) {
                statsHTML += `<span style="background: #64748b; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">অন্যান্য ধর্ম: ${otherRelCount}</span>`;
            }

            statsContainer.innerHTML = statsHTML;
        }

        // --- STUDENT ROSTER LIST RENDERING ---
        function renderStudentList() {
            // Rebuild filters dynamically to match the table's actual student data
            populateStudentPortalFilterDropdowns();

            const searchInput = document.getElementById('student-search-input');
            const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
            const classFilter = document.getElementById('student-class-filter').value;
            const sectionFilter = document.getElementById('student-section-filter').value;
            const genderFilter = document.getElementById('student-gender-filter') ? document.getElementById('student-gender-filter').value : '';
            const religionFilter = document.getElementById('student-religion-filter') ? document.getElementById('student-religion-filter').value : '';
            const container = document.getElementById('student-list-rows');
            if (!container) return;

            const students = loadStudents();
            const filtered = students.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchVal) ||
                    (s.studentId && s.studentId.toLowerCase().includes(searchVal)) ||
                    s.class.toLowerCase().includes(searchVal) ||
                    String(s.roll || '').includes(searchVal);
                const matchesClass = !classFilter || s.class === classFilter;
                const matchesSection = !sectionFilter || s.section === sectionFilter;
                const matchesGender = !genderFilter || s.gender === genderFilter;
                const matchesReligion = !religionFilter || s.religion === religionFilter;
                return matchesSearch && matchesClass && matchesSection && matchesGender && matchesReligion;
            });

            // Sort filtered students by Class hierarchy order and Student ID
            const classHierarchy = ["Play", "Nursery", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            filtered.sort((a, b) => {
                const classA = (a.class || '').replace('Class ', '').trim();
                const classB = (b.class || '').replace('Class ', '').trim();
                const idxA = classHierarchy.indexOf(classA) !== -1 ? classHierarchy.indexOf(classA) : 99;
                const idxB = classHierarchy.indexOf(classB) !== -1 ? classHierarchy.indexOf(classB) : 99;
                if (idxA !== idxB) return idxA - idxB;

                const idA = a.studentId || '';
                const idB = b.studentId || '';
                return idA.localeCompare(idB, undefined, { numeric: true });
            });

            // Update bottom summary badges
            updateStudentStatsSummary(filtered);

            if (filtered.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; color: var(--muted-text); font-style:italic;">
                            No students found matching current search filter.
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
                const photoHTML = s.photo
                    ? `<img src="${s.photo}" class="student-list-photo" alt="Photo">`
                    : `<div class="student-list-photo-placeholder"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                const studentId = s.studentId || '-';
                const sectionDisplay = s.section ? ` - ${s.section}` : '';
                const fatherName = s.fatherName || '-';
                const motherName = s.motherName || '-';
                const fatherPhone = s.fatherPhone || s.phone || '-';
                const motherPhone = s.motherPhone || s.phone || '-';

                html += `
                    <tr>
                        <td style="display: none; text-align: center; padding: 10px;">
                            <input type="checkbox" class="student-select-chk" value="${s.id}" style="transform: scale(1.2); cursor: pointer;" onchange="updateDeleteSelectedBtn()">
                        </td>
                        <td style="color:var(--muted-text); font-weight:600; font-family: monospace;">${startOffset + index + 1}</td>
                        <td>${photoHTML}</td>
                        <td style="color:var(--neon-cyan); font-weight:600; font-family: monospace;">${studentId}</td>
                        <td style="color:#fff; font-weight:600;">
                            <div class="student-list-maintext">${s.nameBn || s.name}</div>
                            <div class="student-list-subtext">${s.class}${sectionDisplay}</div>
                        </td>
                        <td>
                            <div class="student-list-maintext">${fatherName}</div>
                            <div class="student-list-subtext" style="font-family: monospace;">${fatherPhone}</div>
                        </td>
                        <td>
                            <div class="student-list-maintext">${motherName}</div>
                            <div class="student-list-subtext" style="font-family: monospace;">${motherPhone}</div>
                        </td>
                        <td>
                            <button class="action-btn-sm btn-view-card" title="ID Card" onclick="viewModalCard('${s.id}')">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="pointer-events:none;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V18z"/></svg>
                            </button>
                            <button class="action-btn-sm btn-view-profile" title="Profile" style="background:var(--accent-grad); color:#fff; box-shadow:var(--cyan-glow); margin-right:8px;" onclick="viewModalProfile('${s.id}')">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="pointer-events:none;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            </button>
                            <button class="action-btn-sm btn-edit-student" title="Edit" style="background:var(--warning-grad); color:#fff; box-shadow:none; margin-right:8px;" onclick="editStudent('${s.id}')">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="pointer-events:none;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button class="action-btn-sm btn-delete-student" title="Delete" onclick="deleteStudent('${s.id}')">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="pointer-events:none;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
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

        // Rearrange all student IDs according to class prefix rules
        function rearrangeStudentIdsByClass(silent = false) {
            const students = loadStudents();
            if (!students || students.length === 0) {
                if (!silent) alert("কোনো শিক্ষার্থী পাওয়া যায়নি।");
                return;
            }

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);

            // Class prefix map
            const prefixMap = {};
            if (Array.isArray(classPrefixes)) {
                classPrefixes.forEach(p => {
                    if (p.class && p.prefix) prefixMap[p.class] = p.prefix;
                });
            } else if (typeof classPrefixes === 'object') {
                Object.assign(prefixMap, classPrefixes);
            }

            // Group students by class
            const grouped = {};
            students.forEach(s => {
                const c = s.class || 'Unknown';
                if (!grouped[c]) grouped[c] = [];
                grouped[c].push(s);
            });

            let updatedCount = 0;
            // Rearrange per class
            Object.keys(grouped).forEach(cName => {
                let prefix = prefixMap[cName];
                if (!prefix) {
                    const numStr = cName.replace(/\D/g, '');
                    prefix = numStr ? `26${numStr.padStart(2, '0')}` : (idRegSettings.idPrefix || '2600');
                }

                const list = grouped[cName];
                // Sort by numeric roll if available, keeping relative order otherwise
                list.sort((a, b) => {
                    const rollA = parseInt(a.roll, 10);
                    const rollB = parseInt(b.roll, 10);
                    if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
                    return 0;
                });

                list.forEach((s, idx) => {
                    const newId = `${prefix}${String(idx + 1).padStart(3, '0')}`;
                    if (s.studentId !== newId) {
                        s.studentId = newId;
                        updatedCount++;
                    }
                });
            });

            // Re-flatten students in standard class hierarchy order
            const classHierarchy = ["Play", "Nursery", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            const flattened = [];
            const sortedClasses = Object.keys(grouped).sort((a, b) => {
                const cleanA = a.replace('Class ', '').trim();
                const cleanB = b.replace('Class ', '').trim();
                const idxA = classHierarchy.indexOf(cleanA) !== -1 ? classHierarchy.indexOf(cleanA) : 99;
                const idxB = classHierarchy.indexOf(cleanB) !== -1 ? classHierarchy.indexOf(cleanB) : 99;
                return idxA - idxB;
            });

            sortedClasses.forEach(cName => {
                flattened.push(...grouped[cName]);
            });

            saveStudents(flattened);
            renderStudentList();

            if (!silent) {
                alert(`প্রতিটি শ্রেণির নির্দেশনা অনুসারে সকল শিক্ষার্থীর Student ID সফলভাবে পুনঃসাজানো হয়েছে। (মোট ${updatedCount} টি আইডি আপডেট হয়েছে)`);
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
                    const matchesSearch = s.name.toLowerCase().includes(searchVal) ||
                        (s.studentId && s.studentId.toLowerCase().includes(searchVal)) ||
                        s.class.toLowerCase().includes(searchVal) ||
                        String(s.roll || '').includes(searchVal);
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

        // Selection & Delete Helpers
        function toggleSelectAllStudents(checked) {
            const checkboxes = document.querySelectorAll('#student-list-rows .student-select-chk');
            checkboxes.forEach(chk => chk.checked = checked);
            updateDeleteSelectedBtn();
            updateBulkToolsSelectedCount();
        }

        function updateDeleteSelectedBtn() {
            const checkedBoxes = document.querySelectorAll('#student-list-rows .student-select-chk:checked');
            const count = checkedBoxes.length;
            const bar = document.getElementById('bulk-actions-bar');
            const countLabel = document.getElementById('bulk-select-count');

            if (bar && countLabel) {
                if (count > 0) {
                    bar.style.display = 'flex';
                    countLabel.innerText = `${count} জন শিক্ষার্থী সিলেক্ট করা হয়েছে`;
                } else {
                    bar.style.display = 'none';
                }
            }
        }

        function deleteSelectedStudents() {
            const checkedBoxes = document.querySelectorAll('#student-list-rows .student-select-chk:checked');
            const count = checkedBoxes.length;
            if (count === 0) return;

            if (confirm(`আপনি কি নিশ্চিত যে সিলেক্ট করা ${count} জন শিক্ষার্থীর তথ্য চিরতরে মুছে ফেলতে চান?`)) {
                const selectedIds = Array.from(checkedBoxes).map(chk => chk.value);
                const students = loadStudents();
                const updated = students.filter(s => !selectedIds.includes(s.id));

                localStorage.setItem('school_students', JSON.stringify(updated));
                // Dispatch storage event to sync with SQLite backend
                window.dispatchEvent(new Event('storage'));

                alert(`সাফল্য: ${count} জন শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে!`);
                renderStudentList();
                renderPromotionList();
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
                    localStorage.setItem('school_students', JSON.stringify([]));
                    // Dispatch storage event to sync with SQLite backend
                    window.dispatchEvent(new Event('storage'));

                    alert("সাফল্য: সকল শিক্ষার্থীর তথ্য ডাটাবেজ থেকে মুছে ফেলা হয়েছে!");
                    renderStudentList();
                    renderPromotionList();
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
                if (summary) summary.innerText = "কোনো শিক্ষার্থী সিলেক্ট করা হয়নি";
                return;
            }

            // Populate optional subjects for selected class dynamically
            populateBulkModalOptionalSubjects(classVal);

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
                if (typeof populateStudentPortalFilterDropdowns === 'function') {
                    populateStudentPortalFilterDropdowns(true);
                }
                if (typeof renderStudentList === 'function') {
                    renderStudentList();
                }
                if (typeof renderPromotionList === 'function') {
                    renderPromotionList();
                }
            }
        }

        // Roster XLSX Export Method
        function exportStudentsToExcel() {
            const searchInput = document.getElementById('student-search-input');
            const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
            const classFilter = document.getElementById('student-class-filter').value;
            const sectionFilter = document.getElementById('student-section-filter').value;
            const genderFilter = document.getElementById('student-gender-filter') ? document.getElementById('student-gender-filter').value : '';
            const religionFilter = document.getElementById('student-religion-filter') ? document.getElementById('student-religion-filter').value : '';
            const students = loadStudents();

            // Filter students currently matching the list filters
            const filtered = students.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchVal) ||
                    (s.studentId && s.studentId.toLowerCase().includes(searchVal)) ||
                    s.class.toLowerCase().includes(searchVal) ||
                    String(s.roll || '').includes(searchVal);
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

            const excelHeaders = [
                "স্টুডেন্ট আইডি (Student ID)",
                "রেজিস্ট্রেশন নম্বর (Registration No)",
                "শিক্ষার্থীর নাম (Name in English)",
                "শিক্ষার্থীর নাম (বাংলায়)",
                "শিক্ষার্থীর ছবি (Photo URL/Base64)",
                "শ্রেণী (Class)",
                "শাখা (Section)",
                "গ্রুপ/বিভাগ (Department/Group)",
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
                return {
                    "স্টুডেন্ট আইডি (Student ID)": s.studentId || "",
                    "রেজিস্ট্রেশন নম্বর (Registration No)": s.regNo || "",
                    "শিক্ষার্থীর নাম (Name in English)": s.name || "",
                    "শিক্ষার্থীর নাম (বাংলায়)": s.nameBn || "",
                    "শিক্ষার্থীর ছবি (Photo URL/Base64)": s.photo || "",
                    "শ্রেণী (Class)": s.class || "",
                    "শাখা (Section)": s.section || "",
                    "গ্রুপ/বিভাগ (Department/Group)": s.roll || "",
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
        }

        // Delete Student
        function deleteStudent(id) {
            const students = loadStudents();
            const student = students.find(s => s.id === id);
            if (!student) return;

            if (confirm(`Are you sure you want to delete student "${student.name}"?`)) {
                const updated = students.filter(s => s.id !== id);
                localStorage.setItem('school_students', JSON.stringify(updated));
                renderStudentList();
                renderPromotionList();
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
                    "শিক্ষার্থীর নাম (Name in English)": "Rafi Ahmed",
                    "শিক্ষার্থীদের নাম (বাংলায়)": "রাফি আহমেদ",
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

            // Map header keys properly for the sample data row
            const mappedSample = {};
            excelHeaders.forEach(h => {
                const matchedKey = Object.keys(sampleData[0]).find(k => k.trim() === h.trim() || k.replace('শিক্ষার্থীদের', 'শিক্ষার্থীর').trim() === h.trim());
                mappedSample[h] = matchedKey ? sampleData[0][matchedKey] : "";
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet([mappedSample], { header: excelHeaders });
            XLSX.utils.book_append_sheet(wb, ws, "Students Template");
            XLSX.writeFile(wb, "student_admission_template.xlsx");
        }
        function triggerImportFileInput() {
            document.getElementById('import-students-file').click();
        }

        function importStudentsFromFile(input) {
            const file = input.files[0];
            if (!file) return;

            // Verify it is an Excel file
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'xlsx') {
                alert("ত্রুটি: দয়া করে শুধুমাত্র .xlsx ফরম্যাটের ফাইল আপলোড করুন।");
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    if (rawRows.length === 0) {
                        alert("ত্রুটি: ফাইলটিতে কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।");
                        input.value = '';
                        return;
                    }

                    const headerKeyMap = {
                        "স্টুডেন্ট আইডি (Student ID)": "studentId",
                        "স্টুডেন্ট আইডি (Student ID - Auto from Advance)": "studentId",
                        "রেজিস্ট্রেশন নম্বর (Registration No)": "regNo",
                        "শিক্ষার্থীর নাম (Name in English)": "name",
                        "শিক্ষার্থীর নাম (বাংলায়)": "nameBn",
                        "শিক্ষার্থীর ছবি (Photo URL/Base64)": "photo",
                        "শিক্ষার্থীর ছবি (Photo)": "photo",
                        "ছবি (Photo)": "photo",
                        "Photo": "photo",
                        "Photo URL": "photo",
                        "শ্রেণী (Class)": "class",
                        "Class": "class",
                        "শাখা (Section)": "section",
                        "Section": "section",
                        "গ্রুপ (Group)": "roll",
                        "গ্রুপ/বিভাগ (Department/Group)": "roll",
                        "বিভাগ (Department)": "roll",
                        "Department": "roll",
                        "Department (Group)": "roll",
                        "Group": "roll",
                        "ঐচ্ছিক বিষয় (Optional Subject)": "optionalSubject",
                        "শিক্ষাবর্ষ (Session)": "session",
                        "জন্ম তারিখ (Date of Birth)": "dob",
                        "লিঙ্গ (Gender)": "gender",
                        "ধর্ম (Religion)": "religion",
                        "রক্তের গ্রুপ (Blood Group)": "blood",
                        "পিতার নাম (Father's Name)": "fatherName",
                        "পিতার পেশা (Father's Occupation)": "fatherOccup",
                        "পিতার পেশা (Occupation)": "fatherOccup",
                        "পিতার মোবাইল নম্বর (Father's Mobile)": "fatherPhone",
                        "মাতার নাম (Mother's Name)": "motherName",
                        "মাতার পেশা (Mother's Occupation)": "motherOccup",
                        "মাতার পেশা (Occupation)": "motherOccup",
                        "মাতার মোবাইল নম্বর (Mother's Mobile)": "motherPhone",
                        "অভিভাবকের মোবাইল নম্বর (Guardian's Phone)": "phone",
                        "ইমেইল ঠিকানা (Email Address)": "email",
                        "বর্তমান ঠিকানা (Present Address)": "presentAddress",
                        "স্থায়ী ঠিকানা (Permanent Address)": "permanentAddress"
                    };

                    tempImportedStudents = [];
                    rawRows.forEach(row => {
                        const studentObj = {};
                        studentObj.photo = "";

                        Object.keys(row).forEach(header => {
                            const cleanHeader = header.trim();
                            const dbKey = headerKeyMap[cleanHeader];
                            if (dbKey) {
                                studentObj[dbKey] = String(row[header]).trim();
                            }
                        });

                        // Standard validation: check if the student has a name
                        if (studentObj.name) {
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
                        input.value = '';
                        return;
                    }

                    // Pre-generate Student IDs and Registration numbers for preview
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
                    input.value = '';
                } catch (err) {
                    console.error("Error parsing XLSX file:", err);
                    alert("ত্রুটি: এক্সেল ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে ফাইলটির ফরম্যাট চেক করুন।");
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
            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);

            // 1. Generate Student ID if blank
            if (!s.studentId || s.studentId.trim() === "") {
                const className = s.class || "Class 6";
                let prefix = idRegSettings.idPrefix || 'CMS-';
                if (Array.isArray(classPrefixes)) {
                    const found = classPrefixes.find(p => p.class === className);
                    if (found) prefix = found.prefix;
                } else {
                    if (classPrefixes[className]) prefix = classPrefixes[className];
                }

                let maxSerial = 0;
                existing.forEach(st => {
                    if (st.studentId && st.studentId.startsWith(prefix)) {
                        const suffix = st.studentId.slice(prefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxSerial) {
                            maxSerial = serial;
                        }
                    }
                });

                for (let i = 0; i < index; i++) {
                    const prevSt = list[i];
                    if (prevSt && prevSt.studentId && prevSt.studentId.startsWith(prefix)) {
                        const suffix = prevSt.studentId.slice(prefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxSerial) {
                            maxSerial = serial;
                        }
                    }
                }

                let classStudentsCount = existing.filter(st => st.class === className).length;
                let prevPreviewCount = 0;
                for (let i = 0; i < index; i++) {
                    if (list[i] && (list[i].class || "Class 6") === className) {
                        prevPreviewCount++;
                    }
                }
                const nextSerial = maxSerial > 0 ? maxSerial + 1 : (classStudentsCount + prevPreviewCount + 1);
                const nextSerialStr = String(nextSerial).padStart(3, '0');
                s.studentId = `${prefix}${nextSerialStr}`;
            }

            // 2. Generate Registration No if blank
            if (!s.regNo || s.regNo.trim() === "") {
                const sessionVal = s.session || new Date().getFullYear().toString();
                const regPrefix = idRegSettings.regPrefix || `REG${sessionVal}-`;

                let maxRegSerial = 0;
                existing.forEach(st => {
                    if (st.regNo && st.regNo.startsWith(regPrefix)) {
                        const suffix = st.regNo.slice(regPrefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                });

                for (let i = 0; i < index; i++) {
                    const prevSt = list[i];
                    if (prevSt && prevSt.regNo && prevSt.regNo.startsWith(regPrefix)) {
                        const suffix = prevSt.regNo.slice(regPrefix.length);
                        const serial = parseInt(suffix, 10);
                        if (!isNaN(serial) && serial > maxRegSerial) {
                            maxRegSerial = serial;
                        }
                    }
                }

                const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : 1;
                const regSerialStr = String(nextRegSerial).padStart(4, '0');
                s.regNo = `${regPrefix}${regSerialStr}`;
            }
        }

        function recalculateTempIdsAndRegs() {
            tempImportedStudents.forEach((s, idx) => {
                generateTempStudentIdAndReg(s, idx, tempImportedStudents);
            });
        }

        function saveImportedStudents() {
            // Validate: check that at least one student has a name
            const validStudents = tempImportedStudents.filter(s => s && s.name && s.name.trim() !== "");
            if (validStudents.length === 0) {
                alert("ত্রুটি: সংরক্ষণের জন্য কোনো বৈধ শিক্ষার্থীর নাম পাওয়া যায়নি। অনুগ্রহ করে অন্তত একজনের নাম লিখুন।");
                return;
            }

            const selectedClass = document.getElementById('import-class-select') ? document.getElementById('import-class-select').value : '';
            const selectedDept = document.getElementById('import-dept-filter') ? document.getElementById('import-dept-filter').value : '';

            // Apply selected Header Class & Department to all imported records
            validStudents.forEach(s => {
                if (selectedClass && selectedClass.trim() !== "") {
                    s.class = selectedClass;
                }
                if (selectedDept && selectedDept.trim() !== "") {
                    s.roll = selectedDept === 'Primary Level' ? 'Primary' : 'High';
                }
            });

            // Recalculate IDs for any updated class
            recalculateTempIdsAndRegs();

            const existing = loadStudents();
            let importedCount = 0;
            let updatedCount = 0;

            const idRegSettings = safeJsonParse('school_id_reg_settings', {});
            const classPrefixes = safeJsonParse('school_class_id_prefixes', []);

            validStudents.forEach(s => {
                if (!s.id) {
                    s.id = Date.now().toString() + '-' + Math.floor(Math.random() * 100000) + '-' + importedCount;
                }

                const className = s.class || "Class 6";
                let prefix = idRegSettings.idPrefix || 'CMS-';
                if (Array.isArray(classPrefixes)) {
                    const found = classPrefixes.find(p => p.class === className);
                    if (found) prefix = found.prefix;
                } else {
                    if (classPrefixes[className]) prefix = classPrefixes[className];
                }

                // Deduplication: Match by unique ID, Student ID, or Name + Father's Name + Mother's Name
                const idx = existing.findIndex(x =>
                    x.id === s.id ||
                    (x.studentId && s.studentId && x.studentId === s.studentId) ||
                    (x.name && s.name && x.name.trim().toLowerCase() === s.name.trim().toLowerCase() &&
                        x.fatherName && s.fatherName && x.fatherName.trim().toLowerCase() === s.fatherName.trim().toLowerCase() &&
                        x.motherName && s.motherName && x.motherName.trim().toLowerCase() === s.motherName.trim().toLowerCase())
                );

                if (idx !== -1) {
                    existing[idx] = { ...existing[idx], ...s };
                    updatedCount++;
                } else {
                    // Generate studentId if missing
                    if (!s.studentId) {
                        const classStudents = existing.filter(st => st.class === className);
                        let maxSerial = 0;
                        classStudents.forEach(st => {
                            if (st.studentId && st.studentId.startsWith(prefix)) {
                                const suffix = st.studentId.slice(prefix.length);
                                const serial = parseInt(suffix, 10);
                                if (!isNaN(serial) && serial > maxSerial) {
                                    maxSerial = serial;
                                }
                            }
                        });
                        const nextSerial = maxSerial > 0 ? maxSerial + 1 : classStudents.length + 1;
                        const nextSerialStr = String(nextSerial).padStart(3, '0');
                        s.studentId = `${prefix}${nextSerialStr}`;
                    }

                    // Generate regNo if missing
                    if (!s.regNo) {
                        const sessionVal = s.session || new Date().getFullYear().toString();
                        const regPrefix = idRegSettings.regPrefix || `REG${sessionVal}-`;
                        let maxRegSerial = 0;
                        existing.forEach(st => {
                            if (st.regNo && st.regNo.startsWith(regPrefix)) {
                                const suffix = st.regNo.slice(regPrefix.length);
                                const serial = parseInt(suffix, 10);
                                if (!isNaN(serial) && serial > maxRegSerial) {
                                    maxRegSerial = serial;
                                }
                            }
                        });
                        const nextRegSerial = maxRegSerial > 0 ? maxRegSerial + 1 : 1;
                        const regSerialStr = String(nextRegSerial).padStart(4, '0');
                        s.regNo = `${regPrefix}${regSerialStr}`;
                    }

                    existing.push(s);
                    importedCount++;
                }
            });

            localStorage.setItem('school_students', JSON.stringify(existing));
            window.dispatchEvent(new Event('storage'));

            alert(`সাফল্য: ${importedCount} জন নতুন শিক্ষার্থী যুক্ত করা হয়েছে এবং ${updatedCount} জন শিক্ষার্থীর তথ্য আপডেট করা হয়েছে!`);

            resetImportModalView();
            closeImportModal();
            renderStudentList();
            renderPromotionList();
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
                        <div class="id-school-name">CREATIVE MODEL SCHOOL</div>
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
            const schoolName = schoolSettings.schoolName || "CREATIVE MODEL SCHOOL";
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
                                <td colspan="3">: ${email}</td>
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
                    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
                    <style>
                        @page {
                            size: A4;
                            margin: 0.3in;
                        }
                        body {
                            font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
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
        function renderPromotionList() {
            const classVal = document.getElementById('promote-class-select').value;
            const container = document.getElementById('promote-list-rows');
            if (!container) return;

            // Reset Select All
            document.getElementById('select-all-promotions').checked = false;

            const students = loadStudents();
            const filtered = students.filter(s => s.class === classVal);

            if (filtered.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; color: var(--muted-text); font-style:italic;">
                            No students registered in ${classVal} yet.
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            filtered.forEach(s => {
                const photoHTML = s.photo
                    ? `<img src="${s.photo}" class="student-list-photo" alt="Photo">`
                    : `<div class="student-list-photo-placeholder"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                html += `
                    <tr>
                        <td style="text-align: center;">
                            <input type="checkbox" class="chk-control promote-student-chk" value="${s.id}">
                        </td>
                        <td>${photoHTML}</td>
                        <td style="color:#fff; font-weight:600;">${s.name}</td>
                        <td>${s.class}</td>
                        <td>${s.roll}</td>
                        <td><span style="color:var(--neon-pink);">${s.blood}</span></td>
                    </tr>
                `;
            });
            container.innerHTML = html;
        }

        function toggleSelectAllPromotions(checked) {
            const checkboxes = document.querySelectorAll('.promote-student-chk');
            checkboxes.forEach(chk => chk.checked = checked);
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

            const promoteClassSelect = document.getElementById('promote-class-select');
            if (promoteClassSelect) {
                const currentVal = promoteClassSelect.value;
                promoteClassSelect.innerHTML = renderGroupOptions(false);
                if (currentVal && classes.includes(currentVal)) {
                    promoteClassSelect.value = currentVal;
                }
            }

            populateImportModalClassDropdown('');
            
            // Populate filters dynamically based on database data
            populateStudentPortalFilterDropdowns();
        }

        function populateStudentPortalFilterDropdowns() {
            const students = loadStudents();
            
            // Get unique classes, sections, genders, and religions from student list
            const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
            const uniqueSections = Array.from(new Set(students.map(s => s.section).filter(Boolean))).sort();
            const uniqueGenders = Array.from(new Set(students.map(s => s.gender).filter(Boolean))).sort();
            const uniqueReligions = Array.from(new Set(students.map(s => s.religion).filter(Boolean))).sort();

            // Sort classes using the order defined in loadClasses()
            const allConfiguredClasses = loadClasses();
            uniqueClasses.sort((a, b) => allConfiguredClasses.indexOf(a) - allConfiguredClasses.indexOf(b));

            // Populate Class Filter
            const classFilter = document.getElementById('student-class-filter');
            if (classFilter) {
                const currentVal = classFilter.value;
                let html = `<option value="">Class</option>`;
                uniqueClasses.forEach(c => {
                    html += `<option value="${c}">${c}</option>`;
                });
                classFilter.innerHTML = html;
                if (currentVal && uniqueClasses.includes(currentVal)) {
                    classFilter.value = currentVal;
                } else {
                    classFilter.value = "";
                }
            }

            // Populate Section Filter
            const sectionFilter = document.getElementById('student-section-filter');
            if (sectionFilter) {
                const currentVal = sectionFilter.value;
                let html = `<option value="">Section</option>`;
                uniqueSections.forEach(sec => {
                    html += `<option value="${sec}">${sec}</option>`;
                });
                sectionFilter.innerHTML = html;
                if (currentVal && uniqueSections.includes(currentVal)) {
                    sectionFilter.value = currentVal;
                } else {
                    sectionFilter.value = "";
                }
            }

            // Populate Gender Filter
            const genderFilter = document.getElementById('student-gender-filter');
            if (genderFilter) {
                const currentVal = genderFilter.value;
                let html = `<option value="">Gender</option>`;
                uniqueGenders.forEach(g => {
                    html += `<option value="${g}">${g}</option>`;
                });
                genderFilter.innerHTML = html;
                if (currentVal && uniqueGenders.includes(currentVal)) {
                    genderFilter.value = currentVal;
                } else {
                    genderFilter.value = "";
                }
            }

            // Populate Religion Filter
            const religionFilter = document.getElementById('student-religion-filter');
            if (religionFilter) {
                const currentVal = religionFilter.value;
                let html = `<option value="">Religion</option>`;
                uniqueReligions.forEach(r => {
                    html += `<option value="${r}">${r}</option>`;
                });
                religionFilter.innerHTML = html;
                if (currentVal && uniqueReligions.includes(currentVal)) {
                    religionFilter.value = currentVal;
                } else {
                    religionFilter.value = "";
                }
            }
        }

        // Handle mass promotion or demotion
        function handlePromotion(direction) {
            const checkedBoxes = document.querySelectorAll('.promote-student-chk:checked');
            if (checkedBoxes.length === 0) {
                alert("Please select at least one student first.");
                return;
            }

            const studentIds = Array.from(checkedBoxes).map(cb => cb.value);
            const students = loadStudents();

            const classesOrder = [...loadClasses(), "Alumni"];

            let affectedCount = 0;
            students.forEach(s => {
                if (studentIds.includes(s.id)) {
                    const currentIdx = classesOrder.indexOf(s.class);
                    if (currentIdx !== -1) {
                        let newIdx = currentIdx + direction;
                        if (newIdx >= 0 && newIdx < classesOrder.length) {
                            s.class = classesOrder[newIdx];
                            affectedCount++;
                        }
                    }
                }
            });

            localStorage.setItem('school_students', JSON.stringify(students));
            alert(`Successfully updated the class of ${affectedCount} student(s)!`);

            // Re-render
            renderPromotionList();
            renderStudentList();
        }

        // Check view param in url on DOM load
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'list';
            switchPortalView(view);
        }

        // Sync class and section changes from the server database
        window.addEventListener('dbSynced', () => {
            populateStudentPortalClassDropdowns();
            handleClassSelectChange();
            updateIdRegPreviews();
        });

        // Intercept dropdown clicks dynamically
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
    