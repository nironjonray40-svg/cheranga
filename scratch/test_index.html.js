
// BLOCK 4

        let studentChartInstance = null;

        function renderStudentChart(maleData, femaleData, customLabels) {
            const ctxBar = document.getElementById('studentBarChart')?.getContext('2d');
            if (!ctxBar) return;

            if (studentChartInstance) {
                studentChartInstance.destroy();
            }

            const defaultClassNames = ['ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'];
            const chartLabels = customLabels || maleData.map((mVal, i) => {
                const fVal = femaleData[i] || 0;
                const total = mVal + fVal;
                const name = defaultClassNames[i] || `শ্রেণি ${i+6}`;
                return `${name} : ${total} জন`;
            });

            const valuesAboveBarPlugin = {
                id: 'valuesAboveBar',
                afterDatasetsDraw(chart) {
                    const { ctx } = chart;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            ctx.fillStyle = i === 0 ? '#0284c7' : '#db2777';
                            ctx.font = "bold 11px 'Tiro Bangla', sans-serif";
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(value + ' জন', bar.x, bar.y - 4);
                        });
                    });
                }
            };

            studentChartInstance = new Chart(ctxBar, {
                type: 'bar',
                plugins: [valuesAboveBarPlugin],
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'ছাত্র',
                            data: maleData,
                            backgroundColor: 'rgba(14, 165, 233, 0.85)',
                            borderColor: 'rgb(14, 165, 233)',
                            borderWidth: 1,
                            borderRadius: 4
                        },
                        {
                            label: 'ছাত্রী',
                            data: femaleData,
                            backgroundColor: 'rgba(236, 72, 153, 0.85)',
                            borderColor: 'rgb(236, 72, 153)',
                            borderWidth: 1,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 25 } },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { font: { family: "'Noto Rashi Hebrew', 'Tiro Bangla', serif", size: 12 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.raw + ' জন';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grace: '15%',
                            title: { display: true, text: 'শিক্ষার্থীর সংখ্যা' }
                        },
                        x: {
                            ticks: {
                                font: { family: "'Noto Rashi Hebrew', 'Tiro Bangla', serif", size: 11, weight: 'bold' }
                            }
                        }
                    }
                }
            });
        }

        function updateHomeDataFromWebsite() {
            // 1. School General Settings & Logo
            try {
                const customLogo = localStorage.getItem('school_logo');
                const logoImgEl = document.getElementById('homeSchoolLogo');
                if (logoImgEl) {
                    if (customLogo) {
                        logoImgEl.src = customLogo;
                    } else {
                        logoImgEl.src = 'school_logo.svg';
                    }
                }

                const settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
                const schoolTitleEl = document.getElementById('homeSchoolTitle');
                const schoolSubEl = document.getElementById('homeSchoolSubTitle');
                
                if (schoolTitleEl) {
                    schoolTitleEl.textContent = settings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
                }
                if (schoolSubEl) {
                    schoolSubEl.textContent = settings.schoolSubtitle || (settings.schoolAddress ? `${settings.schoolAddress}${settings.estYear ? ' — স্থাপিত: ' + settings.estYear : ''}` : "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়");
                }

                // Update Slider Header Elements (Subtitle, Gmail, and Other Info)
                const heroTitle = document.getElementById('school-name');
                if (heroTitle) {
                    heroTitle.textContent = settings.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
                }
                const heroSubtitle = document.querySelector('.hero-subtitle');
                if (heroSubtitle) {
                    heroSubtitle.textContent = settings.schoolSubtitle || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
                }
                const heroGmail = document.querySelector('.hero-gmail');
                if (heroGmail) {
                    if (settings.schoolGmail) {
                        heroGmail.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 6px; position: relative; top: -1.5px;"><path fill="#4285F4" d="M20 18h1.5V8L17 5v13h3z"/><path fill="#34A853" d="M4 18h3V5L2.5 8v10H4z"/><path fill="#EA4335" d="M17 5L12 8.5 7 5v13h10V5z"/><path fill="#FBBC05" d="M12 8.5l5-3.5L12 1.5 7 5l5 3.5z"/></svg><span style="vertical-align: middle;">${settings.schoolGmail}</span>`;
                        heroGmail.style.display = 'block';
                    } else {
                        heroGmail.style.display = 'none';
                    }
                }
                const heroOther = document.querySelector('.hero-other');
                if (heroOther) {
                    if (settings.schoolOther) {
                        heroOther.textContent = settings.schoolOther;
                        heroOther.style.display = 'block';
                    } else {
                        heroOther.style.display = 'none';
                    }
                }

                // Update Login Button Option
                if (typeof initializeNavbarLogin === 'function') {
                    initializeNavbarLogin();
                }
                // Chairman message & photo
                const chNameEl = document.getElementById('homeChairmanName');
                if (chNameEl) {
                    chNameEl.textContent = settings.chairmanName || "";
                }
                const chTitleEl = document.getElementById('homeChairmanTitle');
                if (chTitleEl) {
                    chTitleEl.textContent = settings.chairmanTitle || "";
                }
                const chTextEl = document.getElementById('homeChairmanText');
                if (chTextEl) {
                    chTextEl.textContent = settings.chairmanMsg ? `"${settings.chairmanMsg}"` : "";
                }
                const chPhotoEl = document.getElementById('homeChairmanPhoto');
                const chIconEl = document.getElementById('homeChairmanIcon');
                if (chPhotoEl) {
                    if (settings.chairmanPhoto) {
                        chPhotoEl.src = settings.chairmanPhoto;
                        chPhotoEl.classList.remove('hidden');
                        chPhotoEl.style.display = 'block';
                        if (chIconEl) {
                            chIconEl.classList.add('hidden');
                            chIconEl.style.display = 'none';
                        }
                    } else {
                        chPhotoEl.src = "";
                        chPhotoEl.classList.add('hidden');
                        chPhotoEl.style.display = 'none';
                        if (chIconEl) {
                            chIconEl.classList.remove('hidden');
                            chIconEl.style.display = 'inline-block';
                        }
                    }
                }

                // Headmaster info
                const staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
                const headmaster = staffList.find(s => typeof isHeadmasterDesignation === 'function' ? isHeadmasterDesignation(s.designation || s.designationBn) : (s.designation || '').includes('প্রধান শিক্ষক'));

                let hmName = "";
                if (headmaster && headmaster.nameBn) {
                    if (settings.headmasterName && !/^[A-Za-z\s.,'-]+$/.test(settings.headmasterName.trim())) {
                        hmName = settings.headmasterName;
                    } else {
                        hmName = headmaster.nameBn;
                    }
                } else if (settings.headmasterName) {
                    hmName = settings.headmasterName;
                } else if (headmaster) {
                    hmName = headmaster.nameBn || headmaster.name || "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
                } else {
                    hmName = "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
                }
                const hmTitle = settings.headmasterTitle !== undefined ? settings.headmasterTitle : (headmaster && headmaster.designation);
                const hmMsg = settings.headmasterMsg !== undefined ? settings.headmasterMsg : (headmaster && headmaster.message);
                const hmPhoto = settings.headmasterPhoto !== undefined ? settings.headmasterPhoto : (headmaster && headmaster.photo);

                if (hmName && document.getElementById('homeHeadmasterName')) {
                    document.getElementById('homeHeadmasterName').textContent = hmName;
                }
                if (hmTitle !== undefined && document.getElementById('homeHeadmasterTitle')) {
                    document.getElementById('homeHeadmasterTitle').textContent = hmTitle;
                }
                if (hmMsg !== undefined && document.getElementById('homeHeadmasterText')) {
                    document.getElementById('homeHeadmasterText').textContent = hmMsg ? `"${hmMsg}"` : "";
                }
                const hmPhotoEl = document.getElementById('homeHeadmasterPhoto');
                const hmIconEl = document.getElementById('homeHeadmasterIcon');
                if (hmPhoto && hmPhotoEl) {
                    hmPhotoEl.src = hmPhoto;
                    hmPhotoEl.classList.remove('hidden');
                    hmPhotoEl.style.display = 'block';
                    if (hmIconEl) {
                        hmIconEl.classList.add('hidden');
                        hmIconEl.style.display = 'none';
                    }
                } else if (hmPhotoEl && hmIconEl) {
                    hmPhotoEl.classList.add('hidden');
                    hmPhotoEl.style.display = 'none';
                    hmIconEl.classList.remove('hidden');
                    hmIconEl.style.display = 'inline-block';
                }
            } catch (e) { console.error("Settings load error:", e); }

            // 2. Published Notices & Unified Ticker (Sourced from Advance Ticker Manager & Notice Board)
            try {
                if (typeof updateNoticeTicker === 'function') {
                    updateNoticeTicker();
                }

                // Load ticker notices (from Advance -> Scrolling Notice Ticker Manager)
                let tickerNotices = [];
                try {
                    const rawTicker = localStorage.getItem('school_ticker_notices');
                    if (rawTicker) {
                        const parsed = JSON.parse(rawTicker);
                        if (Array.isArray(parsed)) {
                            tickerNotices = parsed.map((t, idx) => {
                                if (!t) return null;
                                if (typeof t === 'string' && t.trim()) {
                                    return { id: 'tk_' + idx, title: t.trim(), date: '২০২৬', desc: '', pdf: null, fileName: null };
                                }
                                if (typeof t === 'object') {
                                    return {
                                        id: 'tk_' + idx,
                                        title: (t.text || t.title || '').trim(),
                                        date: t.date || '২০২৬',
                                        desc: t.desc || '',
                                        pdf: t.pdf || null,
                                        fileName: t.fileName || null,
                                        fileSize: t.fileSize || 0
                                    };
                                }
                                return null;
                            }).filter(Boolean);
                        }
                    }
                } catch (e) { console.error("Ticker load error:", e); }

                // Load published notices (from Notice Board)
                let publishedNotices = [];
                try {
                    const rawNotices = localStorage.getItem('school_notices');
                    if (rawNotices) {
                        const parsed = JSON.parse(rawNotices);
                        if (Array.isArray(parsed)) {
                            publishedNotices = parsed.map((n, idx) => ({
                                id: n.id || 'pub_' + idx,
                                title: n.title || n.desc || n.text || 'বিজ্ঞপ্তি',
                                date: n.date || '২০২৬',
                                desc: (n.description || n.desc || ''),
                                pdf: n.pdf || n.file || n.pdfUrl || n.attachment || null,
                                fileName: n.fileName || null
                            }));
                        }
                    }
                } catch (e) { console.error("Notice load error:", e); }

                // Combine: Advance ticker notices + Notice board published notices
                let combinedNotices = [];
                const seenTitles = new Set();

                // 1. Ticker notices from Advance (especially with PDF)
                tickerNotices.forEach(tn => {
                    if (tn.title && !seenTitles.has(tn.title.toLowerCase())) {
                        seenTitles.add(tn.title.toLowerCase());
                        combinedNotices.push(tn);
                    }
                });

                // 2. Published notices from Notice Board
                publishedNotices.forEach(pn => {
                    if (pn.title && !seenTitles.has(pn.title.toLowerCase())) {
                        seenTitles.add(pn.title.toLowerCase());
                        combinedNotices.push(pn);
                    } else if (pn.title && seenTitles.has(pn.title.toLowerCase())) {
                        const existing = combinedNotices.find(c => c.title.toLowerCase() === pn.title.toLowerCase());
                        if (existing && !existing.pdf && pn.pdf) {
                            existing.pdf = pn.pdf;
                            existing.fileName = pn.fileName || existing.fileName;
                        }
                    }
                });

                // 3. Fallback defaults if no notices exist
                if (combinedNotices.length === 0) {
                    combinedNotices = [
                        { id: 'def_1', title: 'সকল শিক্ষকমণ্ডলীর উপস্থিতিতে বার্ষিক একাডেমিক পরিকল্পনা সভা।', date: '১০ আগস্ট ২০২৬', desc: 'সকল শিক্ষকমণ্ডলীর অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১০ আগস্ট বার্ষিক একাডেমিক পরিকল্পনা সভা অনুষ্ঠিত হবে।' },
                        { id: 'def_2', title: 'ষষ্ঠ থেকে দশম শ্রেণির মডেল টেস্ট পরীক্ষা সংক্রান্ত নোটিশ।', date: '০৫ আগস্ট ২০২৬', desc: 'ষষ্ঠ থেকে দশম শ্রেণির মডেল টেস্ট পরীক্ষা সংক্রান্ত নোটিশ ও রুটিন প্রকাশ করা হলো।' },
                        { id: 'def_3', title: 'অভিভাবক সমাবেশ ও অর্ধবার্ষিক পরীক্ষার ফলাফল প্রদান।', date: '২৮ জুলাই ২০২৬', desc: 'অভিভাবক সমাবেশ ও অর্ধবার্ষিক পরীক্ষার ফলাফল প্রদান অনুষ্ঠান বিদ্যালয় মিলনায়তনে অনুষ্ঠিত হবে।' }
                    ];
                }

                window.currentHomeNotices = combinedNotices;
                const noticeListEl = document.getElementById('homeNoticeList');

                if (noticeListEl && combinedNotices.length > 0) {
                    noticeListEl.innerHTML = combinedNotices.slice(0, 4).map((n, i) => {
                        const hasPdf = !!(n.pdf || n.file || n.pdfUrl || n.attachment);
                        const title = n.title || n.desc || n.text || 'বিজ্ঞপ্তি';
                        const desc = (n.desc && n.title && n.desc !== n.title) ? n.desc : (n.description || '');
                        const dateStr = n.date || '২০২৬';

                        return `
                            <div onclick="handleHomeNoticeClick(${i})" class="group p-3 rounded-xl border border-gray-100 hover:border-sky-300 hover:bg-sky-50/50 transition-all duration-200 cursor-pointer flex flex-col shadow-2xs hover:shadow-xs bg-white" title="${hasPdf ? 'ক্লিক করে নোটিশ ও PDF দেখুন' : 'ক্লিক করে বিস্তারিত বিবরণ দেখুন'}">
                                <div class="flex items-start justify-between gap-2">
                                    <span class="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 mt-0.5">
                                        <i class="fa-regular fa-calendar-alt text-[10px] text-sky-600"></i> ${dateStr}
                                    </span>
                                    <div class="flex flex-col items-end shrink-0">
                                        <span class="text-[11px] text-sky-600 font-semibold flex items-center gap-0.5 group-hover:text-sky-800 transition">
                                            বিস্তারিত <i class="fa-solid fa-chevron-right text-[8px]"></i>
                                        </span>
                                        ${hasPdf ? `
                                            <button type="button" onclick="event.stopPropagation(); handleHomeNoticePdfClick(${i});" class="mt-1.5 inline-flex items-center gap-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold px-2 py-0.5 rounded text-[10.5px] transition-all shadow-2xs hover:shadow-xs cursor-pointer" title="PDF ফাইলটি চালু ও ডাউনলোড করুন">
                                                <i class="fa-solid fa-file-pdf text-[11px]"></i> <span>Pdf</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                                <p class="text-xs text-gray-800 font-semibold group-hover:text-sky-700 transition mt-1.5 line-clamp-2 leading-relaxed">${title}</p>
                                ${desc ? `<p class="text-[11px] text-gray-500 line-clamp-1 mt-0.5">${desc}</p>` : ''}
                            </div>
                        `;
                    }).join('');
                }
            } catch (e) { console.error("Notice load error:", e); }

            // 3. Staff & Administrative Summary
            try {
                const staff = JSON.parse(localStorage.getItem('school_staff') || '[]');
                const teachers = staff.filter(s => s.role === 'teacher' || s.designation?.includes('শিক্ষক')).length;
                const totalStaff = staff.length || 25;
                const officeStaff = staff.length > 0 ? Math.max(1, totalStaff - teachers) : 8;
                
                const adminBodyEl = document.getElementById('homeAdminSummaryBody');
                if (adminBodyEl) {
                    adminBodyEl.innerHTML = `
                        <tr>
                            <td class="py-2">অনুমোদিত পদ</td>
                            <td class="py-2">${totalStaff} জন</td>
                            <td class="py-2"><span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">পূর্ণাঙ্গ</span></td>
                        </tr>
                        <tr>
                            <td class="py-2">শিক্ষক ও কর্মকর্তা</td>
                            <td class="py-2">${teachers > 0 ? teachers : 17} জন</td>
                            <td class="py-2"><span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">সক্রিয়</span></td>
                        </tr>
                        <tr>
                            <td class="py-2">সহকারী ও স্টাফ</td>
                            <td class="py-2">${officeStaff} জন</td>
                            <td class="py-2"><span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">সক্রিয়</span></td>
                        </tr>
                        <tr>
                            <td class="py-2">শিক্ষক উপস্থিতি</td>
                            <td class="py-2">৯৬%</td>
                            <td class="py-2"><span class="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded">২৪/২৫</span></td>
                        </tr>
                        <tr>
                            <td class="py-2">ম্যানেজমেন্ট সিস.</td>
                            <td class="py-2">ভার্সন ৩.২</td>
                            <td class="py-2"><span class="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded">আপডেটেড</span></td>
                        </tr>
                    `;
                }
            } catch (e) { console.error("Staff summary load error:", e); }

            // 4. Student Data & Class Statistics
            try {
                const students = JSON.parse(localStorage.getItem('school_students') || '[]');
                const classNames = ['ষষ্ঠ শ্রেণি', 'সপ্তম শ্রেণি', 'অষ্টম শ্রেণি', 'নবম শ্রেণি', 'দশম শ্রেণি (SSC)'];
                const classKeys = ['Six', 'Seven', 'Eight', 'Nine', 'Ten'];
                
                let chartMaleData = [65, 60, 58, 55, 52];
                let chartFemaleData = [55, 55, 52, 50, 48];
                let tableRowsData = [];

                if (students.length > 0) {
                    chartMaleData = [];
                    chartFemaleData = [];

                    classKeys.forEach((ck, idx) => {
                        const classStudents = students.filter(s => {
                            const c = (s.class || s.studentClass || '').toString().toLowerCase();
                            return c.includes(ck.toLowerCase()) || c.includes((idx + 6).toString()) || c.includes(classNames[idx].toLowerCase());
                        });

                        const maleCount = classStudents.filter(s => {
                            const g = (s.gender || s.studentGender || '').toString().toLowerCase();
                            return g === 'male' || g === 'ছাত্র' || g === 'm';
                        }).length;

                        const femaleCount = classStudents.filter(s => {
                            const g = (s.gender || s.studentGender || '').toString().toLowerCase();
                            return g === 'female' || g === 'ছাত্রী' || g === 'f';
                        }).length;

                        const totalInClass = classStudents.length;

                        chartMaleData.push(maleCount || (65 - idx * 3));
                        chartFemaleData.push(femaleCount || (55 - idx * 2));

                        tableRowsData.push({
                            name: classNames[idx],
                            section: idx < 3 ? '২ (ক, খ)' : '২ (বিজ্ঞান, মানবিক)',
                            male: maleCount || (65 - idx * 3),
                            female: femaleCount || (55 - idx * 2),
                            total: totalInClass || (120 - idx * 5),
                            attendance: (93.5 + (idx % 3)).toFixed(1) + '%',
                            status: idx === 4 ? 'অতি উত্তম' : 'চমৎকার'
                        });
                    });

                    // Update Total Students Badge & Counters
                    const totalCount = students.length;
                    const badgeEl = document.getElementById('homeTotalStudentsBadge');
                    if (badgeEl) badgeEl.textContent = `মোট ${totalCount} জন`;

                    const counterEl = document.getElementById('homeAchievementTotalStudents');
                    if (counterEl) counterEl.textContent = `${totalCount}+`;
                } else {
                    tableRowsData = [
                        { name: 'ষষ্ঠ শ্রেণি', section: '২ (ক, খ)', male: 65, female: 55, total: 120, attendance: '৯৫.০%', status: 'চমৎকার' },
                        { name: 'সপ্তম শ্রেণি', section: '২ (ক, খ)', male: 60, female: 55, total: 115, attendance: '৯৩.২%', status: 'ভালো' },
                        { name: 'অষ্টম শ্রেণি', section: '২ (ক, খ)', male: 58, female: 52, total: 110, attendance: '৯৪.৫%', status: 'চমৎকার' },
                        { name: 'নবম শ্রেণি', section: '২ (বিজ্ঞান, মানবিক)', male: 55, female: 50, total: 105, attendance: '৯২.০%', status: 'সন্তোষজনক' },
                        { name: 'দশম শ্রেণি (SSC)', section: '২ (বিজ্ঞান, মানবিক)', male: 52, female: 48, total: 100, attendance: '৯৬.৮%', status: 'অতি উত্তম' }
                    ];
                }

                const studentTableBody = document.getElementById('homeStudentTableBody');
                if (studentTableBody) {
                    studentTableBody.innerHTML = tableRowsData.map(row => `
                        <tr class="hover:bg-slate-50 transition">
                            <td class="py-2.5 text-left pl-3 font-bold text-slate-800">${row.name}</td>
                            <td>${row.section}</td>
                            <td class="font-medium text-sky-700">${row.male} জন</td>
                            <td class="font-medium text-pink-700">${row.female} জন</td>
                            <td class="font-bold text-slate-900">${row.total} জন</td>
                            <td class="font-semibold text-emerald-600">${row.attendance}</td>
                            <td><span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">${row.status}</span></td>
                        </tr>
                    `).join('');
                }

                // Generate custom class labels with total student count
                const baseClassLabels = ['ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'];
                const customLabels = chartMaleData.map((mVal, idx) => {
                    const fVal = chartFemaleData[idx] || 0;
                    const totalVal = mVal + fVal;
                    const labelName = baseClassLabels[idx] || (classNames[idx] ? classNames[idx].replace(' শ্রেণি', '').trim() : `শ্রেণি ${idx+6}`);
                    return `${labelName} : ${totalVal} জন`;
                });

                // Render Chart.js
                renderStudentChart(chartMaleData, chartFemaleData, customLabels);

            } catch (e) { console.error("Student stats load error:", e); }

            // 5. Render Dynamic Important Links (e-Services)
            try {
                renderHomeImportantLinks();
            } catch (e) { console.error("Important links render error:", e); }
        }

        const DEFAULT_IMPORTANT_LINKS = [
            { title: "শিক্ষা মন্ত্রণালয়", url: "http://moedu.gov.bd", subtitle: "moedu.gov.bd", icon: "fa-landmark", color: "sky" },
            { title: "মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর", url: "http://dshe.gov.bd", subtitle: "dshe.gov.bd", icon: "fa-building-columns", color: "amber" },
            { title: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড", url: "http://nctb.gov.bd", subtitle: "nctb.gov.bd", icon: "fa-book", color: "emerald" },
            { title: "দিনাজপুর শিক্ষা বোর্ড", url: "http://dinajpurboard.gov.bd", subtitle: "dinajpurboard.gov.bd", icon: "fa-graduation-cap", color: "rose" },
            { title: "ব্যানবেইস (BANBEIS)", url: "http://banbeis.gov.bd", subtitle: "banbeis.gov.bd", icon: "fa-chart-bar", color: "sky" },
            { title: "শিক্ষক বাতায়ন", url: "http://teachers.gov.bd", subtitle: "teachers.gov.bd", icon: "fa-chalkboard-user", color: "emerald" }
        ];

        function renderHomeImportantLinks() {
            const container = document.getElementById('homeImportantLinksContainer');
            if (!container) return;

            let links = DEFAULT_IMPORTANT_LINKS;
            try {
                const stored = localStorage.getItem('school_important_links');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        links = parsed;
                    }
                }
            } catch (e) { console.error("Links load error:", e); }

            const colorClasses = {
                sky: 'bg-sky-100 text-sky-600',
                amber: 'bg-amber-100 text-amber-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                rose: 'bg-rose-100 text-rose-600',
                purple: 'bg-purple-100 text-purple-600'
            };

            container.innerHTML = links.map(link => {
                const badgeStyle = colorClasses[link.color] || 'bg-sky-100 text-sky-600';
                const iconClass = link.icon || 'fa-globe';
                const displaySub = link.subtitle || link.url.replace(/^https?:\/\//, '');

                return `
                    <a href="${link.url}" target="_blank" class="flex items-center p-3 border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 transition group shadow-2xs">
                        <div class="w-9 h-9 ${badgeStyle} rounded-lg flex items-center justify-center shrink-0 mr-3 group-hover:scale-105 transition shadow-inner">
                            <i class="fa-solid ${iconClass} text-sm"></i>
                        </div>
                        <div class="overflow-hidden">
                            <h4 class="text-xs font-bold text-gray-800 group-hover:text-sky-600 transition truncate">${link.title}</h4>
                            <span class="text-[10px] text-gray-400 block truncate">${displaySub}</span>
                        </div>
                    </a>
                `;
            }).join('');
        }

        // Dynamic Hero Banner Slider Initializer
        const DEFAULT_HOME_SLIDES = [
            {
                url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
                badge: "স্মার্ট ক্যাম্পাস ২০২৬",
                badgeColor: "bg-amber-500 text-slate-950",
                title: "গুণগত শিক্ষা ও মনোরম পরিবেশের সেরা ঠিকানা",
                desc: "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School — শিক্ষার্থীদের নৈতিক, শারীরিক ও মানসিক বিকাশে অনন্য প্রতিষ্ঠান।"
            },
            {
                url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
                badge: "ডিজিটাল ক্লাসরুম",
                badgeColor: "bg-sky-500 text-white",
                title: "আধুনিক আইসিটি ল্যাব ও স্মার্ট লার্নিং ব্যবস্থা",
                desc: "মাল্টিমিডিয়া প্রজেক্টর, কম্পিউটার ল্যাব ও প্রযুক্তি নির্ভর নতুন শিক্ষাক্রমের যুগোপযোগী প্রতিফলন।"
            },
            {
                url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
                badge: "সমৃদ্ধ পাঠাগার",
                badgeColor: "bg-emerald-500 text-white",
                title: "জ্ঞানচর্চা ও বই পড়ার চমৎকার পরিবেশ",
                desc: "সহস্রাধিক বই সংবলিত সুসজ্জিত লাইব্রেরি, বিজ্ঞানাগার ও বৈচিত্র্যময় সহপাঠ্যক্রমিক কার্যক্রম।"
            },
            {
                url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
                badge: "অভিজ্ঞ শিক্ষকমণ্ডলী",
                badgeColor: "bg-purple-500 text-white",
                title: "দক্ষ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দের সার্বক্ষণিক তদারকি",
                desc: "প্রতিটি শিক্ষার্থীর পৃথক যত্ন, নিয়মিত পাঠ্য মূল্যায়ন এবং ভবিষ্যৎ গঠনের দিকনির্দেশনা।"
            }
        ];

        let heroSlideInterval = null;
        let currentHeroSlideIndex = 0;

        function initDynamicHeroSlider() {
            const sliderContainer = document.getElementById('heroSlider');
            const dotsContainer = document.getElementById('slideIndicatorsContainer');
            const prevBtn = document.getElementById('prevSlideBtn');
            const nextBtn = document.getElementById('nextSlideBtn');
            if (!sliderContainer) return;

            let slidesData = [];

            try {
                const stored = localStorage.getItem('school_slider_images');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        slidesData = parsed.map((item) => {
                            if (typeof item === 'string') {
                                return {
                                    url: item,
                                    badge: 'স্মার্ট ক্যাম্পাস ২০২৬',
                                    badgeColor: 'bg-amber-500 text-slate-950',
                                    title: '',
                                    desc: ''
                                };
                            }
                            return item;
                        }).filter(s => s && (s.url || s.image));
                    }
                }
            } catch (e) { console.error("Slider data load error:", e); }

            if (slidesData.length === 0) {
                if (heroSlideInterval) clearInterval(heroSlideInterval);
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                if (dotsContainer) dotsContainer.style.display = 'none';
                sliderContainer.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 text-center min-h-[300px] sm:min-h-[330px]">
                        <div class="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-3">
                            <i class="fa-solid fa-images text-indigo-400 text-2xl"></i>
                        </div>
                        <h3 class="text-base font-bold text-slate-100">স্মার্ট ডিজিটাল ক্যাম্পাস</h3>
                        <p class="text-xs text-slate-400 mt-1 max-w-md">অ্যাডভান্স প্যানেল থেকে আপনার নিজস্ব স্লাইড ছবি ও বিবরণ আপলোড করুন।</p>
                    </div>
                `;
                return;
            }

            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
            if (dotsContainer) dotsContainer.style.display = '';

            // Render Slide Items HTML
            sliderContainer.innerHTML = slidesData.map(slide => `
                <div class="w-full shrink-0 relative h-full min-h-[300px] sm:min-h-[330px]">
                    <img src="${slide.url || slide.image}" alt="${slide.title || 'Slide Image'}" class="w-full h-full object-cover brightness-75 transition-all duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex items-end p-5 md:p-6">
                        <div class="text-white">
                            ${slide.badge ? `<span class="${slide.badgeColor || 'bg-amber-500 text-slate-950'} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block shadow-xs">${slide.badge}</span>` : ''}
                            ${slide.title ? `<h2 class="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">${slide.title}</h2>` : ''}
                            ${slide.desc ? `<p class="text-xs text-gray-200 mt-1 drop-shadow line-clamp-2">${slide.desc}</p>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            // Render Dot Indicators
            if (dotsContainer) {
                dotsContainer.innerHTML = slidesData.map((_, idx) => `
                    <button class="slide-dot w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50 hover:bg-white'} transition" data-index="${idx}"></button>
                `).join('');
            }

            const totalSlides = slidesData.length;
            currentHeroSlideIndex = 0;

            function goToSlide(index) {
                currentHeroSlideIndex = (index + totalSlides) % totalSlides;
                sliderContainer.style.transform = `translateX(-${currentHeroSlideIndex * 100}%)`;
                
                const dots = dotsContainer?.querySelectorAll('.slide-dot');
                dots?.forEach((dot, i) => {
                    if (i === currentHeroSlideIndex) {
                        dot.classList.remove('bg-white/50');
                        dot.classList.add('bg-white');
                    } else {
                        dot.classList.remove('bg-white');
                        dot.classList.add('bg-white/50');
                    }
                });
            }

            // Attach button handlers
            if (prevBtn) {
                prevBtn.onclick = () => {
                    goToSlide(currentHeroSlideIndex - 1);
                    resetHeroTimer();
                };
            }

            if (nextBtn) {
                nextBtn.onclick = () => {
                    goToSlide(currentHeroSlideIndex + 1);
                    resetHeroTimer();
                };
            }

            const dots = dotsContainer?.querySelectorAll('.slide-dot');
            dots?.forEach((dot, i) => {
                dot.onclick = () => {
                    goToSlide(i);
                    resetHeroTimer();
                };
            });

            function startHeroTimer() {
                if (heroSlideInterval) clearInterval(heroSlideInterval);
                heroSlideInterval = setInterval(() => {
                    goToSlide(currentHeroSlideIndex + 1);
                }, 4500);
            }

            function resetHeroTimer() {
                if (heroSlideInterval) clearInterval(heroSlideInterval);
                startHeroTimer();
            }

            startHeroTimer();
        }

        function handleHomeNoticePdfClick(index) {
            const notices = window.currentHomeNotices || [];
            const notice = notices[index];
            if (!notice) return;

            const pdfData = notice.pdf || notice.file || notice.pdfUrl || notice.attachment;
            if (pdfData) {
                const fileName = notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf';
                if (typeof openNoticePdf === 'function') {
                    openNoticePdf(pdfData, fileName);
                } else if (typeof window.openNoticePdf === 'function') {
                    window.openNoticePdf(pdfData, fileName);
                } else {
                    window.open(pdfData, '_blank');
                }
            }
        }
        window.handleHomeNoticePdfClick = handleHomeNoticePdfClick;

        function handleHomeNoticeClick(index) {
            const notices = window.currentHomeNotices || [];
            const notice = notices[index];
            if (!notice) return;

            const pdfData = notice.pdf || notice.file || notice.pdfUrl || notice.attachment;
            if (pdfData) {
                const fileName = notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf';
                if (typeof openNoticePdf === 'function') {
                    openNoticePdf(pdfData, fileName);
                } else if (typeof window.openNoticePdf === 'function') {
                    window.openNoticePdf(pdfData, fileName);
                } else {
                    window.open(pdfData, '_blank');
                }
            } else {
                openHomeNoticeDetailModal(notice);
            }
        }
        window.handleHomeNoticeClick = handleHomeNoticeClick;

        function openHomeNoticeDetailModal(notice) {
            if (!notice) return;
            const modalEl = document.getElementById('homeNoticeDetailModal');
            if (!modalEl) {
                if (notice.title) {
                    alert(notice.title + '\n\n' + (notice.desc || notice.description || ''));
                }
                return;
            }

            const titleEl = document.getElementById('homeModalNoticeTitle');
            const dateEl = document.getElementById('homeModalNoticeDate');
            const descEl = document.getElementById('homeModalNoticeDesc');
            const pdfActionEl = document.getElementById('homeModalPdfAction');
            const pdfBtnEl = document.getElementById('homeModalPdfBtn');

            if (titleEl) titleEl.textContent = notice.title || notice.text || 'বিজ্ঞপ্তি';
            if (dateEl) dateEl.textContent = notice.date || '২০২৬';
            if (descEl) descEl.textContent = notice.desc || notice.description || notice.title || 'কোনো বিস্তারিত বিবরণ পাওয়া যায়নি।';

            const pdfData = notice.pdf || notice.file || notice.pdfUrl || notice.attachment;
            if (pdfActionEl && pdfBtnEl) {
                if (pdfData) {
                    pdfActionEl.classList.remove('hidden');
                    pdfBtnEl.onclick = function() {
                        if (typeof openNoticePdf === 'function') {
                            openNoticePdf(pdfData, notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf');
                        } else {
                            window.open(pdfData, '_blank');
                        }
                    };
                } else {
                    pdfActionEl.classList.add('hidden');
                    pdfBtnEl.onclick = null;
                }
            }

            modalEl.classList.remove('hidden');
            modalEl.classList.add('flex');
        }

        function closeHomeNoticeDetailModal() {
            const modalEl = document.getElementById('homeNoticeDetailModal');
            if (modalEl) {
                modalEl.classList.add('hidden');
                modalEl.classList.remove('flex');
            }
        }
        window.openHomeNoticeDetailModal = openHomeNoticeDetailModal;
        window.closeHomeNoticeDetailModal = closeHomeNoticeDetailModal;

        // Expose functions globally for main.js triggerAllUIRefresh
        window.updateHomeDataFromWebsite = updateHomeDataFromWebsite;
        window.initDynamicHeroSlider = initDynamicHeroSlider;

        // Immediate event listeners
        window.addEventListener('storage', () => {
            updateHomeDataFromWebsite();
            initDynamicHeroSlider();
        });

        window.addEventListener('dbSynced', () => {
            updateHomeDataFromWebsite();
            initDynamicHeroSlider();
        });

        window.addEventListener('tickerNoticesUpdated', () => {
            updateHomeDataFromWebsite();
            initDynamicHeroSlider();
        });

        document.addEventListener('DOMContentLoaded', function() {
            updateHomeDataFromWebsite();
            initDynamicHeroSlider();
        });

        // Ensure fresh data boot re-renders UI as soon as server response arrives
        if (window.dbBootPromise) {
            window.dbBootPromise.then(() => {
                updateHomeDataFromWebsite();
                initDynamicHeroSlider();
            });
        }
    