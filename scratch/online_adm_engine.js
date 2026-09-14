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
