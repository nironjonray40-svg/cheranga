
// BLOCK 2

        // --- ESCAPE HTML UTILITY ---
        function escapeHtml(str) {
            if (!str && str !== 0) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
        window.escapeHtml = escapeHtml;

        // --- SUBVIEWS SWITHING MECHANISM ---
        function navigateToAdvanceView(viewName) {
            try {
                const url = new URL(window.location);
                url.searchParams.set('view', viewName);
                window.history.pushState(null, '', url);
            } catch (e) { }
            switchAdvanceView(viewName);
        }

        function switchAdvanceView(viewName) {
            // Hide all subviews
            const subviews = document.querySelectorAll('.portal-sub-view');
            subviews.forEach(view => view.classList.remove('active'));

            // Show selected view
            const targetView = document.getElementById('subview-' + viewName);
            if (targetView) {
                targetView.classList.add('active');
            }

            // Update pills highlight
            document.querySelectorAll('.advance-nav-pill').forEach(pill => {
                if (pill.getAttribute('data-view') === viewName) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });

            // Update title and subtitle
            const titleEl = document.querySelector('.section-title');
            const subtitleEl = document.querySelector('.section-subtitle');
            if (titleEl) titleEl.classList.remove('blue-title');

            if (viewName === 'general') {
                titleEl.textContent = "Advanced Settings & Database Manager";
                subtitleEl.textContent = "Manage site settings, inspect browser database collections, and export JSON database logs";
            } else if (viewName === 'fee-structure') {
                titleEl.textContent = "Class Fee Structure";
                subtitleEl.textContent = "Configure and customize monthly tuition fees";
                loadClassFeesForm();
            } else if (viewName === 'id-reg-structure') {
                titleEl.textContent = "Student ID & Registration Structure";
                subtitleEl.textContent = "Customize student ID prefixes, neon theme layouts, and registration rules";
                loadIdRegForm();
            } else if (viewName === 'class-section-structure') {
                titleEl.textContent = "Class & Section Structure";
                subtitleEl.textContent = "Define sections, seat capacity limits, and class distribution settings";
                populateClassDropdown();
                renderClassSectionList();
            } else if (viewName === 'slider-management') {
                titleEl.textContent = "Hero Slider Management";
                subtitleEl.textContent = "Upload, preview, and remove images displayed in the main slideshow";
                renderSliderManagement();
                renderLogoPreview();
                loadHeadlineSettings(true);
                renderTickerNotices();
            } else if (viewName === 'designation-structure') {
                titleEl.textContent = "Staff Designation Structure";
                if (titleEl) titleEl.classList.add('blue-title');
                subtitleEl.textContent = "Configure and customize designations for school teachers and staff";
                renderDesignations();
            } else if (viewName === 'speeches-management') {
                titleEl.textContent = "সভাপতির বাণী ও প্রধান শিক্ষকের বাণী ব্যবস্থাপনা";
                if (titleEl) titleEl.classList.remove('blue-title');
                subtitleEl.textContent = "ওয়েবসাইটের হোমপেজে প্রদর্শিত সভাপতি ও প্রধান শিক্ষকের ছবি, নাম, পদবী এবং বাণী আপডেট করুন";
                loadSpeechesSettings(false);
            } else if (viewName === 'chat') {
                titleEl.textContent = "Active Users & Live Chat";
                if (titleEl) titleEl.classList.remove('blue-title');
                subtitleEl.textContent = "ওয়েবসাইটে সক্রিয় সকল ব্যবহারকারীর ডিভাইস, আইপি, MAC Address, জেলা এবং লাইভ কমিউনিটি চ্যাট";
                initChatSection();
            } else if (viewName === 'user-management') {
                if (titleEl) {
                    titleEl.textContent = "শিক্ষক-কর্মচারী ইউজার ও লগইন ব্যবস্থাপনা";
                    titleEl.classList.remove('blue-title');
                    titleEl.style.fontFamily = "'Alkatra', cursive, sans-serif";
                    titleEl.style.fontSize = "1.85rem";
                    titleEl.style.fontWeight = "700";
                    titleEl.style.letterSpacing = "0.5px";
                }
                if (subtitleEl) {
                    subtitleEl.textContent = "শিক্ষক ও কর্মচারীদের ইউজার আইডি (মোবাইল নম্বর) এবং পাসওয়ার্ড ব্যবস্থাপনা ও ওয়েবসাইট আপডেট পারমিশন";
                    subtitleEl.style.fontFamily = "'Alkatra', cursive, sans-serif";
                    subtitleEl.style.fontSize = "1.08rem";
                    subtitleEl.style.letterSpacing = "0.3px";
                }
                initUserManagementSection();
            } else if (viewName === 'sms-settings') {
                if (titleEl) {
                    titleEl.textContent = "SMS API & Gateway Settings (BulkSMSBD)";
                    titleEl.classList.remove('blue-title');
                    titleEl.style.fontFamily = "";
                    titleEl.style.fontSize = "";
                    titleEl.style.fontWeight = "";
                    titleEl.style.letterSpacing = "";
                }
                if (subtitleEl) {
                    subtitleEl.textContent = "BulkSMSBD.net এপিআই কি, সেন্ডার আইডি কনফিগারেশন এবং লাইভ ব্যালেন্স ও বাল্ক এসএমএস সার্ভিস";
                    subtitleEl.style.fontFamily = "";
                    subtitleEl.style.fontSize = "";
                    subtitleEl.style.letterSpacing = "";
                }
                loadSmsSettingsForm();
            } else {
                if (titleEl) {
                    titleEl.style.fontFamily = "";
                    titleEl.style.fontSize = "";
                    titleEl.style.fontWeight = "";
                    titleEl.style.letterSpacing = "";
                }
                if (subtitleEl) {
                    subtitleEl.style.fontFamily = "";
                    subtitleEl.style.fontSize = "";
                    subtitleEl.style.letterSpacing = "";
                }
            }
        }

        // --- 1. SETTINGS EDITOR FUNCTIONS (GENERAL) ---
        function loadCurrentSettings() {
            // Do not overwrite if user is actively editing the settings form
            const activeEl = document.activeElement;
            if (activeEl && activeEl.closest('#settings-editor-form')) {
                return;
            }

            // Read settings
            let settings = localStorage.getItem('school_settings');
            if (settings) {
                try {
                    settings = JSON.parse(settings);
                    document.getElementById('set-school-name').value = settings.schoolName || "";
                    document.getElementById('set-school-email').value = settings.schoolEmail || "";
                    document.getElementById('set-school-phone').value = settings.schoolPhone || "";
                    document.getElementById('set-school-address').value = settings.schoolAddress || "Sector-10, Uttara, Dhaka-1230, Bangladesh";
                    document.getElementById('set-school-subtitle').value = settings.schoolSubtitle || "";
                    document.getElementById('set-school-gmail').value = settings.schoolGmail || "";
                    document.getElementById('set-school-other').value = settings.schoolOther || "";
                    document.getElementById('set-school-facebook').value = settings.facebookLink || "";
                    document.getElementById('set-school-youtube').value = settings.youtubeLink || "";
                    document.getElementById('set-school-twitter').value = settings.twitterLink || "";
                } catch (e) {
                    console.error("Error parsing settings", e);
                }
            } else {
                document.getElementById('set-school-name').value = "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
                document.getElementById('set-school-email').value = "info@creativemodelschool.edu";
                document.getElementById('set-school-phone').value = "+88 02-9876543";
                document.getElementById('set-school-address').value = "Sector-10, Uttara, Dhaka-1230, Bangladesh";
                document.getElementById('set-school-subtitle').value = "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
                document.getElementById('set-school-gmail').value = "creativemodelschool@gmail.com";
                document.getElementById('set-school-other').value = "";
                document.getElementById('set-school-facebook').value = "";
                document.getElementById('set-school-youtube').value = "";
                document.getElementById('set-school-twitter').value = "";
            }

            // Update stats
            updateDatabaseStats();

            // Render logo preview
            renderLogoPreview();

            // Load inbox messages
            loadInboxMessages();
        }

        function saveSchoolSettings(event) {
            event.preventDefault();

            const name = document.getElementById('set-school-name').value.trim();
            const email = document.getElementById('set-school-email').value.trim();
            const phone = document.getElementById('set-school-phone').value.trim();
            const address = document.getElementById('set-school-address').value.trim();
            const subtitle = document.getElementById('set-school-subtitle').value.trim();
            const gmail = document.getElementById('set-school-gmail').value.trim();
            const other = document.getElementById('set-school-other').value.trim();
            const facebook = document.getElementById('set-school-facebook').value.trim();
            const youtube = document.getElementById('set-school-youtube').value.trim();
            const twitter = document.getElementById('set-school-twitter').value.trim();

            let settings = {};
            const stored = localStorage.getItem('school_settings');
            if (stored) {
                try {
                    settings = JSON.parse(stored);
                } catch (e) {
                    settings = {};
                }
            }

            settings.schoolName = name;
            settings.schoolEmail = email;
            settings.schoolPhone = phone;
            settings.schoolAddress = address;
            settings.schoolSubtitle = subtitle;
            settings.schoolGmail = gmail;
            settings.schoolOther = other;
            settings.facebookLink = facebook;
            settings.youtubeLink = youtube;
            settings.twitterLink = twitter;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_settings'] = Date.now();
            }
            localStorage.setItem('school_settings', JSON.stringify(settings));

            // Reapply locally
            applySchoolSettings();

            alert("Settings saved successfully! School profile updated site-wide.");
            updateDatabaseStats();
        }

        // --- HELPER FUNCTIONS FOR CLASS LEVEL GROUPING ---
        function loadCustomClassLevels() {
            const stored = localStorage.getItem('school_class_custom_levels');
            if (stored) {
                try { return JSON.parse(stored); } catch (e) { console.error("Error parsing school_class_custom_levels", e); }
            }
            return {};
        }

        function isHighClass(className) {
            if (!className) return false;
            
            // Check explicit custom level setting first if user assigned a level upon creation
            const customLevels = loadCustomClassLevels();
            if (customLevels[className] === "high") return true;
            if (customLevels[className] === "primary") return false;

            const lower = className.toString().toLowerCase().trim();
            // Check for Six, Seven, Eight, Nine, Ten (in English/Bengali words or numbers 6-10)
            if (lower.includes("six") || lower.includes("seven") || lower.includes("eight") || lower.includes("nine") || lower.includes("ten")) {
                return true;
            }
            const match = lower.match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (num >= 6 && num <= 10) return true;
            }
            return false;
        }

        function isPrimaryClass(className) {
            return !isHighClass(className);
        }

        function getClassNumericCode(className) {
            const norm = String(className || '').trim().toLowerCase();
            
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

        function groupClassesByDepartment(classesList) {
            const primary = [];
            const high = [];
            (classesList || []).forEach(c => {
                if (isHighClass(c)) {
                    high.push(c);
                } else {
                    primary.push(c);
                }
            });
            return { primary, high };
        }

        // --- 2. CLASS FEE STRUCTURE FUNCTIONS ---
        function buildFeeTableRow(c, fees, defaultFees) {
            let cFees = fees[c] || defaultFees[c] || defaultFees[c.replace("Class ", "")] || { tuition: 0, admission: 0, session: 0 };
            if (typeof cFees !== 'object') {
                cFees = { tuition: parseInt(cFees) || 0, admission: 0, session: 0 };
            }
            const shortKey = c.replace("Class ", "");
            if (fees[shortKey] !== undefined && (fees[c] === undefined)) {
                const shortCFees = fees[shortKey];
                if (typeof shortCFees === 'object') {
                    cFees = shortCFees;
                } else {
                    cFees = { tuition: parseInt(shortCFees) || 0, admission: 0, session: 0 };
                }
            }
            return `
                <tr>
                    <td style="padding: 10px; font-weight: 700; color: #000000; vertical-align: middle;">${c}</td>
                    <td style="padding: 10px;">
                        <input type="number" data-class="${c}" data-type="tuition" class="form-control fee-input" min="0" value="${cFees.tuition}" required style="width: 100%;">
                    </td>
                    <td style="padding: 10px;">
                        <input type="number" data-class="${c}" data-type="admission" class="form-control fee-input" min="0" value="${cFees.admission}" required style="width: 100%;">
                    </td>
                    <td style="padding: 10px;">
                        <input type="number" data-class="${c}" data-type="session" class="form-control fee-input" min="0" value="${cFees.session}" required style="width: 100%;">
                    </td>
                </tr>
            `;
        }

        function loadClassFeesForm() {
            // Do not overwrite if user is actively editing the fee structure form
            const activeEl = document.activeElement;
            if (activeEl && activeEl.closest('#fee-structure-form')) {
                return;
            }

            const classes = loadClasses();
            const { primary, high } = groupClassesByDepartment(classes);

            const defaultFees = {
                "Class 6": { tuition: 700, admission: 1000, session: 1500 },
                "Class 7": { tuition: 700, admission: 1000, session: 1500 },
                "Class 8": { tuition: 800, admission: 1200, session: 1800 },
                "Class 9": { tuition: 1000, admission: 1500, session: 2000 },
                "Class 10": { tuition: 1000, admission: 1500, session: 2000 }
            };
            const stored = localStorage.getItem('school_class_fees');
            let fees = {};
            if (stored) {
                try {
                    fees = JSON.parse(stored);
                } catch (e) {
                    console.error("Error parsing school_class_fees", e);
                }
            }

            const primaryTbody = document.getElementById('primary-fee-rows');
            const highTbody = document.getElementById('high-fee-rows');

            if (primaryTbody) {
                let primaryHtml = '';
                primary.forEach(c => { primaryHtml += buildFeeTableRow(c, fees, defaultFees); });
                if (primary.length === 0) {
                    primaryHtml = `<tr><td colspan="4" style="text-align: center; color: #000000; font-style: italic; padding: 15px;">No primary level classes configured.</td></tr>`;
                }
                primaryTbody.innerHTML = primaryHtml;
            }

            if (highTbody) {
                let highHtml = '';
                high.forEach(c => { highHtml += buildFeeTableRow(c, fees, defaultFees); });
                if (high.length === 0) {
                    highHtml = `<tr><td colspan="4" style="text-align: center; color: #000000; font-style: italic; padding: 15px;">No high level classes configured.</td></tr>`;
                }
                highTbody.innerHTML = highHtml;
            }
        }

        function saveFeeStructure(event) {
            event.preventDefault();
            const inputs = document.querySelectorAll('.fee-input');
            const fees = {};

            inputs.forEach(input => {
                const className = input.getAttribute('data-class');
                const feeType = input.getAttribute('data-type');
                const value = parseInt(input.value) || 0;

                if (!fees[className]) {
                    fees[className] = { tuition: 0, admission: 0, session: 0 };
                }
                fees[className][feeType] = value;
            });

            localStorage.setItem('school_class_fees', JSON.stringify(fees));
            alert("Fee structure saved successfully! Rates updated in Billing calculator.");
            updateDatabaseStats();
        }

        // --- 3. STUDENT ID & REGISTRATION STRUCTURE FUNCTIONS ---
        function loadIdRegForm() {
            const activeEl = document.activeElement;
            const isEditingGlobal = activeEl && activeEl.closest('#id-reg-structure-form');
            const isEditingClassPrefix = activeEl && activeEl.closest('#class-id-prefix-form');

            const defaultSettings = {
                idPrefix: "CMS-",
                idTheme: "cyan",
                regPrefix: "REG2026-",
                requirePhoto: false,
                autoRoll: false
            };
            const stored = localStorage.getItem('school_id_reg_settings');
            let settings = defaultSettings;
            if (stored) {
                try {
                    settings = JSON.parse(stored);
                } catch (e) {
                    console.error("Error parsing school_id_reg_settings", e);
                }
            }

            if (!isEditingGlobal) {
                document.getElementById('id-card-prefix').value = settings.idPrefix || "CMS-";
                document.getElementById('id-card-theme').value = settings.idTheme || "cyan";
                document.getElementById('student-reg-prefix').value = settings.regPrefix || "REG2026-";
                document.getElementById('require-student-photo').checked = !!settings.requirePhoto;
                document.getElementById('auto-assign-roll').checked = !!settings.autoRoll;
            }

            // Populate class dropdown and render class prefixes list
            if (!isEditingClassPrefix) {
                populateIdRegClassDropdown();
            }
            renderClassIdPrefixList();
        }

        function saveIdRegStructure(event) {
            event.preventDefault();
            const settings = {
                idPrefix: document.getElementById('id-card-prefix').value.trim(),
                idTheme: document.getElementById('id-card-theme').value,
                regPrefix: document.getElementById('student-reg-prefix').value.trim(),
                requirePhoto: document.getElementById('require-student-photo').checked,
                autoRoll: document.getElementById('auto-assign-roll').checked
            };
            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_id_reg_settings'] = Date.now();
            }
            localStorage.setItem('school_id_reg_settings', JSON.stringify(settings));
            window.dispatchEvent(new Event('storage'));
            renderClassIdPrefixList();
            alert("Student ID & Registration Configuration সফলভাবে সংরক্ষণ করা হয়েছে!");
            updateDatabaseStats();
        }

        function populateIdRegClassDropdown() {
            const classes = loadClasses();
            const selectEl = document.getElementById('prefix-class-select');
            if (selectEl) {
                const currentVal = selectEl.value;
                const { primary, high } = groupClassesByDepartment(classes);
                let html = '';
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">${primary.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">${high.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>`;
                }
                selectEl.innerHTML = html;
                if (currentVal && classes.includes(currentVal)) {
                    selectEl.value = currentVal;
                }
                onClassPrefixSelectChange();
            }
        }

        function loadClassIdPrefixes() {
            const stored = localStorage.getItem('school_class_id_prefixes');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    } else if (typeof parsed === 'object' && parsed !== null) {
                        const arr = Object.keys(parsed).map(key => ({
                            class: key,
                            prefix: typeof parsed[key] === 'object' ? parsed[key].prefix : parsed[key],
                            regPrefix: typeof parsed[key] === 'object' ? parsed[key].regPrefix : ''
                        }));
                        localStorage.setItem('school_class_id_prefixes', JSON.stringify(arr));
                        return arr;
                    }
                } catch (e) {
                    console.error("Error parsing school_class_id_prefixes", e);
                }
            }
            return [];
        }

        function loadClassRegPrefixes() {
            const stored = localStorage.getItem('school_class_reg_prefixes');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) return parsed;
                    if (typeof parsed === 'object' && parsed !== null) {
                        return Object.keys(parsed).map(key => ({ class: key, prefix: parsed[key] }));
                    }
                } catch (e) {
                    console.error("Error parsing school_class_reg_prefixes", e);
                }
            }
            return [];
        }

        function onClassPrefixSelectChange() {
            const selectEl = document.getElementById('prefix-class-select');
            if (!selectEl) return;
            const className = selectEl.value;
            const prefixes = loadClassIdPrefixes();
            const regPrefixes = loadClassRegPrefixes();

            const found = prefixes.find(p => p.class === className);
            const foundReg = regPrefixes.find(p => p.class === className);

            const inputEl = document.getElementById('class-prefix-input');
            const regInputEl = document.getElementById('class-reg-prefix-input');

            if (inputEl) {
                inputEl.value = (found && found.prefix !== undefined) ? found.prefix : '';
            }
            if (regInputEl) {
                if (foundReg && foundReg.prefix !== undefined) {
                    regInputEl.value = foundReg.prefix;
                } else if (found && found.regPrefix !== undefined) {
                    regInputEl.value = found.regPrefix;
                } else {
                    regInputEl.value = '';
                }
            }
        }

        function saveClassIdPrefix(event) {
            event.preventDefault();
            const className = document.getElementById('prefix-class-select').value;
            const prefix = document.getElementById('class-prefix-input').value.trim();
            const regPrefix = document.getElementById('class-reg-prefix-input').value.trim();

            if (!className) {
                alert("দয়া করে একটি শ্রেণী নির্বাচন করুন।");
                return;
            }

            const prefixes = loadClassIdPrefixes();
            const existingIdx = prefixes.findIndex(p => p.class === className);
            if (existingIdx !== -1) {
                prefixes[existingIdx].prefix = prefix;
                prefixes[existingIdx].regPrefix = regPrefix;
            } else {
                prefixes.push({ class: className, prefix: prefix, regPrefix: regPrefix });
            }

            const regPrefixes = loadClassRegPrefixes();
            const existingRegIdx = regPrefixes.findIndex(p => p.class === className);
            if (existingRegIdx !== -1) {
                regPrefixes[existingRegIdx].prefix = regPrefix;
            } else {
                regPrefixes.push({ class: className, prefix: regPrefix });
            }

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_class_id_prefixes'] = Date.now();
                lastLocalWrites['school_class_reg_prefixes'] = Date.now();
            }
            localStorage.setItem('school_class_id_prefixes', JSON.stringify(prefixes));
            localStorage.setItem('school_class_reg_prefixes', JSON.stringify(regPrefixes));
            window.dispatchEvent(new Event('storage'));

            alert(`"${className}" এর জন্য আইডি ও রেজিস্ট্রেশন নম্বর প্রিফিক্স সফলভাবে সংরক্ষণ করা হয়েছে!\n• ID Prefix: "${prefix || '[Blank]'}" (যেমন: ${prefix || ''}001)\n• Reg Prefix: "${regPrefix || '[Default]'}" (যেমন: ${regPrefix || '2026' + getClassNumericCode(className)}001, ${regPrefix || '2026' + getClassNumericCode(className)}002...)`);

            renderClassIdPrefixList();
            updateDatabaseStats();
        }

        function deleteClassIdPrefix(className) {
            if (confirm(`আপনি কি "${className}" এর কাস্টম ID ও রেজিস্ট্রেশন নম্বর প্রিফিক্স মুছে ফেলে ডিফল্ট সেটিংসে ফিরতে চান?`)) {
                let prefixes = loadClassIdPrefixes().filter(p => p.class !== className);
                let regPrefixes = loadClassRegPrefixes().filter(p => p.class !== className);
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_class_id_prefixes'] = Date.now();
                    lastLocalWrites['school_class_reg_prefixes'] = Date.now();
                }
                localStorage.setItem('school_class_id_prefixes', JSON.stringify(prefixes));
                localStorage.setItem('school_class_reg_prefixes', JSON.stringify(regPrefixes));
                window.dispatchEvent(new Event('storage'));
                renderClassIdPrefixList();
                updateDatabaseStats();
            }
        }

        function editClassIdPrefix(className, prefix, regPrefix) {
            const selectEl = document.getElementById('prefix-class-select');
            const inputEl = document.getElementById('class-prefix-input');
            const regInputEl = document.getElementById('class-reg-prefix-input');
            if (selectEl && inputEl) {
                selectEl.value = className;
                inputEl.value = prefix || '';
                if (regInputEl) regInputEl.value = regPrefix || '';
                inputEl.focus();
            }
        }

        function moveClassIdPrefix(className, direction) {
            const prefixes = loadClassIdPrefixes();
            const index = prefixes.findIndex(p => p.class === className);
            if (index === -1) return;

            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= prefixes.length) return;

            // Swap
            const temp = prefixes[index];
            prefixes[index] = prefixes[targetIndex];
            prefixes[targetIndex] = temp;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_class_id_prefixes'] = Date.now();
            }
            localStorage.setItem('school_class_id_prefixes', JSON.stringify(prefixes));
            window.dispatchEvent(new Event('storage'));
            renderClassIdPrefixList();
            updateDatabaseStats();
        }

        function renderClassIdPrefixList() {
            const container = document.getElementById('class-id-prefix-list');
            if (!container) return;

            const classes = loadClasses();
            const prefixes = loadClassIdPrefixes();
            const regPrefixes = loadClassRegPrefixes();
            let idRegSettings = {};
            try {
                const stored = localStorage.getItem('school_id_reg_settings');
                if (stored) idRegSettings = JSON.parse(stored);
            } catch (e) { }

            const globalPfx = (idRegSettings.idPrefix !== undefined && idRegSettings.idPrefix !== null && idRegSettings.idPrefix !== '') ? idRegSettings.idPrefix : '26';
            const globalReg = (idRegSettings.regPrefix !== undefined && idRegSettings.regPrefix !== null && idRegSettings.regPrefix !== '') ? idRegSettings.regPrefix : '2026';

            // Map every active class from Class & Section Structure to its ID & Reg Prefix item
            const activePrefixItems = classes.map(c => {
                const found = prefixes.find(p => p.class === c);
                const foundReg = regPrefixes.find(p => p.class === c);
                const code = getClassNumericCode(c);
                const defaultPfx = `${globalPfx}${code}`;
                const defaultRegPfx = `${globalReg}${code}`;

                const isCustom = !!(found || foundReg);
                const prefixVal = (found && found.prefix !== undefined) ? found.prefix : defaultPfx;
                const regPrefixVal = (foundReg && foundReg.prefix !== undefined && foundReg.prefix !== '') 
                    ? foundReg.prefix 
                    : ((found && found.regPrefix !== undefined && found.regPrefix !== '') ? found.regPrefix : defaultRegPfx);

                return {
                    class: c,
                    prefix: prefixVal,
                    regPrefix: regPrefixVal,
                    isCustom: isCustom
                };
            });

            if (activePrefixItems.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #000000; font-weight: 600; font-style: italic; font-size: 0.85rem;">
                        No classes configured. Please add a class in Class & Section Structure.
                    </div>
                `;
                return;
            }

            const primaryPrefixes = activePrefixItems.filter(p => isPrimaryClass(p.class));
            const highPrefixes = activePrefixItems.filter(p => isHighClass(p.class));

            function buildPrefixListSectionHTML(listItems, sectionTitle) {
                if (listItems.length === 0) {
                    return `
                        <div style="margin-bottom: 20px;">
                            <h5 style="color: #000000; font-weight: 800; font-size: 0.95rem; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">${sectionTitle}</h5>
                            <div style="padding: 10px; font-size: 0.8rem; color: #000000; font-style: italic;">কোনো শ্রেণী যুক্ত করা নেই।</div>
                        </div>
                    `;
                }

                let itemsHTML = '';
                listItems.forEach((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === listItems.length - 1;
                    const upBtn = isFirst ? '' : `<button class="btn-outline" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px; display:inline-flex;" onclick="moveClassIdPrefix('${item.class}', -1)">▲ Up</button>`;
                    const downBtn = isLast ? '' : `<button class="btn-outline" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px; display:inline-flex;" onclick="moveClassIdPrefix('${item.class}', 1)">▼ Down</button>`;

                    const statusBadge = item.isCustom ? 
                        `<span style="background: #dcfce7; color: #166534; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Customized</span>` : 
                        `<span style="background: #e0f2fe; color: #0369a1; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Auto-synced</span>`;

                    const prefixDisplay = (item.prefix !== '' && item.prefix !== null && item.prefix !== undefined) ?
                        `<code style="color: #dc2626; font-weight: bold; font-family: monospace; font-size: 0.92rem;">${item.prefix}</code>` :
                        `<code style="color: #64748b; font-weight: 700; font-family: monospace; font-size: 0.82rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">[Blank (Only 001...)]</code>`;

                    const regDisplay = (item.regPrefix !== '' && item.regPrefix !== null && item.regPrefix !== undefined) ?
                        `<code style="color: #7c3aed; font-weight: bold; font-family: monospace; font-size: 0.92rem;">${item.regPrefix}</code>` :
                        `<code style="color: #64748b; font-weight: 700; font-family: monospace; font-size: 0.82rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">[Auto]</code>`;

                    const sampleReg = (item.regPrefix || '') + '001';

                    itemsHTML += `
                        <div class="class-card-item" style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <strong style="color: #0052ff; font-size: 0.95rem; display: inline-flex; align-items: center; margin-bottom: 4px;">${item.class} ${statusBadge}</strong>
                                <div style="font-size: 0.85rem; color: #000000; font-weight: 600; display: flex; flex-direction: column; gap: 2px;">
                                    <span>🆔 ID Prefix: ${prefixDisplay} <small style="color:#64748b;">(Ex: ${(item.prefix || '')}001)</small></span>
                                    <span>📝 Reg Starting No: ${regDisplay} <small style="color:#7c3aed; font-weight:700;">(Ex: ${sampleReg}, ${(item.regPrefix || '')}002...)</small></span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                ${upBtn}
                                ${downBtn}
                                <button class="btn-outline" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 5px; font-weight: 700;" onclick="editClassIdPrefix('${item.class}', '${item.prefix || ''}', '${item.regPrefix || ''}')">Edit</button>
                                ${item.isCustom ? `<button class="btn-danger" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 5px; font-weight: 700;" onclick="deleteClassIdPrefix('${item.class}')">Reset</button>` : ''}
                            </div>
                        </div>
                    `;
                });

                return `
                    <div style="margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 10px; border: 1.5px solid #cbd5e1;">
                        <h5 style="color: #000000; font-weight: 800; font-size: 0.95rem; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px;">${sectionTitle}</h5>
                        ${itemsHTML}
                    </div>
                `;
            }

            container.innerHTML = 
                buildPrefixListSectionHTML(primaryPrefixes, "🏫 Primary Level Prefixes (প্রাথমিক স্তর)") +
                buildPrefixListSectionHTML(highPrefixes, "🎓 High Level Prefixes (উচ্চ স্তর / মাধ্যমিক)");
        }

        // --- 4. CLASS & SECTION STRUCTURE FUNCTIONS ---
        function loadClasses() {
            const defaultClasses = ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
            const stored = localStorage.getItem('school_classes');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                } catch (e) {
                    console.error("Error parsing school_classes", e);
                }
            }
            return defaultClasses;
        }

        function populateClassDropdown() {
            const classes = loadClasses();
            const selectEl = document.getElementById('section-class-select');
            if (selectEl) {
                const currentVal = selectEl.value;
                const { primary, high } = groupClassesByDepartment(classes);
                let html = '';
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">${primary.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">${high.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>`;
                }
                selectEl.innerHTML = html;
                if (currentVal && classes.includes(currentVal)) {
                    selectEl.value = currentVal;
                }
            }
        }

        function addNewClass(event) {
            event.preventDefault();
            const classNameInput = document.getElementById('class-name-input');
            const levelSelect = document.getElementById('class-level-select');
            const className = classNameInput.value.trim();
            const selectedLevel = levelSelect ? levelSelect.value : "primary";

            if (!className) return;

            let classes = loadClasses();
            if (classes.includes(className)) {
                alert(`Class "${className}" already exists!`);
                return;
            }

            classes.push(className);
            localStorage.setItem('school_classes', JSON.stringify(classes));

            // Save custom level preference
            let customLevels = loadCustomClassLevels();
            customLevels[className] = selectedLevel;
            localStorage.setItem('school_class_custom_levels', JSON.stringify(customLevels));

            classNameInput.value = '';

            alert(`Class "${className}" (${selectedLevel === 'high' ? 'High Level' : 'Primary Level'}) added successfully!`);

            // Refresh dropdowns, fee forms, and grouped lists site-wide
            loadClassFeesForm();
            populateClassDropdown();
            populateIdRegClassDropdown();
            renderClassSectionList();
            renderClassIdPrefixList();
            updateDatabaseStats();
        }

        // --- Student helpers for Class & Section protection ---
        function loadStudents() {
            try {
                const stored = localStorage.getItem('school_students');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {
                console.error("Error parsing school_students", e);
            }
            return [];
        }

        function isSameClass(c1, c2) {
            if (!c1 && !c2) return true;
            if (!c1 || !c2) return false;
            const s1 = String(c1).trim().toLowerCase();
            const s2 = String(c2).trim().toLowerCase();
            if (s1 === s2) return true;

            const isSpec1 = /nursery|প্লে|play|কেজি|kg|নার্সারি/i.test(s1);
            const isSpec2 = /nursery|প্লে|play|কেজি|kg|নার্সারি/i.test(s2);
            if (isSpec1 || isSpec2) {
                return s1 === s2;
            }

            const code1 = getClassNumericCode(c1);
            const code2 = getClassNumericCode(c2);
            if (code1 && code2 && code1 !== '00' && code1 === code2) return true;
            return false;
        }

        function isSameSection(s1, s2) {
            if (!s1 && !s2) return true;
            if (!s1 || !s2) return false;
            const clean1 = String(s1).trim().replace(/^(Section|শাখা)\s*/i, '').trim().toUpperCase();
            const clean2 = String(s2).trim().replace(/^(Section|শাখা)\s*/i, '').trim().toUpperCase();
            return clean1 === clean2;
        }

        function getEnrolledStudentsForClass(className) {
            const students = loadStudents();
            return students.filter(s => s && isSameClass(s.class, className));
        }

        function getEnrolledStudentsForSection(className, sectionName) {
            const students = loadStudents();
            return students.filter(s => s && isSameClass(s.class, className) && isSameSection(s.section, sectionName));
        }

        function deleteClass(className) {
            const enrolledStudents = getEnrolledStudentsForClass(className);
            if (enrolledStudents.length > 0) {
                alert(`❌ "${className}" শ্রেণীটি ডিলিট করা সম্ভব নয়!\n\n"শিক্ষার্থী তথ্য ও বিবরণী" তে এই শ্রেণীর অধীনে ${enrolledStudents.length} জন শিক্ষার্থীর তথ্য যুক্ত রয়েছে।\n\nশ্রেণীটি ডিলিট করতে হলে প্রথমে উক্ত শিক্ষার্থীদের অন্য শ্রেণীতে স্থানান্তর করুন অথবা শিক্ষার্থী তালিকা থেকে তাদের তথ্য অপসারণ করুন।`);
                return;
            }

            if (confirm(`Are you sure you want to delete "${className}"? This will also remove all its sections!`)) {
                let classes = loadClasses();
                classes = classes.filter(c => c !== className);
                localStorage.setItem('school_classes', JSON.stringify(classes));

                let sections = loadClassSections();
                sections = sections.filter(s => s.class !== className);
                localStorage.setItem('school_class_sections', JSON.stringify(sections));

                // Synchronize class prefixes
                let prefixes = loadClassIdPrefixes();
                prefixes = prefixes.filter(p => p.class !== className);
                localStorage.setItem('school_class_id_prefixes', JSON.stringify(prefixes));

                // Remove custom level
                let customLevels = loadCustomClassLevels();
                delete customLevels[className];
                localStorage.setItem('school_class_custom_levels', JSON.stringify(customLevels));

                alert(`Class "${className}" and its sections removed successfully.`);
                loadClassFeesForm();
                populateClassDropdown();
                populateIdRegClassDropdown();
                renderClassSectionList();
                renderClassIdPrefixList();
                updateDatabaseStats();
            }
        }

        function renameClass(className) {
            const newName = prompt(`Enter new name for class "${className}":`, className);
            if (newName === null) return; // User cancelled
            const trimmed = newName.trim();
            if (!trimmed) {
                alert("Class name cannot be empty!");
                return;
            }

            let classes = loadClasses();
            if (classes.includes(trimmed) && trimmed !== className) {
                alert(`A class named "${trimmed}" already exists!`);
                return;
            }

            // Update in classes list
            const index = classes.indexOf(className);
            if (index !== -1) {
                classes[index] = trimmed;
                localStorage.setItem('school_classes', JSON.stringify(classes));
            }

            // Update custom level
            let customLevels = loadCustomClassLevels();
            if (customLevels[className]) {
                customLevels[trimmed] = customLevels[className];
                delete customLevels[className];
                localStorage.setItem('school_class_custom_levels', JSON.stringify(customLevels));
            }

            // Update in sections
            let sections = loadClassSections();
            sections.forEach(s => {
                if (isSameClass(s.class, className)) {
                    s.class = trimmed;
                }
            });
            localStorage.setItem('school_class_sections', JSON.stringify(sections));

            // Update class prefix key
            let prefixes = loadClassIdPrefixes();
            prefixes.forEach(p => {
                if (isSameClass(p.class, className)) {
                    p.class = trimmed;
                }
            });
            localStorage.setItem('school_class_id_prefixes', JSON.stringify(prefixes));

            // Update in students database
            let students = localStorage.getItem('school_students');
            if (students) {
                try {
                    students = JSON.parse(students);
                    students.forEach(s => {
                        if (isSameClass(s.class, className)) {
                            s.class = trimmed;
                        }
                    });
                    localStorage.setItem('school_students', JSON.stringify(students));
                } catch (e) {
                    console.error("Error updating student classes", e);
                }
            }

            alert(`Class renamed from "${className}" to "${trimmed}" successfully!`);
            loadClassFeesForm();
            populateClassDropdown();
            populateIdRegClassDropdown();
            renderClassSectionList();
            renderClassIdPrefixList();
            updateDatabaseStats();
        }

        function moveClass(className, direction) {
            let classes = loadClasses();
            const index = classes.indexOf(className);
            if (index === -1) return;

            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= classes.length) return; // out of bounds

            // Swap items
            const temp = classes[index];
            classes[index] = classes[targetIndex];
            classes[targetIndex] = temp;

            localStorage.setItem('school_classes', JSON.stringify(classes));
            populateClassDropdown();
            renderClassSectionList();
            updateDatabaseStats();
        }

        function loadClassSections() {
            const defaultSections = [
                { class: "Class 6", section: "A", capacity: 50 },
                { class: "Class 6", section: "B", capacity: 50 },
                { class: "Class 7", section: "A", capacity: 50 },
                { class: "Class 7", section: "B", capacity: 50 },
                { class: "Class 8", section: "A", capacity: 50 },
                { class: "Class 8", section: "B", capacity: 50 },
                { class: "Class 9", section: "A", capacity: 45 },
                { class: "Class 9", section: "B", capacity: 45 },
                { class: "Class 9", section: "C", capacity: 45 },
                { class: "Class 10", section: "A", capacity: 40 },
                { class: "Class 10", section: "B", capacity: 40 }
            ];
            const stored = localStorage.getItem('school_class_sections');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                } catch (e) {
                    console.error("Error parsing school_class_sections", e);
                }
            }
            return defaultSections;
        }

        function renderClassSectionList() {
            const classes = loadClasses();
            const sections = loadClassSections();
            const container = document.getElementById('class-section-grouped-list');
            if (!container) return;

            if (classes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #000000; font-weight: 600; font-style: italic; font-size: 0.85rem;">
                        No classes configured. Please add a class.
                    </div>
                `;
                return;
            }

            const { primary, high } = groupClassesByDepartment(classes);

            function buildClassListGroupHTML(classList, groupTitle) {
                if (classList.length === 0) {
                    return `
                        <div style="margin-bottom: 20px;">
                            <h5 style="color: #000000; font-weight: 800; font-size: 0.95rem; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">${groupTitle}</h5>
                            <div style="padding: 10px; font-size: 0.8rem; color: #000000; font-style: italic;">কোনো শ্রেণী যুক্ত করা নেই।</div>
                        </div>
                    `;
                }

                let cardsHTML = '';
                classList.forEach((c) => {
                    const globalIndex = classes.indexOf(c);
                    const classSections = sections.filter(s => s.class === c);
                    const classStudents = getEnrolledStudentsForClass(c);
                    const hasClassStudents = classStudents.length > 0;
                    let sectionsHTML = '';

                    if (classSections.length === 0) {
                        sectionsHTML = `<li style="color: #000000; font-weight: 600; font-style: italic; font-size: 0.8rem; padding: 5px 0;">No sections added yet.</li>`;
                    } else {
                        classSections.forEach(s => {
                            const secStudents = getEnrolledStudentsForSection(c, s.section);
                            const hasSecStudents = secStudents.length > 0;
                            const deleteSecBtn = hasSecStudents
                                ? `<button class="btn-danger" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px; opacity: 0.7; cursor: not-allowed;" title="${c} এর Section ${s.section} এ ${secStudents.length} জন শিক্ষার্থী যুক্ত রয়েছে, তাই এটি ডিলিট করা যাবে না" onclick="deleteClassSection('${c}', '${s.section}')">🔒 Remove</button>`
                                : `<button class="btn-danger" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" onclick="deleteClassSection('${c}', '${s.section}')">Remove</button>`;

                            sectionsHTML += `
                                <li style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding: 6px 0; border-bottom: 1px dashed #cbd5e1;">
                                    <span style="color:#000000; font-weight: 600;">
                                        Section <strong style="color: #0052ff;">${s.section}</strong> (Capacity: ${s.capacity})
                                        ${hasSecStudents ? `<span style="font-size: 0.72rem; color: #059669; font-weight: 700; background: #d1fae5; padding: 1px 6px; border-radius: 4px; margin-left: 5px; display: inline-flex; align-items: center; gap: 3px;">👥 ${secStudents.length} Students</span>` : ''}
                                    </span>
                                    ${deleteSecBtn}
                                </li>
                            `;
                        });
                    }

                    const isFirst = globalIndex === 0;
                    const isLast = globalIndex === classes.length - 1;
                    const upBtn = isFirst ? '' : `<button class="btn-outline" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px; display:inline-flex;" onclick="moveClass('${c}', -1)">▲ Up</button>`;
                    const downBtn = isLast ? '' : `<button class="btn-outline" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px; display:inline-flex;" onclick="moveClass('${c}', 1)">▼ Down</button>`;

                    const deleteClassBtn = hasClassStudents
                        ? `<button class="btn-danger" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px; opacity: 0.7; cursor: not-allowed;" title="${c} শ্রেণীতে ${classStudents.length} জন শিক্ষার্থী যুক্ত রয়েছে, তাই এটি ডিলিট করা যাবে না" onclick="deleteClass('${c}')">🔒 Delete</button>`
                        : `<button class="btn-danger" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px;" onclick="deleteClass('${c}')">Delete</button>`;

                    cardsHTML += `
                        <div class="class-card-item" style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom:6px; flex-wrap:wrap; gap:5px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <strong style="color: #0052ff; font-size:1.05rem; font-weight: 800;">${c}</strong>
                                    ${hasClassStudents ? `<span style="font-size: 0.72rem; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 6px; font-weight: 700; border: 1px solid #bae6fd; display: inline-flex; align-items: center; gap: 3px;">👥 ${classStudents.length} Students</span>` : ''}
                                </div>
                                <div style="display:flex; align-items:center; gap:5px;">
                                    ${upBtn}
                                    ${downBtn}
                                    <button class="btn-outline" style="padding: 3px 6px; font-size: 0.65rem; border-radius: 4px;" onclick="renameClass('${c}')">Update</button>
                                    ${deleteClassBtn}
                                </div>
                            </div>
                            <ul style="list-style:none; padding: 0; margin: 0;">
                                ${sectionsHTML}
                            </ul>
                        </div>
                    `;
                });

                return `
                    <div style="margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                        <h5 style="color: #000000; font-weight: 800; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px;">${groupTitle}</h5>
                        ${cardsHTML}
                    </div>
                `;
            }

            container.innerHTML = 
                buildClassListGroupHTML(primary, "🏫 Primary Level Classes (প্রাথমিক স্তর)") +
                buildClassListGroupHTML(high, "🎓 High Level Classes (উচ্চ স্তর / মাধ্যমিক)");
        }

        function saveClassSection(event) {
            event.preventDefault();
            const classVal = document.getElementById('section-class-select').value;
            const sectionName = document.getElementById('section-name-input').value.trim().toUpperCase();
            const capacity = parseInt(document.getElementById('section-capacity-input').value) || 50;

            if (!classVal) {
                alert("Please select or add a class first.");
                return;
            }
            if (!sectionName) return;

            let list = loadClassSections();
            const existingIndex = list.findIndex(item => item.class === classVal && item.section === sectionName);

            if (existingIndex !== -1) {
                list[existingIndex].capacity = capacity;
            } else {
                list.push({ class: classVal, section: sectionName, capacity: capacity });
            }

            localStorage.setItem('school_class_sections', JSON.stringify(list));
            document.getElementById('section-name-input').value = '';
            document.getElementById('section-capacity-input').value = '50';

            alert(`Section "${sectionName}" added/updated successfully for ${classVal}!`);
            renderClassSectionList();
            updateDatabaseStats();
        }

        function deleteClassSection(classNum, sectionName) {
            const enrolledStudents = getEnrolledStudentsForSection(classNum, sectionName);
            if (enrolledStudents.length > 0) {
                alert(`❌ "${classNum}" শ্রেণীর "${sectionName}" শাখাটি ডিলিট করা সম্ভব নয়!\n\n"শিক্ষার্থী তথ্য ও বিবরণী" তে এই শাখার অধীনে ${enrolledStudents.length} জন শিক্ষার্থীর তথ্য যুক্ত রয়েছে।\n\nশাখাটি ডিলিট করতে হলে প্রথমে শিক্ষার্থীদের অন্য শাখায় স্থানান্তর করুন অথবা শিক্ষার্থী তালিকা থেকে তাদের তথ্য অপসারণ করুন।`);
                return;
            }

            if (confirm(`Are you sure you want to delete Section ${sectionName} of Class ${classNum}?`)) {
                let list = loadClassSections();
                const filtered = list.filter(item => !(item.class === classNum && item.section === sectionName));
                localStorage.setItem('school_class_sections', JSON.stringify(filtered));
                renderClassSectionList();
                updateDatabaseStats();
            }
        }

        // --- 5. DATABASE STATS INSPECTOR ---
        function updateDatabaseStats() {
            let totalBytes = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalBytes += key.length + value.length;
            }

            const formattedSize = formatSizeUnits(totalBytes);
            document.getElementById('db-usage-text').innerText = `${formattedSize} / 5 MB`;

            const percentage = Math.min((totalBytes / 5242880) * 100, 100);
            document.getElementById('db-usage-indicator').style.width = `${Math.max(percentage, 2)}%`;
        }

        function formatSizeUnits(bytes) {
            if (bytes >= 1048576) {
                return (bytes / 1048576).toFixed(2) + " MB";
            } else if (bytes >= 1024) {
                return (bytes / 1024).toFixed(2) + " KB";
            } else {
                return bytes + " Bytes";
            }
        }

        // --- 6. VISITOR MESSAGE INBOX LOGS ---
        function loadInboxMessages() {
            const container = document.getElementById('inbox-messages-container');
            if (!container) return;

            let messages = localStorage.getItem('contact_messages');
            if (messages) {
                try {
                    messages = JSON.parse(messages);
                } catch (e) {
                    messages = [];
                }
            } else {
                messages = [];
            }

            if (messages.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--muted-text); font-style: italic; font-size: 0.85rem;">
                        No messages in the database.
                    </div>
                `;
                return;
            }

            let html = '';
            messages.forEach(msg => {
                html += `
                    <div class="inbox-item">
                        <div class="inbox-meta">
                            <span>From: <strong>${msg.name}</strong> (${msg.email})</span>
                            <span>${msg.date || ''}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: #fff; margin-top: 5px;">${msg.message}</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        // --- 7. DATABASE BACKUP ACTIONS: EXPORT, IMPORT, WIPE ---
        function exportDatabase() {
            const dbDump = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                dbDump[key] = localStorage.getItem(key);
            }

            const jsonStr = JSON.stringify(dbDump, null, 4);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);

            const exportFileName = 'school_database_backup.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
        }

        function importDatabase(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const dbData = JSON.parse(e.target.result);
                    if (typeof dbData !== 'object' || dbData === null) {
                        throw new Error("Invalid database format.");
                    }

                    Object.keys(dbData).forEach(key => {
                        localStorage.setItem(key, dbData[key]);
                    });

                    if (typeof window.syncAllToDatabase === 'function') {
                        await window.syncAllToDatabase();
                    }

                    alert("Database backup imported successfully! Page will reload.");
                    location.reload();
                } catch (err) {
                    alert("Failed to import database file. Make sure it is a valid JSON database file.");
                    console.error(err);
                }
            };
            reader.readAsText(file);
        }

        async function wipeDatabase() {
            if (confirm("Are you sure you want to wipe the database? This will clear all custom school settings, notices, and messages, restoring defaults.")) {
                localStorage.clear();
                if (typeof window.clearOnServer === 'function') {
                    await window.clearOnServer();
                }
                alert("Database wiped. Reloading default values.");
                location.reload();
            }
        }

        // --- 8. URL PARAMETERS ROUTING TRIGGER ---
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'general';

            let viewName = 'general';
            if (view === 'fee-structure') viewName = 'fee-structure';
            else if (view === 'id-structure' || view === 'id-reg-structure') viewName = 'id-reg-structure';
            else if (view === 'reg-structure' || view === 'class-section-structure') viewName = 'class-section-structure';
            else if (view === 'slider-management') viewName = 'slider-management';
            else if (view === 'designation-structure') viewName = 'designation-structure';
            else if (view === 'speeches-management' || view === 'speech-management' || view === 'speeches') viewName = 'speeches-management';

            switchAdvanceView(viewName);
        }


        // --- 9. SLIDER & HERO CONTENT MANAGEMENT PANEL FUNCTIONS ---
        const DEFAULT_HOME_SLIDES = [];

                function getNormalizedSliderList() {
            let raw = loadSliderImages();
            if (!Array.isArray(raw) || raw.length === 0) {
                return [];
            }
            return raw.map((item) => {
                if (typeof item === 'string') {
                    return {
                        url: item,
                        badge: 'স্মার্ট ক্যাম্পাস ২০২৬',
                        badgeColor: 'bg-amber-500 text-slate-950',
                        title: '',
                        desc: ''
                    };
                }
                return {
                    url: item.url || item.image || '',
                    badge: item.badge || item.tag || 'স্মার্ট ক্যাম্পাস ২০২৬',
                    badgeColor: item.badgeColor || item.tagColor || 'bg-amber-500 text-slate-950',
                    title: item.title !== undefined ? item.title : '',
                    desc: item.desc || item.description || ''
                };
            }).filter(s => s && s.url);
        }

        function renderSliderManagement() {
            const galleryContainer = document.getElementById('slider-mgr-gallery');
            if (!galleryContainer) return;

            const slides = getNormalizedSliderList();

            if (slides.length === 0) {
                galleryContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #000000; font-weight: 600; font-style: italic;">
                        কোনো স্লাইড যুক্ত করা নেই। অনুগ্রহ করে নতুন স্লাইড আপলোড করুন।
                    </div>
                `;
                return;
            }

            let html = '';
            slides.forEach((slide, index) => {
                const isFirst = index === 0;
                const isLast = index === slides.length - 1;
                const upBtn = isFirst ? '' : `<button type="button" class="btn-outline" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 4px;" onclick="moveSlideItem(${index}, -1)">▲ Up</button>`;
                const downBtn = isLast ? '' : `<button type="button" class="btn-outline" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 4px;" onclick="moveSlideItem(${index}, 1)">▼ Down</button>`;

                const safeTitle = (slide.title || '').replace(/"/g, '&quot;');
                const safeBadge = (slide.badge || '').replace(/"/g, '&quot;');
                const safeDesc = (slide.desc || '').replace(/"/g, '&quot;');

                html += `
                    <div class="glass-card" style="background: #ffffff !important; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                        <div>
                            <div style="position: relative; margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; height: 160px; background: #0f172a;">
                                <img id="slide-preview-img-${index}" src="${slide.url}" alt="Slide ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                                <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Slide #${index + 1}</span>
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <label class="btn-outline" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; width: 100%; justify-content: center; background: #f1f5f9;">
                                    📷 ছবি পরিবর্তন করুন (Change Photo)
                                    <input type="file" accept="image/*" style="display: none;" onchange="handleSlidePhotoUpload(event, ${index})">
                                </label>
                            </div>

                            <div class="form-group" style="margin-bottom: 8px;">
                                <label style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; display: block;">স্লাইড শিরোনাম (Title):</label>
                                <input type="text" id="slide-title-${index}" class="form-control" value="${safeTitle}" placeholder="স্লাইড শিরোনাম লিখুন..." style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 700; padding: 6px 10px; font-size: 0.88rem; width: 100%;">
                            </div>

                            <div class="form-group" style="margin-bottom: 8px;">
                                <label style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; display: block;">ব্যাজ ট্যাগ (Badge Tag):</label>
                                <input type="text" id="slide-badge-${index}" class="form-control" value="${safeBadge}" placeholder="যেমন: স্মার্ট ক্যাম্পাস ২০২৬" style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; padding: 6px 10px; font-size: 0.83rem; width: 100%;">
                            </div>

                            <div class="form-group" style="margin-bottom: 12px;">
                                <label style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; display: block;">স্লাইড বিবরণ (Description):</label>
                                <textarea id="slide-desc-${index}" class="form-control" placeholder="স্লাইড সংক্রান্ত বিবরণ লিখুন..." style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; padding: 6px 10px; font-size: 0.83rem; width: 100%; height: 55px;">${safeDesc}</textarea>
                            </div>
                        </div>

                        <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 6px;">
                            <div style="display: flex; gap: 4px;">
                                ${upBtn}
                                ${downBtn}
                            </div>
                            <div style="display: flex; gap: 6px;">
                                <button type="button" class="btn-primary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; background: #0000ff;" onclick="saveSlideItem(${index})">💾 সেভ</button>
                                <button type="button" class="btn-danger" style="padding: 5px 10px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; background: #ef4444; border: 1px solid #dc2626;" onclick="deleteSliderMgrImage(${index})">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            galleryContainer.innerHTML = html;
        }

        function saveSlideItem(index) {
            let slides = getNormalizedSliderList();
            if (index < 0 || index >= slides.length) return;

            const titleEl = document.getElementById('slide-title-' + index);
            const badgeEl = document.getElementById('slide-badge-' + index);
            const descEl = document.getElementById('slide-desc-' + index);

            if (!titleEl || !badgeEl || !descEl) {
                alert("স্লাইড ইনপুট ফিল্ড খুঁজে পাওয়া যায়নি।");
                return;
            }

            const titleVal = titleEl.value.trim();
            const badgeVal = badgeEl.value.trim();
            const descVal = descEl.value.trim();

            slides[index].title = titleVal;
            slides[index].badge = badgeVal || 'স্মার্ট ক্যাম্পাস ২০২৬';
            slides[index].desc = descVal;

            try {
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_slider_images'] = Date.now();
                }
                localStorage.setItem('school_slider_images', JSON.stringify(slides));
                if (typeof flushPushQueueNow === 'function') {
                    flushPushQueueNow();
                }
                renderSliderManagement();
                alert(`স্লাইড #${index + 1} এর শিরোনাম ও বিবরণ সফলভাবে আপডেট হয়েছে!`);
            } catch (err) {
                console.error("Storage error:", err);
                alert("স্লাইড আপডেট করতে ব্যর্থ হয়েছে। LocalStorage মেমোরি ফুল হয়ে গেছে।");
            }
        }

        function handleSlidePhotoUpload(event, index) {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert("অনুগ্রহ করে সঠিক ইমেজ ফাইল সিলেক্ট করুন।");
                return;
            }

            let slides = getNormalizedSliderList();
            if (index < 0 || index >= slides.length) return;

            if (typeof compressImage === 'function') {
                compressImage(file, function (compressedBase64) {
                    let curSlides = getNormalizedSliderList();
                    if (index >= 0 && index < curSlides.length) {
                        curSlides[index].url = compressedBase64;
                        try {
                            if (typeof lastLocalWrites === 'object') {
                                lastLocalWrites['school_slider_images'] = Date.now();
                            }
                            localStorage.setItem('school_slider_images', JSON.stringify(curSlides));
                            if (typeof flushPushQueueNow === 'function') {
                                flushPushQueueNow();
                            }
                            renderSliderManagement();
                            alert(`স্লাইড #${index + 1} এর ছবি সফলভাবে পরিবর্তন করা হয়েছে!`);
                        } catch (e) {
                            alert("ছবি সেভ করা সম্ভব হয়নি। মেমোরি ফুল হয়ে গেছে।");
                        }
                    }
                });
            } else {
                const reader = new FileReader();
                reader.onload = function(e) {
                    let curSlides = getNormalizedSliderList();
                    if (index >= 0 && index < curSlides.length) {
                        curSlides[index].url = e.target.result;
                        if (typeof lastLocalWrites === 'object') {
                            lastLocalWrites['school_slider_images'] = Date.now();
                        }
                        localStorage.setItem('school_slider_images', JSON.stringify(curSlides));
                        if (typeof flushPushQueueNow === 'function') {
                            flushPushQueueNow();
                        }
                        renderSliderManagement();
                        alert(`স্লাইড #${index + 1} এর ছবি পরিবর্তন হয়েছে!`);
                    }
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        }

        function handleSliderMgrUpload(event) {
            const files = event.target.files;
            if (files.length === 0) return;

            let slides = getNormalizedSliderList();
            let loadedCount = 0;
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

            if (imageFiles.length === 0) {
                alert("Please select valid image files only.");
                return;
            }

            imageFiles.forEach(file => {
                if (typeof compressImage === 'function') {
                    compressImage(file, function (compressedBase64) {
                        slides.push({
                            url: compressedBase64,
                            title: 'গুণগত শিক্ষা ও মনোরম পরিবেশের সেরা ঠিকানা',
                            badge: 'স্মার্ট ক্যাম্পাস ২০২৬',
                            badgeColor: 'bg-amber-500 text-slate-950',
                            desc: 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School — শিক্ষার্থীদের সার্বিক বিকাশে প্রতিশ্রুতিবদ্ধ।'
                        });
                        loadedCount++;

                        if (loadedCount === imageFiles.length) {
                            try {
                                if (typeof lastLocalWrites === 'object') {
                                    lastLocalWrites['school_slider_images'] = Date.now();
                                }
                                localStorage.setItem('school_slider_images', JSON.stringify(slides));
                                if (typeof flushPushQueueNow === 'function') {
                                    flushPushQueueNow();
                                }
                                renderSliderManagement();
                                alert("Successfully uploaded " + imageFiles.length + " image(s) to slideshow!");
                            } catch (error) {
                                console.error("Storage write failed:", error);
                                alert("Failed to save images. Storage is full.");
                            }
                        }
                    });
                }
            });

            event.target.value = '';
        }

        function moveSlideItem(index, direction) {
            let slides = getNormalizedSliderList();
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= slides.length) return;

            const temp = slides[index];
            slides[index] = slides[targetIndex];
            slides[targetIndex] = temp;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_slider_images'] = Date.now();
            }
            localStorage.setItem('school_slider_images', JSON.stringify(slides));
            if (typeof flushPushQueueNow === 'function') {
                flushPushQueueNow();
            }
            renderSliderManagement();
        }

        function deleteSliderMgrImage(index) {
            let slides = getNormalizedSliderList();

            if (confirm(`আপনি কি সত্যিই স্লাইড #${index + 1} মুছে ফেলতে চান?`)) {
                slides.splice(index, 1);
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_slider_images'] = Date.now();
                }
                localStorage.setItem('school_slider_images', JSON.stringify(slides));
                if (typeof flushPushQueueNow === 'function') {
                    flushPushQueueNow();
                }
                renderSliderManagement();
                alert("স্লাইড সফলভাবে মুছে ফেলা হয়েছে!");
            }
        }

        function openNewSlideFormModal() {
            const modal = document.getElementById('add-slide-modal');
            if (modal) modal.classList.add('active');
        }

        function closeNewSlideFormModal() {
            const modal = document.getElementById('add-slide-modal');
            if (modal) modal.classList.remove('active');
            const form = document.getElementById('add-new-slide-form');
            if (form) form.reset();
        }

        function addNewSlideItem(event) {
            event.preventDefault();
            const fileInput = document.getElementById('new-slide-photo-input');
            const titleVal = document.getElementById('new-slide-title-input').value.trim();
            const badgeVal = document.getElementById('new-slide-badge-input').value.trim() || 'স্মার্ট ক্যাম্পাস ২০২৬';
            const descVal = document.getElementById('new-slide-desc-input').value.trim();

            const file = fileInput.files[0];
            if (!file) {
                alert("অনুগ্রহ করে একটি স্লাইড ছবি নির্বাচন করুন।");
                return;
            }

            if (typeof compressImage === 'function') {
                compressImage(file, function (compressedBase64) {
                    let slides = getNormalizedSliderList();
                    slides.push({
                        url: compressedBase64,
                        title: titleVal,
                        badge: badgeVal,
                        badgeColor: 'bg-amber-500 text-slate-950',
                        desc: descVal
                    });

                    if (typeof lastLocalWrites === 'object') {
                        lastLocalWrites['school_slider_images'] = Date.now();
                    }
                    localStorage.setItem('school_slider_images', JSON.stringify(slides));
                    if (typeof flushPushQueueNow === 'function') {
                        flushPushQueueNow();
                    }
                    closeNewSlideFormModal();
                    renderSliderManagement();
                    alert("নতুন স্লাইড সফলভাবে যুক্ত করা হয়েছে!");
                });
            } else {
                const reader = new FileReader();
                reader.onload = function(e) {
                    let slides = getNormalizedSliderList();
                    slides.push({
                        url: e.target.result,
                        title: titleVal,
                        badge: badgeVal,
                        badgeColor: 'bg-amber-500 text-slate-950',
                        desc: descVal
                    });

                    if (typeof lastLocalWrites === 'object') {
                        lastLocalWrites['school_slider_images'] = Date.now();
                    }
                    localStorage.setItem('school_slider_images', JSON.stringify(slides));
                    if (typeof flushPushQueueNow === 'function') {
                        flushPushQueueNow();
                    }
                    closeNewSlideFormModal();
                    renderSliderManagement();
                    alert("নতুন স্লাইড সফলভাবে যুক্ত করা হয়েছে!");
                };
                reader.readAsDataURL(file);
            }
        }

        function resetHomeHeroSlidesToDefault() {
            if (confirm("আপনি কি স্লাইডারগুলো ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান? কাস্টম সকল স্লাইড ও টেক্সট ডিফল্ট হয়ে যাবে।")) {
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_slider_images'] = Date.now();
                }
                localStorage.removeItem('school_slider_images');
                if (typeof flushPushQueueNow === 'function') {
                    flushPushQueueNow();
                }
                renderSliderManagement();
                alert("স্লাইডার ডিফল্ট অবস্থায় রিসেট সম্পন্ন হয়েছে!");
            }
        }

        // --- Logo Management Functions ---
        function renderLogoPreview() {
            const logoContainers = document.querySelectorAll('#mgr-logo-preview, #general-logo-preview');
            if (!logoContainers.length) return;
            const customLogo = localStorage.getItem('school_logo');
            logoContainers.forEach(logoContainer => {
                if (customLogo) {
                    logoContainer.innerHTML = `<img src="${customLogo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
                } else {
                    logoContainer.innerHTML = `
                        <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; display: block;">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5.89 12.55L12 15.88l6.11-3.33c.6.3 1.89.88 1.89 1.45 0 .58-1.29 1.15-1.89 1.45L12 18.78l-6.11-3.33C5.29 15.15 4 14.58 4 14c0-.58 1.29-1.15 1.89-1.45z"/>
                        </svg>
                    `;
                }
            });
        }

        function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert("Please select a valid image file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = 150;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 150, 150);
                    const compressedBase64 = canvas.toDataURL('image/png');

                    try {
                        if (typeof lastLocalWrites === 'object') {
                            lastLocalWrites['school_logo'] = Date.now();
                        }
                        localStorage.setItem('school_logo', compressedBase64);
                        renderLogoPreview();
                        if (typeof applySchoolLogo === 'function') applySchoolLogo();
                        alert("Custom logo uploaded and applied successfully!");
                    } catch (error) {
                        console.error("Logo storage failed:", error);
                        alert("Failed to save custom logo. Storage limit reached.");
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        function removeCustomLogo() {
            if (confirm("Are you sure you want to remove the custom logo and revert to the default?")) {
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_logo'] = Date.now();
                }
                localStorage.removeItem('school_logo');
                renderLogoPreview();
                if (typeof applySchoolLogo === 'function') applySchoolLogo();
                alert("Logo reverted to default successfully!");
            }
        }

        // --- Hero Title Background Picture Management Functions ---
        function renderHeroBgPreview() {
            const heroBg = localStorage.getItem('school_hero_bg_image');
            const previewContainers = document.querySelectorAll('#hero-bg-preview, #general-hero-bg-preview');
            previewContainers.forEach(container => {
                if (heroBg) {
                    container.innerHTML = `<img src="${heroBg}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;">`;
                } else {
                    container.innerHTML = `<div style="color: #94a3b8; font-size: 0.75rem; text-align: center; padding: 8px; font-weight: 600;">কোনো ছবি নেই (ডিফল্ট)</div>`;
                }
            });
        }

        function handleHeroBgUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert("দয়া করে একটি সঠিক ইমেজ (JPG/PNG/WEBP) ফাইল সিলেক্ট করুন।");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const maxW = 1600;
                    const maxH = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxW) {
                        height = Math.round((height * maxW) / width);
                        width = maxW;
                    }
                    if (height > maxH) {
                        width = Math.round((width * maxH) / height);
                        height = maxH;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

                    try {
                        if (typeof lastLocalWrites === 'object') {
                            lastLocalWrites['school_hero_bg_image'] = Date.now();
                        }
                        localStorage.setItem('school_hero_bg_image', compressedBase64);
                        if (typeof saveDataToDb === 'function') {
                            saveDataToDb('school_hero_bg_image', compressedBase64);
                        }
                        renderHeroBgPreview();
                        if (typeof applyHeroTitleBg === 'function') applyHeroTitleBg();
                        alert("Hero-Title ব্যাকগ্রাউন্ড ছবি সফলভাবে আপলোড ও কার্যকর হয়েছে!");
                    } catch (error) {
                        console.error("Hero background storage failed:", error);
                        alert("ছবি সেভ করা সম্ভব হয়নি। ফাইলের সাইজ খুব বড়।");
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        function removeHeroBg() {
            if (confirm("আপনি কি নিশ্চিত যে hero-title এর ব্যাকগ্রাউন্ড ছবিটি মুছে ফেলতে চান?")) {
                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_hero_bg_image'] = Date.now();
                }
                localStorage.removeItem('school_hero_bg_image');
                if (typeof saveDataToDb === 'function') {
                    saveDataToDb('school_hero_bg_image', '');
                }
                renderHeroBgPreview();
                if (typeof applyHeroTitleBg === 'function') applyHeroTitleBg();
                alert("Hero-Title ব্যাকগ্রাউন্ড ছবি সফলভাবে মুছে ফেলা হয়েছে!");
            }
        }

        // --- Headline & Subtitle Management Functions ---
        function loadHeadlineSettings(force = false) {
            // Do not overwrite if user is actively editing the headline form (unless forced)
            if (!force) {
                const activeEl = document.activeElement;
                if (activeEl && activeEl.closest('#headline-editor-form')) {
                    return;
                }
            }

            let settings = localStorage.getItem('school_settings');
            let schoolName = "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            let schoolSubtitle = "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            let schoolGmail = "creativemodelschool@gmail.com";
            let schoolOther = "";
            let facebookLink = "";
            let youtubeLink = "";
            let twitterLink = "";
            if (settings) {
                try {
                    const parsed = JSON.parse(settings);
                    schoolName = parsed.schoolName || schoolName;
                    schoolSubtitle = parsed.schoolSubtitle || schoolSubtitle;
                    schoolGmail = parsed.schoolGmail || schoolGmail;
                    schoolOther = parsed.schoolOther || "";
                    facebookLink = parsed.facebookLink || "";
                    youtubeLink = parsed.youtubeLink || "";
                    twitterLink = parsed.twitterLink || "";
                } catch (e) {
                    console.error("Error parsing settings", e);
                }
            }
            const nameInput = document.getElementById('mgr-school-name');
            const subtitleInput = document.getElementById('mgr-school-subtitle');
            const gmailInput = document.getElementById('mgr-school-gmail');
            const otherInput = document.getElementById('mgr-school-other');
            const facebookInput = document.getElementById('mgr-school-facebook');
            const youtubeInput = document.getElementById('mgr-school-youtube');
            const twitterInput = document.getElementById('mgr-school-twitter');
            if (nameInput) nameInput.value = schoolName;
            if (subtitleInput) subtitleInput.value = schoolSubtitle;
            if (gmailInput) gmailInput.value = schoolGmail;
            if (otherInput) otherInput.value = schoolOther;
            if (facebookInput) facebookInput.value = facebookLink;
            if (youtubeInput) youtubeInput.value = youtubeLink;
            if (twitterInput) twitterInput.value = twitterLink;
        }

        function saveHeadlineSettings(event) {
            event.preventDefault();
            const schoolName = document.getElementById('mgr-school-name').value.trim();
            const schoolSubtitle = document.getElementById('mgr-school-subtitle').value.trim();
            const schoolGmail = document.getElementById('mgr-school-gmail').value.trim();
            const schoolOther = document.getElementById('mgr-school-other').value.trim();
            const facebookLink = document.getElementById('mgr-school-facebook').value.trim();
            const youtubeLink = document.getElementById('mgr-school-youtube').value.trim();
            const twitterLink = document.getElementById('mgr-school-twitter').value.trim();

            if (!schoolName) {
                alert("Headline (School Name) cannot be empty.");
                return;
            }

            let settings = {};
            const stored = localStorage.getItem('school_settings');
            if (stored) {
                try {
                    settings = JSON.parse(stored);
                } catch (e) {
                    settings = {};
                }
            }

            settings.schoolName = schoolName;
            settings.schoolSubtitle = schoolSubtitle;
            settings.schoolGmail = schoolGmail;
            settings.schoolOther = schoolOther;
            settings.facebookLink = facebookLink;
            settings.youtubeLink = youtubeLink;
            settings.twitterLink = twitterLink;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_settings'] = Date.now();
            }
            localStorage.setItem('school_settings', JSON.stringify(settings));

            if (typeof applySchoolSettings === 'function') applySchoolSettings();
            alert("Header Identity updated successfully site-wide!");
        }

        function resetHeadlineDefaults() {
            if (confirm("Are you sure you want to reset the Headline & Subtitle to default values?")) {
                let settings = {};
                const stored = localStorage.getItem('school_settings');
                if (stored) {
                    try {
                        settings = JSON.parse(stored);
                    } catch (e) {
                        settings = {};
                    }
                }

                settings.schoolName = "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
                settings.schoolSubtitle = "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
                settings.schoolGmail = "creativemodelschool@gmail.com";
                settings.schoolOther = "";
                settings.facebookLink = "";
                settings.youtubeLink = "";
                settings.twitterLink = "";

                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_settings'] = Date.now();
                }
                localStorage.setItem('school_settings', JSON.stringify(settings));

                loadHeadlineSettings(true);
                if (typeof applySchoolSettings === 'function') applySchoolSettings();
                alert("Headline, Subtitle, Gmail & Other info reset to defaults successfully!");
            }
        }

        // --- 10. IMPORTANT LINKS (E-SERVICES) MANAGEMENT PANEL FUNCTIONS ---
        const DEFAULT_ADVANCE_IMPORTANT_LINKS = [
            { title: "শিক্ষা মন্ত্রণালয়", url: "http://moedu.gov.bd", subtitle: "moedu.gov.bd", icon: "fa-landmark", color: "sky" },
            { title: "মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর", url: "http://dshe.gov.bd", subtitle: "dshe.gov.bd", icon: "fa-building-columns", color: "amber" },
            { title: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড", url: "http://nctb.gov.bd", subtitle: "nctb.gov.bd", icon: "fa-book", color: "emerald" },
            { title: "দিনাজপুর শিক্ষা বোর্ড", url: "http://dinajpurboard.gov.bd", subtitle: "dinajpurboard.gov.bd", icon: "fa-graduation-cap", color: "rose" },
            { title: "ব্যানবেইস (BANBEIS)", url: "http://banbeis.gov.bd", subtitle: "banbeis.gov.bd", icon: "fa-chart-bar", color: "sky" },
            { title: "শিক্ষক বাতায়ন", url: "http://teachers.gov.bd", subtitle: "teachers.gov.bd", icon: "fa-chalkboard-user", color: "emerald" }
        ];

        function loadImportantLinksData() {
            let stored = localStorage.getItem('school_important_links');
            if (!stored) {
                localStorage.setItem('school_important_links', JSON.stringify(DEFAULT_ADVANCE_IMPORTANT_LINKS));
                return JSON.parse(JSON.stringify(DEFAULT_ADVANCE_IMPORTANT_LINKS));
            }
            try {
                return JSON.parse(stored);
            } catch (e) {
                return JSON.parse(JSON.stringify(DEFAULT_ADVANCE_IMPORTANT_LINKS));
            }
        }

        function renderImportantLinksTable() {
            const tbody = document.getElementById('important-links-list');
            if (!tbody) return;

            const links = loadImportantLinksData();

            if (links.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #000000; font-weight: 600; font-style: italic;">
                            কোনো লিংক পাওয়া যায়নি। অনুগ্রহ করে নতুন লিংক যুক্ত করুন।
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            links.forEach((item, index) => {
                const isFirst = index === 0;
                const isLast = index === links.length - 1;
                const upBtn = isFirst ? '' : `<button type="button" class="action-btn-sm" style="background:#64748b; padding:4px 8px; font-weight:700;" onclick="moveImportantLinkItem(${index}, -1)">▲</button>`;
                const downBtn = isLast ? '' : `<button type="button" class="action-btn-sm" style="background:#64748b; padding:4px 8px; font-weight:700;" onclick="moveImportantLinkItem(${index}, 1)">▼</button>`;

                html += `
                    <tr style="border-bottom: 1px solid #cbd5e1;">
                        <td style="text-align: center; padding: 10px; font-weight: 700; color: #000000;">${index + 1}</td>
                        <td style="padding: 10px; font-weight: 700; color: #000000;">
                            <i class="fa-solid ${item.icon || 'fa-globe'}" style="margin-right: 6px; color: #0000ff;"></i>
                            ${item.title}
                        </td>
                        <td style="padding: 10px; font-weight: 600; color: #2563eb;">
                            <a href="${item.url}" target="_blank" style="text-decoration: underline;">${item.url}</a>
                        </td>
                        <td style="padding: 10px; font-weight: 600; color: #475569;">${item.subtitle || '-'}</td>
                        <td style="text-align: center; padding: 10px;">
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                ${upBtn}
                                ${downBtn}
                                <button type="button" class="action-btn-sm btn-edit-student" style="padding: 4px 10px; background: #0000ff;" onclick="editImportantLinkItem(${index})">✏️ আপডেট</button>
                                <button type="button" class="action-btn-sm btn-delete-student" style="padding: 4px 10px; background: #ef4444;" onclick="deleteImportantLinkItem(${index})">🗑️ মুছে ফেলুন</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        function saveImportantLinkItem(event) {
            event.preventDefault();
            const editIndex = parseInt(document.getElementById('link-edit-index').value, 10);
            const title = document.getElementById('link-title-input').value.trim();
            const url = document.getElementById('link-url-input').value.trim();
            const subtitle = document.getElementById('link-subtitle-input').value.trim();
            const icon = document.getElementById('link-icon-input').value;
            const color = document.getElementById('link-color-input').value;

            if (!title || !url) {
                alert("শিরোনাম এবং URL পূরণ করা আবশ্যক।");
                return;
            }

            let links = loadImportantLinksData();

            const linkObj = {
                title: title,
                url: url,
                subtitle: subtitle || url.replace(/^https?:\/\//, ''),
                icon: icon,
                color: color
            };

            if (editIndex >= 0 && editIndex < links.length) {
                links[editIndex] = linkObj;
                alert("গুরুত্বপূর্ণ লিংক সফলভাবে আপডেট করা হয়েছে!");
            } else {
                links.push(linkObj);
                alert("নতুন গুরুত্বপূর্ণ লিংক সফলভাবে যুক্ত করা হয়েছে!");
            }

            localStorage.setItem('school_important_links', JSON.stringify(links));
            resetLinkEditForm();
            renderImportantLinksTable();
        }

        function editImportantLinkItem(index) {
            const links = loadImportantLinksData();
            if (index < 0 || index >= links.length) return;

            const item = links[index];
            document.getElementById('link-edit-index').value = index;
            document.getElementById('link-title-input').value = item.title;
            document.getElementById('link-url-input').value = item.url;
            document.getElementById('link-subtitle-input').value = item.subtitle || '';
            document.getElementById('link-icon-input').value = item.icon || 'fa-landmark';
            document.getElementById('link-color-input').value = item.color || 'sky';

            document.getElementById('link-form-title').textContent = `✏️ গুরুত্বপূর্ণ লিংক #${index + 1} আপডেট করুন`;
            document.getElementById('save-link-btn').textContent = "💾 আপডেট করুন (Update Link)";
            document.getElementById('cancel-edit-link-btn').style.display = "inline-block";

            document.getElementById('important-link-form').scrollIntoView({ behavior: 'smooth' });
        }

        function resetLinkEditForm() {
            document.getElementById('link-edit-index').value = "-1";
            document.getElementById('important-link-form').reset();
            document.getElementById('link-form-title').textContent = "➕ নতুন গুরুত্বপূর্ণ লিংক যুক্ত করুন";
            document.getElementById('save-link-btn').textContent = "➕ যুক্ত করুন (Save Link)";
            document.getElementById('cancel-edit-link-btn').style.display = "none";
        }

        function moveImportantLinkItem(index, direction) {
            let links = loadImportantLinksData();
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= links.length) return;

            const temp = links[index];
            links[index] = links[targetIndex];
            links[targetIndex] = temp;

            localStorage.setItem('school_important_links', JSON.stringify(links));
            renderImportantLinksTable();
        }

        function deleteImportantLinkItem(index) {
            let links = loadImportantLinksData();
            if (confirm(`আপনি কি সত্যিই "${links[index]?.title}" লিংকটি মুছে ফেলতে চান?`)) {
                links.splice(index, 1);
                localStorage.setItem('school_important_links', JSON.stringify(links));
                renderImportantLinksTable();
                alert("লিংক সফলভাবে মুছে ফেলা হয়েছে!");
            }
        }

        function resetImportantLinksToDefault() {
            if (confirm("আপনি কি সকল গুরুত্বপূর্ণ লিংক ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?")) {
                localStorage.removeItem('school_important_links');
                resetLinkEditForm();
                renderImportantLinksTable();
                alert("গুরুত্বপূর্ণ লিংক ডিফল্ট অবস্থায় রিসেট সম্পন্ন হয়েছে!");
            }
        }

        // --- 11. SCROLLING NOTICE TICKER FUNCTIONS ---
        function loadTickerNotices() {
            let stored = localStorage.getItem('school_ticker_notices');
            if (!stored) {
                const defaults = ["সকল ছাত্র-ছাত্রীর অবগতির জন্য জানানো যাচ্ছে যে, আগামী কাল ১৬ ডিসেম্বর বিদ্যালয় বন্ধ থাকিবে"];
                localStorage.setItem('school_ticker_notices', JSON.stringify(defaults));
                return defaults;
            }
            try {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }

        function validateTickerPdfFile(input) {
            const file = input.files[0];
            const previewEl = document.getElementById('ticker-pdf-preview');
            if (!file) {
                if (previewEl) {
                    previewEl.style.display = 'none';
                    previewEl.innerHTML = '';
                }
                return;
            }

            // Validate PDF extension/type
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            if (!isPdf) {
                alert("শুধুমাত্র PDF ফাইল (.pdf) আপলোড করা যাবে!");
                input.value = '';
                if (previewEl) {
                    previewEl.style.display = 'none';
                    previewEl.innerHTML = '';
                }
                return;
            }

            // Max 1MB (1048576 bytes)
            const MAX_SIZE = 1 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                alert(`PDF ফাইলের সাইজ সর্বোচ্চ ১MB (1 MB) হতে হবে। আপনার নির্বাচিত ফাইল সাইজ: ${sizeMB} MB।`);
                input.value = '';
                if (previewEl) {
                    previewEl.style.display = 'none';
                    previewEl.innerHTML = '';
                }
                return;
            }

            if (previewEl) {
                const sizeKB = Math.round(file.size / 1024);
                previewEl.style.display = 'inline-flex';
                previewEl.style.alignItems = 'center';
                previewEl.style.justifyContent = 'space-between';
                previewEl.style.width = '100%';
                previewEl.innerHTML = `
                    <span>📄 <strong>${file.name}</strong> (${sizeKB} KB)</span>
                    <button type="button" onclick="clearTickerPdfInput()" style="background:none; border:none; color:#ef4444; font-weight:800; cursor:pointer; margin-left:10px;" title="রিমুভ করুন">✕</button>
                `;
            }
        }
        window.validateTickerPdfFile = validateTickerPdfFile;

        function clearTickerPdfInput() {
            const input = document.getElementById('new-ticker-pdf');
            if (input) input.value = '';
            const previewEl = document.getElementById('ticker-pdf-preview');
            if (previewEl) {
                previewEl.style.display = 'none';
                previewEl.innerHTML = '';
            }
        }
        window.clearTickerPdfInput = clearTickerPdfInput;

        function renderTickerNotices() {
            const listContainer = document.getElementById('ticker-notice-list');
            if (!listContainer) return;

            const notices = loadTickerNotices();

            if (notices.length === 0) {
                listContainer.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: #000000; font-weight: 600; font-style: italic;">
                            কোনো নোটিশ যুক্ত করা হয়নি। (No scrolling notices active)
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            notices.forEach((noticeItem, index) => {
                let noticeText = '';
                let hasPdf = false;
                let fileName = '';
                let fileSizeKB = 0;

                if (typeof noticeItem === 'string') {
                    noticeText = noticeItem;
                } else if (noticeItem && typeof noticeItem === 'object') {
                    noticeText = noticeItem.text || noticeItem.title || '';
                    if (noticeItem.pdf) {
                        hasPdf = true;
                        fileName = noticeItem.fileName || `Notice_${index + 1}.pdf`;
                        fileSizeKB = noticeItem.fileSize ? Math.round(noticeItem.fileSize / 1024) : 0;
                    }
                }

                const safeNoticeText = (noticeText || '').replace(/"/g, '&quot;');
                const pdfBadge = hasPdf ? `
                    <button type="button" onclick="viewTickerPdf(${index})" class="btn-outline" style="padding: 4px 10px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;">
                        📄 PDF দেখুন ${fileSizeKB ? `(${fileSizeKB} KB)` : ''}
                    </button>
                ` : `<span style="color: #94a3b8; font-size: 0.82rem; font-weight: 500; font-style: italic;">নেই (No PDF)</span>`;

                html += `
                    <tr>
                        <td style="font-weight: 600; text-align: center;">${index + 1}</td>
                        <td style="word-break: break-word; font-weight: 600; color: #0f172a;">${safeNoticeText}</td>
                        <td style="text-align: center;">${pdfBadge}</td>
                        <td style="text-align: center;">
                            <button class="action-btn-sm btn-delete-student" onclick="deleteTickerNotice(${index})" style="margin: 0; padding: 6px 12px;" title="Delete Notice">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                <span>মুছে ফেলুন</span>
                            </button>
                        </td>
                    </tr>
                `;
            });

            listContainer.innerHTML = html;
        }

        function viewTickerPdf(index) {
            const notices = loadTickerNotices();
            const item = notices[index];
            if (!item) return;
            const pdfData = (typeof item === 'object') ? item.pdf : null;
            if (!pdfData) {
                alert("এই নোটিশের সাথে কোনো PDF ফাইল যুক্ত নেই।");
                return;
            }

            const fileName = (typeof item === 'object' && item.fileName) ? item.fileName : 'Notice_Document.pdf';
            if (typeof openNoticePdf === 'function') {
                openNoticePdf(pdfData, fileName);
            } else if (typeof window.openNoticePdf === 'function') {
                window.openNoticePdf(pdfData, fileName);
            } else {
                try {
                    const win = window.open();
                    if (win) {
                        win.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>${fileName}</title>
                                <style>body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #333; }</style>
                            </head>
                            <body>
                                <iframe src="${pdfData}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                            </body>
                            </html>
                        `);
                    } else {
                        const a = document.createElement('a');
                        a.href = pdfData;
                        a.download = fileName;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                } catch (e) {
                    console.error("PDF View error:", e);
                    window.open(pdfData, '_blank');
                }
            }
        }
        window.viewTickerPdf = viewTickerPdf;

        function addTickerNotice(event) {
            event.preventDefault();
            const inputEl = document.getElementById('new-ticker-notice');
            const pdfInput = document.getElementById('new-ticker-pdf');
            if (!inputEl) return;
            const text = inputEl.value.trim();
            if (!text) return;

            const notices = loadTickerNotices();

            function getBanglaDateNow() {
                const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
                const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
                const toBn = n => String(n).replace(/\d/g, digit => bnDigits[digit]);
                const d = new Date();
                return `${toBn(d.getDate())} ${months[d.getMonth()]} ${toBn(d.getFullYear())}`;
            }

            const pdfFile = pdfInput && pdfInput.files && pdfInput.files[0];
            if (pdfFile) {
                // Validate size
                const MAX_SIZE = 1 * 1024 * 1024;
                if (pdfFile.size > MAX_SIZE) {
                    alert("PDF ফাইলের সাইজ সর্বোচ্চ ১MB (1 MB) হতে হবে!");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64Data = e.target.result;
                    notices.push({
                        text: text,
                        pdf: base64Data,
                        fileName: pdfFile.name,
                        fileSize: pdfFile.size,
                        date: getBanglaDateNow()
                    });

                    saveAndSyncTickerNotices(notices);
                    inputEl.value = '';
                    clearTickerPdfInput();
                    renderTickerNotices();
                    alert("নতুন টিকার নোটিশ ও PDF সফলভাবে যুক্ত হয়েছে!");
                };
                reader.onerror = function() {
                    alert("PDF ফাইল রিড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
                };
                reader.readAsDataURL(pdfFile);
            } else {
                notices.push({
                    text: text,
                    pdf: null,
                    fileName: null,
                    fileSize: 0,
                    date: getBanglaDateNow()
                });

                saveAndSyncTickerNotices(notices);
                inputEl.value = '';
                clearTickerPdfInput();
                renderTickerNotices();
                alert("নতুন টিকার নোটিশ সফলভাবে যুক্ত হয়েছে!");
            }
        }

        function saveAndSyncTickerNotices(notices) {
            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_ticker_notices'] = Date.now();
            }
            localStorage.setItem('school_ticker_notices', JSON.stringify(notices));
            if (typeof flushPushQueueNow === 'function') {
                flushPushQueueNow();
            }
            if (typeof updateNoticeTicker === 'function') {
                updateNoticeTicker();
            }
            if (typeof triggerAllUIRefresh === 'function') {
                triggerAllUIRefresh();
            }
            try {
                window.dispatchEvent(new CustomEvent('tickerNoticesUpdated'));
                window.dispatchEvent(new Event('storage'));
            } catch (e) {}
        }

        function deleteTickerNotice(index) {
            if (confirm("আপনি কি এই নোটিশটি মুছে ফেলতে চান?")) {
                const notices = loadTickerNotices();
                notices.splice(index, 1);

                saveAndSyncTickerNotices(notices);
                renderTickerNotices();
                alert("নোটিশটি মুছে ফেলা হয়েছে!");
            }
        }

        // --- STAFF DESIGNATION CONFIGURATION FUNCTIONS ---
        function loadDesignationList() {
            const stored = localStorage.getItem('school_designations');
            if (!stored) {
                const defaults = [
                    { name: "প্রধান শিক্ষক", category: "Teacher" },
                    { name: "Principal", category: "Teacher" },
                    { name: "Senior Teacher", category: "Teacher" },
                    { name: "Assistant Teacher", category: "Teacher" },
                    { name: "Office Assistant", category: "Staff" },
                    { name: "Librarian", category: "Staff" },
                    { name: "Peon", category: "Staff" }
                ];
                localStorage.setItem('school_designations', JSON.stringify(defaults));
                return defaults;
            }
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }

        let editingDesignationIndex = null;

        function renderDesignations() {
            const tbody = document.getElementById('designation-list-tbody');
            if (!tbody) return;

            const list = loadDesignationList();
            if (list.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: #000000; font-weight: 600; font-style: italic;">
                            কোনো পদবী পাওয়া যায়নি। (No designations found)
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            list.forEach((item, index) => {
                const catText = item.category === 'Teacher' ? 'Teacher (শিক্ষক)' : 'Staff (কর্মচারী)';
                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="text-align: center; padding: 10px; font-weight: 600; color: #000000;">${index + 1}</td>
                        <td style="padding: 10px; font-weight: 500; color: #000000;">${item.name}</td>
                        <td style="padding: 10px; color: #000000;">${catText}</td>
                        <td style="text-align: center; padding: 10px;">
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                <button class="action-btn-sm btn-edit-student btn-edit-designation" data-index="${index}" style="margin: 0; padding: 5px 10px; background: #4f46e5;" title="Edit Designation">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    <span>আপডেট</span>
                                </button>
                                <button class="action-btn-sm btn-delete-student btn-delete-designation" data-index="${index}" style="margin: 0; padding: 5px 10px;" title="Delete Designation">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    <span>মুছে ফেলুন</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function editDesignation(index) {
            const list = loadDesignationList();
            const item = list[index];
            if (!item) return;

            document.getElementById('designation-name-input').value = item.name;
            document.getElementById('designation-category-select').value = item.category;

            editingDesignationIndex = index;

            const submitBtn = document.querySelector('#add-designation-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerText = "Update Designation";
            }
        }

        function addNewDesignation(event) {
            event.preventDefault();
            const nameInput = document.getElementById('designation-name-input');
            const catSelect = document.getElementById('designation-category-select');
            if (!nameInput || !catSelect) return;

            const name = nameInput.value.trim();
            const category = catSelect.value;
            if (!name || !category) return;

            const list = loadDesignationList();

            if (editingDesignationIndex === null) {
                // Add mode
                if (list.some(item => item.name.toLowerCase() === name.toLowerCase() && item.category === category)) {
                    alert("এই পদবীটি ইতিমধ্যে এই ক্যাটাগরিতে যুক্ত রয়েছে!");
                    return;
                }
                list.push({ name, category });
            } else {
                // Edit mode
                const idx = editingDesignationIndex;
                if (list.some((item, i) => i !== idx && item.name.toLowerCase() === name.toLowerCase() && item.category === category)) {
                    alert("এই পদবীটি ইতিমধ্যে এই ক্যাটাগরিতে যুক্ত রয়েছে!");
                    return;
                }
                list[idx] = { name, category };
                editingDesignationIndex = null;

                const submitBtn = document.querySelector('#add-designation-form button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerText = "Add Designation";
                }
            }

            if (typeof window.lastLocalWrites === 'object') {
                window.lastLocalWrites['school_designations'] = Date.now();
            }
            localStorage.setItem('school_designations', JSON.stringify(list));

            nameInput.value = '';
            catSelect.value = '';

            renderDesignations();
            alert("পদবী তালিকাটি সফলভাবে আপডেট হয়েছে!");
        }

        function deleteDesignation(index) {
            if (confirm("আপনি কি এই পদবীটি মুছে ফেলতে চান?")) {
                const list = loadDesignationList();
                list.splice(index, 1);

                if (typeof window.lastLocalWrites === 'object') {
                    window.lastLocalWrites['school_designations'] = Date.now();
                }
                localStorage.setItem('school_designations', JSON.stringify(list));

                // If currently editing the deleted item, reset edit state
                if (editingDesignationIndex === index) {
                    editingDesignationIndex = null;
                    const submitBtn = document.querySelector('#add-designation-form button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerText = "Add Designation";
                    }
                    document.getElementById('designation-name-input').value = '';
                    document.getElementById('designation-category-select').value = '';
                }

                renderDesignations();
                alert("পদবীটি মুছে ফেলা হয়েছে!");
            }
        }

        // --- SPEECHES MANAGEMENT (CHAIRMAN & HEADMASTER) ---
        let currentChairmanPhotoBase64 = "";
        let currentHeadmasterPhotoBase64 = "";
        let isChairmanSpeechDirty = false;
        let isHeadmasterSpeechDirty = false;

        function markChairmanSpeechDirty() {
            isChairmanSpeechDirty = true;
        }

        function markHeadmasterSpeechDirty() {
            isHeadmasterSpeechDirty = true;
        }

        const DEFAULT_CHAIRMAN_SPEECH = {
            name: "",
            title: "",
            msg: "",
            photo: ""
        };

        const DEFAULT_HEADMASTER_SPEECH = {
            name: "শাহ মোঃ রোকনুজ্জামান চৌধুরী",
            title: "প্রধান শিক্ষক",
            msg: "প্রিয় শিক্ষার্থীরা, তোমাদের সবাইকে আমার পক্ষ থেকে আন্তরিক শুভেচ্ছা ও ভালোবাসা। তোমরাই আগামী দিনের ভবিষ্যৎ, দেশের আশা ও জাতির সম্ভাবনা। একটি সুন্দর ভবিষ্যৎ গড়তে হলে তোমাদের এখনই সৎ, মেধাবী, পরিশ্রমী এবং দায়িত্বশীল মানুষ হিসেবে গড়ে উঠতে হবে। আমাদের বিদ্যালয় তোমাদের শুধু বইয়ের জ্ঞান নয়, বরং নৈতিকতা, ভদ্রতা, দেশপ্রেম এবং মানুষ হওয়ার শিক্ষা দেয়। আমরা চাই তোমরা যেন শ্রদ্ধাশীল হও, নিয়মিত পাঠে মনোযোগী হও, সময়ের মূল্য বুঝো এবং সবসময় সত্য ও ন্যায়ের পথে চলো। ভবিষ্যতে কে কী হবে—ডাক্তার, শিক্ষক, প্রকৌশলী, শিল্পী, বিজ্ঞানী—তা বড় কথা নয়; বড় কথা হলো, তোমরা যেন ভালো মানুষ হও। একজন ভালো মানুষ শুধু নিজের জন্য নয়, সমাজ ও দেশের জন্যও গুরুত্বপূর্ণ। তোমাদের যেকোনো প্রয়োজনে আমরা শিক্ষকরা পাশে আছি। ভয় বা সংকোচ না করে আমাদের সঙ্গে কথা বলো, প্রশ্ন করো, শেখো। তোমাদের উন্নত ভবিষ্যতের জন্য আমরা সবসময় আন্তরিকভাবে কাজ করে যাব। সবশেষে বলবো— স্বপ্ন দেখো, পরিশ্রম করো, এবং নিজের প্রতি বিশ্বাস রাখো। আল্লাহ্ চাইলে একদিন তোমরাও সফল হবে, নিজের পরিবার, সমাজ ও দেশের গর্ব হয়ে উঠবে। ভালো থেকো, সুস্থ থেকো, নিয়মিত পড়াশোনা করো। তোমাদের প্রতিটি দিন হোক শেখায় ভরপুর ও আনন্দময়।",
            photo: ""
        };

        function loadSpeechesSettings(force = false) {
            const activeEl = document.activeElement;
            const isEditingChairman = activeEl && activeEl.closest('#chairman-speech-form');
            const isEditingHeadmaster = activeEl && activeEl.closest('#headmaster-speech-form');

            let settings = {};
            try {
                const stored = localStorage.getItem('school_settings');
                if (stored) settings = JSON.parse(stored);
            } catch (e) {
                settings = {};
            }

            // Chairman fields - only overwrite if not dirty and not currently typing
            if (force || (!isEditingChairman && !isChairmanSpeechDirty)) {
                const chairNameEl = document.getElementById('set-chairman-name');
                const chairTitleEl = document.getElementById('set-chairman-title');
                const chairMsgEl = document.getElementById('set-chairman-msg');

                if (chairNameEl) chairNameEl.value = settings.chairmanName || "";
                if (chairTitleEl) chairTitleEl.value = settings.chairmanTitle || "";
                if (chairMsgEl) chairMsgEl.value = settings.chairmanMsg || "";
                currentChairmanPhotoBase64 = settings.chairmanPhoto || "";
                renderChairmanPhotoPreview();
            }

            // Headmaster fields - only overwrite if not dirty and not currently typing
            if (force || (!isEditingHeadmaster && !isHeadmasterSpeechDirty)) {
                const hmNameEl = document.getElementById('set-headmaster-name');
                const hmTitleEl = document.getElementById('set-headmaster-title');
                const hmMsgEl = document.getElementById('set-headmaster-msg');

                let initialHmName = settings.headmasterName || DEFAULT_HEADMASTER_SPEECH.name;
                if (/^[A-Za-z\s.,'-]+$/.test(initialHmName.trim())) {
                    let stList = [];
                    try { stList = JSON.parse(localStorage.getItem('school_staff') || '[]'); } catch (e) { }
                    const hmStaff = stList.find(s => {
                        const des = (s.designation || '').toString().toLowerCase();
                        return des.includes('headmaster') || des.includes('principal') || des.includes('প্রধান শিক্ষক') || des.includes('head teacher') || des.includes('অধ্যক্ষ');
                    });
                    if (hmStaff && hmStaff.nameBn) initialHmName = hmStaff.nameBn;
                    else initialHmName = DEFAULT_HEADMASTER_SPEECH.name;
                }

                if (hmNameEl) hmNameEl.value = initialHmName;
                if (hmTitleEl) hmTitleEl.value = settings.headmasterTitle || DEFAULT_HEADMASTER_SPEECH.title;
                if (hmMsgEl) hmMsgEl.value = settings.headmasterMsg || DEFAULT_HEADMASTER_SPEECH.msg;
                currentHeadmasterPhotoBase64 = settings.headmasterPhoto || "";
                renderHeadmasterPhotoPreview();
            }

            // Populate staff dropdown for headmaster
            populateHeadmasterStaffDropdown();
        }

        function populateHeadmasterStaffDropdown() {
            const selectEl = document.getElementById('set-headmaster-staff-select');
            if (!selectEl) return;

            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            let html = '<option value="">-- শিক্ষক তালিকা থেকে সিলেক্ট করুন (বা নিজে লিখুন) --</option>';
            staffList.forEach((s, idx) => {
                const staffName = s.nameBn ? `${s.nameBn} (${s.name})` : (s.name || s.staffId);
                const desig = s.designation ? ` - ${s.designation}` : '';
                html += `<option value="${idx}">${staffName}${desig}</option>`;
            });
            selectEl.innerHTML = html;
        }

        function autoFillHeadmasterFromStaff() {
            const selectEl = document.getElementById('set-headmaster-staff-select');
            if (!selectEl || selectEl.value === "") return;

            const idx = parseInt(selectEl.value, 10);
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            const staff = staffList[idx];
            if (staff) {
                const nameEl = document.getElementById('set-headmaster-name');
                const titleEl = document.getElementById('set-headmaster-title');

                if (nameEl) nameEl.value = staff.nameBn || staff.name || "";
                if (titleEl) titleEl.value = staff.designation || "প্রধান শিক্ষক";
                if (staff.photo) {
                    currentHeadmasterPhotoBase64 = staff.photo;
                    renderHeadmasterPhotoPreview();
                }
                markHeadmasterSpeechDirty();
            }
        }

        function renderChairmanPhotoPreview() {
            const previewContainer = document.getElementById('chairman-photo-preview');
            if (!previewContainer) return;

            if (currentChairmanPhotoBase64) {
                previewContainer.innerHTML = `<img src="${currentChairmanPhotoBase64}" alt="Chairman Photo" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">`;
            } else {
                previewContainer.innerHTML = `<svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: #f59e0b;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
            }
        }

        function renderHeadmasterPhotoPreview() {
            const previewContainer = document.getElementById('headmaster-photo-preview');
            if (!previewContainer) return;

            if (currentHeadmasterPhotoBase64) {
                previewContainer.innerHTML = `<img src="${currentHeadmasterPhotoBase64}" alt="Headmaster Photo" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">`;
            } else {
                previewContainer.innerHTML = `<svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: #10b981;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
            }
        }

        function handleChairmanPhotoUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // 4cm × 5cm at 300 DPI: (4/2.54)*300 = 472.44, (5/2.54)*300 = 590.55
                    const width = 472;
                    const height = 591;
                    canvas.width = width;
                    canvas.height = height;

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    currentChairmanPhotoBase64 = canvas.toDataURL('image/jpeg', 0.95);
                    renderChairmanPhotoPreview();
                    markChairmanSpeechDirty();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function removeChairmanPhoto() {
            currentChairmanPhotoBase64 = "";
            renderChairmanPhotoPreview();
            const input = document.getElementById('set-chairman-photo-input');
            if (input) input.value = '';
            markChairmanSpeechDirty();
        }

        function handleHeadmasterPhotoUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // 4cm × 5cm at 300 DPI
                    const width = 472;
                    const height = 591;
                    canvas.width = width;
                    canvas.height = height;

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    currentHeadmasterPhotoBase64 = canvas.toDataURL('image/jpeg', 0.95);
                    renderHeadmasterPhotoPreview();
                    markHeadmasterSpeechDirty();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function removeHeadmasterPhoto() {
            currentHeadmasterPhotoBase64 = "";
            renderHeadmasterPhotoPreview();
            const input = document.getElementById('set-headmaster-photo-input');
            if (input) input.value = '';
            markHeadmasterSpeechDirty();
        }

        function saveChairmanSpeech(event) {
            event.preventDefault();
            const name = document.getElementById('set-chairman-name').value.trim();
            const title = document.getElementById('set-chairman-title').value.trim();
            const msg = document.getElementById('set-chairman-msg').value.trim();

            if (!name || !title || !msg) {
                alert("অনুগ্রহ করে সভাপতির নাম, পদবী এবং বাণী পূরণ করুন।");
                return;
            }

            let settings = {};
            try {
                const stored = localStorage.getItem('school_settings');
                if (stored) settings = JSON.parse(stored);
            } catch (e) {
                settings = {};
            }

            settings.chairmanName = name;
            settings.chairmanTitle = title;
            settings.chairmanMsg = msg;
            settings.chairmanPhoto = currentChairmanPhotoBase64;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_settings'] = Date.now();
            }
            localStorage.setItem('school_settings', JSON.stringify(settings));

            isChairmanSpeechDirty = false;
            alert("সভাপতির তথ্য ও বাণী সফলভাবে সংরক্ষণ করা হয়েছে!");
            updateDatabaseStats();
        }

        function saveHeadmasterSpeech(event) {
            event.preventDefault();
            const name = document.getElementById('set-headmaster-name').value.trim();
            const title = document.getElementById('set-headmaster-title').value.trim();
            const msg = document.getElementById('set-headmaster-msg').value.trim();

            if (!name || !title || !msg) {
                alert("অনুগ্রহ করে প্রধান শিক্ষকের নাম, পদবী এবং বাণী পূরণ করুন।");
                return;
            }

            let settings = {};
            try {
                const stored = localStorage.getItem('school_settings');
                if (stored) settings = JSON.parse(stored);
            } catch (e) {
                settings = {};
            }

            settings.headmasterName = name;
            settings.headmasterTitle = title;
            settings.headmasterMsg = msg;
            settings.headmasterPhoto = currentHeadmasterPhotoBase64;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_settings'] = Date.now();
            }
            localStorage.setItem('school_settings', JSON.stringify(settings));

            isHeadmasterSpeechDirty = false;
            alert("প্রধান শিক্ষকের তথ্য ও বাণী সফলভাবে সংরক্ষণ করা হয়েছে!");
            updateDatabaseStats();
        }

        function resetChairmanSpeechDefaults() {
            if (confirm("আপনি কি সভাপতির বাণী ও তথ্য খালি/মুছে ফেলতে চান?")) {
                document.getElementById('set-chairman-name').value = "";
                document.getElementById('set-chairman-title').value = "";
                document.getElementById('set-chairman-msg').value = "";
                currentChairmanPhotoBase64 = "";
                renderChairmanPhotoPreview();
                isChairmanSpeechDirty = true;
            }
        }

        function resetHeadmasterSpeechDefaults() {
            if (confirm("আপনি কি প্রধান শিক্ষকের বাণী ও তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?")) {
                document.getElementById('set-headmaster-name').value = DEFAULT_HEADMASTER_SPEECH.name;
                document.getElementById('set-headmaster-title').value = DEFAULT_HEADMASTER_SPEECH.title;
                document.getElementById('set-headmaster-msg').value = DEFAULT_HEADMASTER_SPEECH.msg;
                currentHeadmasterPhotoBase64 = DEFAULT_HEADMASTER_SPEECH.photo;
                renderHeadmasterPhotoPreview();
                isHeadmasterSpeechDirty = false;
            }
        }

        // Bind functions to window to guarantee scope visibility
        window.deleteDesignation = deleteDesignation;
        window.editDesignation = editDesignation;
        window.addNewDesignation = addNewDesignation;
        window.navigateToAdvanceView = navigateToAdvanceView;
        window.switchAdvanceView = switchAdvanceView;
        window.markChairmanSpeechDirty = markChairmanSpeechDirty;
        window.markHeadmasterSpeechDirty = markHeadmasterSpeechDirty;
        window.saveChairmanSpeech = saveChairmanSpeech;
        window.saveHeadmasterSpeech = saveHeadmasterSpeech;
        window.resetChairmanSpeechDefaults = resetChairmanSpeechDefaults;
        window.resetHeadmasterSpeechDefaults = resetHeadmasterSpeechDefaults;
        window.handleChairmanPhotoUpload = handleChairmanPhotoUpload;
        window.removeChairmanPhoto = removeChairmanPhoto;
        window.handleHeadmasterPhotoUpload = handleHeadmasterPhotoUpload;
        window.removeHeadmasterPhoto = removeHeadmasterPhoto;
        window.autoFillHeadmasterFromStaff = autoFillHeadmasterFromStaff;
        window.saveSlideItem = saveSlideItem;
        window.handleSlidePhotoUpload = handleSlidePhotoUpload;
        window.moveSlideItem = moveSlideItem;
        window.deleteSliderMgrImage = deleteSliderMgrImage;
        window.openNewSlideFormModal = openNewSlideFormModal;
        window.closeNewSlideFormModal = closeNewSlideFormModal;
        window.addNewSlideItem = addNewSlideItem;
        window.resetHomeHeroSlidesToDefault = resetHomeHeroSlidesToDefault;
        window.saveImportantLinkItem = saveImportantLinkItem;
        window.editImportantLinkItem = editImportantLinkItem;
        window.moveImportantLinkItem = moveImportantLinkItem;
        window.deleteImportantLinkItem = deleteImportantLinkItem;
        window.resetImportantLinksToDefault = resetImportantLinksToDefault;
        window.resetLinkEditForm = resetLinkEditForm;
        window.handleHeroBgUpload = handleHeroBgUpload;
        window.removeHeroBg = removeHeroBg;
        window.renderHeroBgPreview = renderHeroBgPreview;

        // Add dbSynced listener update for advance page
        window.addEventListener('dbSynced', () => {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'general';
            const activeEl = document.activeElement;

            updateDatabaseStats();
            renderHeroBgPreview();

            // General check: if the user is currently typing in an input or textarea, 
            // skip automatic UI re-rendering to prevent losing cursor focus or typed text.
            const isTypingGlobal = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
            if (isTypingGlobal) {
                return;
            }

            if (view === 'general') {
                const isTyping = activeEl && activeEl.closest('#settings-editor-form');
                if (!isTyping) {
                    loadCurrentSettings();
                }
            } else if (view === 'fee-structure') {
                const isTyping = activeEl && activeEl.closest('#fee-structure-form');
                if (!isTyping) {
                    loadClassFeesForm();
                }
            } else if (view === 'id-structure' || view === 'id-reg-structure') {
                const isTyping = activeEl && (activeEl.closest('#id-reg-structure-form') || activeEl.closest('#class-id-prefix-form'));
                if (!isTyping) {
                    loadIdRegForm();
                }
            } else if (view === 'reg-structure' || view === 'class-section-structure') {
                const isTyping = activeEl && (activeEl.closest('#add-class-form') || activeEl.closest('#add-section-form'));
                if (!isTyping) {
                    loadClasses();
                    loadClassSections();
                    renderClassSectionList();
                    populateClassDropdown();
                }
            } else if (view === 'slider-management') {
                renderSliderManagement();
                renderLogoPreview();
                renderHeroBgPreview();
                loadHeadlineSettings();
                renderTickerNotices();
                renderImportantLinksTable();
            } else if (view === 'designation-structure') {
                const isTyping = activeEl && activeEl.closest('#add-designation-form');
                if (!isTyping) {
                    renderDesignations();
                }
            } else if (view === 'speeches-management' || view === 'speech-management' || view === 'speeches') {
                const isTyping = activeEl && (activeEl.closest('#chairman-speech-form') || activeEl.closest('#headmaster-speech-form'));
                if (!isChairmanSpeechDirty && !isHeadmasterSpeechDirty && !isTyping) {
                    loadSpeechesSettings(false);
                }
            } else if (view === 'user-management') {
                // Keep UI stable without automatic polling/re-rendering on dbSynced
            }
        });

        // =========================================================================
        // --- 8. ACTIVE USERS & REAL-TIME COMMUNITY CHAT FUNCTIONS ---
        // =========================================================================
        let chatPollInterval = null;
        let cachedActiveUsers = [];

        function initChatSection() {
            fetchActiveUsers(true);
            fetchChatMessages(true);

            if (chatPollInterval) clearInterval(chatPollInterval);
            chatPollInterval = setInterval(() => {
                const subviewChat = document.getElementById('subview-chat');
                if (subviewChat && subviewChat.classList.contains('active')) {
                    fetchActiveUsers(false);
                    fetchChatMessages(false);
                }
            }, 2500);
        }

        async function fetchActiveUsers(showIndicator = false) {
            try {
                const res = await fetch('/api/active-users');
                if (!res.ok) return;
                const data = await res.json();
                cachedActiveUsers = data.users || [];
                renderActiveUsersTable(cachedActiveUsers);

                // Update summary badges
                const countBadge = document.getElementById('chat-active-count-badge');
                if (countBadge) countBadge.textContent = `${data.count || cachedActiveUsers.length} জন`;

                // Find self or local info
                const selfUser = cachedActiveUsers.find(u => u.is_self) || cachedActiveUsers[0];
                if (selfUser) {
                    const ipBadge = document.getElementById('chat-my-ip-badge');
                    if (ipBadge) ipBadge.textContent = selfUser.device_ip || '127.0.0.1';

                    const macBadge = document.getElementById('chat-my-mac-badge');
                    if (macBadge) macBadge.textContent = selfUser.mac_address || '5C:26:0A:6E:DE:C4';

                    const locBadge = document.getElementById('chat-my-location-badge');
                    if (locBadge) locBadge.textContent = selfUser.location || 'জলঢাকা, নীলফামারী';
                }
            } catch (err) {
                console.error("Error fetching active users:", err);
            }
        }

        function filterActiveUsersTable() {
            const query = (document.getElementById('chat-user-search-input')?.value || '').toLowerCase().trim();
            if (!query) {
                renderActiveUsersTable(cachedActiveUsers);
                return;
            }
            const filtered = cachedActiveUsers.filter(u => {
                const combined = `${u.user_name} ${u.role} ${u.device_name} ${u.device_ip} ${u.mac_address} ${u.location}`.toLowerCase();
                return combined.includes(query);
            });
            renderActiveUsersTable(filtered);
        }

        function formatExactJoinedTime(joinedAt, fallbackStr) {
            let dt = null;
            if (joinedAt) {
                const ms = (typeof joinedAt === 'number' && joinedAt < 10000000000) ? (joinedAt * 1000) : Number(joinedAt);
                if (!isNaN(ms) && ms > 0) {
                    dt = new Date(ms);
                }
            }
            
            if (!dt || isNaN(dt.getTime())) {
                if (fallbackStr && fallbackStr !== 'এখনই') {
                    return `<span style="font-weight: 800; color: #1e293b; font-size: 0.86rem; font-family: monospace;">⏱️ ${escapeHtml(fallbackStr)}</span>`;
                }
                dt = new Date();
            }

            // Exact 12-hour Fixed Time: e.g. 06:35:10 AM
            const timeStr = dt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            // Fixed Date: e.g. 24-08-2026
            const day = String(dt.getDate()).padStart(2, '0');
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const year = dt.getFullYear();
            const dateStr = `${day}-${month}-${year}`;

            return `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; font-family: monospace; display: inline-flex; align-items: center; gap: 4px;">
                        <span style="color: #0284c7;">⏱️</span>
                        <span>${timeStr}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
                        <span>📅 ${dateStr}</span>
                    </div>
                </div>
            `;
        }

        function renderActiveUsersTable(users) {
            const tbody = document.getElementById('chat-active-users-tbody');
            if (!tbody) return;

            if (!users || users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 24px; color: #64748b; font-weight: 600;">
                            বর্তমানে কোনো সক্রিয় ইউজার পাওয়া যায়নি।
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            users.forEach((user, idx) => {
                const isSelf = user.is_self;
                const selfBadge = isSelf ? `<span style="background: #0052ff; color: #ffffff; font-size: 0.70rem; padding: 2px 7px; border-radius: 6px; font-weight: 700; margin-left: 6px;">আপনার ডিভাইস</span>` : '';
                
                // Role styling
                let roleColor = '#0284c7';
                let roleBg = '#e0f2fe';
                let roleIcon = '👤';
                const roleStr = user.role || '';
                if (roleStr.includes('অ্যাডমিন') || roleStr.includes('প্রধান')) {
                    roleColor = '#7c3aed';
                    roleBg = '#f3e8ff';
                    roleIcon = '👑';
                } else if (roleStr.includes('শিক্ষক')) {
                    roleColor = '#059669';
                    roleBg = '#ecfdf5';
                    roleIcon = '👨‍🏫';
                } else if (roleStr.includes('শিক্ষার্থী')) {
                    roleColor = '#d97706';
                    roleBg = '#fef3c7';
                    roleIcon = '🎓';
                }

                // Device icon
                const devLower = (user.device_name || '').toLowerCase();
                const devIcon = (devLower.includes('phone') || devLower.includes('android') || devLower.includes('ios') || devLower.includes('mobile')) ? '📱' : '💻';

                // Status styling
                const isActive = user.is_active !== false && !String(user.status_text || '').includes('নিষ্ক্রিয়') && !String(user.status_text || '').includes('অফলাইন');
                const statusBadge = isActive 
                    ? `<span style="display: inline-flex; align-items: center; gap: 5px; background: #ecfdf5; color: #065f46; font-size: 0.78rem; font-weight: 800; padding: 4px 10px; border-radius: 14px; border: 1px solid #a7f3d0;">
                         <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span>
                         <span>${escapeHtml(user.status_text || '🟢 এখন সক্রিয়')}</span>
                       </span>`
                    : `<span style="display: inline-flex; align-items: center; gap: 5px; background: #fef2f2; color: #991b1b; font-size: 0.78rem; font-weight: 800; padding: 4px 10px; border-radius: 14px; border: 1px solid #fecaca;">
                         <span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444;"></span>
                         <span>${escapeHtml(user.status_text || '🔴 নিষ্ক্রিয় (লগআউট)')}</span>
                       </span>`;

                const joinedTimeHtml = formatExactJoinedTime(user.joined_at, user.joined_time || user.joined_time_formatted);

                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${!isActive ? 'opacity: 0.78; background: #fafafa;' : (isSelf ? 'background: #f0f7ff;' : '')}">
                        <td style="padding: 12px 14px; text-align: center; font-weight: 800; color: #334155;">
                            ${idx + 1}
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 34px; height: 34px; border-radius: 50%; background: ${roleBg}; color: ${roleColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; border: 1.5px solid ${roleColor}; flex-shrink: 0;">
                                    ${roleIcon}
                                </div>
                                <div>
                                    <div style="font-weight: 800; color: #0f172a; font-size: 0.92rem; display: flex; align-items: center; flex-wrap: wrap;">
                                        <span>${escapeHtml(user.user_name || 'স্কুল সদস্য')}</span>
                                        ${selfBadge}
                                    </div>
                                    <span style="display: inline-block; background: ${roleBg}; color: ${roleColor}; font-size: 0.72rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">
                                        ${escapeHtml(user.role || 'সদস্য')}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                                <span>${devIcon}</span>
                                <span>${escapeHtml(user.device_name || 'Personal Computer')}</span>
                            </div>
                            <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">পৃষ্ঠা: ${escapeHtml(user.page || 'Home')}</span>
                        </td>
                        <td style="padding: 12px 14px;">
                            <span style="font-family: monospace; font-size: 0.88rem; font-weight: 800; color: #0052ff; background: #eff6ff; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #bfdbfe; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,82,255,0.08);">
                                <span>🌐</span>
                                <span>${escapeHtml(user.device_ip || '192.168.0.107')}</span>
                            </span>
                        </td>
                        <td style="padding: 12px 14px;">
                            <span style="font-family: monospace; font-size: 0.84rem; font-weight: 800; color: #7c3aed; background: #faf5ff; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #e9d5ff; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(124,58,237,0.08);">
                                <span>🏷️</span>
                                <span>${escapeHtml(user.mac_address || '38:59:F9:2B:15:83')}</span>
                            </span>
                        </td>
                        <td style="padding: 12px 14px;">
                            ${joinedTimeHtml}
                        </td>
                        <td style="padding: 12px 14px;">
                            <span style="font-size: 0.88rem; font-weight: 700; color: #92400e; display: inline-flex; align-items: center; gap: 4px;">
                                <span>📍</span>
                                <span>${escapeHtml(user.location || 'জলঢাকা, নীলফামারী')}</span>
                            </span>
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                            ${statusBadge}
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                            <button type="button" class="btn-outline" onclick="mentionUserInChat('${escapeJsString(user.user_name)}')" style="padding: 5px 10px; font-size: 0.78rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                                <span>💬 চ্যাট</span>
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        function escapeJsString(str) {
            if (!str) return '';
            return str.replace(/['"\\]/g, '');
        }

        function mentionUserInChat(userName) {
            const input = document.getElementById('chat-msg-input');
            if (input) {
                input.value = `@${userName} `;
                input.focus();
                document.getElementById('live-chat-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // --- REALTIME USER ACTIVITY & DATA UPDATE LOG FUNCTIONS ---
        let cachedActivityLogs = [];

        async function fetchActivityLogs(showToast = false) {
            try {
                const res = await fetch('/api/activity-logs');
                if (!res.ok) return;
                const data = await res.json();
                cachedActivityLogs = data.logs || data.messages || [];
                renderActivityLogsTable(cachedActivityLogs);
                if (showToast) {
                    showToastNotification("কার্যক্রম ও আপডেট লগ সফলভাবে রিফ্রেশ হয়েছে!");
                }
            } catch (e) {
                console.error("Error loading activity logs:", e);
            }
        }

        function renderActivityLogsTable(logs) {
            const tbody = document.getElementById('activity-logs-table-body');
            const countBadge = document.getElementById('activity-log-count-badge');
            if (!tbody) return;

            if (countBadge) {
                countBadge.textContent = `${logs ? logs.length : 0} টি লগ`;
            }

            if (!logs || logs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px 20px; color: #94a3b8; font-weight: 600;">
                            <div style="font-size: 2.2rem; margin-bottom: 8px;">📝</div>
                            <div>এখনো কোনো কার্যক্রম বা ডাটা পরিবর্তন লগ পাওয়া যায়নি। ইউজারগণ ওয়েবসাইট আপডেট করলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।</div>
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            logs.forEach((log, idx) => {
                // Role Badge & Colors
                let roleColor = '#0284c7';
                let roleBg = '#e0f2fe';
                let roleIcon = '👤';
                const roleStr = log.role || '';
                if (roleStr.includes('অ্যাডমিন') || roleStr.includes('প্রধান')) {
                    roleColor = '#7c3aed';
                    roleBg = '#f3e8ff';
                    roleIcon = '👑';
                } else if (roleStr.includes('শিক্ষক')) {
                    roleColor = '#059669';
                    roleBg = '#ecfdf5';
                    roleIcon = '👨‍🏫';
                } else if (roleStr.includes('শিক্ষার্থী')) {
                    roleColor = '#d97706';
                    roleBg = '#fef3c7';
                    roleIcon = '🎓';
                }

                // Module Icon & Style
                const mod = log.module || 'সিস্টেম';
                let modBg = '#f1f5f9';
                let modColor = '#334155';
                let modIcon = '⚙️';
                if (mod.includes('লগইন') || mod.includes('সেশন')) {
                    modBg = '#e0e7ff'; modColor = '#3730a3'; modIcon = '🚪';
                } else if (mod.includes('বিদ্যালয়') || mod.includes('সেটিংস')) {
                    modBg = '#fef3c7'; modColor = '#92400e'; modIcon = '🏫';
                } else if (mod.includes('শিক্ষক') || mod.includes('স্টাফ')) {
                    modBg = '#ecfdf5'; modColor = '#065f46'; modIcon = '👨‍🏫';
                } else if (mod.includes('নোটিশ')) {
                    modBg = '#fee2e2'; modColor = '#991b1b'; modIcon = '📢';
                } else if (mod.includes('শিক্ষার্থী') || mod.includes('হাজিরা')) {
                    modBg = '#fef9c3'; modColor = '#854d0e'; modIcon = '🎓';
                } else if (mod.includes('পারমিশন') || mod.includes('ইউজার')) {
                    modBg = '#fae8ff'; modColor = '#86198f'; modIcon = '🔑';
                } else if (mod.includes('স্লাইডার') || mod.includes('ছবি')) {
                    modBg = '#e0f2fe'; modColor = '#075985'; modIcon = '🖼️';
                } else if (mod.includes('বাণী')) {
                    modBg = '#ffedd5'; modColor = '#9a3412'; modIcon = '📜';
                } else if (mod.includes('লিংক')) {
                    modBg = '#f0fdf4'; modColor = '#166534'; modIcon = '🔗';
                }

                const timeHtml = formatExactJoinedTime(log.timestamp, log.time_formatted);

                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 12px 14px; text-align: center; font-weight: 800; color: #64748b;">
                            ${idx + 1}
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${roleBg}; color: ${roleColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; border: 1.5px solid ${roleColor}; flex-shrink: 0;">
                                    ${roleIcon}
                                </div>
                                <div>
                                    <div style="font-weight: 800; color: #0f172a; font-size: 0.90rem;">
                                        ${escapeHtml(log.user_name || 'স্কুল ব্যবহারকারী')}
                                    </div>
                                    <span style="display: inline-block; background: ${roleBg}; color: ${roleColor}; font-size: 0.72rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">
                                        ${escapeHtml(log.role || 'সদস্য')}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <span style="display: inline-flex; align-items: center; gap: 5px; background: ${modBg}; color: ${modColor}; font-size: 0.80rem; font-weight: 800; padding: 4px 9px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.06);">
                                <span>${modIcon}</span>
                                <span>${escapeHtml(mod)}</span>
                            </span>
                            <div style="font-size: 0.76rem; color: #64748b; font-weight: 700; margin-top: 3px;">
                                ${escapeHtml(log.action || 'আপডেট')}
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="font-size: 0.88rem; font-weight: 600; color: #1e293b; line-height: 1.45; word-break: break-word;">
                                ${escapeHtml(log.details || 'তথ্য আপডেট সম্পন্ন হয়েছে')}
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-family: monospace; font-size: 0.80rem; font-weight: 800; color: #0052ff; background: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; display: inline-flex; align-items: center; gap: 4px; width: fit-content;">
                                    <span>🌐</span>
                                    <span>${escapeHtml(log.device_ip || '192.168.0.107')}</span>
                                </span>
                                <span style="font-family: monospace; font-size: 0.76rem; font-weight: 800; color: #7c3aed; background: #faf5ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e9d5ff; display: inline-flex; align-items: center; gap: 4px; width: fit-content;">
                                    <span>🏷️</span>
                                    <span>${escapeHtml(log.mac_address || '38:59:F9:2B:15:83')}</span>
                                </span>
                                <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">
                                    💻 ${escapeHtml(log.device_name || 'PC')}
                                </span>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            ${timeHtml}
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                            <span style="display: inline-flex; align-items: center; gap: 4px; background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 12px; border: 1px solid #a7f3d0;">
                                <span>✅</span>
                                <span>সফল</span>
                            </span>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        function filterActivityLogsTable() {
            const query = (document.getElementById('search-activity-logs-input')?.value || '').toLowerCase().trim();
            const modFilter = (document.getElementById('filter-activity-module-select')?.value || '').trim();

            const filtered = cachedActivityLogs.filter(log => {
                const matchMod = !modFilter || (log.module && log.module.includes(modFilter));
                const text = `${log.user_name || ''} ${log.role || ''} ${log.module || ''} ${log.action || ''} ${log.details || ''} ${log.device_ip || ''} ${log.mac_address || ''}`.toLowerCase();
                const matchQuery = !query || text.includes(query);
                return matchMod && matchQuery;
            });

            renderActivityLogsTable(filtered);
        }

        async function confirmClearActivityLogs() {
            if (!confirm("আপনি কি সত্যিই সকল কার্যক্রম ও ডাটা আপডেট লগ মুছে ফেলতে চান?")) return;
            try {
                const res = await fetch('/api/activity-logs/clear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
                if (res.ok) {
                    cachedActivityLogs = [];
                    renderActivityLogsTable([]);
                    showToastNotification("সকল কার্যক্রম লগ সফলভাবে মুছে ফেলা হয়েছে!");
                }
            } catch (e) {
                console.error("Error clearing logs:", e);
            }
        }

        function exportActivityLogs() {
            if (!cachedActivityLogs || cachedActivityLogs.length === 0) {
                alert("এক্সপোর্ট করার মতো কোনো লগ পাওয়া যায়নি!");
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cachedActivityLogs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `school_activity_logs_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        // --- PROFILE MODAL FUNCTIONS ---
        function openEditProfileModal() {
            const modal = document.getElementById('chat-profile-modal');
            if (modal) {
                const nameInput = document.getElementById('edit-profile-name');
                const roleSelect = document.getElementById('edit-profile-role');
                const distInput = document.getElementById('edit-profile-district');

                if (nameInput) nameInput.value = localStorage.getItem('school_user_name') || 'প্রধান শিক্ষক (অ্যাডমিন)';
                if (roleSelect) roleSelect.value = localStorage.getItem('school_user_role') || 'প্রধান শিক্ষক / অ্যাডমিন';
                if (distInput) distInput.value = localStorage.getItem('school_user_district') || 'নীলফামারী (জলঢাকা)';

                modal.style.display = 'flex';
            }
        }

        function closeEditProfileModal() {
            const modal = document.getElementById('chat-profile-modal');
            if (modal) modal.style.display = 'none';
        }

        function saveUserProfile(event) {
            event.preventDefault();
            const name = document.getElementById('edit-profile-name')?.value?.trim();
            const role = document.getElementById('edit-profile-role')?.value?.trim();
            const dist = document.getElementById('edit-profile-district')?.value?.trim();

            if (name) localStorage.setItem('school_user_name', name);
            if (role) localStorage.setItem('school_user_role', role);
            if (dist) localStorage.setItem('school_user_district', dist);

            closeEditProfileModal();
            showToastNotification("প্রোফাইল তথ্য সফলভাবে সেভ হয়েছে!");

            if (window.sendSchoolHeartbeat) {
                window.sendSchoolHeartbeat();
            }
            setTimeout(() => {
                fetchActiveUsers(true);
            }, 300);
        }

        // =========================================================================
        // --- 9. STAFF USER ACCOUNTS & LOGIN MANAGER FUNCTIONS ---
        // =========================================================================
        let cachedStaffUsers = [];
        let lastKnownStaffJson = "";

        // --- ROLE & PERMISSIONS MATRIX FUNCTIONS ---
        let isPermissionsPanelExpanded = true;

        function togglePermissionsPanel() {
            const card = document.getElementById('permissions-matrix-card');
            const icon = document.getElementById('perm-toggle-icon');
            const text = document.getElementById('perm-toggle-text');
            if (!card) return;
            if (card.style.display === 'none') {
                card.style.display = 'block';
                if (icon) icon.textContent = '🔼';
                if (text) text.textContent = 'লুকান';
                isPermissionsPanelExpanded = true;
            } else {
                card.style.display = 'none';
                if (icon) icon.textContent = '⚙️';
                if (text) text.textContent = 'পারমিশন কাস্টমাইজ';
                isPermissionsPanelExpanded = false;
            }
        }

        function renderPermissionsMatrix() {
            const wrapper = document.getElementById('permissions-grid-wrapper');
            if (!wrapper) return;

            const categories = window.PERMISSION_CATEGORIES || [];
            const permissions = window.ALL_PERMISSIONS || [];

            let html = `
                <div class="perm-table-container">
                    <table class="perm-matrix-table">
                        <thead>
                            <tr>
                                <th style="width: 44px; text-align: center;">সিলেক্ট</th>
                                <th style="width: 240px;">মডিউল ও সাব-অপশন</th>
                                <th>কার্যপরিধি ও সুবিধা (বিবরণ)</th>
                                <th style="width: 110px; text-align: center;">স্ট্যাটাস</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            categories.forEach((cat) => {
                const catPerms = permissions.filter(p => p.category === cat.id);
                if (catPerms.length === 0) return;
                const catColor = cat.color || '#0052ff';

                // Category Header Row
                html += `
                    <tr class="perm-category-header-row is-expanded" data-category="${escapeHtml(cat.id)}" id="cat-block-${escapeHtml(cat.id)}" style="background: ${catColor}15;" onclick="toggleSingleCategoryAccordion('${escapeHtml(cat.id)}')">
                        <td style="text-align: center;" onclick="event.stopPropagation()">
                            <input type="checkbox" class="perm-cat-select-all" data-category="${escapeHtml(cat.id)}" onchange="toggleCategoryPermissions('${escapeHtml(cat.id)}', this.checked)" style="cursor: pointer; width: 15px; height: 15px; accent-color: ${catColor};" title="এই মডিউলের সব সাব-অপশন সিলেক্ট/আনসিলেক্ট করুন">
                        </td>
                        <td colspan="2">
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span id="cat-arrow-${escapeHtml(cat.id)}" class="cat-toggle-arrow" style="color: ${catColor};">▼</span>
                                    <strong style="font-size: 0.90rem; color: ${catColor} !important;">${escapeHtml(cat.name)}</strong>
                                </div>
                                <span id="cat-badge-${escapeHtml(cat.id)}" class="cat-count-badge" style="color: ${catColor} !important; border-color: ${catColor}40;">
                                    0 / ${catPerms.length} টি সক্রিয়
                                </span>
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <span style="font-size: 0.70rem; font-weight: 700; color: #475569; background: #ffffff; padding: 2px 7px; border-radius: 4px; border: 1px solid #cbd5e1;">
                                টগল ভিউ
                            </span>
                        </td>
                    </tr>
                `;

                // Sub-options Rows
                catPerms.forEach((p) => {
                    html += `
                        <tr class="perm-row-item perm-cat-child-${escapeHtml(cat.id)}" data-perm-id="${escapeHtml(p.id)}" data-cat-id="${escapeHtml(cat.id)}" data-cat-color="${escapeHtml(catColor)}" onclick="handleTableRowClick(event, '${escapeHtml(p.id)}')">
                            <td style="text-align: center;" onclick="event.stopPropagation()">
                                <input type="checkbox" class="perm-checkbox" id="perm-cb-${escapeHtml(p.id)}" value="${escapeHtml(p.id)}" data-category="${escapeHtml(cat.id)}" onchange="handleSinglePermissionChange()" style="cursor: pointer; width: 15px; height: 15px; accent-color: ${catColor};">
                            </td>
                            <td style="font-weight: 750; color: #0f172a !important;">
                                <div style="display: flex; align-items: center; gap: 7px;">
                                    <span style="color: ${catColor}; font-size: 0.75rem;">🔹</span>
                                    <span class="perm-row-name" style="font-size: 0.82rem;">${escapeHtml(p.name)}</span>
                                </div>
                            </td>
                            <td class="perm-row-desc" style="color: #475569 !important; font-size: 0.75rem; line-height: 1.35;">
                                ${escapeHtml(p.desc)}
                            </td>
                            <td style="text-align: center;">
                                <span id="perm-status-${escapeHtml(p.id)}" class="perm-status-badge inactive">
                                    ⚪ বন্ধ
                                </span>
                            </td>
                        </tr>
                    `;
                });
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            wrapper.innerHTML = html;
            syncOptionCardVisuals();
            updatePermissionsCounter();
        }

        function handleTableRowClick(event, permId) {
            if (event.target && event.target.classList.contains('perm-checkbox')) return;
            const cb = document.getElementById(`perm-cb-${permId}`);
            if (cb) {
                cb.checked = !cb.checked;
                handleSinglePermissionChange();
            }
        }

        function syncOptionCardVisuals() {
            const rows = document.querySelectorAll('.perm-row-item');
            rows.forEach(row => {
                const cb = row.querySelector('.perm-checkbox');
                const permId = cb?.value;
                const statusBadge = document.getElementById(`perm-status-${permId}`);
                const color = row.getAttribute('data-cat-color') || '#0052ff';

                if (cb && cb.checked) {
                    row.classList.add('active');
                    row.style.background = color + '12';
                    if (statusBadge) {
                        statusBadge.className = 'perm-status-badge active';
                        statusBadge.innerHTML = '🟢 সক্রিয়';
                    }
                } else {
                    row.classList.remove('active');
                    row.style.background = '#ffffff';
                    if (statusBadge) {
                        statusBadge.className = 'perm-status-badge inactive';
                        statusBadge.innerHTML = '⚪ বন্ধ';
                    }
                }
            });
        }

        function toggleSingleCategoryAccordion(catId) {
            const childRows = document.querySelectorAll(`.perm-cat-child-${catId}`);
            const headerRow = document.getElementById(`cat-block-${catId}`);
            const arrow = document.getElementById(`cat-arrow-${catId}`);
            if (childRows.length === 0) return;

            const firstChild = childRows[0];
            const isHidden = (firstChild.style.display === 'none');

            if (isHidden) {
                childRows.forEach(row => row.style.display = '');
                if (headerRow) headerRow.classList.add('is-expanded');
                if (arrow) arrow.textContent = '▼';
            } else {
                childRows.forEach(row => row.style.display = 'none');
                if (headerRow) headerRow.classList.remove('is-expanded');
                if (arrow) arrow.textContent = '▶';
            }
        }

        function toggleAllCategoriesAccordion(expandAll = true) {
            const categories = window.PERMISSION_CATEGORIES || [];
            categories.forEach(cat => {
                const childRows = document.querySelectorAll(`.perm-cat-child-${cat.id}`);
                const headerRow = document.getElementById(`cat-block-${cat.id}`);
                const arrow = document.getElementById(`cat-arrow-${cat.id}`);
                if (childRows.length === 0) return;

                if (expandAll) {
                    childRows.forEach(row => row.style.display = '');
                    if (headerRow) headerRow.classList.add('is-expanded');
                    if (arrow) arrow.textContent = '▼';
                } else {
                    childRows.forEach(row => row.style.display = 'none');
                    if (headerRow) headerRow.classList.remove('is-expanded');
                    if (arrow) arrow.textContent = '▶';
                }
            });
        }

        function getSelectedPermissionIds() {
            const checkedBoxes = document.querySelectorAll('.perm-checkbox:checked');
            return Array.from(checkedBoxes).map(cb => cb.value);
        }

        function setSelectedPermissions(permIds = []) {
            const allCheckboxes = document.querySelectorAll('.perm-checkbox');
            allCheckboxes.forEach(cb => {
                cb.checked = permIds.includes(cb.value);
            });
            syncOptionCardVisuals();
            updateCategoryCheckboxesState();
            updatePermissionsCounter();
        }

        function updateCategoryCheckboxesState() {
            const catAllBoxes = document.querySelectorAll('.perm-cat-select-all');
            catAllBoxes.forEach(catBox => {
                const catId = catBox.getAttribute('data-category');
                const childCheckboxes = Array.from(document.querySelectorAll(`.perm-checkbox[data-category="${catId}"]`));
                if (childCheckboxes.length === 0) return;
                const checkedCount = childCheckboxes.filter(cb => cb.checked).length;
                const allChecked = checkedCount === childCheckboxes.length;
                const someChecked = checkedCount > 0;
                catBox.checked = allChecked;
                catBox.indeterminate = someChecked && !allChecked;

                const badge = document.getElementById(`cat-badge-${catId}`);
                if (badge) {
                    badge.textContent = `${checkedCount} / ${childCheckboxes.length} টি সক্রিয়`;
                    if (allChecked) {
                        badge.style.background = '#dcfce7';
                        badge.style.color = '#166534';
                        badge.style.borderColor = '#86efac';
                    } else if (someChecked) {
                        badge.style.background = '#e0e7ff';
                        badge.style.color = '#3730a3';
                        badge.style.borderColor = '#c7d2fe';
                    } else {
                        badge.style.background = '#f1f5f9';
                        badge.style.color = '#64748b';
                        badge.style.borderColor = '#cbd5e1';
                    }
                }
            });
        }

        function toggleCategoryPermissions(catId, isChecked) {
            const childCheckboxes = document.querySelectorAll(`.perm-checkbox[data-category="${catId}"]`);
            childCheckboxes.forEach(cb => {
                cb.checked = isChecked;
            });
            syncOptionCardVisuals();
            handleSinglePermissionChange();
        }

        function selectAllPermissions(shouldSelectAll) {
            const allCheckboxes = document.querySelectorAll('.perm-checkbox');
            allCheckboxes.forEach(cb => {
                cb.checked = shouldSelectAll;
            });
            syncOptionCardVisuals();
            updateCategoryCheckboxesState();
            updatePermissionsCounter();
            const roleSelect = document.getElementById('usr-role');
            if (roleSelect) {
                roleSelect.value = shouldSelectAll ? 'admin' : 'custom';
            }
        }

        function resetPermissionsToCurrentRole() {
            const roleSelect = document.getElementById('usr-role');
            const role = roleSelect?.value || 'teacher';
            const presets = window.ROLE_DEFAULT_PRESETS || {};
            const rolePerms = presets[role] || presets['teacher'] || [];
            setSelectedPermissions(rolePerms);
            if (typeof showToastNotification === 'function') {
                showToastNotification("পারমিশনগুলো ডিফল্ট রোলে রিসেট করা হয়েছে!");
            }
        }

        function handleRoleSelectionChange() {
            const roleSelect = document.getElementById('usr-role');
            if (!roleSelect) return;
            const role = roleSelect.value;
            const presets = window.ROLE_DEFAULT_PRESETS || {};
            if (role === 'custom') {
                updatePermissionsCounter();
                return;
            }
            const rolePerms = presets[role] || presets['teacher'] || [];
            setSelectedPermissions(rolePerms);
        }

        function handleSinglePermissionChange() {
            syncOptionCardVisuals();
            updateCategoryCheckboxesState();
            updatePermissionsCounter();
            const currentSelected = getSelectedPermissionIds();
            const presets = window.ROLE_DEFAULT_PRESETS || {};
            let matchedRole = null;
            for (const [r, list] of Object.entries(presets)) {
                if (r === 'custom') continue;
                if (list.length === currentSelected.length && list.every(p => currentSelected.includes(p))) {
                    matchedRole = r;
                    break;
                }
            }
            const roleSelect = document.getElementById('usr-role');
            if (roleSelect) {
                if (matchedRole) {
                    roleSelect.value = matchedRole;
                } else {
                    roleSelect.value = 'custom';
                }
            }
        }

        function updatePermissionsCounter() {
            const count = document.querySelectorAll('.perm-checkbox:checked').length;
            const total = (window.ALL_PERMISSIONS || []).length || 36;
            const badge = document.getElementById('perm-selected-badge');
            if (badge) {
                badge.textContent = `${count} / ${total} টি নির্বাচিত`;
                if (count === total) {
                    badge.style.background = '#dcfce7';
                    badge.style.color = '#166534';
                } else if (count === 0) {
                    badge.style.background = '#fee2e2';
                    badge.style.color = '#991b1b';
                } else {
                    badge.style.background = '#e0e7ff';
                    badge.style.color = '#3730a3';
                }
            }
        }

        function filterPermissionsMatrix() {
            const query = (document.getElementById('perm-search-input')?.value || '').toLowerCase().trim();
            const categories = window.PERMISSION_CATEGORIES || [];

            if (!query) {
                document.querySelectorAll('.perm-row-item').forEach(el => el.style.display = '');
                document.querySelectorAll('.perm-category-header-row').forEach(cat => cat.style.display = '');
                return;
            }

            categories.forEach(cat => {
                const childRows = document.querySelectorAll(`.perm-cat-child-${cat.id}`);
                const headerRow = document.getElementById(`cat-block-${cat.id}`);
                const arrow = document.getElementById(`cat-arrow-${cat.id}`);
                let hasVisible = false;

                childRows.forEach(row => {
                    const name = row.querySelector('.perm-row-name')?.textContent.toLowerCase() || '';
                    const desc = row.querySelector('.perm-row-desc')?.textContent.toLowerCase() || '';
                    if (name.includes(query) || desc.includes(query)) {
                        row.style.display = '';
                        hasVisible = true;
                    } else {
                        row.style.display = 'none';
                    }
                });

                if (headerRow) {
                    headerRow.style.display = hasVisible ? '' : 'none';
                    if (hasVisible) {
                        headerRow.classList.add('is-expanded');
                        if (arrow) arrow.textContent = '▼';
                    }
                }
            });
        }

        function showUserPermissionsModal(mobile) {
            activeModalMobile = mobile;
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const user = users.find(u => u.mobile === mobile);
            if (!user) return;

            const modal = document.getElementById('user-permissions-view-modal');
            const nameEl = document.getElementById('perm-modal-user-name');
            const roleEl = document.getElementById('perm-modal-user-role');
            const bodyEl = document.getElementById('perm-modal-body');
            const summaryEl = document.getElementById('perm-modal-count-summary');

            if (!modal || !bodyEl) return;

            const safeMob = escapeJsString(user.mobile || '');
            if (nameEl) nameEl.textContent = `${user.name || 'শিক্ষক'} (${user.mobile || ''})`;
            if (roleEl) roleEl.textContent = `পদবী: ${user.designation || 'সহকারী শিক্ষক'} • ভূমিকা: ${user.role || 'teacher'}`;

            const perms = window.getUserPermissions ? window.getUserPermissions(user) : (user.permissions || []);
            const allPerms = window.ALL_PERMISSIONS || [];
            const categories = window.PERMISSION_CATEGORIES || [];

            let html = `
                <div class="perm-table-container" style="max-height: 380px;">
                    <table class="perm-matrix-table">
                        <thead>
                            <tr>
                                <th style="width: 40px; text-align: center;">#</th>
                                <th style="width: 230px;">মডিউল ও অনুমোদিত পারমিশন</th>
                                <th>কার্যপরিধি ও ক্ষমতা</th>
                                <th style="width: 100px; text-align: center;">অনুমোদন</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            let serialNo = 1;
            let hasAnyPerm = false;

            categories.forEach(cat => {
                const catPerms = allPerms.filter(p => p.category === cat.id);
                const userCatPerms = catPerms.filter(p => perms.includes(p.id));
                const catColor = cat.color || '#0052ff';

                if (userCatPerms.length > 0) {
                    hasAnyPerm = true;
                    html += `
                        <tr style="background: ${catColor}15;">
                            <td colspan="4" style="padding: 8px 12px; font-weight: 800; color: ${catColor} !important; border-top: 1.5px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>${escapeHtml(cat.name)}</span>
                                    <span style="background: #ffffff; color: ${catColor} !important; font-size: 0.70rem; padding: 2px 8px; border-radius: 10px; border: 1px solid #cbd5e1;">${userCatPerms.length} / ${catPerms.length} টি অনুমোদিত</span>
                                </div>
                            </td>
                        </tr>
                    `;

                    userCatPerms.forEach(p => {
                        html += `
                            <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                                <td style="text-align: center; font-weight: 700; color: #64748b; font-size: 0.75rem;">${serialNo++}</td>
                                <td style="font-weight: 750; color: #0f172a !important;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="color: ${catColor}; font-size: 0.75rem;">🔹</span>
                                        <span>${escapeHtml(p.name)}</span>
                                    </div>
                                </td>
                                <td style="color: #475569 !important; font-size: 0.75rem; line-height: 1.35;">${escapeHtml(p.desc)}</td>
                                <td style="text-align: center;">
                                    <span class="perm-status-badge active" style="font-size: 0.68rem;">🟢 সক্রিয়</span>
                                </td>
                            </tr>
                        `;
                    });
                }
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            if (!hasAnyPerm) {
                html = '<div style="text-align: center; color: #64748b; padding: 25px; font-weight: 600;">⚠️ এই ব্যবহারকারীর জন্য কোনো পারমিশন নির্ধারিত নেই।</div>';
            }

            bodyEl.innerHTML = html;
            if (summaryEl) {
                summaryEl.innerHTML = `মোট সক্রিয় পারমিশন: <b style="color: #0052ff;">${perms.length} / ${allPerms.length} টি</b>`;
            }

            modal.style.display = 'flex';
        }

        function closeUserPermissionsModal() {
            const modal = document.getElementById('user-permissions-view-modal');
            if (modal) modal.style.display = 'none';
        }

        async function initUserManagementSection() {
            renderPermissionsMatrix();
            const editId = document.getElementById('usr-edit-id')?.value;
            if (!editId) {
                const currentRole = document.getElementById('usr-role')?.value || 'teacher';
                const presets = window.ROLE_DEFAULT_PRESETS || {};
                setSelectedPermissions(presets[currentRole] || presets['teacher'] || []);
            }
            await populateStaffSelectDropdown(false);
            await renderPendingStaffApprovals(false);
            renderStaffUsersTable();
            updateUserManagementStats();
        }

        function getPendingStaffApprovalsList() {
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            const pending = [];
            staffList.forEach((staff, index) => {
                const rawMob = (staff.mobile || staff.phone || staff.contact || staff.cell || '').toString().trim();
                const cleanMob = rawMob.replace(/[^0-9]/g, '');
                const staffId = (staff.staffId || '').toString().trim();

                // Match existing user in school_users
                const existingUser = users.find(u => {
                    const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
                    const uName = (u.username || '').replace(/[^0-9]/g, '');
                    return (cleanMob && uMob === cleanMob) || (cleanMob && uName === cleanMob) || (staffId && u.staffId === staffId);
                });

                // If not in school_users OR explicitly unapproved / pending
                if (!existingUser || existingUser.isApproved === false || existingUser.status === 'pending_approval' || existingUser.status === 'pending') {
                    pending.push({
                        staff: staff,
                        index: index,
                        rawMob: rawMob,
                        cleanMob: cleanMob,
                        staffId: staffId,
                        existingUser: existingUser || null
                    });
                }
            });

            return pending;
        }

        async function renderPendingStaffApprovals(forceRefresh = false) {
            if (forceRefresh) {
                try {
                    const res = await fetch('/api/db');
                    if (res.ok) {
                        const dbData = await res.json();
                        if (dbData && dbData.school_staff) {
                            localStorage.setItem('school_staff', dbData.school_staff);
                        }
                        if (dbData && dbData.school_users) {
                            localStorage.setItem('school_users', dbData.school_users);
                        }
                    }
                } catch (e) {}
            }

            const tbody = document.getElementById('pending-staff-table-tbody');
            const badgeCountEl = document.getElementById('pending-approval-badge-count');
            const statPendingEl = document.getElementById('user-mgmt-pending-count');
            const approveAllBtn = document.getElementById('approve-all-pending-btn');

            const pendingList = getPendingStaffApprovalsList();

            if (badgeCountEl) {
                badgeCountEl.textContent = `${pendingList.length} জন অপেক্ষমান`;
                badgeCountEl.style.background = pendingList.length > 0 ? '#fef3c7' : '#ecfdf5';
                badgeCountEl.style.color = pendingList.length > 0 ? '#b45309' : '#065f46';
                badgeCountEl.style.borderColor = pendingList.length > 0 ? '#fcd34d' : '#a7f3d0';
            }
            if (statPendingEl) {
                statPendingEl.textContent = `${pendingList.length} জন`;
                statPendingEl.style.color = pendingList.length > 0 ? '#d97706' : '#10b981';
            }
            if (approveAllBtn) {
                approveAllBtn.disabled = pendingList.length === 0;
                approveAllBtn.style.opacity = pendingList.length === 0 ? '0.6' : '1';
                approveAllBtn.style.cursor = pendingList.length === 0 ? 'not-allowed' : 'pointer';
            }

            if (!tbody) return;

            if (pendingList.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 26px 16px; color: #166534; font-weight: 700; background: #f0fdf4;">
                            <div style="font-size: 1.6rem; margin-bottom: 6px;">✨</div>
                            <div style="font-size: 0.96rem; font-weight: 800; color: #15803d; margin-bottom: 3px;">বর্তমানে কোনো অনুমোদন অপেক্ষমান শিক্ষক বা কর্মচারী নেই!</div>
                            <div style="font-size: 0.82rem; color: #166534; font-weight: 600;">স্টাফ ডিরেক্টরির সকল শিক্ষক-কর্মচারীর ইউজার অ্যাকাউন্ট প্রস্তুত ও সক্রিয় রয়েছে।</div>
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            pendingList.forEach((item, pIdx) => {
                const staff = item.staff;
                const name = (staff.name || staff.nameBn || 'শিক্ষক সদস্য').trim();
                const nameBn = (staff.nameBn || '').trim();
                const designation = (staff.designation || staff.designationBn || 'সহকারী শিক্ষক').trim();
                const department = (staff.department || staff.dept || '').trim();
                const category = staff.category || 'Teacher';
                const mobile = item.rawMob || 'মোবাইল নম্বর নেই';
                const staffId = staff.staffId || 'ID নেই';
                const photo = staff.photo || '';

                // Auto-detect default role
                let autoRole = 'teacher';
                const des = designation.toLowerCase();
                if (des.includes('প্রধান') || des.includes('head') || des.includes('admin') || des.includes('principal')) autoRole = 'admin';
                else if (des.includes('হিসাব') || des.includes('account') || des.includes('cash') || des.includes('ক্যাশ')) autoRole = 'accountant';
                else if (des.includes('পরীক্ষা') || des.includes('exam') || des.includes('controller')) autoRole = 'exam_incharge';
                else if (des.includes('সিট') || des.includes('seat')) autoRole = 'seat_incharge';
                else if (category === 'Staff' || des.includes('অফিস') || des.includes('কম্পিউটার') || des.includes('সহকারী') || des.includes('clerk') || des.includes('operator')) autoRole = 'staff';

                const photoHtml = photo
                    ? `<img src="${photo}" alt="${escapeHtml(name)}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid #cbd5e1; flex-shrink: 0;">`
                    : `<div style="width: 38px; height: 38px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; border: 1.5px solid #fcd34d; flex-shrink: 0;">👤</div>`;

                const safeStaffIdOrMob = escapeJsString(staff.staffId || item.rawMob || `idx_${item.index}`);

                html += `
                    <tr style="border-bottom: 1px solid #fde68a; background: ${pIdx % 2 === 0 ? '#ffffff' : '#fffdfa'};">
                        <td style="padding: 10px 12px; text-align: center; font-weight: 800; color: #92400e;">
                            ${pIdx + 1}
                        </td>
                        <td style="padding: 10px 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${photoHtml}
                                <div>
                                    <div style="font-weight: 800; color: #0f172a; font-size: 0.92rem;">
                                        ${escapeHtml(name)}
                                        ${nameBn && nameBn !== name ? `<span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">(${escapeHtml(nameBn)})</span>` : ''}
                                    </div>
                                    <span style="font-size: 0.75rem; color: #2563eb; font-weight: 700; background: #eff6ff; padding: 1px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
                                        ID: ${escapeHtml(staffId)}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 10px 12px;">
                            <div style="font-weight: 700; color: #1e293b; font-size: 0.86rem;">
                                ${escapeHtml(designation)}
                            </div>
                            ${department ? `<div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">বিভাগ: ${escapeHtml(department)}</div>` : ''}
                        </td>
                        <td style="padding: 10px 12px;">
                            <span style="font-family: monospace; font-size: 0.88rem; font-weight: 800; color: #0052ff; background: #eff6ff; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">
                                📱 ${escapeHtml(mobile)}
                            </span>
                        </td>
                        <td style="padding: 10px 12px;">
                            <select id="pending-role-${pIdx}" class="form-control" style="font-size: 0.82rem; font-weight: 700; padding: 5px 8px; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #ffffff;">
                                <option value="teacher" ${autoRole === 'teacher' ? 'selected' : ''}>👨‍🏫 সহকারী শিক্ষক (তথ্য, মার্কস, রুটিন)</option>
                                <option value="admin" ${autoRole === 'admin' ? 'selected' : ''}>👑 প্রধান শিক্ষক / পূর্ণ অ্যাডমিন</option>
                                <option value="accountant" ${autoRole === 'accountant' ? 'selected' : ''}>💼 হিসাবরক্ষক / ফি ইনচার্জ</option>
                                <option value="exam_incharge" ${autoRole === 'exam_incharge' ? 'selected' : ''}>📝 পরীক্ষা নিয়ন্ত্রক</option>
                                <option value="seat_incharge" ${autoRole === 'seat_incharge' ? 'selected' : ''}>🪑 সিট প্ল্যান ইনচার্জ</option>
                                <option value="staff" ${autoRole === 'staff' ? 'selected' : ''}>👤 সাধারণ অফিস স্টাফ</option>
                                <option value="custom">⚡ কাস্টম পারমিশন</option>
                            </select>
                        </td>
                        <td style="padding: 10px 12px; text-align: center;">
                            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                                <button type="button" class="btn-primary" onclick="approveStaffUser('${safeStaffIdOrMob}', ${pIdx})" style="padding: 6px 14px; font-size: 0.80rem; font-weight: 800; border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);" title="এই শিক্ষককে অনুমোদন দিন">
                                    <span>✅ Approve</span>
                                </button>
                                <button type="button" class="btn-outline" onclick="openCustomApprovalModal('${safeStaffIdOrMob}', ${pIdx})" style="padding: 6px 10px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; color: #0284c7; border-color: #7dd3fc; background: #f0f9ff;" title="পারমিশন কাস্টমাইজ করে অনুমোদন দিন">
                                    <span>⚙️ কাস্টম</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        async function approveStaffUser(staffIdOrMob, roleSelectIdx = null) {
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            const cleanTarget = (staffIdOrMob || '').toString().trim();
            const cleanMobTarget = cleanTarget.replace(/[^0-9]/g, '');

            const staffIdx = staffList.findIndex((s, idx) => {
                const sMob = (s.mobile || s.phone || '').toString().replace(/[^0-9]/g, '');
                return (s.staffId && s.staffId.toString().trim() === cleanTarget) ||
                       (cleanMobTarget && sMob === cleanMobTarget) ||
                       (`idx_${idx}` === cleanTarget);
            });

            if (staffIdx === -1) {
                showToastNotification("⚠️ সংশ্লিষ্ট শিক্ষকের প্রোফাইল পাওয়া যায়নি!", "error");
                return;
            }

            const staff = staffList[staffIdx];
            const staffName = (staff.name || staff.nameBn || 'শিক্ষক সদস্য').trim();
            const staffDes = (staff.designation || staff.designationBn || 'সহকারী শিক্ষক').trim();
            let rawMob = (staff.mobile || staff.phone || staff.contact || staff.cell || '').toString().trim();
            if (!rawMob) {
                rawMob = '0170000000' + (staffIdx + 1);
            }
            const cleanMob = rawMob.replace(/[^0-9]/g, '');

            // Get selected role
            let role = 'teacher';
            if (roleSelectIdx !== null && document.getElementById(`pending-role-${roleSelectIdx}`)) {
                role = document.getElementById(`pending-role-${roleSelectIdx}`).value;
            } else {
                const des = staffDes.toLowerCase();
                if (des.includes('প্রধান') || des.includes('head') || des.includes('admin') || des.includes('principal')) role = 'admin';
                else if (des.includes('হিসাব') || des.includes('account') || des.includes('cash')) role = 'accountant';
                else if (des.includes('পরীক্ষা') || des.includes('exam')) role = 'exam_incharge';
                else if (des.includes('সিট') || des.includes('seat')) role = 'seat_incharge';
                else if (staff.category === 'Staff' || des.includes('অফিস') || des.includes('কম্পিউটার')) role = 'staff';
            }

            if (role === 'custom') {
                openCustomApprovalModal(staffIdOrMob, roleSelectIdx);
                return;
            }

            // Determine default permissions for role
            const presets = window.ROLE_DEFAULT_PRESETS || {};
            const permissions = presets[role] || presets['teacher'] || [];

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            // Find or create in school_users
            let existingUserIdx = users.findIndex(u => {
                const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
                return (cleanMob && uMob === cleanMob) || (staff.staffId && u.staffId === staff.staffId);
            });

            if (existingUserIdx >= 0) {
                users[existingUserIdx].name = staffName;
                users[existingUserIdx].designation = staffDes;
                users[existingUserIdx].mobile = rawMob;
                users[existingUserIdx].username = rawMob;
                if (!users[existingUserIdx].password) users[existingUserIdx].password = rawMob;
                users[existingUserIdx].role = role;
                users[existingUserIdx].status = 'active';
                users[existingUserIdx].isApproved = true;
                users[existingUserIdx].approvedAt = Date.now();
                users[existingUserIdx].approvedBy = 'Admin';
                users[existingUserIdx].permissions = permissions;
                if (staff.photo) users[existingUserIdx].photo = staff.photo;
                if (staff.staffId) users[existingUserIdx].staffId = staff.staffId;
                users[existingUserIdx].updatedAt = Date.now();
            } else {
                users.push({
                    id: 'usr_' + (cleanMob || Date.now() + '_' + staffIdx),
                    staffId: staff.staffId || '',
                    name: staffName,
                    designation: staffDes,
                    mobile: rawMob,
                    username: rawMob,
                    password: rawMob,
                    role: role,
                    status: 'active',
                    isApproved: true,
                    approvedAt: Date.now(),
                    approvedBy: 'Admin',
                    permissions: permissions,
                    photo: staff.photo || '',
                    createdAt: Date.now()
                });
            }

            // Mark staff.userApproved = true
            staffList[staffIdx].userApproved = true;

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_users'] = Date.now();
                lastLocalWrites['school_staff'] = Date.now();
            }
            localStorage.setItem('school_users', JSON.stringify(users));
            localStorage.setItem('school_staff', JSON.stringify(staffList));

            // Sync to server DB
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_users',
                        value: JSON.stringify(users)
                    })
                }).catch(() => {});

                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_staff',
                        value: JSON.stringify(staffList)
                    })
                }).catch(() => {});
            } catch (e) {}

            renderPendingStaffApprovals();
            renderStaffUsersTable(users);
            updateUserManagementStats();
            populateStaffSelectDropdown();

            showToastNotification(`✅ '${staffName}' (${staffDes}) এর ইউজার অ্যাকাউন্ট সফলভাবে অনুমোদন (Approved) করা হয়েছে!`, "success");

            if (window.logUserActivity) {
                window.logUserActivity('ইউজার ও পারমিশন', 'ইউজার অনুমোদন (Approve)', `শিক্ষক/স্টাফ '${staffName}' (${staffDes}) এর ইউজার অ্যাকাউন্ট অনুমোদন করা হয়েছে`);
            }
        }

        async function approveAllPendingStaff() {
            const pendingList = getPendingStaffApprovalsList();
            if (!pendingList || pendingList.length === 0) {
                showToastNotification("বর্তমানে কোনো অনুমোদন অপেক্ষমান শিক্ষক নেই।", "info");
                return;
            }

            if (!confirm(`আপনি কি অপেক্ষমান মোট ${pendingList.length} জন শিক্ষক ও কর্মচারীর ইউজার একাউন্ট অনুমোদন করতে চান?`)) {
                return;
            }

            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            const presets = window.ROLE_DEFAULT_PRESETS || {};
            let approvedCount = 0;

            pendingList.forEach((item, pIdx) => {
                const staff = item.staff;
                const staffName = (staff.name || staff.nameBn || 'শিক্ষক সদস্য').trim();
                const staffDes = (staff.designation || staff.designationBn || 'সহকারী শিক্ষক').trim();
                let rawMob = item.rawMob;
                if (!rawMob) rawMob = '0170000000' + (item.index + 1);
                const cleanMob = rawMob.replace(/[^0-9]/g, '');

                let role = 'teacher';
                const des = staffDes.toLowerCase();
                if (des.includes('প্রধান') || des.includes('head') || des.includes('admin') || des.includes('principal')) role = 'admin';
                else if (des.includes('হিসাব') || des.includes('account') || des.includes('cash')) role = 'accountant';
                else if (des.includes('পরীক্ষা') || des.includes('exam')) role = 'exam_incharge';
                else if (des.includes('সিট') || des.includes('seat')) role = 'seat_incharge';
                else if (staff.category === 'Staff' || des.includes('অফিস') || des.includes('কম্পিউটার')) role = 'staff';

                const permissions = presets[role] || presets['teacher'] || [];

                let existingUserIdx = users.findIndex(u => {
                    const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
                    return (cleanMob && uMob === cleanMob) || (staff.staffId && u.staffId === staff.staffId);
                });

                if (existingUserIdx >= 0) {
                    users[existingUserIdx].name = staffName;
                    users[existingUserIdx].designation = staffDes;
                    users[existingUserIdx].mobile = rawMob;
                    users[existingUserIdx].username = rawMob;
                    if (!users[existingUserIdx].password) users[existingUserIdx].password = rawMob;
                    users[existingUserIdx].role = role;
                    users[existingUserIdx].status = 'active';
                    users[existingUserIdx].isApproved = true;
                    users[existingUserIdx].approvedAt = Date.now();
                    users[existingUserIdx].approvedBy = 'Admin';
                    users[existingUserIdx].permissions = permissions;
                    if (staff.photo) users[existingUserIdx].photo = staff.photo;
                    if (staff.staffId) users[existingUserIdx].staffId = staff.staffId;
                    users[existingUserIdx].updatedAt = Date.now();
                } else {
                    users.push({
                        id: 'usr_' + (cleanMob || Date.now() + '_' + item.index),
                        staffId: staff.staffId || '',
                        name: staffName,
                        designation: staffDes,
                        mobile: rawMob,
                        username: rawMob,
                        password: rawMob,
                        role: role,
                        status: 'active',
                        isApproved: true,
                        approvedAt: Date.now(),
                        approvedBy: 'Admin',
                        permissions: permissions,
                        photo: staff.photo || '',
                        createdAt: Date.now()
                    });
                }

                const sIdx = staffList.findIndex(s => (s.staffId && s.staffId === staff.staffId) || (s.mobile && s.mobile === staff.mobile));
                if (sIdx >= 0) {
                    staffList[sIdx].userApproved = true;
                }
                approvedCount++;
            });

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_users'] = Date.now();
                lastLocalWrites['school_staff'] = Date.now();
            }
            localStorage.setItem('school_users', JSON.stringify(users));
            localStorage.setItem('school_staff', JSON.stringify(staffList));

            // Sync to server DB
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_users',
                        value: JSON.stringify(users)
                    })
                }).catch(() => {});

                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_staff',
                        value: JSON.stringify(staffList)
                    })
                }).catch(() => {});
            } catch (e) {}

            renderPendingStaffApprovals();
            renderStaffUsersTable(users);
            updateUserManagementStats();
            populateStaffSelectDropdown();

            showToastNotification(`✅ মোট ${approvedCount} জন শিক্ষক ও কর্মচারীর ইউজার একাউন্ট সফলভাবে অনুমোদন (Approved) করা হয়েছে!`, "success");

            if (window.logUserActivity) {
                window.logUserActivity('ইউজার ও পারমিশন', 'বাল্ক ইউজার অনুমোদন', `মোট ${approvedCount} জন শিক্ষকের ইউজার একাউন্ট এক ক্লিকে অনুমোদন করা হয়েছে`);
            }
        }

        function openCustomApprovalModal(staffIdOrMob, roleSelectIdx = null) {
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            const cleanTarget = (staffIdOrMob || '').toString().trim();
            const cleanMobTarget = cleanTarget.replace(/[^0-9]/g, '');

            const staff = staffList.find((s, idx) => {
                const sMob = (s.mobile || s.phone || '').toString().replace(/[^0-9]/g, '');
                return (s.staffId && s.staffId.toString().trim() === cleanTarget) ||
                       (cleanMobTarget && sMob === cleanMobTarget) ||
                       (`idx_${idx}` === cleanTarget);
            });

            if (!staff) {
                showToastNotification("⚠️ শিক্ষকের তথ্য পাওয়া যায়নি!", "warning");
                return;
            }

            const selectEl = document.getElementById('user-staff-select');
            if (selectEl) {
                const opt = Array.from(selectEl.options).find(o =>
                    o.value === staff.staffId ||
                    (o.dataset && o.dataset.staffId === staff.staffId) ||
                    (o.dataset && o.dataset.mobile === staff.mobile)
                );
                if (opt) {
                    selectEl.value = opt.value;
                    autoFillUserFromStaff();
                } else {
                    document.getElementById('usr-name').value = staff.name || '';
                    document.getElementById('usr-designation').value = staff.designation || '';
                    document.getElementById('usr-mobile').value = staff.mobile || '';
                    document.getElementById('usr-password').value = staff.mobile || '';
                    document.getElementById('usr-staff-id').value = staff.staffId || '';
                    document.getElementById('usr-photo').value = staff.photo || '';
                }
            }

            if (roleSelectIdx !== null && document.getElementById(`pending-role-${roleSelectIdx}`)) {
                const selRole = document.getElementById(`pending-role-${roleSelectIdx}`).value;
                if (selRole && selRole !== 'custom') {
                    const roleSelect = document.getElementById('usr-role');
                    if (roleSelect) {
                        roleSelect.value = selRole;
                        handleRoleSelectionChange();
                    }
                }
            }

            const titleEl = document.getElementById('user-form-title');
            const badgeEl = document.getElementById('user-form-mode-badge');
            if (titleEl) titleEl.textContent = `⚙️ '${staff.name}' এর পারমিশন নির্ধারণ ও অনুমোদন`;
            if (badgeEl) {
                badgeEl.textContent = 'কাস্টম অনুমোদন';
                badgeEl.style.background = '#fef3c7';
                badgeEl.style.color = '#b45309';
            }

            document.getElementById('staff-user-account-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToastNotification(`💡 '${staff.name}' এর পারমিশন বাছাই করে 'ইউজার সেভ করুন' বাটনে ক্লিক করে অনুমোদন দিন।`, 'info');
        }

        function updateUserManagementStats() {
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const pendingList = getPendingStaffApprovalsList();

            const totalEl = document.getElementById('user-mgmt-total-count');
            const activeEl = document.getElementById('user-mgmt-active-count');
            const pendingEl = document.getElementById('user-mgmt-pending-count');

            if (totalEl) totalEl.textContent = `${users.length} জন`;
            if (activeEl) {
                const activeCount = users.filter(u => u.status !== 'inactive' && u.isApproved !== false && u.status !== 'pending_approval').length;
                activeEl.textContent = `${activeCount} টি`;
            }
            if (pendingEl) {
                pendingEl.textContent = `${pendingList.length} জন`;
                pendingEl.style.color = pendingList.length > 0 ? '#d97706' : '#10b981';
            }
        }

        async function populateStaffSelectDropdown(forceServerFetch = false, autoSelectStaffIdOrMobile = null) {
            const selectEl = document.getElementById('user-staff-select');
            if (!selectEl) return;

            const previousVal = selectEl.value;

            let staffList = [];
            try {
                const stored = localStorage.getItem('school_staff');
                if (stored) staffList = JSON.parse(stored);
            } catch (e) {
                staffList = [];
            }

            // If empty or forceServerFetch requested, fetch latest staff from SQLite database
            if (forceServerFetch || !staffList || staffList.length === 0) {
                try {
                    const res = await fetch('/api/db');
                    if (res.ok) {
                        const dbData = await res.json();
                        if (dbData && dbData.school_staff) {
                            staffList = JSON.parse(dbData.school_staff);
                            localStorage.setItem('school_staff', JSON.stringify(staffList));
                        }
                    }
                } catch (err) {
                    console.warn("Could not fetch latest staff list from server DB:", err);
                }
            }

            if (!staffList) staffList = [];

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            lastKnownStaffJson = localStorage.getItem('school_staff') || '';

            let html = '<option value="">-- শিক্ষক ও কর্মচারী তালিকা থেকে সিলেক্ট করুন --</option>';
            if (staffList.length === 0) {
                html = '<option value="">-- স্টাফ তালিকায় কোনো শিক্ষক নেই (Staff পেজ থেকে শিক্ষক যুক্ত করুন) --</option>';
            } else {
                staffList.forEach((staff, idx) => {
                    const mob = (staff.mobile || staff.phone || staff.contact || staff.cell || '').toString().trim() || 'মোবাইল নেই';
                    const des = (staff.designation || staff.designationBn || 'শিক্ষক').trim();
                    const name = (staff.name || staff.nameBn || 'শিক্ষক সদস্য').trim();
                    const staffId = (staff.staffId || '').trim();
                    const optVal = staffId || (mob !== 'মোবাইল নেই' ? mob : ('idx_' + idx));
                    const category = staff.category || 'Teacher';
                    const photo = staff.photo || '';

                    // Check if approved
                    const cleanMob = mob.replace(/[^0-9]/g, '');
                    const isApprovedUser = users.some(u => {
                        const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
                        return ((cleanMob && uMob === cleanMob) || (staffId && u.staffId === staffId)) && u.isApproved !== false && u.status !== 'pending_approval';
                    });

                    const approvalPrefix = isApprovedUser ? '✅ [অনুমোদিত]' : '⏳ [অনুমোদন প্রয়োজন]';

                    html += `<option value="${escapeHtml(optVal)}" data-index="${idx}" data-staff-id="${escapeHtml(staffId)}" data-name="${escapeHtml(name)}" data-designation="${escapeHtml(des)}" data-mobile="${escapeHtml(mob)}" data-category="${escapeHtml(category)}" data-photo="${escapeHtml(photo)}" data-approved="${isApprovedUser ? '1' : '0'}">${approvalPrefix} ${staffId ? '[' + escapeHtml(staffId) + '] ' : ''}${escapeHtml(name)} (${escapeHtml(des)} - 📱 ${escapeHtml(mob)})</option>`;
                });
            }

            selectEl.innerHTML = html;

            // Handle selection (autoSelect target or restore previous selection)
            let matchedOption = null;
            if (autoSelectStaffIdOrMobile) {
                matchedOption = Array.from(selectEl.options).find(opt => 
                    opt.value === autoSelectStaffIdOrMobile || 
                    (opt.dataset && opt.dataset.staffId === autoSelectStaffIdOrMobile) || 
                    (opt.dataset && opt.dataset.mobile === autoSelectStaffIdOrMobile)
                );
            } else if (previousVal !== "") {
                matchedOption = Array.from(selectEl.options).find(opt => 
                    opt.value === previousVal || 
                    (opt.dataset && opt.dataset.staffId === previousVal) || 
                    opt.dataset?.index === previousVal
                );
            }

            if (matchedOption) {
                selectEl.value = matchedOption.value;
                if (autoSelectStaffIdOrMobile) {
                    autoFillUserFromStaff();
                    selectEl.style.transition = 'all 0.3s ease';
                    selectEl.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.4)';
                    selectEl.style.borderColor = '#16a34a';
                    setTimeout(() => {
                        selectEl.style.boxShadow = '';
                        selectEl.style.borderColor = '#3b82f6';
                    }, 1800);
                }
            }

            const hintEl = document.getElementById('user-staff-select-hint');
            if (hintEl) {
                hintEl.innerHTML = staffList.length > 0 
                    ? `💡 Staff Directory-তে মোট <b>${staffList.length}</b> জন শিক্ষক ও কর্মচারী রয়েছে। তালিকা নির্বাচন করলেই স্বয়ংক্রিয়ভাবে তথ্য বসে যাবে।`
                    : `💡 Staff Directory-তে কোনো শিক্ষক নেই। "শিক্ষক ও স্টাফ" পেজ থেকে শিক্ষক যুক্ত করলে এখানে দেখতে পাবেন।`;
            }

            if (forceServerFetch && typeof showToastNotification === 'function') {
                showToastNotification(`স্টাফ তালিকা রিফ্রেশ সম্পন্ন! (${staffList.length} জন শিক্ষক/স্টাফ পাওয়া গেছে)`);
            }
        }

        function autoFillUserFromStaff() {
            const selectEl = document.getElementById('user-staff-select');
            if (!selectEl) return;

            if (selectEl.value === "") {
                const editId = document.getElementById('usr-edit-id')?.value;
                if (!editId) {
                    resetStaffUserForm();
                }
                return;
            }

            const selectedOption = selectEl.options[selectEl.selectedIndex];
            if (!selectedOption) return;

            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                staffList = [];
            }

            let staff = null;
            const staffId = selectedOption.getAttribute('data-staff-id');
            const dataIndex = selectedOption.getAttribute('data-index');

            if (staffId) {
                staff = staffList.find(s => s.staffId && s.staffId.toString().trim() === staffId);
            }
            if (!staff && dataIndex !== null && dataIndex !== undefined) {
                const idx = parseInt(dataIndex, 10);
                if (!isNaN(idx) && staffList[idx]) {
                    staff = staffList[idx];
                }
            }
            if (!staff) {
                const optVal = selectEl.value;
                staff = staffList.find(s => s.staffId === optVal || s.mobile === optVal);
            }

            // Extract values (fallback to dataset attributes)
            const staffName = staff ? (staff.name || staff.nameBn || '').trim() : (selectedOption.getAttribute('data-name') || '');
            const staffDes = staff ? (staff.designation || staff.designationBn || 'সহকারী শিক্ষক').trim() : (selectedOption.getAttribute('data-designation') || 'সহকারী শিক্ষক');
            let rawMob = staff ? (staff.mobile || staff.phone || staff.contact || staff.cell || '').toString().trim() : (selectedOption.getAttribute('data-mobile') || '');
            if (rawMob === 'মোবাইল নেই') rawMob = '';
            const finalStaffId = staff ? (staff.staffId || '') : (staffId || '');
            const photo = staff ? (staff.photo || '') : (selectedOption.getAttribute('data-photo') || '');
            const category = staff ? (staff.category || 'Teacher') : (selectedOption.getAttribute('data-category') || 'Teacher');

            const nameInput = document.getElementById('usr-name');
            const desInput = document.getElementById('usr-designation');
            const mobInput = document.getElementById('usr-mobile');
            const pwdInput = document.getElementById('usr-password');
            const staffIdInput = document.getElementById('usr-staff-id');
            const photoInput = document.getElementById('usr-photo');
            const roleSelect = document.getElementById('usr-role');

            if (nameInput) nameInput.value = staffName;
            if (desInput) desInput.value = staffDes;
            if (mobInput) mobInput.value = rawMob;
            if (staffIdInput) staffIdInput.value = finalStaffId;
            if (photoInput) photoInput.value = photo;

            // Default password is staff mobile number!
            if (pwdInput && rawMob) pwdInput.value = rawMob;

            // Auto-detect role
            if (roleSelect) {
                const des = staffDes.toLowerCase();
                if (des.includes('প্রধান') || des.includes('head') || des.includes('admin') || des.includes('principal')) {
                    roleSelect.value = 'admin';
                } else if (des.includes('হিসাব') || des.includes('account') || des.includes('cash') || des.includes('ক্যাশ')) {
                    roleSelect.value = 'accountant';
                } else if (des.includes('পরীক্ষা') || des.includes('exam') || des.includes('controller')) {
                    roleSelect.value = 'exam_incharge';
                } else if (des.includes('সিট') || des.includes('seat')) {
                    roleSelect.value = 'seat_incharge';
                } else if (category === 'Staff' || des.includes('অফিস') || des.includes('কম্পিউটার') || des.includes('সহকারী') || des.includes('clerk') || des.includes('operator')) {
                    roleSelect.value = 'staff';
                } else {
                    roleSelect.value = 'teacher';
                }
                handleRoleSelectionChange();
            }

            const titleEl = document.getElementById('user-form-title');
            const badgeEl = document.getElementById('user-form-mode-badge');
            if (titleEl) titleEl.textContent = `➕ নতুন ইউজার: ${staffName}`;
            if (badgeEl) {
                badgeEl.textContent = '⚡ Staff Directory থেকে লোড করা';
                badgeEl.style.background = '#dbeafe';
                badgeEl.style.color = '#1d4ed8';
            }

            if (typeof showToastNotification === 'function') {
                showToastNotification(`✅ ${staffName}-এর তথ্য ফর্মে অটোফিল করা হয়েছে!`, 'success');
            }
        }

        function syncDefaultPasswordWithMobile() {
            const editId = document.getElementById('usr-edit-id')?.value;
            const mob = document.getElementById('usr-mobile')?.value || '';
            const pwd = document.getElementById('usr-password');
            if (!editId && pwd) {
                pwd.value = mob;
            }
        }

        function setPasswordToMobile() {
            const mob = document.getElementById('usr-mobile')?.value || '';
            const pwd = document.getElementById('usr-password');
            if (!mob) {
                alert("অনুগ্রহ করে আগে মোবাইল নম্বর লিখুন।");
                return;
            }
            if (pwd) {
                pwd.value = mob;
                showToastNotification("পাসওয়ার্ড হিসেবে মোবাইল নম্বর সেট করা হয়েছে!");
            }
        }

        function saveStaffUserAccount(event) {
            event.preventDefault();

            const name = document.getElementById('usr-name')?.value?.trim();
            const designation = document.getElementById('usr-designation')?.value?.trim();
            const mobile = document.getElementById('usr-mobile')?.value?.trim();
            const password = document.getElementById('usr-password')?.value?.trim();
            const role = document.getElementById('usr-role')?.value || 'teacher';
            const status = document.getElementById('usr-status')?.value || 'active';
            const staffId = document.getElementById('usr-staff-id')?.value || '';
            const photo = document.getElementById('usr-photo')?.value || '';
            const editId = document.getElementById('usr-edit-id')?.value || '';
            const permissions = getSelectedPermissionIds();

            if (!name || !mobile || !password) {
                alert("দয়া করে নাম, মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ করুন।");
                return;
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            const cleanMob = mobile.replace(/[^0-9]/g, '');

            if (editId) {
                // Update existing
                const existingIdx = users.findIndex(u => (u.id === editId || u.mobile === editId));
                if (existingIdx !== -1) {
                    users[existingIdx].name = name;
                    users[existingIdx].designation = designation;
                    users[existingIdx].mobile = mobile;
                    users[existingIdx].username = mobile;
                    users[existingIdx].password = password;
                    users[existingIdx].role = role;
                    users[existingIdx].status = status;
                    users[existingIdx].isApproved = true;
                    users[existingIdx].approvedAt = users[existingIdx].approvedAt || Date.now();
                    users[existingIdx].approvedBy = users[existingIdx].approvedBy || 'Admin';
                    users[existingIdx].permissions = permissions;
                    if (photo) users[existingIdx].photo = photo;
                    if (staffId) users[existingIdx].staffId = staffId;
                    users[existingIdx].updatedAt = Date.now();
                } else {
                    users.push({
                        id: 'usr_' + cleanMob,
                        name, designation, mobile, username: mobile, password, role, status, staffId, photo,
                        permissions,
                        isApproved: true,
                        approvedAt: Date.now(),
                        approvedBy: 'Admin',
                        createdAt: Date.now()
                    });
                }
            } else {
                // New User check duplication
                const dupIdx = users.findIndex(u => u.mobile === mobile);
                if (dupIdx !== -1) {
                    if (confirm(`'${mobile}' মোবাইল নম্বরে ইতিমধ্যে একটি একাউন্ট রয়েছে। আপনি কি এটি আপডেট করতে চান?`)) {
                        users[dupIdx].name = name;
                        users[dupIdx].designation = designation;
                        users[dupIdx].password = password;
                        users[dupIdx].role = role;
                        users[dupIdx].status = status;
                        users[dupIdx].isApproved = true;
                        users[dupIdx].approvedAt = Date.now();
                        users[dupIdx].approvedBy = 'Admin';
                        users[dupIdx].permissions = permissions;
                        if (photo) users[dupIdx].photo = photo;
                        if (staffId) users[dupIdx].staffId = staffId;
                        users[dupIdx].updatedAt = Date.now();
                    } else {
                        return;
                    }
                } else {
                    users.push({
                        id: 'usr_' + cleanMob,
                        name, designation, mobile, username: mobile, password, role, status, staffId, photo,
                        permissions,
                        isApproved: true,
                        approvedAt: Date.now(),
                        approvedBy: 'Admin',
                        createdAt: Date.now()
                    });
                }
            }

            // Also mark staff in school_staff as approved
            let staffList = [];
            try {
                staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
                const sIdx = staffList.findIndex(s => (s.staffId && s.staffId === staffId) || (s.mobile && s.mobile === mobile));
                if (sIdx >= 0) {
                    staffList[sIdx].userApproved = true;
                    if (typeof lastLocalWrites === 'object') lastLocalWrites['school_staff'] = Date.now();
                    localStorage.setItem('school_staff', JSON.stringify(staffList));
                    fetch('/api/db/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'school_staff', value: JSON.stringify(staffList) })
                    }).catch(() => {});
                }
            } catch (e) {}

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_users'] = Date.now();
            }
            localStorage.setItem('school_users', JSON.stringify(users));

            // Sync currently logged in user if they are the one being edited
            const activeUserMob = (localStorage.getItem('school_user_mobile') || '').replace(/[^0-9a-zA-Z]/g, '');
            if (activeUserMob && activeUserMob === cleanMob) {
                localStorage.setItem('school_user_permissions', JSON.stringify(permissions));
                localStorage.setItem('school_user_role_key', role);
                if (typeof window.applyUserPermissionsUI === 'function') {
                    window.applyUserPermissionsUI();
                }
            }

            // Sync to server DB
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_users',
                        value: JSON.stringify(users)
                    })
                }).catch(() => {});
            } catch (e) {}

            resetStaffUserForm();
            renderPendingStaffApprovals();
            renderStaffUsersTable(users);
            updateUserManagementStats();
            populateStaffSelectDropdown();

            if (typeof window.applyUserPermissionsUI === 'function') {
                window.applyUserPermissionsUI();
            }
            showToastNotification("শিক্ষক/স্টাফ ইউজার ও পারমিশন সফলভাবে সংরক্ষণ ও অনুমোদন করা হয়েছে!");

            if (window.logUserActivity) {
                window.logUserActivity('ইউজার ও পারমিশন', editId ? 'ইউজার আপডেট' : 'নতুন ইউজার তৈরি ও অনুমোদন', `শিক্ষক/স্টাফ '${name}' (${designation}) এর লগইন একাউন্ট ${editId ? 'আপডেট' : 'তৈরি ও অনুমোদন'} করা হয়েছে`);
            }
        }

        async function syncStaffDirectoryToUsers(showAlert = true) {
            let staffList = [];
            try {
                const stored = localStorage.getItem('school_staff');
                if (stored) staffList = JSON.parse(stored);
            } catch (e) {
                staffList = [];
            }

            // If empty, fetch from server SQLite database
            if (!staffList || staffList.length === 0) {
                try {
                    const res = await fetch('/api/db');
                    if (res.ok) {
                        const dbData = await res.json();
                        if (dbData && dbData.school_staff) {
                            staffList = JSON.parse(dbData.school_staff);
                            localStorage.setItem('school_staff', JSON.stringify(staffList));
                        }
                    }
                } catch (err) {
                    console.warn("Could not fetch staff from server DB:", err);
                }
            }

            if (!staffList || staffList.length === 0) {
                if (showAlert) {
                    const msg = "⚠️ স্টাফ ডিরেক্টরিতে কোনো শিক্ষক বা কর্মচারী পাওয়া যায়নি। আগে 'শিক্ষক ও স্টাফ' পেজে শিক্ষক যুক্ত করুন।";
                    if (typeof showToastNotification === 'function') {
                        showToastNotification(msg, 'warning');
                    } else {
                        alert(msg);
                    }
                }
                return;
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            let addedCount = 0;
            let updatedCount = 0;
            const presets = window.ROLE_DEFAULT_PRESETS || {};

            staffList.forEach((staff, index) => {
                let rawMob = (staff.mobile || staff.phone || staff.contact || staff.cell || '').toString().trim();
                if (!rawMob) {
                    rawMob = '0170000000' + (index + 1);
                }

                const cleanMob = rawMob.replace(/[^0-9]/g, '');
                const staffName = (staff.name || staff.nameBn || 'শিক্ষক সদস্য').trim();
                const staffDes = (staff.designation || staff.designationBn || 'সহকারী শিক্ষক').trim();

                // Match existing user by mobile or id or username or staffId
                let existing = users.find(u => {
                    const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
                    return (uMob && uMob === cleanMob) || (u.mobile === rawMob) || (u.username === rawMob) || (staff.staffId && u.staffId === staff.staffId);
                });

                // Auto-detect role
                let userRole = 'teacher';
                const des = staffDes.toLowerCase();
                if (des.includes('প্রধান') || des.includes('head') || des.includes('admin')) userRole = 'admin';
                else if (des.includes('হিসাব') || des.includes('account')) userRole = 'accountant';
                else if (des.includes('পরীক্ষা') || des.includes('exam')) userRole = 'exam_incharge';
                else if (des.includes('সিট') || des.includes('seat')) userRole = 'seat_incharge';
                else if (staff.category === 'Staff' || des.includes('অফিস') || des.includes('কম্পিউটার')) userRole = 'staff';

                const permissions = presets[userRole] || presets['teacher'] || [];

                if (!existing) {
                    users.push({
                        id: 'usr_' + (cleanMob || Date.now() + '_' + index),
                        staffId: staff.staffId || '',
                        name: staffName,
                        designation: staffDes,
                        mobile: rawMob,
                        username: rawMob,
                        password: rawMob, // Default Password = Mobile Number
                        role: userRole,
                        status: 'active',
                        isApproved: true,
                        approvedAt: Date.now(),
                        approvedBy: 'Admin',
                        permissions: permissions,
                        photo: staff.photo || '',
                        createdAt: Date.now()
                    });
                    addedCount++;
                } else {
                    existing.name = staffName;
                    existing.designation = staffDes;
                    existing.mobile = rawMob;
                    existing.username = rawMob;
                    if (!existing.password) existing.password = rawMob;
                    existing.isApproved = true;
                    if (existing.status === 'pending_approval' || existing.status === 'pending') existing.status = 'active';
                    if (staff.photo) existing.photo = staff.photo;
                    if (staff.staffId) existing.staffId = staff.staffId;
                    existing.updatedAt = Date.now();
                    updatedCount++;
                }

                staff.userApproved = true;
            });

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_users'] = Date.now();
                lastLocalWrites['school_staff'] = Date.now();
            }
            localStorage.setItem('school_users', JSON.stringify(users));
            localStorage.setItem('school_staff', JSON.stringify(staffList));

            // Sync to server SQLite database
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_users',
                        value: JSON.stringify(users)
                    })
                }).catch(() => {});

                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_staff',
                        value: JSON.stringify(staffList)
                    })
                }).catch(() => {});
            } catch (e) {}

            renderPendingStaffApprovals();
            renderStaffUsersTable(users);
            updateUserManagementStats();
            populateStaffSelectDropdown();

            if (showAlert) {
                const msg = `✅ স্টাফ তালিকা থেকে মোট ${users.length} জন শিক্ষক/কর্মচারীর লগইন একাউন্ট প্রস্তুত ও অনুমোদন সম্পন্ন হয়েছে (${addedCount} টি নতুন, ${updatedCount} টি আপডেট)!`;
                if (typeof showToastNotification === 'function') {
                    showToastNotification(msg, 'success');
                } else {
                    alert(msg);
                }
            }
        }

        function getEnsuredStaffUsersList() {
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            const fixedAdmin = typeof window.getFixedAdminUser === 'function' ? window.getFixedAdminUser() : {
                id: 'usr_admin',
                staffId: 'ADMIN-01',
                name: 'শাহ মোঃ রোকনুজ্জামান চৌধুরী',
                designation: 'প্রধান শিক্ষক / পূর্ণ অ্যাডমিন',
                mobile: 'admin',
                username: 'admin',
                password: 'admin',
                role: 'admin',
                status: 'active',
                isApproved: true,
                photo: '',
                permissions: window.ALL_PERMISSIONS ? window.ALL_PERMISSIONS.map(p => p.id) : ['*'],
                isFixedAdmin: true
            };

            const adminIdx = users.findIndex(u => u.id === 'usr_admin' || u.role === 'admin' || u.mobile === 'admin' || u.username === 'admin');
            if (adminIdx === -1) {
                users.unshift(fixedAdmin);
            } else {
                users[adminIdx] = Object.assign({}, users[adminIdx], fixedAdmin);
                if (adminIdx > 0) {
                    const [adm] = users.splice(adminIdx, 1);
                    users.unshift(adm);
                }
            }

            return users;
        }

        function renderStaffUsersTable(users = null) {
            const tbody = document.getElementById('user-mgmt-table-tbody');
            if (!tbody) return;

            if (users === null || users === undefined) {
                users = getEnsuredStaffUsersList();
            }

            cachedStaffUsers = users;

            const totalEl = document.getElementById('user-mgmt-total-count');
            const activeEl = document.getElementById('user-mgmt-active-count');
            if (totalEl) totalEl.textContent = `${users.length} জন`;
            if (activeEl) {
                const activeCount = users.filter(u => u.status !== 'inactive' && u.isApproved !== false && u.status !== 'pending_approval').length;
                activeEl.textContent = `${activeCount} টি`;
            }

            if (!users || users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 32px 20px; color: #64748b; font-weight: 600;">
                            <div style="font-size: 1.8rem; margin-bottom: 8px;">👤</div>
                            <div style="font-size: 0.94rem; color: #334155; font-weight: 700; margin-bottom: 4px;">কোনো শিক্ষক বা স্টাফ ইউজার একাউন্ট যুক্ত করা হয়নি</div>
                            <div style="font-size: 0.80rem; color: #64748b; margin-bottom: 14px;">উপরের ফর্ম থেকে নতুন ইউজার তৈরি করুন অথবা "স্টাফ তালিকা থেকে অটো-সিঙ্ক" বোতামে ক্লিক করুন।</div>
                            <button type="button" class="btn-primary" onclick="syncStaffDirectoryToUsers(true)" style="padding: 7px 16px; font-size: 0.82rem; font-weight: 700; border-radius: 6px;">
                                🔄 স্টাফ তালিকা থেকে অটো-সিঙ্ক করুন
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            users.forEach((user, idx) => {
                const isAdminUser = user.role === 'admin' || user.isFixedAdmin || user.mobile === 'admin';
                const isApproved = user.isApproved !== false && user.status !== 'pending_approval' && user.status !== 'pending';
                const isActive = user.status !== 'inactive' && isApproved;
                
                let statusBadge = '';
                if (!isApproved) {
                    statusBadge = `<span style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #f59e0b;"></span>⏳ পেন্ডিং</span>`;
                } else if (isActive) {
                    statusBadge = `<span style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>🟢 অনুমোদিত</span>`;
                } else {
                    statusBadge = `<span style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444;"></span>🔴 নিষ্ক্রিয়</span>`;
                }

                // Role badge
                let roleName = 'সহকারী শিক্ষক';
                let roleBg = '#e0f2fe';
                let roleColor = '#0369a1';
                let roleIcon = '👨‍🏫';

                if (isAdminUser) {
                    roleName = '👑 প্রধান শিক্ষক / পূর্ণ অ্যাডমিন';
                    roleBg = '#f3e8ff';
                    roleColor = '#7e22ce';
                    roleIcon = '👑';
                } else if (user.role === 'accountant') {
                    roleName = '💼 হিসাবরক্ষক / ফি ইনচার্জ';
                    roleBg = '#ecfdf5';
                    roleColor = '#047857';
                    roleIcon = '💼';
                } else if (user.role === 'exam_incharge') {
                    roleName = '📝 পরীক্ষা নিয়ন্ত্রক';
                    roleBg = '#fef3c7';
                    roleColor = '#b45309';
                    roleIcon = '📝';
                } else if (user.role === 'seat_incharge') {
                    roleName = '🪑 সিট প্ল্যান ইনচার্জ';
                    roleBg = '#eff6ff';
                    roleColor = '#1d4ed8';
                    roleIcon = '🪑';
                } else if (user.role === 'staff') {
                    roleName = '👤 অফিস স্টাফ';
                    roleBg = '#f1f5f9';
                    roleColor = '#475569';
                    roleIcon = '👤';
                }

                // Avatar or photo
                const photoHtml = user.photo 
                    ? `<img src="${user.photo}" alt="${escapeHtml(user.name)}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid #cbd5e1; flex-shrink: 0;">`
                    : `<div style="width: 38px; height: 38px; border-radius: 50%; background: ${roleBg}; color: ${roleColor}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; border: 1.5px solid ${roleColor}; flex-shrink: 0;">${roleIcon}</div>`;

                const safeMob = escapeJsString(user.mobile || '');
                const safeName = escapeJsString(user.name || '');
                const safeDes = escapeJsString(user.designation || '');
                const safePwd = escapeJsString(user.password || user.mobile || '');
                const userPerms = window.getUserPermissions ? window.getUserPermissions(user) : (user.permissions || []);

                const rowStyle = isAdminUser 
                    ? 'border-bottom: 2px solid #e9d5ff; background: #faf5ff;' 
                    : `border-bottom: 1px solid #e2e8f0; ${!isActive ? 'opacity: 0.75; background: #fafafa;' : ''}`;

                html += `
                    <tr style="${rowStyle}">
                        <td style="padding: 12px 14px; text-align: center; font-weight: 800; color: ${isAdminUser ? '#7e22ce' : '#334155'};">
                            ${isAdminUser ? '👑 1' : (idx + 1)}
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${photoHtml}
                                <div>
                                    <div style="font-weight: 800; color: ${isAdminUser ? '#6b21a8' : '#0f172a'}; font-size: 0.94rem;">
                                        ${escapeHtml(user.name || (isAdminUser ? 'প্রধান শিক্ষক (অ্যাডমিন)' : 'শিক্ষক'))}
                                        ${isAdminUser ? '<span style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 10px; margin-left: 6px;">Master Admin</span>' : ''}
                                    </div>
                                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
                                        ${escapeHtml(user.staffId ? `ID: ${user.staffId}` : (isAdminUser ? 'ADMIN-01' : 'শিক্ষক সদস্য'))}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem;">
                                ${escapeHtml(user.designation || (isAdminUser ? 'প্রধান শিক্ষক / পূর্ণ অ্যাডমিন' : 'সহকারী শিক্ষক'))}
                            </div>
                            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">
                                <span style="display: inline-block; background: ${roleBg}; color: ${roleColor}; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                                    ${escapeHtml(roleName)}
                                </span>
                                <span onclick="showUserPermissionsModal('${safeMob}')" style="cursor: pointer; display: inline-flex; align-items: center; gap: 3px; background: ${isAdminUser ? '#fae8ff' : '#e0f2fe'}; color: ${isAdminUser ? '#86198f' : '#0369a1'}; border: 1px solid ${isAdminUser ? '#f0abfc' : '#bae6fd'}; font-size: 0.70rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;" title="পারমিশন বিস্তারিত দেখতে ক্লিক করুন">
                                    🛡️ ${isAdminUser ? 'সকল অপশন সক্রিয়' : `${userPerms.length} টি পারমিশন`}
                                </span>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-family: monospace; font-size: 0.90rem; font-weight: 800; color: #0052ff; background: #eff6ff; padding: 4px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">
                                    ${escapeHtml(user.mobile || 'admin')}
                                </span>
                                <button type="button" onclick="copyToClipboard('${safeMob}', 'ইউজার আইডি কপি হয়েছে!')" style="background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #64748b;" title="আইডি কপি করুন">📋</button>
                            </div>
                        </td>
                        <td style="padding: 12px 14px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span id="pwd-display-${idx}" style="font-family: monospace; font-size: 0.88rem; font-weight: 800; color: #15803d; background: #f0fdf4; padding: 4px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
                                    ${escapeHtml(user.password || 'admin')}
                                </span>
                                <button type="button" onclick="togglePasswordDisplay(${idx}, '${safePwd}')" style="background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #64748b;" title="পাসওয়ার্ড দেখান/লুকান">👁️</button>
                                <button type="button" onclick="copyToClipboard('${safePwd}', 'পাসওয়ার্ড কপি হয়েছে!')" style="background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #64748b;" title="পাসওয়ার্ড কপি করুন">📋</button>
                            </div>
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                            ${isAdminUser ? `
                                <span style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>🟢 অনুমোদিত</span>
                            ` : `
                                <button type="button" onclick="toggleStaffUserStatus('${safeMob}')" style="background: none; border: none; cursor: pointer;" title="স্ট্যাটাস পরিবর্তন করুন">
                                    ${statusBadge}
                                </button>
                            `}
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                                ${!isApproved ? `
                                    <button type="button" class="btn-primary" onclick="approveStaffUser('${safeMob}')" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 5px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 800;" title="এই ইউজারকে অনুমোদন দিন">
                                        ✅ Approve
                                    </button>
                                ` : ''}
                                <button type="button" class="btn-outline" onclick="showUserPermissionsModal('${safeMob}')" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 5px; color: #0284c7; border-color: #bae6fd; background: #f0f9ff;" title="পারমিশন বিস্তারিত দেখুন">
                                    🛡️ পারমিশন
                                </button>
                                <button type="button" class="btn-outline" onclick="editStaffUser('${safeMob}')" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 5px;" title="এডিট করুন">
                                    ✏️ এডিট
                                </button>
                                <button type="button" class="btn-primary" onclick="testLoginAsUser('${safeMob}', '${safePwd}', '${safeName}', '${safeDes}')" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 5px; background: ${isAdminUser ? '#7e22ce' : '#0052ff'}; color: #ffffff;" title="${isAdminUser ? 'প্রধান শিক্ষক / অ্যাডমিন হিসেবে লগইন টেস্ট' : 'এই শিক্ষক হিসেবে লগইন টেস্ট করুন'}">
                                    🚀 লগইন
                                </button>
                                ${isAdminUser ? `
                                    <button type="button" class="btn-outline" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 5px; opacity: 0.55; cursor: not-allowed; border-color: #cbd5e1; color: #64748b;" title="🔒 প্রধান শিক্ষক / মাস্টার অ্যাডমিন একাউন্ট মুছে ফেলা যাবে না" disabled>
                                        🔒 ফিক্সড
                                    </button>
                                ` : `
                                    <button type="button" class="btn-danger" onclick="deleteStaffUser('${safeMob}')" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 5px;" title="মুছে ফেলুন">
                                        🗑️
                                    </button>
                                `}
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        let pwdHiddenStates = {};
        function togglePasswordDisplay(idx, pwd) {
            const el = document.getElementById(`pwd-display-${idx}`);
            if (!el) return;
            if (!pwdHiddenStates[idx]) {
                el.textContent = '••••••••';
                pwdHiddenStates[idx] = true;
            } else {
                el.textContent = pwd;
                pwdHiddenStates[idx] = false;
            }
        }

        function filterStaffUsersTable() {
            const query = (document.getElementById('user-mgmt-search-input')?.value || '').toLowerCase().trim();
            if (!query) {
                renderStaffUsersTable(cachedStaffUsers);
                return;
            }
            const filtered = cachedStaffUsers.filter(u => {
                const combined = `${u.name} ${u.designation} ${u.mobile} ${u.role}`.toLowerCase();
                return combined.includes(query);
            });
            renderStaffUsersTable(filtered);
        }

        function editStaffUser(mobile) {
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const user = users.find(u => u.mobile === mobile);
            if (!user) return;

            document.getElementById('usr-edit-id').value = user.id || user.mobile;
            document.getElementById('usr-name').value = user.name || '';
            document.getElementById('usr-designation').value = user.designation || '';
            document.getElementById('usr-mobile').value = user.mobile || '';
            document.getElementById('usr-password').value = user.password || user.mobile || '';
            document.getElementById('usr-role').value = user.role || 'teacher';
            document.getElementById('usr-status').value = user.status || 'active';
            document.getElementById('usr-staff-id').value = user.staffId || '';
            document.getElementById('usr-photo').value = user.photo || '';

            const perms = window.getUserPermissions ? window.getUserPermissions(user) : (user.permissions || []);
            setSelectedPermissions(perms);

            const titleEl = document.getElementById('user-form-title');
            const badgeEl = document.getElementById('user-form-mode-badge');
            if (titleEl) titleEl.textContent = `✏️ '${user.name}' এর অ্যাকাউন্ট এডিট`;
            if (badgeEl) {
                badgeEl.textContent = 'এডিট মোড';
                badgeEl.style.background = '#fef3c7';
                badgeEl.style.color = '#b45309';
            }

            document.getElementById('staff-user-account-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function resetStaffUserForm() {
            document.getElementById('staff-user-account-form')?.reset();
            document.getElementById('usr-edit-id').value = '';
            document.getElementById('usr-staff-id').value = '';
            document.getElementById('usr-photo').value = '';
            const staffSelect = document.getElementById('user-staff-select');
            if (staffSelect) staffSelect.value = '';

            const roleSelect = document.getElementById('usr-role');
            if (roleSelect) roleSelect.value = 'teacher';
            const presets = window.ROLE_DEFAULT_PRESETS || {};
            setSelectedPermissions(presets['teacher'] || []);

            const titleEl = document.getElementById('user-form-title');
            const badgeEl = document.getElementById('user-form-mode-badge');
            if (titleEl) titleEl.textContent = '➕ নতুন শিক্ষক/স্টাফ ইউজার যুক্ত করুন';
            if (badgeEl) {
                badgeEl.textContent = 'নতুন ইউজার';
                badgeEl.style.background = '#e0f2fe';
                badgeEl.style.color = '#0284c7';
            }
        }

        function resetStaffUserPasswordToMobile(mobile) {
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const user = users.find(u => u.mobile === mobile);
            if (!user) return;

            if (confirm(`আপনি কি '${user.name}' এর পাসওয়ার্ড রিসেট করে মোবাইল নম্বর (${user.mobile}) করতে চান?`)) {
                user.password = user.mobile;
                user.updatedAt = Date.now();
                if (typeof lastLocalWrites === 'object') lastLocalWrites['school_users'] = Date.now();
                localStorage.setItem('school_users', JSON.stringify(users));
                renderStaffUsersTable(users);
                showToastNotification(`'${user.name}' এর পাসওয়ার্ড মোবাইল নম্বরে রিসেট হয়েছে!`);

                if (window.logUserActivity) {
                    window.logUserActivity('ইউজার ও পারমিশন', 'পাসওয়ার্ড রিসেট', `ইউজার '${user.name}' (${user.designation || 'স্টাফ'}) এর পাসওয়ার্ড মোবাইল নম্বরে রিসেট করা হয়েছে`);
                }
            }
        }

        function toggleStaffUserStatus(mobile) {
            if (mobile === 'admin' || mobile === 'usr_admin') {
                showToastNotification("🔒 প্রধান শিক্ষক / মাস্টার অ্যাডমিন একাউন্ট সবসময় সক্রিয় থাকবে।", "info");
                return;
            }
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const user = users.find(u => u.mobile === mobile);
            if (!user) return;

            user.status = user.status === 'inactive' ? 'active' : 'inactive';
            user.updatedAt = Date.now();
            if (typeof lastLocalWrites === 'object') lastLocalWrites['school_users'] = Date.now();
            localStorage.setItem('school_users', JSON.stringify(users));
            renderStaffUsersTable(users);
            updateUserManagementStats();
            showToastNotification(`একাউন্ট স্ট্যাটাস '${user.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}' করা হয়েছে!`);

            if (window.logUserActivity) {
                window.logUserActivity('ইউজার ও পারমিশন', 'স্ট্যাটাস পরিবর্তন', `ইউজার '${user.name}' এর স্ট্যাটাস '${user.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}' করা হয়েছে`);
            }
        }

        function deleteStaffUser(mobile) {
            if (mobile === 'admin' || mobile === 'usr_admin') {
                alert("🔒 প্রধান শিক্ষক / মাস্টার অ্যাডমিন একাউন্টটি সিস্টেমের মূল একাউন্ট এবং এটি মুছে ফেলা যাবে না।");
                return;
            }
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const user = users.find(u => u.mobile === mobile);
            if (!user) return;
            const delName = user.name || 'শিক্ষক';

            if (confirm(`আপনি কি সত্যিই '${user.name}' এর লগইন অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
                users = users.filter(u => u.mobile !== mobile);
                if (typeof lastLocalWrites === 'object') lastLocalWrites['school_users'] = Date.now();
                localStorage.setItem('school_users', JSON.stringify(users));
                renderStaffUsersTable(users);
                updateUserManagementStats();
                showToastNotification("ইউজার একাউন্ট মুছে ফেলা হয়েছে!");

                if (window.logUserActivity) {
                    window.logUserActivity('ইউজার ও পারমিশন', 'ইউজার মুছে ফেলা', `ইউজার একাউন্ট '${delName}' মুছে ফেলা হয়েছে`);
                }
            }
        }

        function testLoginAsUser(mobile, password, name, designation) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', name);
            localStorage.setItem('school_user_name', name);
            localStorage.setItem('school_user_role', designation || 'সহকারী শিক্ষক');
            localStorage.setItem('school_user_mobile', mobile);
            localStorage.setItem('school_user_id', mobile);
            localStorage.setItem('__school_user_login_time', Date.now().toString());

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            const targetUser = users.find(u => u.mobile === mobile);
            let staffPhoto = targetUser?.photo || '';
            if (!staffPhoto) {
                try {
                    const stList = JSON.parse(localStorage.getItem('school_staff') || '[]');
                    const st = stList.find(s => s.mobile === mobile);
                    if (st && st.photo) staffPhoto = st.photo;
                } catch(e) {}
            }
            localStorage.setItem('school_user_photo', staffPhoto || '');

            const userPerms = window.getUserPermissions ? window.getUserPermissions(targetUser) : (targetUser?.permissions || []);
            localStorage.setItem('school_user_permissions', JSON.stringify(userPerms));
            localStorage.setItem('school_user_role_key', targetUser?.role || 'teacher');

            if (window.sendSchoolHeartbeat) window.sendSchoolHeartbeat();

            if (window.logUserActivity) {
                window.logUserActivity('লগইন ও সেশন', 'সরাসরি লগইন', `অ্যাডমিন '${name}' (${designation}) হিসেবে সফলভাবে লগইন করেছেন`);
            }

            showToastNotification(`স্বাগতম! আপনি '${name}' (${designation}) হিসেবে লগইন করেছেন।`);
            setTimeout(() => {
                location.reload();
            }, 800);
        }

        let activeModalMobile = null;
        function handleEditFromPermissionsModal() {
            if (!activeModalMobile) return;
            const mob = activeModalMobile;
            closeUserPermissionsModal();
            editStaffUser(mob);
        }

        function copyToClipboard(text, msg = 'কপি করা হয়েছে!') {
            navigator.clipboard.writeText(text).then(() => {
                showToastNotification(msg);
            }).catch(() => {
                showToastNotification(text);
            });
        }

        function copyAllCredentialsToClipboard() {
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }
            if (users.length === 0) {
                alert("কপি করার মতো কোনো শিক্ষক ইউজার নেই।");
                return;
            }

            let text = "=====================================================\n";
            text += "আল-হাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যা তীর্থ উচ্চ বিদ্যালয়\n";
            text += "শিক্ষক ও কর্মচারীদের ওয়েবসাইট লগইন আইডি ও পাসওয়ার্ড তালিকা\n";
            text += "লগইন লিংক: http://192.168.0.107:8000\n";
            text += "=====================================================\n\n";

            users.forEach((u, i) => {
                text += `${i + 1}. নাম: ${u.name}\n`;
                text += `   পদবী: ${u.designation || 'সহকারী শিক্ষক'}\n`;
                text += `   ইউজার আইডি (User ID): ${u.mobile}\n`;
                text += `   পাসওয়ার্ড (Password): ${u.password || u.mobile}\n`;
                text += `   স্ট্যাটাস: ${u.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}\n\n`;
            });

            copyToClipboard(text, "সকল শিক্ষক-স্টাফদের ইউজার আইডি ও পাসওয়ার্ড ক্লিপবোর্ডে কপি হয়েছে!");
        }

        // --- PRINTABLE CREDENTIALS SLIPS ---
        function openPrintableCredentialsModal() {
            const modal = document.getElementById('print-credentials-modal');
            const container = document.getElementById('print-credentials-slips-container');
            if (!modal || !container) return;

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('school_users') || '[]');
            } catch (e) {
                users = [];
            }

            if (users.length === 0) {
                alert("প্রিন্ট করার মতো কোনো ইউজার পাওয়া যায়নি। দয়া করে আগে অটো-সিঙ্ক করুন।");
                return;
            }

            const currentOrigin = window.location.origin || 'http://192.168.0.107:8000';

            let html = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
            `;

            users.forEach((u, idx) => {
                html += `
                    <div style="background: #ffffff; border: 2px dashed #0052ff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', serif;">
                        <div style="border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; text-align: center;">
                            <h4 style="margin: 0; font-size: 0.98rem; font-weight: 800; color: #0052ff;">আল-হাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যা তীর্থ উচ্চ বিদ্যালয়</h4>
                            <span style="font-size: 0.74rem; color: #64748b; font-weight: 700;">জলঢাকা, নীলফামারী • শিক্ষক ও স্টাফ লগইন স্লিপ</span>
                        </div>
                        
                        <div style="margin-bottom: 8px; font-size: 0.92rem;">
                            <strong style="color: #0f172a;">👤 নাম:</strong> <span style="font-weight: 800; color: #000000;">${escapeHtml(u.name)}</span>
                        </div>
                        <div style="margin-bottom: 8px; font-size: 0.86rem;">
                            <strong style="color: #0f172a;">💼 পদবী:</strong> <span>${escapeHtml(u.designation || 'সহকারী শিক্ষক')}</span>
                        </div>
                        <div style="margin-bottom: 8px; font-size: 0.86rem; background: #eff6ff; padding: 6px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                            <strong style="color: #1e40af;">🌐 ওয়েবসাইট লিংক:</strong> <span style="font-family: monospace; font-weight: 700; color: #0052ff;">${escapeHtml(currentOrigin)}</span>
                        </div>
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <div style="flex: 1; background: #faf5ff; padding: 6px 10px; border-radius: 6px; border: 1px solid #e9d5ff;">
                                <strong style="display: block; font-size: 0.72rem; color: #7c3aed; text-transform: uppercase;">📱 ইউজার আইডি (User ID)</strong>
                                <span style="font-family: monospace; font-weight: 800; font-size: 0.95rem; color: #6b21a8;">${escapeHtml(u.mobile)}</span>
                            </div>
                            <div style="flex: 1; background: #ecfdf5; padding: 6px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
                                <strong style="display: block; font-size: 0.72rem; color: #059669; text-transform: uppercase;">🔑 পাসওয়ার্ড (Password)</strong>
                                <span style="font-family: monospace; font-weight: 800; font-size: 0.95rem; color: #047857;">${escapeHtml(u.password || u.mobile)}</span>
                            </div>
                        </div>
                        <div style="font-size: 0.70rem; color: #64748b; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                            ⚠️ এই স্লিপটি শিক্ষককে প্রদান করুন। পাসওয়ার্ড কারো সাথে শেয়ার করবেন না।
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
            modal.style.display = 'flex';
        }

        function closePrintableCredentialsModal() {
            const modal = document.getElementById('print-credentials-modal');
            if (modal) modal.style.display = 'none';
        }

        function printCredentialsSlipsSheet() {
            const container = document.getElementById('print-credentials-slips-container');
            if (!container) return;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>শিক্ষক ও স্টাফ লগইন আইডি-পাসওয়ার্ড স্লিপ</title>
                    <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Rashi+Hebrew:wght@600;700;800&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4; margin: 15mm; }
                        body { font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', serif; margin: 0; padding: 0; background: #ffffff; }
                        .slips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                        @media print {
                            .no-print { display: none !important; }
                        }
                    </style>
                </head>
                <body onload="window.print()">
                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0052ff; padding-bottom: 10px;">
                        <h2 style="margin: 0; color: #0052ff;">আল-হাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যা তীর্থ উচ্চ বিদ্যালয়</h2>
                        <p style="margin: 4px 0 0; font-size: 0.90rem; color: #475569;">শিক্ষক ও কর্মচারী ওয়েবসাইট লগইন ইউজার আইডি ও পাসওয়ার্ড স্লিপ</p>
                    </div>
                    ${container.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
        }

        // ==========================================
        // 📱 BULKSMSBD GATEWAY & API CONTROLLERS
        // ==========================================
        const DEFAULT_BULKSMSBD_CONFIG = {
            provider: "BulkSMSBD",
            apiKey: "Cxo5awXxNbJj8P1BN0Pm",
            senderId: "8809648908844",
            apiUrl: "https://bulksmsbd.net/api/smsapi",
            smsType: "text",
            balanceApiUrl: "https://bulksmsbd.net/api/getBalanceApi",
            isEnabled: true
        };

        function loadSmsGatewayConfig() {
            try {
                const stored = localStorage.getItem('school_sms_config');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return { ...DEFAULT_BULKSMSBD_CONFIG, ...parsed };
                }
            } catch (e) { }
            return { ...DEFAULT_BULKSMSBD_CONFIG };
        }

        function loadSmsSettingsForm() {
            const config = loadSmsGatewayConfig();

            // Populate form inputs
            const apiKeyInput = document.getElementById('sms-setting-api-key');
            const senderIdInput = document.getElementById('sms-setting-sender-id');
            const apiUrlInput = document.getElementById('sms-setting-api-url');
            const smsTypeInput = document.getElementById('sms-setting-type');
            const balanceUrlInput = document.getElementById('sms-setting-balance-url');

            if (apiKeyInput) apiKeyInput.value = config.apiKey || DEFAULT_BULKSMSBD_CONFIG.apiKey;
            if (senderIdInput) senderIdInput.value = config.senderId || DEFAULT_BULKSMSBD_CONFIG.senderId;
            if (apiUrlInput) apiUrlInput.value = config.apiUrl || DEFAULT_BULKSMSBD_CONFIG.apiUrl;
            if (smsTypeInput) smsTypeInput.value = config.smsType || DEFAULT_BULKSMSBD_CONFIG.smsType;
            if (balanceUrlInput) balanceUrlInput.value = config.balanceApiUrl || DEFAULT_BULKSMSBD_CONFIG.balanceApiUrl;

            // Update KPI cards
            const kpiSenderId = document.getElementById('sms-kpi-senderid');
            const kpiApiKeyStatus = document.getElementById('sms-kpi-apikey-status');
            if (kpiSenderId) kpiSenderId.textContent = config.senderId || DEFAULT_BULKSMSBD_CONFIG.senderId;
            if (kpiApiKeyStatus) {
                kpiApiKeyStatus.textContent = config.apiKey ? "সংযুক্ত (Active 🟢)" : "Not Configured";
                kpiApiKeyStatus.style.color = config.apiKey ? "#16a34a" : "#dc2626";
            }

            renderBulkSmsLogs();
        }

        function saveSmsGatewayConfig(event) {
            if (event) event.preventDefault();

            const apiKey = document.getElementById('sms-setting-api-key').value.trim();
            const senderId = document.getElementById('sms-setting-sender-id').value.trim();
            const apiUrl = document.getElementById('sms-setting-api-url').value.trim();
            const smsType = document.getElementById('sms-setting-type').value;
            const balanceApiUrl = document.getElementById('sms-setting-balance-url').value.trim();

            if (!apiKey || !senderId) {
                alert("❌ API Key এবং Approved Sender ID পূরণ করা আবশ্যক!");
                return;
            }

            const newConfig = {
                provider: "BulkSMSBD",
                apiKey,
                senderId,
                apiUrl: apiUrl || DEFAULT_BULKSMSBD_CONFIG.apiUrl,
                smsType: smsType || "text",
                balanceApiUrl: balanceApiUrl || DEFAULT_BULKSMSBD_CONFIG.balanceApiUrl,
                isEnabled: true,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('school_sms_config', JSON.stringify(newConfig));
            loadSmsSettingsForm();
            alert("✅ BulkSMSBD API Credentials সফলভাবে সংরক্ষণ করা হয়েছে!");
        }

        function restoreDefaultBulkSmsConfig() {
            if (!confirm("আপনি কি BulkSMSBD ডিফল্ট এপিআই সেটিংসে রিসেট করতে চান?")) return;
            localStorage.setItem('school_sms_config', JSON.stringify(DEFAULT_BULKSMSBD_CONFIG));
            loadSmsSettingsForm();
            alert("✅ ডিফল্ট BulkSMSBD সেটিংস পুনরুদ্ধার করা হয়েছে!");
        }

        async function checkBulkSmsLiveBalance() {
            const config = loadSmsGatewayConfig();
            const balanceDisplay = document.getElementById('sms-live-balance-display');
            if (balanceDisplay) balanceDisplay.textContent = "⏳ লোড হচ্ছে...";

            try {
                const res = await fetch(`/api/sms/balance?api_key=${encodeURIComponent(config.apiKey)}&balance_url=${encodeURIComponent(config.balanceApiUrl || 'https://bulksmsbd.net/api/getBalanceApi')}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.balance !== undefined) {
                        if (balanceDisplay) {
                            balanceDisplay.textContent = `৳ ${data.balance}`;
                            balanceDisplay.style.color = "#16a34a";
                        }
                        return;
                    } else if (data && (data.error_message || data.response_code)) {
                        if (balanceDisplay) {
                            balanceDisplay.textContent = `⚠️ ${data.error_message || `Code ${data.response_code}`}`;
                            balanceDisplay.style.color = "#dc2626";
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn("Backend balance check fallback:", e);
            }

            if (balanceDisplay) {
                balanceDisplay.textContent = "🟢 Active (সংযুক্ত)";
                balanceDisplay.style.color = "#0052ff";
            }
        }

        function formatBangladeshiMobileNumber(num) {
            if (!num) return '';
            let clean = num.toString().replace(/[^0-9]/g, '');
            if (clean.startsWith('880')) return clean;
            if (clean.startsWith('01')) return '88' + clean;
            if (clean.length === 10 && clean.startsWith('1')) return '880' + clean;
            return clean;
        }

        function updateTestSmsCharCounter() {
            const text = document.getElementById('sms-test-message')?.value || '';
            const charCountEl = document.getElementById('sms-test-char-count');
            const creditCountEl = document.getElementById('sms-test-credit-count');

            const chars = text.length;
            if (charCountEl) charCountEl.textContent = `${chars} / 160 characters`;

            const credits = Math.ceil(chars / 160) || 1;
            if (creditCountEl) creditCountEl.textContent = `${credits} SMS Credit` + (credits > 1 ? 's' : '');
        }

        async function sendLiveTestSms(event) {
            if (event) event.preventDefault();

            const phoneInput = document.getElementById('sms-test-phone');
            const messageInput = document.getElementById('sms-test-message');
            const logConsole = document.getElementById('sms-test-log-console');
            const btn = document.getElementById('btn-send-test-sms');

            const phone = phoneInput ? phoneInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!phone || !message) {
                alert("❌ অনুগ্রহ করে প্রাপকের মোবাইল নাম্বার এবং মেসেজ বডি পূরণ করুন!");
                return;
            }

            const cleanPhone = formatBangladeshiMobileNumber(phone);
            if (cleanPhone.length < 11) {
                alert("❌ সঠিক মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX বা 88017XXXXXXXX)!");
                return;
            }

            const config = loadSmsGatewayConfig();
            if (btn) btn.disabled = true;

            const timeStr = new Date().toLocaleTimeString();

            if (logConsole) {
                logConsole.innerHTML = `
                    <div style="color: #38bdf8;">[${timeStr}] 📡 Connecting to BulkSMSBD API Gateway via Secure Backend Proxy...</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; word-break: break-all; margin: 4px 0;">Recipient: ${cleanPhone} | SenderID: ${config.senderId}</div>
                    <div style="color: #facc15;">⏳ Dispatching SMS payload to BulkSMSBD gateway...</div>
                `;
            }

            try {
                const res = await fetch('/api/sms/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: config.apiKey,
                        sender_id: config.senderId,
                        sms_type: config.smsType || 'text',
                        number: cleanPhone,
                        message: message,
                        api_url: config.apiUrl || 'https://bulksmsbd.net/api/smsapi'
                    })
                });

                const data = await res.json();
                const nowTime = new Date().toLocaleTimeString();

                if (data.response_code === 202 || data.response_code === 200 || data.response_code === 1000) {
                    if (logConsole) {
                        logConsole.innerHTML += `
                            <div style="color: #4ade80; font-weight: 700; margin-top: 6px;">[${nowTime}] ✅ SUCCESS: SMS Request Accepted by BulkSMSBD Gateway!</div>
                            <div style="color: #cbd5e1; font-size: 0.8rem;">Recipient: ${cleanPhone} | Response Code: ${data.response_code} | ${data.success_message || 'Delivered'}</div>
                        `;
                        logConsole.scrollTop = logConsole.scrollHeight;
                    }

                    saveBulkSmsLog({
                        timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
                        recipient: cleanPhone,
                        message: message,
                        status: `Success (${data.response_code})`,
                        gateway: 'BulkSMSBD'
                    });

                    if (btn) btn.disabled = false;
                    alert(`✅ Test SMS successfully submitted to BulkSMSBD Gateway for ${cleanPhone}!`);
                } else {
                    const errMsg = data.error_message || data.error || (data.details ? JSON.stringify(data.details) : 'Gateway Rejected Request');
                    if (logConsole) {
                        logConsole.innerHTML += `
                            <div style="color: #f87171; font-weight: 700; margin-top: 6px;">[${nowTime}] ❌ GATEWAY ERROR (Code ${data.response_code || 'Err'}): ${escapeHtml(errMsg)}</div>
                            <div style="color: #fca5a5; font-size: 0.82rem; margin-top: 4px;">📌 কারণ: ${errMsg.includes('not Whitelisted') ? 'BulkSMSBD ড্যাশবোর্ডে গিয়ে আপনার বর্তমান সার্ভার আইপি Whitelist করুন।' : errMsg}</div>
                        `;
                        logConsole.scrollTop = logConsole.scrollHeight;
                    }

                    saveBulkSmsLog({
                        timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
                        recipient: cleanPhone,
                        message: message,
                        status: `Failed (${data.response_code || 'Err'})`,
                        gateway: 'BulkSMSBD'
                    });

                    if (btn) btn.disabled = false;
                    alert(`❌ SMS প্রেরণ ব্যর্থ হয়েছে!\n\nBulkSMSBD Gateway Error (Code: ${data.response_code || 'Error'}):\n${errMsg}`);
                }

            } catch (err) {
                const nowTime = new Date().toLocaleTimeString();
                if (logConsole) {
                    logConsole.innerHTML += `
                        <div style="color: #f87171; font-weight: 700; margin-top: 6px;">[${nowTime}] ⚠️ Network/Server Error: ${err.message}</div>
                    `;
                }

                saveBulkSmsLog({
                    timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
                    recipient: cleanPhone,
                    message: message,
                    status: 'Failed (Network)',
                    gateway: 'BulkSMSBD'
                });

                if (btn) btn.disabled = false;
                alert(`❌ সংযোগ ত্রুটি: ${err.message}`);
            }
        }

        function getBulkSmsLogs() {
            try {
                const stored = localStorage.getItem('school_sms_logs');
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                return [];
            }
        }

        function saveBulkSmsLog(logEntry) {
            try {
                const logs = getBulkSmsLogs();
                logs.unshift({ id: Date.now().toString(), ...logEntry });
                if (logs.length > 200) logs.length = 200;
                localStorage.setItem('school_sms_logs', JSON.stringify(logs));
                renderBulkSmsLogs();
            } catch (e) { }
        }

        function renderBulkSmsLogs() {
            const tbody = document.getElementById('sms-logs-table-tbody');
            if (!tbody) return;

            const logs = getBulkSmsLogs();
            if (logs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 24px; color: #64748b; font-weight: 600;">
                            📭 কোনো এসএমএস হিস্ট্রি পাওয়া যায়নি। টেস্ট মেসেজ পাঠিয়ে গেটওয়ে যাচাই করুন।
                        </td>
                    </tr>
                `;
                return;
            }

            let html = "";
            logs.forEach(item => {
                const isSuccess = (item.status || '').toLowerCase().includes('success') || (item.status || '').includes('202');
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 14px; font-weight: 700; color: #334155; font-size: 0.88rem;">${escapeHtml(item.timestamp || '')}</td>
                        <td style="padding: 10px 14px; font-weight: 800; color: #0052ff; font-family: monospace; font-size: 0.92rem;">${escapeHtml(item.recipient || '')}</td>
                        <td style="padding: 10px 14px; color: #0f172a; font-weight: 600; font-size: 0.88rem; max-width: 320px; word-break: break-word;">${escapeHtml(item.message || '')}</td>
                        <td style="padding: 10px 14px; text-align: center;">
                            <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; background: ${isSuccess ? '#dcfce7' : '#fee2e2'}; color: ${isSuccess ? '#166534' : '#991b1b'}; border: 1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'};">
                                ${escapeHtml(item.status || 'Dispatched')}
                            </span>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function clearBulkSmsLogs() {
            if (!confirm("আপনি কি সকল সংরক্ষিত এসএমএস লগ মুছে ফেলতে চান?")) return;
            localStorage.removeItem('school_sms_logs');
            renderBulkSmsLogs();
        }

        async function sendBulkSmsBdMessage(recipients, messageText, options = {}) {
            const config = loadSmsGatewayConfig();
            if (!config || !config.apiKey || !config.senderId) {
                throw new Error("SMS Gateway is not configured! Please configure API Key and Sender ID in Advance > SMS Gateway API.");
            }

            let numberList = [];
            if (Array.isArray(recipients)) {
                numberList = recipients.map(n => formatBangladeshiMobileNumber(n)).filter(n => n.length >= 10);
            } else if (typeof recipients === 'string') {
                numberList = recipients.split(/[\s,;|]+/).map(n => formatBangladeshiMobileNumber(n)).filter(n => n.length >= 10);
            }

            if (numberList.length === 0) {
                throw new Error("No valid mobile numbers provided!");
            }

            const numberParam = numberList.join(',');

            try {
                const res = await fetch('/api/sms/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: config.apiKey,
                        sender_id: config.senderId,
                        sms_type: config.smsType || 'text',
                        number: numberParam,
                        message: messageText,
                        api_url: config.apiUrl || 'https://bulksmsbd.net/api/smsapi'
                    })
                });

                const data = await res.json();
                const isSuccess = data.response_code === 202 || data.response_code === 200 || data.response_code === 1000;

                saveBulkSmsLog({
                    timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
                    recipient: numberParam,
                    count: numberList.length,
                    message: messageText,
                    status: isSuccess ? `Success (${data.response_code})` : `Failed (${data.response_code || 'Err'})`,
                    response: data.error_message || data.success_message || JSON.stringify(data)
                });

                if (!isSuccess) {
                    throw new Error(data.error_message || `Gateway Error Code: ${data.response_code}`);
                }

                return data;
            } catch (err) {
                saveBulkSmsLog({
                    timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
                    recipient: numberParam,
                    count: numberList.length,
                    message: messageText,
                    status: 'Failed (Network)',
                    response: err.message
                });
                throw err;
            }
        }

        function checkURLParameters() {
            try {
                const params = new URLSearchParams(window.location.search);
                const view = params.get('view');
                if (view) {
                    switchAdvanceView(view);
                } else {
                    switchAdvanceView('general');
                }
            } catch (e) {
                switchAdvanceView('general');
            }
        }

        // Export all View & Navigation functions to window scope
        window.navigateToAdvanceView = navigateToAdvanceView;
        window.switchAdvanceView = switchAdvanceView;

        // Export BulkSMSBD Functions to window scope
        window.loadSmsGatewayConfig = loadSmsGatewayConfig;
        window.loadSmsSettingsForm = loadSmsSettingsForm;
        window.saveSmsGatewayConfig = saveSmsGatewayConfig;
        window.restoreDefaultBulkSmsConfig = restoreDefaultBulkSmsConfig;
        window.checkBulkSmsLiveBalance = checkBulkSmsLiveBalance;
        window.sendLiveTestSms = sendLiveTestSms;
        window.updateTestSmsCharCounter = updateTestSmsCharCounter;
        window.formatBangladeshiMobileNumber = formatBangladeshiMobileNumber;
        window.renderBulkSmsLogs = renderBulkSmsLogs;
        window.clearBulkSmsLogs = clearBulkSmsLogs;
        window.sendBulkSmsBdMessage = sendBulkSmsBdMessage;

        // Export all User Management & Permissions functions to window scope
        window.togglePermissionsPanel = togglePermissionsPanel;
        window.renderPermissionsMatrix = renderPermissionsMatrix;
        window.toggleSingleCategoryAccordion = toggleSingleCategoryAccordion;
        window.getSelectedPermissionIds = getSelectedPermissionIds;
        window.setSelectedPermissions = setSelectedPermissions;
        window.toggleCategoryPermissions = toggleCategoryPermissions;
        window.selectAllPermissions = selectAllPermissions;
        window.resetPermissionsToCurrentRole = resetPermissionsToCurrentRole;
        window.handleRoleSelectionChange = handleRoleSelectionChange;
        window.handleSinglePermissionChange = handleSinglePermissionChange;
        window.updatePermissionsCounter = updatePermissionsCounter;
        window.filterPermissionsMatrix = filterPermissionsMatrix;
        window.showUserPermissionsModal = showUserPermissionsModal;
        window.closeUserPermissionsModal = closeUserPermissionsModal;
        window.handleEditFromPermissionsModal = handleEditFromPermissionsModal;

        window.initUserManagementSection = initUserManagementSection;
        window.getPendingStaffApprovalsList = getPendingStaffApprovalsList;
        window.renderPendingStaffApprovals = renderPendingStaffApprovals;
        window.approveStaffUser = approveStaffUser;
        window.approveAllPendingStaff = approveAllPendingStaff;
        window.openCustomApprovalModal = openCustomApprovalModal;
        window.updateUserManagementStats = updateUserManagementStats;
        window.populateStaffSelectDropdown = populateStaffSelectDropdown;
        window.autoFillUserFromStaff = autoFillUserFromStaff;
        window.syncDefaultPasswordWithMobile = syncDefaultPasswordWithMobile;
        window.setPasswordToMobile = setPasswordToMobile;
        window.saveStaffUserAccount = saveStaffUserAccount;
        window.syncStaffDirectoryToUsers = syncStaffDirectoryToUsers;
        window.renderStaffUsersTable = renderStaffUsersTable;
        window.filterStaffUsersTable = filterStaffUsersTable;
        window.editStaffUser = editStaffUser;
        window.resetStaffUserForm = resetStaffUserForm;
        window.resetStaffUserPasswordToMobile = resetStaffUserPasswordToMobile;
        window.toggleStaffUserStatus = toggleStaffUserStatus;
        window.deleteStaffUser = deleteStaffUser;
        window.testLoginAsUser = testLoginAsUser;
        window.togglePasswordDisplay = togglePasswordDisplay;
        window.copyAllCredentialsToClipboard = copyAllCredentialsToClipboard;
        window.openPrintableCredentialsModal = openPrintableCredentialsModal;
        window.closePrintableCredentialsModal = closePrintableCredentialsModal;
        window.printCredentialsSlipsSheet = printCredentialsSlipsSheet;
        window.copyToClipboard = copyToClipboard;

        window.fetchActiveUsers = fetchActiveUsers;
        window.filterActiveUsersTable = filterActiveUsersTable;
        window.renderActiveUsersTable = renderActiveUsersTable;
        window.fetchActivityLogs = fetchActivityLogs;
        window.renderActivityLogsTable = renderActivityLogsTable;
        window.filterActivityLogsTable = filterActivityLogsTable;
        window.confirmClearActivityLogs = confirmClearActivityLogs;
        window.exportActivityLogs = exportActivityLogs;
        window.openEditProfileModal = openEditProfileModal;
        window.closeEditProfileModal = closeEditProfileModal;
        window.saveUserProfile = saveUserProfile;
        window.initChatSection = initChatSection;
        window.checkURLParameters = checkURLParameters;

        // Initialize dashboard details
        document.addEventListener('DOMContentLoaded', () => {
            loadCurrentSettings();
            renderHeroBgPreview();
            renderPermissionsMatrix();
            checkURLParameters();
            renderTickerNotices();
            renderImportantLinksTable();
            populateStaffSelectDropdown(false);
            renderPendingStaffApprovals(false);
            renderStaffUsersTable();
            updateUserManagementStats();
            fetchActivityLogs(false);

            // Recheck if URL hash or search parameters change without reloading
            window.addEventListener('popstate', checkURLParameters);

            // Programmatic event delegation for designation list actions
            const tbody = document.getElementById('designation-list-tbody');
            if (tbody) {
                tbody.addEventListener('click', (event) => {
                    const deleteBtn = event.target.closest('.btn-delete-designation');
                    if (deleteBtn) {
                        const index = parseInt(deleteBtn.getAttribute('data-index'), 10);
                        deleteDesignation(index);
                        return;
                    }
                    const editBtn = event.target.closest('.btn-edit-designation');
                    if (editBtn) {
                        const index = parseInt(editBtn.getAttribute('data-index'), 10);
                        editDesignation(index);
                        return;
                    }
                });
            }
        });
    