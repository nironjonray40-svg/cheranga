
// BLOCK 3

        // --- STAFF MANAGEMENT DATABASE SYSTEM ---
        let currentStaffPhotoBase64 = "";
        let currentStaffPage = 1;
        const staffPerPage = 10;

        // Image helper: Square crop & resize to 300x300 (1:1 ratio) with 300 DPI target
        function resizeImageToSquare300(img) {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 300, 300);
            return canvas.toDataURL('image/jpeg', 0.92);
        }

        // Signature helper: Resize/fit to 300x80 canvas with transparency preserved (PNG)
        function resizeImageToSignature(img) {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 300, 80);

            const hRatio = 300 / img.width;
            const vRatio = 80 / img.height;
            const ratio = Math.min(hRatio, vRatio, 1);
            const drawW = img.width * ratio;
            const drawH = img.height * ratio;
            const offsetX = (300 - drawW) / 2;
            const offsetY = (80 - drawH) / 2;

            ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawW, drawH);
            return canvas.toDataURL('image/png');
        }

        // Backward compatibility helper
        function resizeImageToPassport(img) {
            return resizeImageToSquare300(img);
        }

        function previewStaffPhoto(input) {
            const file = input.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert("Please select a valid image file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    currentStaffPhotoBase64 = resizeImageToPassport(img);

                    // Show preview UI
                    if (document.getElementById('staff-photo-placeholder')) {
                        document.getElementById('staff-photo-placeholder').style.display = 'none';
                    }
                    const previewImg = document.getElementById('staff-photo-preview');
                    if (previewImg) {
                        previewImg.src = currentStaffPhotoBase64;
                        previewImg.style.display = 'block';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function loadStaffList() {
            const stored = localStorage.getItem('school_staff');
            if (!stored) {
                return [];
            }
            try {
                const list = JSON.parse(stored);
                let updated = false;
                list.forEach(staff => {
                    if (!staff.joining) {
                        staff.joining = "2024-01-01";
                        updated = true;
                    }
                });
                if (updated) {
                    localStorage.setItem('school_staff', JSON.stringify(list));
                }
                return list;
            } catch (e) {
                return [];
            }
        }

        function formatJoiningDate(joiningStr) {
            if (!joiningStr || String(joiningStr).trim() === '') return '01-01-2024';
            const parts = String(joiningStr).split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return joiningStr;
        }

        function updateStaffSummaryTable(list) {
            let teacherTotal = 0, teacherMale = 0, teacherFemale = 0, teacherMpo = 0;
            let staffTotal = 0, staffMale = 0, staffFemale = 0, staffMpo = 0;

            (list || []).forEach(item => {
                const isTeacher = (item.category === 'Teacher' || item.category === 'শিক্ষক');
                const isMale = (item.gender === 'Male' || item.gender === 'পুরুষ');
                const isFemale = (item.gender === 'Female' || item.gender === 'মহিলা');
                const isMpo = ((item.mpoStatus || item.mpo) === 'MPO');

                if (isTeacher) {
                    teacherTotal++;
                    if (isMale) teacherMale++;
                    else if (isFemale) teacherFemale++;
                    if (isMpo) teacherMpo++;
                } else {
                    staffTotal++;
                    if (isMale) staffMale++;
                    else if (isFemale) staffFemale++;
                    if (isMpo) staffMpo++;
                }
            });

            const tTot = document.getElementById('sum-teacher-total');
            const tMal = document.getElementById('sum-teacher-male');
            const tFem = document.getElementById('sum-teacher-female');
            const tMpo = document.getElementById('sum-teacher-mpo');
            const sTot = document.getElementById('sum-staff-total');
            const sMal = document.getElementById('sum-staff-male');
            const sFem = document.getElementById('sum-staff-female');
            const sMpo = document.getElementById('sum-staff-mpo');

            if (tTot) tTot.innerText = teacherTotal;
            if (tMal) tMal.innerText = teacherMale;
            if (tFem) tFem.innerText = teacherFemale;
            if (tMpo) tMpo.innerText = teacherMpo;
            if (sTot) sTot.innerText = staffTotal;
            if (sMal) sMal.innerText = staffMale;
            if (sFem) sFem.innerText = staffFemale;
            if (sMpo) sMpo.innerText = staffMpo;
        }

        function onStaffSearchInput() {
            const searchInput = document.getElementById('staff-search-input');
            const clearBtn = document.getElementById('staff-search-clear-btn');
            if (searchInput && clearBtn) {
                clearBtn.style.display = searchInput.value.trim() !== '' ? 'block' : 'none';
            }
            currentStaffPage = 1;
            renderStaffList();
        }

        function clearStaffSearch() {
            const searchInput = document.getElementById('staff-search-input');
            const categorySelect = document.getElementById('staff-search-category');
            const mpoSelect = document.getElementById('staff-search-mpo');
            const clearBtn = document.getElementById('staff-search-clear-btn');

            if (searchInput) searchInput.value = '';
            if (categorySelect) categorySelect.value = 'all';
            if (mpoSelect) mpoSelect.value = 'all';
            if (clearBtn) clearBtn.style.display = 'none';

            currentStaffPage = 1;
            renderStaffList();
        }

        function getFilteredStaffList() {
            const fullList = loadStaffList();
            const searchInput = document.getElementById('staff-search-input');
            const categorySelect = document.getElementById('staff-search-category');
            const mpoSelect = document.getElementById('staff-search-mpo');

            const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const categoryFilter = categorySelect ? categorySelect.value : 'all';
            const mpoFilter = mpoSelect ? mpoSelect.value : 'all';

            const isFilteringActive = (searchTerm !== '' || categoryFilter !== 'all' || mpoFilter !== 'all');

            const countBadge = document.getElementById('staff-search-count-badge');
            const countVal = document.getElementById('staff-search-count-val');
            const resetBtn = document.getElementById('staff-search-reset-btn');

            const filteredList = fullList.filter(staff => {
                // Category filter
                if (categoryFilter !== 'all') {
                    const isTeacher = (staff.category === 'Teacher' || staff.category === 'শিক্ষক');
                    if (categoryFilter === 'Teacher' && !isTeacher) return false;
                    if (categoryFilter === 'Staff' && isTeacher) return false;
                }

                // MPO filter
                if (mpoFilter !== 'all') {
                    const isMpo = ((staff.mpoStatus || staff.mpo) === 'MPO');
                    if (mpoFilter === 'MPO' && !isMpo) return false;
                    if (mpoFilter === 'Non-MPO' && isMpo) return false;
                }

                // Search query
                if (searchTerm) {
                    const fieldsToSearch = [
                        staff.staffId,
                        staff.name,
                        staff.nameBn,
                        staff.designation,
                        staff.department,
                        staff.subject,
                        staff.mobile,
                        staff.email,
                        staff.nid,
                        staff.category,
                        staff.mpoStatus || staff.mpo,
                        staff.gender,
                        staff.qualification,
                        staff.presentAddr,
                        staff.permanentAddr
                    ];
                    const match = fieldsToSearch.some(field => field && String(field).toLowerCase().includes(searchTerm));
                    if (!match) return false;
                }

                return true;
            });

            if (countBadge && countVal) {
                if (isFilteringActive) {
                    countBadge.style.display = 'inline-block';
                    countVal.innerText = filteredList.length;
                } else {
                    countBadge.style.display = 'none';
                }
            }
            if (resetBtn) {
                resetBtn.style.display = isFilteringActive ? 'inline-block' : 'none';
            }

            return { fullList: fullList, filteredList: filteredList, isFilteringActive: isFilteringActive };
        }

        function renderStaffList() {
            const tbody = document.getElementById('staff-list-tbody');
            if (!tbody) return;

            const { fullList, filteredList, isFilteringActive } = getFilteredStaffList();
            updateStaffSummaryTable(fullList);

            const totalItems = filteredList.length;

            if (totalItems === 0) {
                const searchInput = document.getElementById('staff-search-input');
                const queryVal = searchInput ? searchInput.value.trim() : '';
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px 20px; color: #4b5563;">
                            <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
                            <div style="font-size: 1.1rem; font-weight: 700; color: #1f2937;">কোনো শিক্ষক বা কর্মচারীর তথ্য পাওয়া যায়নি</div>
                            ${queryVal ? `<div style="font-size: 0.9rem; color: #6b7280; margin-top: 4px;">"${queryVal}"-এর সাথে মেলে এমন কোনো তথ্য তালিকায় নেই।</div>` : ''}
                            <button type="button" onclick="clearStaffSearch()" style="margin-top: 15px; padding: 8px 18px; font-size: 0.88rem; font-weight: 700; background: #4f46e5; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 6px rgba(79,70,229,0.3);">
                                🔄 সকল তালিকা দেখুন (Reset Search)
                            </button>
                        </td>
                    </tr>
                `;
                const infoEl = document.getElementById('staff-pagination-info');
                if (infoEl) infoEl.innerText = isFilteringActive ? "মোট: ০ জন (ফিল্টারকৃত) | পাতা: ০ এর ০" : "মোট: ০ জন | পাতা: ০ এর ০";
                updateStaffPaginationButtons(0, 0);
                return;
            }

            const totalPages = Math.ceil(totalItems / staffPerPage) || 1;
            if (currentStaffPage > totalPages) {
                currentStaffPage = totalPages;
            }
            if (currentStaffPage < 1) {
                currentStaffPage = 1;
            }

            const startIndex = (currentStaffPage - 1) * staffPerPage;
            const endIndex = Math.min(startIndex + staffPerPage, totalItems);
            const paginatedList = filteredList.slice(startIndex, endIndex);

            let html = '';
            paginatedList.forEach((staff, pIndex) => {
                const actualIndex = fullList.indexOf(staff);
                const photoHtml = staff.photo
                    ? `<img src="${staff.photo}" style="width: 51px; height: 64px; border-radius: 4px; object-fit: cover; display: block; margin: 0 auto; border: 1.5px solid var(--neon-cyan); box-shadow: var(--cyan-glow);">`
                    : `<div style="width: 51px; height: 64px; border-radius: 4px; background: rgba(0,0,0,0.05); border: 1px dashed rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto; color: var(--muted-text);"><svg viewBox="0 0 24 24" style="width: 23px; height: 23px; fill: currentColor;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                const formattedJoining = formatJoiningDate(staff.joining || staff.joiningDate || staff.joinDate);

                html += `
                    <tr style="border-bottom: 1px solid var(--glass-border); opacity: 1;">
                        <td style="text-align: center; font-weight: 700; padding: 3.5px 10px; color: #000000;">${startIndex + pIndex + 1}</td>
                        <td style="padding: 3.5px 7px;">${photoHtml}</td>
                        <td class="staff-id" style="font-weight: 600; padding: 3.5px 10px; color: #2563eb;">${staff.staffId}</td>
                        <td class="staff-name" style="padding: 3.5px 10px; color: #000000;">
                            <div style="font-weight: 700; line-height: 1.15; color: #000000; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <span>${staff.name}</span>
                                ${staff.nameBn ? `<span style="font-size: 0.85rem; color: #4b5563; font-weight: 600;">(${staff.nameBn})</span>` : ''}
                                ${(staff.mpoStatus || staff.mpo) ? `<span style="font-size: 0.72rem; padding: 1px 6px; border-radius: 4px; background: ${(staff.mpoStatus || staff.mpo) === 'MPO' ? '#10b981' : '#f59e0b'}; color: #fff; font-weight: 700;">${staff.mpoStatus || staff.mpo}</span>` : ''}
                            </div>
                            <div style="font-size: 1rem; color: #111827; font-weight: 600; margin-top: 1px; line-height: 1.15;">
                                ${staff.designation || ''}
                            </div>
                        </td>
                        <td style="padding: 3.5px 10px; color: #000000;">
                            <div style="font-weight: 600; line-height: 1.15; color: #000000;">${staff.mobile || '-'}</div>
                            <div style="font-size: 1rem; color: #111827; font-weight: 600; margin-top: 1px; line-height: 1.15;">
                                Join: ${formattedJoining}
                            </div>
                        </td>
                        <td style="text-align: center; padding: 3.5px 10px;">
                            <div class="action-icons-wrapper">
                                <button class="action-icon-btn view-btn" onclick="viewStaffDetails(${actualIndex})" title="View Details">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <button class="action-icon-btn edit-btn" onclick="openEditStaffModal(${actualIndex})" title="Update Info">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="action-icon-btn delete-btn" onclick="deleteStaffMember(${actualIndex})" title="Delete Staff">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;

            const infoEl = document.getElementById('staff-pagination-info');
            if (infoEl) {
                infoEl.innerText = isFilteringActive
                    ? `মোট: ${totalItems} জন (ফিল্টারকৃত) | পাতা: ${currentStaffPage} এর ${totalPages}`
                    : `মোট: ${totalItems} জন | পাতা: ${currentStaffPage} এর ${totalPages}`;
            }
            updateStaffPaginationButtons(currentStaffPage, totalPages);
        }

        function updateStaffPaginationButtons(currentPage, totalPages) {
            const firstBtn = document.getElementById('staff-page-first');
            const prevBtn = document.getElementById('staff-page-prev');
            const nextBtn = document.getElementById('staff-page-next');
            const lastBtn = document.getElementById('staff-page-last');
            const numbersContainer = document.getElementById('staff-page-numbers');

            if (firstBtn) firstBtn.disabled = (currentPage <= 1 || totalPages <= 1);
            if (prevBtn) prevBtn.disabled = (currentPage <= 1 || totalPages <= 1);
            if (nextBtn) nextBtn.disabled = (currentPage >= totalPages || totalPages <= 1);
            if (lastBtn) lastBtn.disabled = (currentPage >= totalPages || totalPages <= 1);

            if (numbersContainer) {
                let numHtml = '';
                if (totalPages > 1) {
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                    }
                    for (let p = startPage; p <= endPage; p++) {
                        numHtml += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="goToStaffPage(${p})">${p}</button>`;
                    }
                }
                numbersContainer.innerHTML = numHtml;
            }
        }

        function changeStaffPage(delta) {
            const { filteredList } = getFilteredStaffList();
            const totalPages = Math.ceil(filteredList.length / staffPerPage) || 1;
            const target = currentStaffPage + delta;
            if (target >= 1 && target <= totalPages) {
                currentStaffPage = target;
                renderStaffList();
            }
        }

        function goToStaffPage(page) {
            const { filteredList } = getFilteredStaffList();
            const totalPages = Math.ceil(filteredList.length / staffPerPage) || 1;
            if (page === 'last') page = totalPages;
            if (page >= 1 && page <= totalPages) {
                currentStaffPage = page;
                renderStaffList();
            }
        }

        function deleteStaffMember(index) {
            const list = loadStaffList();
            const staff = list[index];
            if (!staff) return;

            const displayName = staff.nameBn ? `${staff.name} (${staff.nameBn})` : (staff.name || staff.staffId);
            if (confirm(`আপনি কি নিশ্চিত যে "${displayName}"-এর তথ্য তালিকা থেকে মুছে ফেলতে চান?`)) {
                list.splice(index, 1);

                if (typeof lastLocalWrites === 'object') {
                    lastLocalWrites['school_staff'] = Date.now();
                }
                localStorage.setItem('school_staff', JSON.stringify(list));

                // Adjust pagination if needed
                const totalPages = Math.ceil(list.length / staffPerPage) || 1;
                if (currentStaffPage > totalPages) {
                    currentStaffPage = totalPages;
                }

                renderStaffList();
                alert("শিক্ষক/কর্মচারীর তথ্য সফলভাবে মুছে ফেলা হয়েছে!");
            }
        }

        // --- STAFF MODAL DIALOG CONTROLLERS ---
        let currentModalPhotoBase64 = "";
        let currentModalSignatureBase64 = "";

        function toggleSubjectField() {
            const category = document.getElementById('modal-staff-category').value;
            const container = document.getElementById('subject-field-container');
            if (category === 'Teacher') {
                container.style.display = 'flex';
            } else {
                container.style.display = 'none';
                document.getElementById('modal-staff-subject').value = '';
            }
        }

        function generateAutoStaffIdByDob(dobVal, list = []) {
            const currentYearStr = new Date().getFullYear().toString().slice(-2);
            let birthYearStr = "90";

            if (dobVal) {
                const d = new Date(dobVal);
                if (!isNaN(d.getTime())) {
                    birthYearStr = d.getFullYear().toString().slice(-2);
                } else if (typeof dobVal === 'string' && /^\d{4}/.test(dobVal)) {
                    birthYearStr = dobVal.slice(2, 4);
                }
            }

            const prefix = currentYearStr + birthYearStr;

            let maxSerial = 0;
            list.forEach(staff => {
                if (staff && staff.staffId) {
                    const idStr = String(staff.staffId).trim();
                    if (idStr.startsWith(prefix) && idStr.length === 6) {
                        const serialStr = idStr.slice(-2);
                        const serialNum = parseInt(serialStr, 10);
                        if (!isNaN(serialNum) && serialNum > maxSerial) {
                            maxSerial = serialNum;
                        }
                    }
                }
            });

            const nextSerial = maxSerial + 1;
            return prefix + nextSerial.toString().padStart(2, '0');
        }

        function generateAutoStaffId() {
            const dobVal = document.getElementById('modal-staff-dob').value;
            if (!dobVal) return;

            const editIndex = document.getElementById('staff-edit-index').value;
            if (editIndex !== "") return; // Don't overwrite existing staff ID when editing

            const list = loadStaffList();
            document.getElementById('modal-staff-id').value = generateAutoStaffIdByDob(dobVal, list);
        }

        function copyAddress() {
            const checkbox = document.getElementById('modal-staff-same-address');
            const present = document.getElementById('modal-staff-present-addr');
            const permanent = document.getElementById('modal-staff-permanent-addr');
            if (checkbox.checked) {
                permanent.value = present.value;
                permanent.setAttribute('readonly', 'true');
                present.addEventListener('input', updatePermanentAddress);
            } else {
                permanent.removeAttribute('readonly');
                present.removeEventListener('input', updatePermanentAddress);
            }
        }

        function updatePermanentAddress() {
            const checkbox = document.getElementById('modal-staff-same-address');
            if (checkbox && checkbox.checked) {
                document.getElementById('modal-staff-permanent-addr').value = document.getElementById('modal-staff-present-addr').value;
            }
        }

        function toggleStaffModalFullscreen() {
            const modalContent = document.querySelector('#staff-modal .modal-content');
            const btn = document.querySelector('#staff-modal .fullscreen-btn');
            if (modalContent.classList.contains('fullscreen')) {
                modalContent.classList.remove('fullscreen');
                btn.innerText = "⛶";
                btn.title = "Full Screen";
            } else {
                modalContent.classList.add('fullscreen');
                btn.innerText = "🗗";
                btn.title = "Restore Size";
            }
        }

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
        window.isHeadmasterDesignation = isHeadmasterDesignation;

        function loadDesignationList() {
            const stored = localStorage.getItem('school_designations');
            if (!stored) {
                const defaults = [
                    { name: "প্রধান শিক্ষক (Headmaster)", category: "Teacher" },
                    { name: "সহকারী প্রধান শিক্ষক (Assistant Headmaster)", category: "Teacher" },
                    { name: "সিনিয়র শিক্ষক (Senior Teacher)", category: "Teacher" },
                    { name: "সহকারী শিক্ষক (Assistant Teacher)", category: "Teacher" },
                    { name: "জুনিয়র শিক্ষক (Junior Teacher)", category: "Teacher" },
                    { name: "ট্রেড ইন্সট্রাক্টর (Trade Instructor)", category: "Teacher" },
                    { name: "কম্পিউটার ডেমোনস্ট্রেটর (Computer Demonstrator)", category: "Teacher" },
                    { name: "অফিস সহকারী কাম কম্পিউটার অপারেটর", category: "Staff" },
                    { name: "হিসাব সহকারী (Accounts Assistant)", category: "Staff" },
                    { name: "গ্রন্থাগারিক / লাইব্রেরিয়ান (Librarian)", category: "Staff" },
                    { name: "অফিস সহায়ক / পিয়ন (MLSS / Peon)", category: "Staff" },
                    { name: "নিরাপত্তাকর্মী (Security Guard)", category: "Staff" },
                    { name: "পরিচ্ছন্নতাকর্মী (Cleaner)", category: "Staff" },
                    { name: "আয়া (Aya)", category: "Staff" }
                ];
                localStorage.setItem('school_designations', JSON.stringify(defaults));
                return defaults;
            }
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && !parsed.some(d => isHeadmasterDesignation(d.name))) {
                    parsed.unshift({ name: "প্রধান শিক্ষক (Headmaster)", category: "Teacher" });
                }
                return parsed;
            } catch (e) {
                return [];
            }
        }

        function populateDesignationDropdown() {
            const category = document.getElementById('modal-staff-category').value;
            const department = document.getElementById('modal-staff-department') ? document.getElementById('modal-staff-department').value : '';
            const selectEl = document.getElementById('modal-staff-designation');
            if (!selectEl) return;

            const previousValue = selectEl.value;

            const list = loadDesignationList();
            const staffList = loadStaffList();
            const editIndexVal = document.getElementById('staff-edit-index') ? document.getElementById('staff-edit-index').value : '';
            const currentEditIdx = editIndexVal !== '' ? parseInt(editIndexVal, 10) : -1;

            // Check if there is already an existing headmaster for Primary Level and High Level (excluding current editing staff)
            const primaryHm = staffList.find((s, idx) => idx !== currentEditIdx && isHeadmasterDesignation(s.designation) && (s.department || s.dept || '').toLowerCase() === 'primary level');
            const highHm = staffList.find((s, idx) => idx !== currentEditIdx && isHeadmasterDesignation(s.designation) && (s.department || s.dept || '').toLowerCase() === 'high level');

            // Filter by category if one is selected
            const filtered = list.filter(item => !category || item.category === category);

            let html = '<option value="" disabled selected>পদবী নির্বাচন করুন (Select Designation)</option>';
            filtered.forEach(item => {
                const isHead = isHeadmasterDesignation(item.name);
                if (isHead) {
                    if (department === 'Primary Level' && primaryHm) {
                        const hmName = primaryHm.nameBn ? `${primaryHm.name} (${primaryHm.nameBn})` : (primaryHm.name || primaryHm.staffId);
                        html += `<option value="${item.name}" disabled style="color: #9ca3af; background: #f3f4f6;">${item.name} (Primary Level-এ ইতিমধ্যে যুক্ত: ${hmName})</option>`;
                    } else if (department === 'High Level' && highHm) {
                        const hmName = highHm.nameBn ? `${highHm.name} (${highHm.nameBn})` : (highHm.name || highHm.staffId);
                        html += `<option value="${item.name}" disabled style="color: #9ca3af; background: #f3f4f6;">${item.name} (High Level-এ ইতিমধ্যে যুক্ত: ${hmName})</option>`;
                    } else if (!department && primaryHm && highHm) {
                        html += `<option value="${item.name}" disabled style="color: #9ca3af; background: #f3f4f6;">${item.name} (উভয় বিভাগে ২ জন প্রধান শিক্ষক বিদ্যমান)</option>`;
                    } else {
                        html += `<option value="${item.name}">${item.name}</option>`;
                    }
                } else {
                    html += `<option value="${item.name}">${item.name}</option>`;
                }
            });

            selectEl.innerHTML = html;
            if (previousValue && selectEl.querySelector(`option[value="${previousValue}"]:not([disabled])`)) {
                selectEl.value = previousValue;
            }
        }

        function openAddStaffModal() {
            document.getElementById('modal-title').innerText = "নতুন শিক্ষক ও কর্মচারী যুক্ত করুন (Add New Teacher / Staff)";
            document.getElementById('staff-edit-index').value = "";
            document.getElementById('staff-modal-form').reset();
            if (document.getElementById('modal-staff-mpo')) document.getElementById('modal-staff-mpo').value = "";
            if (document.getElementById('modal-staff-department')) document.getElementById('modal-staff-department').value = "";
            
            // Reset photo
            currentModalPhotoBase64 = "";
            document.getElementById('modal-photo-placeholder').style.display = 'flex';
            document.getElementById('modal-photo-preview').src = "";
            document.getElementById('modal-photo-preview').style.display = 'none';
            if (document.getElementById('modal-photo-input')) document.getElementById('modal-photo-input').value = "";
            if (document.getElementById('modal-photo-remove-btn')) document.getElementById('modal-photo-remove-btn').style.display = 'none';

            // Reset signature
            currentModalSignatureBase64 = "";
            if (document.getElementById('modal-signature-placeholder')) document.getElementById('modal-signature-placeholder').style.display = 'flex';
            if (document.getElementById('modal-signature-preview')) {
                document.getElementById('modal-signature-preview').src = "";
                document.getElementById('modal-signature-preview').style.display = 'none';
            }
            if (document.getElementById('modal-signature-input')) document.getElementById('modal-signature-input').value = "";
            if (document.getElementById('modal-signature-remove-btn')) document.getElementById('modal-signature-remove-btn').style.display = 'none';

            // Reset nameBn field
            if (document.getElementById('modal-staff-name-bn')) {
                document.getElementById('modal-staff-name-bn').value = "";
            }

            // Populate designation dropdown after reset
            populateDesignationDropdown();
            document.getElementById('subject-field-container').style.display = 'none';

            // Set fullscreen state by default
            const modalContent = document.querySelector('#staff-modal .modal-content');
            if (modalContent) modalContent.classList.add('fullscreen');
            const fullscreenBtn = document.querySelector('#staff-modal .fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerText = "🗗";
                fullscreenBtn.title = "Restore Size";
            }

            // Reset address checkbox and state
            document.getElementById('modal-staff-same-address').checked = false;
            document.getElementById('modal-staff-permanent-addr').removeAttribute('readonly');
            document.getElementById('modal-staff-present-addr').removeEventListener('input', updatePermanentAddress);

            document.getElementById('staff-modal').style.display = 'block';
        }

        function openEditStaffModal(index) {
            const list = loadStaffList();
            const staff = list[index];
            if (!staff) return;

            // Set fullscreen state by default
            const modalContent = document.querySelector('#staff-modal .modal-content');
            if (modalContent) modalContent.classList.add('fullscreen');
            const fullscreenBtn = document.querySelector('#staff-modal .fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerText = "🗗";
                fullscreenBtn.title = "Restore Size";
            }

            document.getElementById('modal-title').innerText = "তথ্য আপডেট করুন (Update Staff)";
            document.getElementById('staff-edit-index').value = index;
            document.getElementById('modal-staff-id').value = staff.staffId || "";
            document.getElementById('modal-staff-name').value = staff.name || "";
            if (document.getElementById('modal-staff-name-bn')) {
                document.getElementById('modal-staff-name-bn').value = staff.nameBn || staff.name_bn || "";
            }
            document.getElementById('modal-staff-mobile').value = staff.mobile || "";

            document.getElementById('modal-staff-category').value = staff.category || "";
            populateDesignationDropdown();
            document.getElementById('modal-staff-designation').value = staff.designation || "";
            if (document.getElementById('modal-staff-department')) document.getElementById('modal-staff-department').value = staff.department || staff.dept || "";
            if (document.getElementById('modal-staff-mpo')) document.getElementById('modal-staff-mpo').value = staff.mpoStatus || staff.mpo || "";
            document.getElementById('modal-staff-subject').value = staff.subject || "";
            document.getElementById('modal-staff-gender').value = staff.gender || "";
            document.getElementById('modal-staff-dob').value = staff.dob || "";
            document.getElementById('modal-staff-blood').value = staff.blood || "";
            document.getElementById('modal-staff-email').value = staff.email || "";
            document.getElementById('modal-staff-nid').value = staff.nid || "";
            document.getElementById('modal-staff-joining').value = staff.joining || "";
            document.getElementById('modal-staff-qualification').value = staff.qualification || "";
            document.getElementById('modal-staff-present-addr').value = staff.presentAddr || "";
            document.getElementById('modal-staff-permanent-addr').value = staff.permanentAddr || "";

            toggleSubjectField();

            // Set address checkbox and state based on saved values
            const sameAddrCheckbox = document.getElementById('modal-staff-same-address');
            const presentAddr = staff.presentAddr || "";
            const permanentAddr = staff.permanentAddr || "";
            if (presentAddr && permanentAddr && presentAddr === permanentAddr) {
                sameAddrCheckbox.checked = true;
                document.getElementById('modal-staff-permanent-addr').setAttribute('readonly', 'true');
                document.getElementById('modal-staff-present-addr').addEventListener('input', updatePermanentAddress);
            } else {
                sameAddrCheckbox.checked = false;
                document.getElementById('modal-staff-permanent-addr').removeAttribute('readonly');
                document.getElementById('modal-staff-present-addr').removeEventListener('input', updatePermanentAddress);
            }

            // Photo preview setup
            currentModalPhotoBase64 = staff.photo || "";
            if (currentModalPhotoBase64) {
                document.getElementById('modal-photo-placeholder').style.display = 'none';
                const previewImg = document.getElementById('modal-photo-preview');
                previewImg.src = currentModalPhotoBase64;
                previewImg.style.display = 'block';
                if (document.getElementById('modal-photo-remove-btn')) document.getElementById('modal-photo-remove-btn').style.display = 'inline-flex';
            } else {
                document.getElementById('modal-photo-placeholder').style.display = 'flex';
                document.getElementById('modal-photo-preview').style.display = 'none';
                if (document.getElementById('modal-photo-remove-btn')) document.getElementById('modal-photo-remove-btn').style.display = 'none';
            }

            // Signature preview setup
            currentModalSignatureBase64 = staff.signature || "";
            if (currentModalSignatureBase64) {
                if (document.getElementById('modal-signature-placeholder')) document.getElementById('modal-signature-placeholder').style.display = 'none';
                const sigPreviewImg = document.getElementById('modal-signature-preview');
                if (sigPreviewImg) {
                    sigPreviewImg.src = currentModalSignatureBase64;
                    sigPreviewImg.style.display = 'block';
                }
                if (document.getElementById('modal-signature-remove-btn')) document.getElementById('modal-signature-remove-btn').style.display = 'inline-flex';
            } else {
                if (document.getElementById('modal-signature-placeholder')) document.getElementById('modal-signature-placeholder').style.display = 'flex';
                if (document.getElementById('modal-signature-preview')) document.getElementById('modal-signature-preview').style.display = 'none';
                if (document.getElementById('modal-signature-remove-btn')) document.getElementById('modal-signature-remove-btn').style.display = 'none';
            }

            document.getElementById('staff-modal').style.display = 'block';
        }

        function viewStaffDetails(index) {
            const list = loadStaffList();
            const staff = list[index];
            if (!staff) return;

            // Fetch dynamic school settings
            let settings = localStorage.getItem('school_settings');
            try {
                settings = settings ? JSON.parse(settings) : {};
            } catch (e) {
                settings = {};
            }
            const schoolName = settings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const schoolAddress = settings.schoolAddress || "Sector-10, Uttara, Dhaka-1230, Bangladesh";

            // Update School Info on CV Header
            document.getElementById('view-school-name').innerText = schoolName;
            document.getElementById('view-school-address').innerText = schoolAddress;

            // Update Logo on CV Header
            const logoContainer = document.getElementById('view-school-logo');
            const customLogo = localStorage.getItem('school_logo');
            if (customLogo) {
                logoContainer.innerHTML = `<img src="${customLogo}" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
            } else {
                logoContainer.innerHTML = `
                    <svg viewBox="0 0 24 24" style="width: 70%; height: 70%; fill: #1e3a8a;">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5.89 12.55L12 15.88l6.11-3.33c.6.3 1.89.88 1.89 1.45 0 .58-1.29 1.15-1.89 1.45L12 18.78l-6.11-3.33C5.29 15.15 4 14.58 4 14c0-.58 1.29-1.15 1.89-1.45z"/>
                    </svg>
                `;
            }

            // Category specific label
            const titleLabel = document.getElementById('view-title-label');
            if (staff.category === 'Teacher') {
                titleLabel.innerText = "শিক্ষকের প্রোফাইল";
            } else {
                titleLabel.innerText = "কর্মচারীর প্রোফাইল";
            }

            // Populate CV fields
            const cvNameDisplay = staff.nameBn ? `${staff.name || "-"} (${staff.nameBn})` : (staff.name || "-");
            document.getElementById('view-cv-name').innerText = cvNameDisplay;
            document.getElementById('view-cv-designation').innerText = staff.designation || "-";
            document.getElementById('view-cv-staff-id').innerText = staff.staffId || "-";
            document.getElementById('view-cv-category').innerText = staff.category === "Teacher" ? "শিক্ষক (Teacher)" : "কর্মচারী (Staff)";
            if (document.getElementById('view-cv-department')) document.getElementById('view-cv-department').innerText = staff.department || staff.dept || "-";
            document.getElementById('view-cv-joining').innerText = staff.joining || "-";
            if (document.getElementById('view-cv-mpo')) document.getElementById('view-cv-mpo').innerText = staff.mpoStatus || staff.mpo || "-";

            // Subject Row visibility
            const subjectRow = document.getElementById('view-cv-subject-row');
            const subjectVal = document.getElementById('view-cv-subject');
            if (staff.category === 'Teacher') {
                subjectRow.style.display = 'block';
                subjectVal.innerText = staff.subject || "-";
            } else {
                subjectRow.style.display = 'none';
            }

            // Contact & Personal details
            document.getElementById('view-cv-mobile').innerText = staff.mobile || "-";
            document.getElementById('view-cv-email').innerText = staff.email || "-";
            document.getElementById('view-cv-nid').innerText = staff.nid || "-";
            document.getElementById('view-cv-dob').innerText = staff.dob || "-";
            document.getElementById('view-cv-blood').innerText = staff.blood || "-";
            document.getElementById('view-cv-gender').innerText = staff.gender === "Male" ? "পুরুষ (Male)" : (staff.gender === "Female" ? "মহিলা (Female)" : (staff.gender === "Other" ? "অন্যান্য (Other)" : "-"));

            // Qualification
            document.getElementById('view-cv-qualification').innerText = staff.qualification || "-";

            // Addresses
            document.getElementById('view-cv-present').innerText = staff.presentAddr || "-";
            document.getElementById('view-cv-permanent').innerText = staff.permanentAddr || "-";

            // Photo
            const photoEl = document.getElementById('view-cv-photo');
            if (staff.photo) {
                photoEl.src = staff.photo;
            } else {
                photoEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
            }

            // Signature
            const sigEl = document.getElementById('view-cv-signature');
            if (sigEl) {
                if (staff.signature) {
                    sigEl.src = staff.signature;
                    sigEl.style.display = 'block';
                } else {
                    sigEl.src = '';
                    sigEl.style.display = 'none';
                }
            }

            document.getElementById('view-staff-modal').style.display = 'block';
        }

        function closeStaffModal() {
            document.getElementById('staff-modal').style.display = 'none';
        }

        function closeViewStaffModal() {
            document.getElementById('view-staff-modal').style.display = 'none';
        }

        function previewModalStaffPhoto(input) {
            const file = input.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert("দয়া করে একটি সঠিক ইমেজ ফাইল নির্বাচন করুন। (Please select a valid image file)");
                input.value = '';
                return;
            }

            // Max file size 250 KB check
            const maxPhotoBytes = 250 * 1024;
            if (file.size > maxPhotoBytes) {
                const fileSizeKB = (file.size / 1024).toFixed(1);
                alert(`❌ ছবির সাইজ অতিরিক্ত বড়!\n\nছবির সাইজ সর্বোচ্চ 250 KB হতে পারবে। আপনার ফাইলের সাইজ: ${fileSizeKB} KB।\nঅনুগ্রহ করে ২৫০ কেবি বা তার চেয়ে কম সাইজের ছবি নির্বাচন করুন।`);
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    // Resize to 300px * 300px (1:1 ratio)
                    currentModalPhotoBase64 = resizeImageToSquare300(img);

                    document.getElementById('modal-photo-placeholder').style.display = 'none';
                    const previewImg = document.getElementById('modal-photo-preview');
                    previewImg.src = currentModalPhotoBase64;
                    previewImg.style.display = 'block';
                    if (document.getElementById('modal-photo-remove-btn')) {
                        document.getElementById('modal-photo-remove-btn').style.display = 'inline-flex';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function previewModalStaffSignature(input) {
            const file = input.files[0];
            if (!file) return;

            // PNG format check
            const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
            if (!isPng) {
                alert("❌ ফরম্যাট ত্রুটি: স্বাক্ষর শুধুমাত্র PNG (.png) ফরম্যাটে আপলোড করা যাবে!\n(Signature must be in PNG format)");
                input.value = '';
                return;
            }

            // Max file size 150 KB check
            const maxSigBytes = 150 * 1024;
            if (file.size > maxSigBytes) {
                const fileSizeKB = (file.size / 1024).toFixed(1);
                alert(`❌ স্বাক্ষরের সাইজ অতিরিক্ত বড়!\n\nস্বাক্ষরের সাইজ সর্বোচ্চ 150 KB হতে পারবে। আপনার ফাইলের সাইজ: ${fileSizeKB} KB।\nঅনুগ্রহ করে ১৫০ কেবি বা তার চেয়ে কম সাইজের পিএনজি (PNG) ফাইল নির্বাচন করুন।`);
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    // Resize to 300px * 80px PNG format
                    currentModalSignatureBase64 = resizeImageToSignature(img);

                    if (document.getElementById('modal-signature-placeholder')) {
                        document.getElementById('modal-signature-placeholder').style.display = 'none';
                    }
                    const previewImg = document.getElementById('modal-signature-preview');
                    if (previewImg) {
                        previewImg.src = currentModalSignatureBase64;
                        previewImg.style.display = 'block';
                    }
                    if (document.getElementById('modal-signature-remove-btn')) {
                        document.getElementById('modal-signature-remove-btn').style.display = 'inline-flex';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function removeModalStaffPhoto(e) {
            if (e) e.stopPropagation();
            currentModalPhotoBase64 = "";
            const input = document.getElementById('modal-photo-input');
            if (input) input.value = "";
            const previewImg = document.getElementById('modal-photo-preview');
            if (previewImg) {
                previewImg.src = "";
                previewImg.style.display = 'none';
            }
            const placeholder = document.getElementById('modal-photo-placeholder');
            if (placeholder) placeholder.style.display = 'flex';
            const removeBtn = document.getElementById('modal-photo-remove-btn');
            if (removeBtn) removeBtn.style.display = 'none';
        }

        function removeModalStaffSignature(e) {
            if (e) e.stopPropagation();
            currentModalSignatureBase64 = "";
            const input = document.getElementById('modal-signature-input');
            if (input) input.value = "";
            const previewImg = document.getElementById('modal-signature-preview');
            if (previewImg) {
                previewImg.src = "";
                previewImg.style.display = 'none';
            }
            const placeholder = document.getElementById('modal-signature-placeholder');
            if (placeholder) placeholder.style.display = 'flex';
            const removeBtn = document.getElementById('modal-signature-remove-btn');
            if (removeBtn) removeBtn.style.display = 'none';
        }

        function saveStaffModal(event) {
            event.preventDefault();
            const editIndex = document.getElementById('staff-edit-index').value;
            const staffId = document.getElementById('modal-staff-id').value.trim();
            const name = document.getElementById('modal-staff-name').value.trim();
            const nameBn = document.getElementById('modal-staff-name-bn') ? document.getElementById('modal-staff-name-bn').value.trim() : '';
            const mobile = document.getElementById('modal-staff-mobile').value.trim();

            const category = document.getElementById('modal-staff-category').value;
            const designation = document.getElementById('modal-staff-designation').value.trim();
            const department = document.getElementById('modal-staff-department') ? document.getElementById('modal-staff-department').value.trim() : '';
            const mpoStatus = document.getElementById('modal-staff-mpo') ? document.getElementById('modal-staff-mpo').value : '';
            const subject = document.getElementById('modal-staff-subject').value.trim();
            const gender = document.getElementById('modal-staff-gender').value;
            const dob = document.getElementById('modal-staff-dob').value;
            const blood = document.getElementById('modal-staff-blood').value;
            const email = document.getElementById('modal-staff-email').value.trim();
            const nid = document.getElementById('modal-staff-nid').value.trim();
            const joining = document.getElementById('modal-staff-joining').value;
            const qualification = document.getElementById('modal-staff-qualification').value.trim();
            const presentAddr = document.getElementById('modal-staff-present-addr').value.trim();
            const permanentAddr = document.getElementById('modal-staff-permanent-addr').value.trim();

            if (!staffId || !name || !mobile || !category || !designation || !gender || !dob) {
                alert("Please fill in all required fields.");
                return;
            }

            const list = loadStaffList();

            // Validate Head Teacher rule per department (Primary Level & High Level, max 1 each)
            if (isHeadmasterDesignation(designation)) {
                if (!department) {
                    alert("❌ 'প্রধান শিক্ষক' পদবী নির্বাচনের জন্য অনুগ্রহ করে 'বিভাগ (Department)' থেকে 'Primary Level' অথবা 'High Level' নির্বাচন করুন।");
                    return;
                }
                const currentIdx = editIndex !== "" ? parseInt(editIndex, 10) : -1;
                const existingDeptHeadmaster = list.find((s, idx) => 
                    idx !== currentIdx && 
                    isHeadmasterDesignation(s.designation) && 
                    (s.department || s.dept || '').toLowerCase() === department.toLowerCase()
                );
                if (existingDeptHeadmaster) {
                    const hmName = existingDeptHeadmaster.nameBn ? `${existingDeptHeadmaster.name} (${existingDeptHeadmaster.nameBn})` : (existingDeptHeadmaster.name || existingDeptHeadmaster.staffId);
                    alert(`❌ "${department}" বিভাগে ইতিমধ্যে একজন প্রধান শিক্ষক তালিকাভুক্ত রয়েছেন (${hmName})।\n\nপ্রতিটি বিভাগে (Primary Level ও High Level) সর্বোচ্চ ১ জন করে মোট ২ জন প্রধান শিক্ষক যুক্ত করা যাবে।`);
                    return;
                }
            }

            const staffObj = {
                staffId,
                name,
                nameBn,
                mobile,
                photo: currentModalPhotoBase64,
                signature: currentModalSignatureBase64,
                category,
                designation,
                department,
                mpoStatus,
                subject,
                gender,
                dob,
                blood,
                email,
                nid,
                joining,
                qualification,
                presentAddr,
                permanentAddr,
                userApproved: editIndex !== "" && list[parseInt(editIndex)]?.userApproved !== undefined ? list[parseInt(editIndex)].userApproved : false
            };

            if (editIndex === "") {
                if (list.some(s => s.staffId.toLowerCase() === staffId.toLowerCase())) {
                    alert("This Staff ID already exists!");
                    return;
                }
                list.push(staffObj);
            } else {
                const idx = parseInt(editIndex);
                if (list.some((s, i) => i !== idx && s.staffId.toLowerCase() === staffId.toLowerCase())) {
                    alert("This Staff ID is already used by another employee!");
                    return;
                }
                list[idx] = staffObj;
            }

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_staff'] = Date.now();
            }
            localStorage.setItem('school_staff', JSON.stringify(list));

            // Sync to server DB
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_staff',
                        value: JSON.stringify(list)
                    })
                }).catch(() => {});
            } catch(e) {}

            if (editIndex === "") {
                currentStaffPage = Math.ceil(list.length / staffPerPage) || 1;
            }

            closeStaffModal();
            renderStaffList();
            alert(editIndex === "" 
                ? "✅ নতুন শিক্ষক/স্টাফ প্রোফাইল সফলভাবে যুক্ত হয়েছে!\n\n💡 এই শিক্ষকের ওয়েবসাইট ইউজার অ্যাকাউন্ট ও লগইন সক্রিয় করতে Advance অপশনের 'Staff Users & Login' সেকশনে গিয়ে Approve (অনুমোদন) করুন।" 
                : "তথ্য সফলভাবে আপডেট করা হয়েছে!");
        }

        // --- STAFF EXCEL TEMPLATE & BULK IMPORT SYSTEM ---
        let tempImportedStaff = [];

        function downloadStaffTemplate() {
            if (typeof XLSX === 'undefined') {
                alert("XLSX লাইব্রেরি লোড হচ্ছে, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
                return;
            }

            const excelHeaders = [
                "স্টাফ আইডি (Staff ID/Index)",
                "পূর্ণ নাম (Employee Name)",
                "পূর্ণ নাম (Bangla)",
                "মোবাইল নম্বর (Mobile No)",
                "ক্যাটাগরি (Category)",
                "পদবী (Designation)",
                "বিভাগ (Department)",
                "MPO স্ট্যাটাস (MPO / Non MPO)",
                "বিষয় (Subject)",
                "লিঙ্গ (Gender)",
                "জন্ম তারিখ (Date of Birth)",
                "রক্তের গ্রুপ (Blood Group)",
                "ইমেইল ঠিকানা (Email Address)",
                "এনআইডি নম্বর (NID Number)",
                "যোগদানের তারিখ (Joining Date)",
                "সর্বশেষ শিক্ষাগত যোগ্যতা (Qualification)",
                "বর্তমান ঠিকানা (Present Address)",
                "স্থায়ী ঠিকানা (Permanent Address)"
            ];

            const sampleRows = [
                {
                    "স্টাফ আইডি (Staff ID/Index)": "268501",
                    "পূর্ণ নাম (Employee Name)": "Md. Rafiqul Islam",
                    "পূর্ণ নাম (Bangla)": "মো: রফিকুল ইসলাম",
                    "মোবাইল নম্বর (Mobile No)": "01712345678",
                    "ক্যাটাগরি (Category)": "Teacher",
                    "পদবী (Designation)": "সিনিয়র শিক্ষক",
                    "বিভাগ (Department)": "High Level",
                    "MPO স্ট্যাটাস (MPO / Non MPO)": "MPO",
                    "বিষয় (Subject)": "গণিত",
                    "লিঙ্গ (Gender)": "Male",
                    "জন্ম তারিখ (Date of Birth)": "1985-05-15",
                    "রক্তের গ্রুপ (Blood Group)": "A+",
                    "ইমেইল ঠিকানা (Email Address)": "rafiqul@school.edu.bd",
                    "এনআইডি নম্বর (NID Number)": "19852612345678901",
                    "যোগদানের তারিখ (Joining Date)": "2018-01-01",
                    "সর্বশেষ শিক্ষাগত যোগ্যতা (Qualification)": "M.Sc in Mathematics, B.Ed",
                    "বর্তমান ঠিকানা (Present Address)": "সেক্টর-১০, উত্তরা, ঢাকা-১২৩০",
                    "স্থায়ী ঠিকানা (Permanent Address)": "জলঢাকা, নীলফামারী"
                },
                {
                    "স্টাফ আইডি (Staff ID/Index)": "269201",
                    "পূর্ণ নাম (Employee Name)": "Mst. Fatema Begum",
                    "পূর্ণ নাম (Bangla)": "মোসাম্মৎ ফাতেমা বেগম",
                    "মোবাইল নম্বর (Mobile No)": "01812345679",
                    "ক্যাটাগরি (Category)": "Staff",
                    "পদবী (Designation)": "সহকারী শিক্ষক",
                    "বিভাগ (Department)": "Primary Level",
                    "MPO স্ট্যাটাস (MPO / Non MPO)": "Non MPO",
                    "বিষয় (Subject)": "",
                    "লিঙ্গ (Gender)": "Female",
                    "জন্ম তারিখ (Date of Birth)": "1992-08-20",
                    "রক্তের গ্রুপ (Blood Group)": "B+",
                    "ইমেইল ঠিকানা (Email Address)": "fatema@school.edu.bd",
                    "এনআইডি নম্বর (NID Number)": "19922612345678902",
                    "যোগদানের তারিখ (Joining Date)": "2020-03-15",
                    "সর্বশেষ শিক্ষাগত যোগ্যতা (Qualification)": "B.A (Honours)",
                    "বর্তমান ঠিকানা (Present Address)": "মিরপুর-১০, ঢাকা",
                    "স্থায়ী ঠিকানা (Permanent Address)": "বরিশাল সদর, বরিশাল"
                }
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(sampleRows, { header: excelHeaders });

            // Optimal column widths
            ws['!cols'] = [
                { wch: 20 }, // Staff ID
                { wch: 26 }, // Name (English)
                { wch: 26 }, // Name (Bangla)
                { wch: 18 }, // Mobile
                { wch: 15 }, // Category
                { wch: 22 }, // Designation
                { wch: 18 }, // Department
                { wch: 18 }, // MPO Status
                { wch: 18 }, // Subject
                { wch: 12 }, // Gender
                { wch: 16 }, // DOB
                { wch: 12 }, // Blood
                { wch: 26 }, // Email
                { wch: 22 }, // NID
                { wch: 16 }, // Joining
                { wch: 28 }, // Qualification
                { wch: 30 }, // Present Addr
                { wch: 30 }  // Permanent Addr
            ];

            XLSX.utils.book_append_sheet(wb, ws, "Staff Directory Template");
            XLSX.writeFile(wb, "creative_model_school_staff_template.xlsx");
        }

        function triggerStaffImportFile() {
            const input = document.getElementById('staff-import-file-input');
            if (input) {
                input.value = '';
                input.click();
            }
        }

        function parseExcelStaffDate(val) {
            if (!val) return '';
            if (typeof val === 'number') {
                const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                if (!isNaN(date.getTime())) {
                    const y = date.getUTCFullYear();
                    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const d = String(date.getUTCDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }
            }
            const str = String(val).trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
            if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
                const p = str.split('-');
                return `${p[2]}-${p[1]}-${p[0]}`;
            }
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
                const p = str.split('/');
                return `${p[2]}-${p[1]}-${p[0]}`;
            }
            if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
                const p = str.split('/');
                return `${p[0]}-${p[1]}-${p[2]}`;
            }
            return str;
        }

        function handleStaffFileSelect(input) {
            const file = input.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop().toLowerCase();
            if (fileExt !== 'xlsx' && fileExt !== 'xls') {
                alert("ত্রুটি: দয়া করে শুধুমাত্র এক্সেল (.xlsx বা .xls) ফরম্যাটের ফাইল নির্বাচন করুন।");
                input.value = '';
                return;
            }

            if (typeof XLSX === 'undefined') {
                alert("XLSX লাইব্রেরি এখনও প্রস্তুত নয়, দয়া করে আবার চেষ্টা করুন।");
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

                    if (!rawRows || rawRows.length === 0) {
                        alert("ফাইলটিতে কোনো শিক্ষক বা কর্মচারীর তথ্য পাওয়া যায়নি।");
                        input.value = '';
                        return;
                    }

                    const headerMap = {
                        // Staff ID
                        "স্টাফ আইডি (Staff ID/Index)": "staffId",
                        "স্টাফ আইডি": "staffId",
                        "আইডি": "staffId",
                        "Staff ID": "staffId",
                        "StaffID": "staffId",
                        "ID": "staffId",
                        "Index": "staffId",
                        "ইন্ডেক্স": "staffId",

                        // Name (English)
                        "পূর্ণ নাম (Employee Name)": "name",
                        "পূর্ণ নাম": "name",
                        "Employee Name": "name",
                        "Name": "name",
                        "Teacher Name": "name",
                        "Staff Name": "name",

                        // Name (Bangla)
                        "পূর্ণ নাম (Bangla)": "nameBn",
                        "পূর্ণ নাম (বাংলা)": "nameBn",
                        "পূর্ণ নাম (বাংলায়)": "nameBn",
                        "নাম (বাংলা)": "nameBn",
                        "নাম (বাংলায়)": "nameBn",
                        "বাংলা নাম": "nameBn",
                        "Name in Bangla": "nameBn",
                        "Name (Bangla)": "nameBn",
                        "NameBn": "nameBn",
                        "nameBn": "nameBn",
                        "শিক্ষকের নাম": "nameBn",
                        "কর্মচারীর নাম": "nameBn",

                        // Mobile
                        "মোবাইল নম্বর (Mobile No)": "mobile",
                        "মোবাইল নম্বর": "mobile",
                        "মোবাইল": "mobile",
                        "Mobile No": "mobile",
                        "Mobile": "mobile",
                        "Mobile Number": "mobile",
                        "Phone": "mobile",
                        "ফোন": "mobile",

                        // Category
                        "ক্যাটাগরি (Category)": "category",
                        "স্টাফ ক্যাটাগরি": "category",
                        "ক্যাটাগরি": "category",
                        "Category": "category",
                        "Type": "category",
                        "ধরন": "category",

                        // Designation
                        "পদবী (Designation)": "designation",
                        "পদবী": "designation",
                        "পদবি": "designation",
                        "Designation": "designation",
                        "Post": "designation",

                        // Department
                        "বিভাগ (Department)": "department",
                        "বিভাগ": "department",
                        "Department": "department",
                        "Dept": "department",

                        // MPO
                        "MPO স্ট্যাটাস (MPO / Non MPO)": "mpoStatus",
                        "MPO স্ট্যাটাস": "mpoStatus",
                        "এমপিও স্ট্যাটাস": "mpoStatus",
                        "MPO Status": "mpoStatus",
                        "MPO": "mpoStatus",
                        "এমপিও": "mpoStatus",

                        // Subject
                        "বিষয় (Subject)": "subject",
                        "বিষয়": "subject",
                        "বিষয়": "subject",
                        "Subject": "subject",

                        // Gender
                        "লিঙ্গ (Gender)": "gender",
                        "লিঙ্গ": "gender",
                        "Gender": "gender",
                        "Sex": "gender",

                        // DOB
                        "জন্ম তারিখ (Date of Birth)": "dob",
                        "জন্ম তারিখ": "dob",
                        "Date of Birth": "dob",
                        "DOB": "dob",

                        // Blood Group
                        "রক্তের গ্রুপ (Blood Group)": "blood",
                        "রক্তের গ্রুপ": "blood",
                        "Blood Group": "blood",
                        "Blood": "blood",

                        // Email
                        "ইমেইল ঠিকানা (Email Address)": "email",
                        "ইমেইল ঠিকানা": "email",
                        "ইমেল": "email",
                        "ইমেইল": "email",
                        "Email": "email",
                        "Email Address": "email",

                        // NID
                        "এনআইডি নম্বর (NID Number)": "nid",
                        "এনআইডি নম্বর": "nid",
                        "এনআইডি": "nid",
                        "NID Number": "nid",
                        "NID": "nid",
                        "National ID": "nid",

                        // Joining Date
                        "যোগদানের তারিখ (Joining Date)": "joining",
                        "যোগদানের তারিখ": "joining",
                        "Joining Date": "joining",
                        "Join Date": "joining",

                        // Qualification
                        "সর্বশেষ শিক্ষাগত যোগ্যতা (Qualification)": "qualification",
                        "সর্বশেষ শিক্ষাগত যোগ্যতা": "qualification",
                        "শিক্ষাগত যোগ্যতা": "qualification",
                        "Qualification": "qualification",
                        "Education": "qualification",

                        // Present Address
                        "বর্তমান ঠিকানা (Present Address)": "presentAddr",
                        "বর্তমান ঠিকানা": "presentAddr",
                        "Present Address": "presentAddr",
                        "Address": "presentAddr",
                        "ঠিকানা": "presentAddr",

                        // Permanent Address
                        "স্থায়ী ঠিকানা (Permanent Address)": "permanentAddr",
                        "স্থায়ী ঠিকানা": "permanentAddr",
                        "Permanent Address": "permanentAddr"
                    };

                    const existingList = loadStaffList();
                    const existingIds = new Set(existingList.map(s => String(s.staffId || '').trim().toLowerCase()));

                    tempImportedStaff = [];
                    let autoIdCounter = 1;

                    rawRows.forEach((row, idx) => {
                        const item = {
                            staffId: '',
                            name: '',
                            nameBn: '',
                            mobile: '',
                            category: '',
                            designation: '',
                            department: '',
                            mpoStatus: '',
                            subject: '',
                            gender: '',
                            dob: '',
                            blood: '',
                            email: '',
                            nid: '',
                            joining: '',
                            qualification: '',
                            presentAddr: '',
                            permanentAddr: '',
                            photo: '',
                            signature: '',
                            selected: true,
                            isDuplicate: false,
                            rawIndex: idx
                        };

                        Object.keys(row).forEach(header => {
                            const cleanH = header.trim();
                            const targetKey = headerMap[cleanH];
                            if (targetKey) {
                                item[targetKey] = String(row[header]).trim();
                            }
                        });

                        // Skip completely blank rows
                        if (!item.name && !item.nameBn && !item.mobile && !item.staffId) {
                            return;
                        }

                        // If English name is empty but Bangla name exists
                        if (!item.name && item.nameBn) {
                            item.name = item.nameBn;
                        }

                        // Normalization
                        const catLower = item.category.toLowerCase();
                        if (catLower.includes('teacher') || catLower.includes('শিক্ষক') || item.designation.includes('শিক্ষক') || item.designation.includes('Teacher') || item.designation.includes('Principal') || item.designation.includes('অধ্যক্ষ')) {
                            item.category = 'Teacher';
                        } else if (catLower.includes('staff') || catLower.includes('কর্মচারী')) {
                            item.category = 'Staff';
                        } else {
                            item.category = 'Teacher';
                        }

                        const genLower = item.gender.toLowerCase();
                        if (genLower.includes('female') || genLower.includes('মহিলা') || genLower.includes('নারী') || genLower.includes('মেয়ে')) {
                            item.gender = 'Female';
                        } else if (genLower.includes('other') || genLower.includes('অন্যান্য')) {
                            item.gender = 'Other';
                        } else {
                            item.gender = 'Male';
                        }

                        const mpoLower = item.mpoStatus.toLowerCase();
                        if (mpoLower.includes('non') || mpoLower.includes('নন')) {
                            item.mpoStatus = 'Non MPO';
                        } else if (mpoLower.includes('mpo') || mpoLower.includes('এমপিও')) {
                            item.mpoStatus = 'MPO';
                        } else {
                            item.mpoStatus = item.mpoStatus ? item.mpoStatus : 'MPO';
                        }

                        item.dob = parseExcelStaffDate(item.dob) || '1990-01-01';
                        item.joining = parseExcelStaffDate(item.joining) || '2024-01-01';
                        if (!item.blood) item.blood = 'A+';

                        // Staff ID/Index Generation Rule:
                        // If Staff ID is missing in Excel, generate using system rule:
                        // Current Year 2-digits + DOB Year 2-digits + 2-digit Serial Number (e.g., 268501)
                        if (!item.staffId) {
                            const allCurrentStaff = [...existingList, ...tempImportedStaff];
                            item.staffId = generateAutoStaffIdByDob(item.dob, allCurrentStaff);
                            item.isAutoGenerated = true;
                        }

                        if (existingIds.has(item.staffId.toLowerCase())) {
                            item.isDuplicate = true;
                        }

                        tempImportedStaff.push(item);
                    });

                    if (tempImportedStaff.length === 0) {
                        alert("ফাইলে বৈধ কোনো শিক্ষকের তথ্য পাওয়া যায়নি। কলাম শিরোনামগুলো সঠিকভাবে আছে কিনা চেক করুন।");
                        input.value = '';
                        return;
                    }

                    openStaffImportPreviewModal();
                    input.value = '';
                } catch (err) {
                    console.error("Error parsing staff xlsx file:", err);
                    alert("ত্রুটি: এক্সেল ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে ফাইলটির ফরম্যাট চেক করুন।");
                    input.value = '';
                }
            };
            reader.readAsArrayBuffer(file);
        }

        function openStaffImportPreviewModal() {
            const modal = document.getElementById('staff-import-preview-modal');
            if (!modal) return;

            const searchInput = document.getElementById('import-preview-search');
            if (searchInput) searchInput.value = '';
            const catSelect = document.getElementById('import-filter-category');
            if (catSelect) catSelect.value = 'all';

            renderStaffImportPreview();
            modal.style.display = 'block';
        }

        function closeStaffImportPreviewModal() {
            const modal = document.getElementById('staff-import-preview-modal');
            if (modal) modal.style.display = 'none';
        }

        function toggleStaffImportFullscreen() {
            const modalContent = document.querySelector('#staff-import-preview-modal .modal-content');
            const btn = document.querySelector('#staff-import-preview-modal .fullscreen-btn');
            if (!modalContent) return;

            if (modalContent.classList.contains('fullscreen')) {
                modalContent.classList.remove('fullscreen');
                if (btn) {
                    btn.innerText = "⛶";
                    btn.title = "Full Screen";
                }
            } else {
                modalContent.classList.add('fullscreen');
                if (btn) {
                    btn.innerText = "🗗";
                    btn.title = "Restore Size";
                }
            }
        }

        function filterImportPreview() {
            renderStaffImportPreview();
        }

        function handleDupStrategyChange() {
            renderStaffImportPreview();
        }

        function renderStaffImportPreview() {
            const tbody = document.getElementById('staff-import-preview-tbody');
            if (!tbody) return;

            const catFilter = document.getElementById('import-filter-category') ? document.getElementById('import-filter-category').value : 'all';
            const keyword = document.getElementById('import-preview-search') ? document.getElementById('import-preview-search').value.trim().toLowerCase() : '';

            let totalCount = tempImportedStaff.length;
            let teacherCount = 0;
            let staffCount = 0;
            let mpoCount = 0;
            let dupCount = 0;
            let selectedCount = 0;

            tempImportedStaff.forEach(s => {
                if (s.category === 'Teacher') teacherCount++;
                else staffCount++;
                if (s.mpoStatus === 'MPO') mpoCount++;
                if (s.isDuplicate) dupCount++;
                if (s.selected) selectedCount++;
            });

            const tEl = document.getElementById('preview-stat-total');
            const teEl = document.getElementById('preview-stat-teachers');
            const sEl = document.getElementById('preview-stat-staff');
            const mEl = document.getElementById('preview-stat-mpo');
            const dEl = document.getElementById('preview-stat-dups');
            const dBadge = document.getElementById('preview-duplicate-badge');
            const selCountEl = document.getElementById('import-selected-count');

            if (tEl) tEl.innerText = totalCount;
            if (teEl) teEl.innerText = teacherCount;
            if (sEl) sEl.innerText = staffCount;
            if (mEl) mEl.innerText = mpoCount;
            if (dEl) dEl.innerText = dupCount;
            if (dBadge) dBadge.style.display = dupCount > 0 ? 'inline-flex' : 'none';
            if (selCountEl) selCountEl.innerText = selectedCount;

            const filtered = tempImportedStaff.filter(item => {
                if (catFilter !== 'all' && item.category !== catFilter) return false;
                if (keyword) {
                    const matchName = item.name.toLowerCase().includes(keyword);
                    const matchId = item.staffId.toLowerCase().includes(keyword);
                    const matchDesig = item.designation.toLowerCase().includes(keyword);
                    const matchPhone = item.mobile.toLowerCase().includes(keyword);
                    const matchSub = (item.subject || '').toLowerCase().includes(keyword);
                    if (!matchName && !matchId && !matchDesig && !matchPhone && !matchSub) return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="13" style="text-align: center; padding: 30px; color: #6b7280; font-style: italic;">
                            কোনো তথ্য মেলেনি। (No matching preview records)
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            filtered.forEach((staff, idx) => {
                const origIndex = tempImportedStaff.indexOf(staff);
                const dupBadge = staff.isDuplicate
                    ? `<span style="font-size: 0.7rem; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-left: 4px;" title="This Staff ID already exists in system">বিদ্যমান</span>`
                    : '';

                const autoBadge = staff.isAutoGenerated
                    ? `<span style="font-size: 0.68rem; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-left: 4px;" title="সিস্টেম শর্তানুসারে স্বয়ংক্রিয়ভাবে তৈরি হয়েছে">অটো</span>`
                    : '';

                const catBadge = staff.category === 'Teacher'
                    ? `<span style="background: #e0e7ff; color: #4338ca; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.76rem;">শিক্ষক</span>`
                    : `<span style="background: #fef3c7; color: #92400e; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.76rem;">কর্মচারী</span>`;

                const mpoBadge = staff.mpoStatus === 'MPO'
                    ? `<span style="background: #dcfce7; color: #15803d; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.76rem;">MPO</span>`
                    : `<span style="background: #f3f4f6; color: #4b5563; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.76rem;">Non MPO</span>`;

                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0; background: ${staff.selected ? (staff.isDuplicate ? '#fff7ed' : '#ffffff') : '#f8fafc'}; opacity: ${staff.selected ? 1 : 0.6}; transition: all 0.2s;">
                        <td style="text-align: center; padding: 8px 6px;">
                            <input type="checkbox" ${staff.selected ? 'checked' : ''} onchange="toggleImportRowSelect(${origIndex}, this.checked)" style="cursor: pointer; width: 16px; height: 16px;">
                        </td>
                        <td style="text-align: center; font-weight: 700; color: #64748b; padding: 8px 6px;">${idx + 1}</td>
                        <td style="padding: 8px 10px; font-weight: 700; color: #2563eb;">
                            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span>${staff.staffId}</span>
                                ${autoBadge}
                                ${dupBadge}
                            </div>
                        </td>
                        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a;">
                            <div>${staff.name}</div>
                            ${staff.nameBn ? `<div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 1px;">(${staff.nameBn})</div>` : ''}
                        </td>
                        <td style="padding: 8px 10px; text-align: center;">${catBadge}</td>
                        <td style="padding: 8px 10px; color: #334155; font-weight: 600;">${staff.designation || '-'}</td>
                        <td style="padding: 8px 8px; color: #334155; font-weight: 500;">${staff.department || '-'}</td>
                        <td style="padding: 8px 8px; text-align: center;">${mpoBadge}</td>
                        <td style="padding: 8px 8px; color: #475569; font-weight: 500;">${staff.subject || '-'}</td>
                        <td style="padding: 8px 8px; font-weight: 600; color: #0284c7;">${staff.mobile || '-'}</td>
                        <td style="padding: 8px 8px; text-align: center; color: #475569; font-weight: 600;">${staff.gender === 'Male' ? 'পুরুষ' : (staff.gender === 'Female' ? 'মহিলা' : staff.gender)}</td>
                        <td style="padding: 8px 8px; color: #475569;">${staff.joining || '-'}</td>
                        <td style="text-align: center; padding: 8px 6px;">
                            <button type="button" onclick="deleteImportPreviewRow(${origIndex})" title="তালিকা থেকে বাদ দিন"
                                style="background: transparent; border: 1px solid #fca5a5; color: #dc2626; border-radius: 4px; width: 26px; height: 26px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                                &times;
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        function toggleImportRowSelect(index, isChecked) {
            if (tempImportedStaff[index]) {
                tempImportedStaff[index].selected = isChecked;
                renderStaffImportPreview();
            }
        }

        function toggleAllImportCheckboxes(masterCheckbox) {
            const isChecked = masterCheckbox.checked;
            tempImportedStaff.forEach(s => s.selected = isChecked);
            renderStaffImportPreview();
        }

        function deleteImportPreviewRow(index) {
            if (tempImportedStaff[index]) {
                tempImportedStaff.splice(index, 1);
                renderStaffImportPreview();
            }
        }

        function confirmAndSaveStaffImport() {
            const selected = tempImportedStaff.filter(s => s.selected);
            if (selected.length === 0) {
                alert("দয়া করে ইমপোর্ট করার জন্য অন্তত একজন শিক্ষক বা কর্মচারীকে সিলেক্ট করুন।");
                return;
            }

            const dupStrategy = document.getElementById('import-dup-strategy') ? document.getElementById('import-dup-strategy').value : 'skip';
            let currentList = loadStaffList();

            // Validate Head Teacher rule per department (Primary Level & High Level, max 1 each)
            const existingPrimaryHm = currentList.find(s => isHeadmasterDesignation(s.designation) && (s.department || s.dept || '').toLowerCase() === 'primary level');
            const existingHighHm = currentList.find(s => isHeadmasterDesignation(s.designation) && (s.department || s.dept || '').toLowerCase() === 'high level');
            let importPrimaryHmCount = 0;
            let importHighHmCount = 0;

            for (const item of selected) {
                if (isHeadmasterDesignation(item.designation)) {
                    const itemDept = (item.department || '').toLowerCase();
                    if (itemDept === 'primary level') {
                        importPrimaryHmCount++;
                        const existingIdx = currentList.findIndex(s => s.staffId && s.staffId.toLowerCase() === item.staffId.toLowerCase());
                        const isOverwritingExistingHm = (existingIdx >= 0 && isHeadmasterDesignation(currentList[existingIdx].designation) && (currentList[existingIdx].department || '').toLowerCase() === 'primary level');

                        if (existingPrimaryHm && !isOverwritingExistingHm && (existingIdx < 0 || dupStrategy !== 'overwrite')) {
                            const hmName = existingPrimaryHm.nameBn ? `${existingPrimaryHm.name} (${existingPrimaryHm.nameBn})` : (existingPrimaryHm.name || existingPrimaryHm.staffId);
                            alert(`❌ ইমপোর্ট ত্রুটি: 'Primary Level' বিভাগে ইতিমধ্যে একজন প্রধান শিক্ষক তালিকাভুক্ত রয়েছেন (${hmName})।\n\nঅতিরিক্ত ব্যক্তি (${item.nameBn || item.name})-কে Primary Level-এর প্রধান শিক্ষক হিসেবে ইমপোর্ট করা যাবে না।`);
                            return;
                        }
                        if (importPrimaryHmCount > 1) {
                            alert(`❌ ইমপোর্ট ত্রুটি: নির্বাচিত এক্সেল ফাইলে 'Primary Level' বিভাগে একাধিক প্রধান শিক্ষক দেওয়া হয়েছে। প্রতি বিভাগে সর্বোচ্চ ১ জন প্রধান শিক্ষক রাখা যাবে।`);
                            return;
                        }
                    } else if (itemDept === 'high level') {
                        importHighHmCount++;
                        const existingIdx = currentList.findIndex(s => s.staffId && s.staffId.toLowerCase() === item.staffId.toLowerCase());
                        const isOverwritingExistingHm = (existingIdx >= 0 && isHeadmasterDesignation(currentList[existingIdx].designation) && (currentList[existingIdx].department || '').toLowerCase() === 'high level');

                        if (existingHighHm && !isOverwritingExistingHm && (existingIdx < 0 || dupStrategy !== 'overwrite')) {
                            const hmName = existingHighHm.nameBn ? `${existingHighHm.name} (${existingHighHm.nameBn})` : (existingHighHm.name || existingHighHm.staffId);
                            alert(`❌ ইমপোর্ট ত্রুটি: 'High Level' বিভাগে ইতিমধ্যে একজন প্রধান শিক্ষক তালিকাভুক্ত রয়েছেন (${hmName})।\n\nঅতিরিক্ত ব্যক্তি (${item.nameBn || item.name})-কে High Level-এর প্রধান শিক্ষক হিসেবে ইমপোর্ট করা যাবে না।`);
                            return;
                        }
                        if (importHighHmCount > 1) {
                            alert(`❌ ইমপোর্ট ত্রুটি: নির্বাচিত এক্সেল ফাইলে 'High Level' বিভাগে একাধিক প্রধান শিক্ষক দেওয়া হয়েছে। প্রতি বিভাগে সর্বোচ্চ ১ জন প্রধান শিক্ষক রাখা যাবে।`);
                            return;
                        }
                    } else {
                        alert(`❌ ইমপোর্ট ত্রুটি: (${item.nameBn || item.name})-কে প্রধান শিক্ষক হিসেবে যুক্ত করার জন্য বিভাগ 'Primary Level' বা 'High Level' নির্দিষ্ট থাকতে হবে।`);
                        return;
                    }
                }
            }

            let addedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;

            selected.forEach(newItem => {
                const existingIdx = currentList.findIndex(s => s.staffId && s.staffId.toLowerCase() === newItem.staffId.trim().toLowerCase());
                const existingStaff = existingIdx >= 0 ? currentList[existingIdx] : null;

                const staffObj = {
                    staffId: newItem.staffId.trim(),
                    name: newItem.name.trim(),
                    nameBn: newItem.nameBn ? newItem.nameBn.trim() : '',
                    mobile: newItem.mobile.trim(),
                    photo: newItem.photo || (existingStaff ? (existingStaff.photo || '') : ''),
                    signature: newItem.signature || (existingStaff ? (existingStaff.signature || '') : ''),
                    category: newItem.category || 'Teacher',
                    designation: newItem.designation.trim() || (newItem.category === 'Teacher' ? 'Assistant Teacher' : 'Office Assistant'),
                    department: newItem.department ? newItem.department.trim() : (existingStaff ? (existingStaff.department || '') : ''),
                    mpoStatus: newItem.mpoStatus || 'MPO',
                    subject: newItem.subject ? newItem.subject.trim() : '',
                    gender: newItem.gender || 'Male',
                    dob: newItem.dob || '1990-01-01',
                    blood: newItem.blood || 'A+',
                    email: newItem.email ? newItem.email.trim() : '',
                    nid: newItem.nid ? newItem.nid.trim() : '',
                    joining: newItem.joining || '2024-01-01',
                    qualification: newItem.qualification ? newItem.qualification.trim() : '',
                    presentAddr: newItem.presentAddr ? newItem.presentAddr.trim() : '',
                    permanentAddr: newItem.permanentAddr ? newItem.permanentAddr.trim() : '',
                    userApproved: existingStaff && existingStaff.userApproved !== undefined ? existingStaff.userApproved : false
                };

                if (existingIdx >= 0) {
                    if (dupStrategy === 'overwrite') {
                        currentList[existingIdx] = staffObj;
                        updatedCount++;
                    } else if (dupStrategy === 'auto_new') {
                        // Generate new unique ID following system rule: Current Year 2 digits + DOB Year 2 digits + Next Serial
                        staffObj.staffId = generateAutoStaffIdByDob(staffObj.dob, currentList);
                        currentList.push(staffObj);
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    currentList.push(staffObj);
                    addedCount++;
                }
            });

            if (typeof lastLocalWrites === 'object') {
                lastLocalWrites['school_staff'] = Date.now();
            }
            localStorage.setItem('school_staff', JSON.stringify(currentList));

            // Sync to server DB
            try {
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'school_staff',
                        value: JSON.stringify(currentList)
                    })
                }).catch(() => {});
            } catch(e) {}

            closeStaffImportPreviewModal();
            renderStaffList();

            let summaryMsg = `সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!\n\nনতুন যুক্ত: ${addedCount} জন`;
            if (updatedCount > 0) summaryMsg += `\nআপডেট করা হয়েছে: ${updatedCount} জন`;
            if (skippedCount > 0) summaryMsg += `\nবিদ্যমান স্কিপ: ${skippedCount} জন`;
            if (addedCount > 0) summaryMsg += `\n\n💡 নতুন যুক্ত হওয়া শিক্ষকদের ইউজার একাউন্ট ও লগইন সক্রিয় করতে Advance অপশনের 'Staff Users & Login' সেকশনে গিয়ে Approve (অনুমোদন) করুন।`;

            alert(summaryMsg);
        }

        // Close modals on clicking outside window
        window.addEventListener('click', (event) => {
            const addModal = document.getElementById('staff-modal');
            const viewModal = document.getElementById('view-staff-modal');
            const previewModal = document.getElementById('staff-import-preview-modal');
            if (event.target === addModal) {
                closeStaffModal();
            }
            if (event.target === viewModal) {
                closeViewStaffModal();
            }
            if (event.target === previewModal) {
                closeStaffImportPreviewModal();
            }
        });

        // Initialize lists on load
        document.addEventListener('DOMContentLoaded', () => {
            renderStaffList();
        });

        // Listen for database sync updates
        window.addEventListener('dbSynced', () => {
            renderStaffList();
        });
    