
// BLOCK 1

        function getBnDateString(d) {
            if (!d) d = new Date();
            var months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
            var bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
            var toBn = function(n) { return String(n).replace(/\d/g, function(digit) { return bnDigits[digit]; }); };
            return toBn(d.getDate()) + ' ' + months[d.getMonth()] + ' ' + toBn(d.getFullYear());
        }

        function clearNoticeBoardPdf() {
            var fileInput = document.getElementById('notice-pdf-input');
            var base64Input = document.getElementById('notice-pdf-base64');
            var filenameInput = document.getElementById('notice-pdf-filename');
            var previewBox = document.getElementById('notice-pdf-info-box');
            var removeBtn = document.getElementById('remove-notice-pdf-btn');

            if (fileInput) fileInput.value = '';
            if (base64Input) base64Input.value = '';
            if (filenameInput) filenameInput.value = '';
            if (previewBox) previewBox.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'none';
        }
        window.clearNoticeBoardPdf = clearNoticeBoardPdf;

        function openCreateModal() {
            var modalEl = document.getElementById('notice-modal');
            var formEl = document.getElementById('create-notice-form');
            var editingInput = document.getElementById('editing-notice-id');
            var modalTitle = document.getElementById('modal-title-text');
            var dateInput = document.getElementById('notice-date');
            
            if (formEl) formEl.reset();
            if (editingInput) editingInput.value = '';
            if (modalTitle) modalTitle.textContent = 'নতুন নোটিশ তৈরি করুন';
            clearNoticeBoardPdf();

            if (dateInput) {
                dateInput.value = getBnDateString();
            }
            if (modalEl) {
                modalEl.setAttribute('style', 'display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 9999999 !important;');
                modalEl.classList.add('active');
            }
        }

        function openEditModal(noticeId) {
            var notices = typeof getStoredNotices === 'function' ? getStoredNotices() : [];
            var notice = notices.find(function(n) { return n.id === noticeId; });
            if (!notice) {
                var card = document.querySelector('.notice-card[data-notice-id="' + noticeId + '"]');
                if (card) {
                    var titleText = card.querySelector('.card-header h3')?.textContent.trim();
                    notice = notices.find(function(n) { return n.title === titleText; });
                }
            }
            if (!notice) return;

            var modalEl = document.getElementById('notice-modal');
            var editingInput = document.getElementById('editing-notice-id');
            var modalTitle = document.getElementById('modal-title-text');
            var titleInput = document.getElementById('notice-title');
            var dateInput = document.getElementById('notice-date');
            var iconSelect = document.getElementById('notice-icon');
            var descInput = document.getElementById('notice-desc');
            var base64Input = document.getElementById('notice-pdf-base64');
            var filenameInput = document.getElementById('notice-pdf-filename');
            var previewBox = document.getElementById('notice-pdf-info-box');
            var previewText = document.getElementById('notice-pdf-info-text');
            var removeBtn = document.getElementById('remove-notice-pdf-btn');

            if (editingInput) editingInput.value = notice.id;
            if (modalTitle) modalTitle.textContent = 'নোটিশ আপডেট করুন';
            if (titleInput) titleInput.value = notice.title || '';
            if (dateInput) dateInput.value = notice.date || '';
            if (iconSelect) iconSelect.value = notice.iconClass || 'fa-solid fa-bullhorn';
            if (descInput) descInput.value = notice.description || '';

            if (notice.pdf) {
                if (base64Input) base64Input.value = notice.pdf;
                if (filenameInput) filenameInput.value = notice.fileName || 'সংযুক্ত-ডকুমেন্ট.pdf';
                if (previewText) previewText.textContent = `যুক্ত আছে: ${notice.fileName || 'সংযুক্ত PDF ডকুমেন্ট'}`;
                if (previewBox) previewBox.style.display = 'block';
                if (removeBtn) removeBtn.style.display = 'inline-block';
            } else {
                clearNoticeBoardPdf();
            }

            if (modalEl) {
                modalEl.setAttribute('style', 'display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 9999999 !important;');
                modalEl.classList.add('active');
            }
        }

        function closeCreateModal() {
            var modalEl = document.getElementById('notice-modal');
            var formEl = document.getElementById('create-notice-form');
            var editingInput = document.getElementById('editing-notice-id');
            var modalTitle = document.getElementById('modal-title-text');

            if (modalEl) {
                modalEl.setAttribute('style', 'display: none !important; opacity: 0 !important; visibility: hidden !important;');
                modalEl.classList.remove('active');
            }
            if (formEl) {
                formEl.reset();
            }
            if (editingInput) editingInput.value = '';
            if (modalTitle) modalTitle.textContent = 'নতুন নোটিশ তৈরি করুন';
            clearNoticeBoardPdf();
        }

        function openNoticeDetail(data) {
            if (!data) return;
            var detailModal = document.getElementById('detail-modal');
            var titleEl = document.getElementById('detail-title');
            var dateEl = document.getElementById('detail-date');
            var descEl = document.getElementById('detail-description');
            var iconContainer = document.getElementById('detail-icon-container');
            var pdfContainer = document.getElementById('detail-pdf-container');
            var pdfBtn = document.getElementById('detail-pdf-btn');

            if (titleEl) titleEl.textContent = data.title;
            if (dateEl) dateEl.innerHTML = '<i class="fa-regular fa-calendar-alt"></i> ' + data.date;
            if (descEl) descEl.textContent = data.description;
            if (iconContainer && data.iconHtml) iconContainer.innerHTML = data.iconHtml;

            if (pdfContainer && pdfBtn) {
                if (data.pdf) {
                    pdfContainer.style.display = 'block';
                    pdfBtn.onclick = function(e) {
                        e.preventDefault();
                        if (typeof openNoticePdf === 'function') {
                            openNoticePdf(data.pdf, data.fileName || data.title || 'নোটিশ-ডকুমেন্ট.pdf');
                        } else {
                            window.open(data.pdf, '_blank');
                        }
                    };
                } else {
                    pdfContainer.style.display = 'none';
                    pdfBtn.onclick = null;
                }
            }

            if (detailModal) {
                detailModal.setAttribute('style', 'display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 9999999 !important;');
                detailModal.classList.add('active');
            }
        }

        function closeDetailModal() {
            var detailModal = document.getElementById('detail-modal');
            if (detailModal) {
                detailModal.setAttribute('style', 'display: none !important; opacity: 0 !important; visibility: hidden !important;');
                detailModal.classList.remove('active');
            }
        }

        function printNoticeDetail() {
            var title = document.getElementById('detail-title')?.textContent || '';
            var date = document.getElementById('detail-date')?.textContent || '';
            var desc = document.getElementById('detail-description')?.textContent || '';
            var printWin = window.open('', '_blank');
            if (printWin) {
                printWin.document.write('<html><head><title>' + title + '</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8;}h1{color:#00796b;margin-bottom:10px;}.date{color:#666;font-size:14px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #00796b;}</style></head><body><h1>' + title + '</h1><div class="date">' + date + '</div><p>' + desc + '</p></body></html>');
                printWin.document.close();
                printWin.print();
            }
        }

        window.openCreateModal = openCreateModal;
        window.openEditModal = openEditModal;
        window.closeCreateModal = closeCreateModal;
        window.openNoticeDetail = openNoticeDetail;
        window.closeDetailModal = closeDetailModal;
    
// BLOCK 2

        function collectNoticeData(button) {
            var card = button.closest('.notice-card');
            if (card) {
                var noticeId = card.getAttribute('data-notice-id');
                var notices = typeof getStoredNotices === 'function' ? getStoredNotices() : [];
                var noticeObj = noticeId ? notices.find(function(n) { return String(n.id) === String(noticeId); }) : null;
                return {
                    id: noticeId,
                    title: card.querySelector('.card-header h3')?.textContent.trim() || '',
                    date: card.querySelector('.notice-date')?.textContent.replace(/\s+/g, ' ').trim() || '',
                    description: card.querySelector('.notice-desc')?.textContent.trim() || '',
                    iconHtml: card.querySelector('.card-header i')?.outerHTML || '<i class="fa-solid fa-bell"></i>',
                    pdf: noticeObj ? (noticeObj.pdf || noticeObj.file || noticeObj.pdfUrl) : null,
                    fileName: noticeObj ? noticeObj.fileName : ''
                };
            }

            var summary = button.closest('.latest-news-summary');
            if (summary) {
                return {
                    title: summary.querySelector('h4')?.textContent.trim() || '',
                    date: summary.querySelector('.notice-date')?.textContent.replace(/\s+/g, ' ').trim() || '',
                    description: summary.querySelector('.notice-desc')?.textContent.trim() || '',
                    iconHtml: summary.querySelector('.notice-icon i')?.outerHTML || '<i class="fa-solid fa-bell"></i>'
                };
            }

            return null;
        }

        function parseBnDate(dateText) {
            var digits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
            var replaceDigits = function(str) { return str.replace(/[০-৯]/g, function(m) { return digits.indexOf(m); }); };
            var months = {
                'জানুয়ারি': 1, 'ফেব্রুয়ারি': 2, 'মার্চ': 3, 'এপ্রিল': 4,
                'মে': 5, 'জুন': 6, 'জুলাই': 7, 'আগস্ট': 8,
                'সেপ্টেম্বর': 9, 'অক্টোবর': 10, 'নভেম্বর': 11, 'ডিসেম্বর': 12
            };
            var normalized = dateText.replace(/[ - ]+/g, '').trim();
            var match = normalized.match(/(\d+)\s+([^\d\s]+)\s+(\d+)/);
            if (!match) return null;
            var day = parseInt(replaceDigits(match[1]), 10);
            var month = months[match[2]];
            var year = parseInt(replaceDigits(match[3]), 10);
            return month ? new Date(year, month - 1, day) : null;
        }

        function buildLatestNewsFromCards() {
            var cards = Array.from(document.querySelectorAll('.notice-card'));
            if (!cards.length) return;

            var notices = cards.map(function(card, index) {
                var titleEl = card.querySelector('.card-header h3');
                var dateEl = card.querySelector('.notice-date');
                var descEl = card.querySelector('.notice-desc');
                return {
                    index: index,
                    title: titleEl?.textContent.trim() || '',
                    date: dateEl?.textContent.replace(/\s+/g, ' ').trim() || '',
                    dateObj: parseBnDate(dateEl?.textContent || '') || new Date(0),
                    description: descEl?.textContent.trim() || '',
                    iconHtml: card.querySelector('.card-header i')?.outerHTML || '<i class="fa-solid fa-bell"></i>'
                };
            });

            notices.sort(function(a, b) { return b.dateObj - a.dateObj; });
            var latest = notices[0];
            var list = document.getElementById('latest-news-list');
            var summary = document.querySelector('.latest-news-summary');
            if (list) {
                var escapeAttr = function(str) {
                    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                };
                list.innerHTML = notices.slice(0, 5).map(function(n) {
                    return '<li><a href="#" data-notice-index="' + n.index + '" data-title="' + escapeAttr(n.title) + '" data-date="' + escapeAttr(n.date) + '" data-desc="' + escapeAttr(n.description) + '" data-icon="' + escapeAttr(n.iconHtml) + '"><i class="fa-solid fa-chevron-right"></i> ' + n.title + ' <span class="news-date">' + n.date + '</span></a></li>';
                }).join('');
            }
            if (summary && latest) {
                var titleEl = summary.querySelector('h4');
                var dateEl = summary.querySelector('.notice-date');
                var descEl = summary.querySelector('.notice-desc');
                var iconEl = summary.querySelector('.notice-icon');
                if (titleEl) titleEl.textContent = latest.title;
                if (dateEl) dateEl.textContent = latest.date;
                if (descEl) descEl.textContent = latest.description;
                if (iconEl) iconEl.innerHTML = latest.iconHtml;
            }
        }

        function observeCardChanges() {
            var noticeGrid = document.querySelector('.notice-grid');
            if (!noticeGrid) return;
            var observer = new MutationObserver(function() { buildLatestNewsFromCards(); });
            observer.observe(noticeGrid, { childList: true, subtree: true, characterData: true });
        }

        buildLatestNewsFromCards();
        observeCardChanges();

        function openNoticeWindow(data) {
            if (!data) return;
            var noticeWindow = window.open('', '_blank', 'width=720,height=760,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes');
            if (!noticeWindow) return;

            var content = '<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Agbalumo&family=Noto+Rashi+Hebrew:wght@100..900&family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet"><title>' + data.title + '</title><style>body { margin: 0; font-family: "Noto Rashi Hebrew", "Tiro Bangla", "Hind Siliguri", serif; background: #f4f7f6; color: #222; } .notice-detail { max-width: 700px; margin: 30px auto; background: #ffffff; border-radius: 24px; box-shadow: 0 18px 45px rgba(0,0,0,0.12); overflow: hidden; } .notice-detail-header { background: #00796b; color: #fff; padding: 30px 28px; display: grid; gap: 18px; } .notice-detail-header .icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.18); display: inline-flex; align-items: center; justify-content: center; font-size: 24px; } .notice-detail-header h1 { font-size: 28px; margin: 0; line-height: 1.2; } .notice-detail-header .notice-date { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; opacity: 0.92; } .notice-detail-body { padding: 28px; display: grid; gap: 18px; } .notice-detail-body p { margin: 0; line-height: 1.8; color: #444; font-size: 15px; } .notice-detail-body .action { margin-top: 12px; } .notice-detail-body .action a { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 999px; background: #00796b; color: #ffffff; text-decoration: none; font-weight: 600; } .notice-detail-body .action a:hover { background: #005a4d; }</style></head><body><article class="notice-detail"><header class="notice-detail-header"><div class="icon">' + data.iconHtml + '</div><h1>' + data.title + '</h1><div class="notice-date"><i class="fa-regular fa-calendar-alt"></i>' + data.date + '</div></header><section class="notice-detail-body"><p>' + data.description + '</p><div class="action"><a href="javascript:window.close();">বন্দ করুন</a></div></section></article></body></html>';
            noticeWindow.document.open();
            noticeWindow.document.write(content);
            noticeWindow.document.close();
        }

        const DEFAULT_NOTICES = [
            {
                id: 'notice_1',
                title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৪',
                date: '২৫ জুলাই ২০২৪',
                iconClass: 'fa-solid fa-running',
                description: 'আগামী ২৫ জুলাই ২০২৪ তারিখে বিদ্যালয় প্রাঙ্গণে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হইবে। সকল ছাত্র-ছাত্রীকে সময়মতো উপস্থিত থাকার অনুরোধ করা হচ্ছে।'
            },
            {
                id: 'notice_2',
                title: 'গ্রীষ্মকালীন ছুটি সংক্রান্ত বিজ্ঞপ্তি',
                date: '১৫ জুলাই ২০২৪',
                iconClass: 'fa-solid fa-sun',
                description: 'এতদ্বারা সকল শিক্ষক ও শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১৫ জুলাই থেকে গ্রীষ্মকালীন ছুটি শুরু হতে যাচ্ছে।'
            },
            {
                id: 'notice_3',
                title: 'বিজ্ঞান মেলা এবং প্রদর্শনী',
                date: '১০ জুলাই ২০২৪',
                iconClass: 'fa-solid fa-flask',
                description: 'বিদ্যালয় প্রাঙ্গণে অনুষ্ঠিত হতে যাচ্ছে বার্ষিক বিজ্ঞান মেলা। প্রজেক্ট সাবমিশনের শেষ তারিখ ১০ জুলাই ২০২৪।'
            },
            {
                id: 'notice_4',
                title: 'দশম শ্রেণীর প্রস্তুতিমূলক পরীক্ষা',
                date: '০৮ জুলাই ২০২৪',
                iconClass: 'fa-solid fa-file-pen',
                description: 'দশম শ্রেণীর সকল শিক্ষার্থীদের প্রস্তুতিমূলক পরীক্ষার সময়সূচি প্রকাশ করা হয়েছে। সকল শিক্ষার্থীকে সময়সূচি সংগ্রহ করার নির্দেশ দেওয়া হচ্ছে।'
            },
            {
                id: 'notice_5',
                title: 'নতুন বই বিতরণ অনুষ্ঠান',
                date: '২৮ জুন ২০২৪',
                iconClass: 'fa-solid fa-book-open',
                description: 'নবম ও দশম শ্রেণীর অতিরিক্ত সহায়ক বই বিতরণ করা হবে আগামী ২৮ জুন। নির্দিষ্ট সময়ে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।'
            }
        ];

        function getStoredNotices() {
            // 1. Load ticker notices from Advance (school_ticker_notices)
            var tickerNotices = [];
            try {
                var rawTicker = localStorage.getItem('school_ticker_notices');
                if (rawTicker) {
                    var parsedTicker = JSON.parse(rawTicker);
                    if (Array.isArray(parsedTicker)) {
                        tickerNotices = parsedTicker.map(function(t, idx) {
                            if (typeof t === 'string' && t.trim()) {
                                var text = t.trim();
                                var parts = text.split(/\s*[-—:]\s*/);
                                var title = parts[0] || text;
                                var desc = parts.length > 1 ? parts.slice(1).join(' - ') : text;
                                return {
                                    id: 'ticker_' + idx,
                                    title: title,
                                    date: '২০২৬',
                                    iconClass: 'fa-solid fa-bullhorn',
                                    description: desc,
                                    pdf: null,
                                    fileName: null,
                                    isTicker: true
                                };
                            } else if (t && typeof t === 'object') {
                                var title = (t.title || t.text || 'বিজ্ঞপ্তি').trim();
                                var desc = (t.description || t.desc || t.text || title).trim();
                                return {
                                    id: t.id || ('ticker_' + idx),
                                    title: title,
                                    date: t.date || '২০২৬',
                                    iconClass: t.iconClass || (t.pdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-bullhorn'),
                                    description: desc,
                                    pdf: t.pdf || null,
                                    fileName: t.fileName || null,
                                    isTicker: true
                                };
                            }
                            return null;
                        }).filter(Boolean);
                    }
                }
            } catch (e) {
                console.error("Failed to parse school_ticker_notices in notice-board:", e);
            }

            // 2. Load published notices from Notice Board (school_notices)
            var publishedNotices = [];
            try {
                var rawNotices = localStorage.getItem('school_notices');
                if (rawNotices) {
                    var parsedNotices = JSON.parse(rawNotices);
                    if (Array.isArray(parsedNotices) && parsedNotices.length > 0) {
                        publishedNotices = parsedNotices;
                    }
                }
            } catch (e) {
                console.error("Failed to parse school_notices in notice-board:", e);
            }

            // Fallback if neither source has notices
            if (tickerNotices.length === 0 && publishedNotices.length === 0) {
                if (!localStorage.getItem('school_notices') && !localStorage.getItem('school_ticker_notices')) {
                    localStorage.setItem('school_notices', JSON.stringify(DEFAULT_NOTICES));
                }
                return DEFAULT_NOTICES;
            }

            // 3. Combine: Advance ticker notices (latest first) + Notice board published notices
            var combined = [];
            var seenTitles = new Set();

            // Ticker notices from Advance (especially with PDF) take high precedence
            tickerNotices.forEach(function(tn) {
                var key = (tn.title || '').trim().toLowerCase();
                if (key && !seenTitles.has(key)) {
                    seenTitles.add(key);
                    combined.push(tn);
                }
            });

            // Published notices from Notice Board
            publishedNotices.forEach(function(pn) {
                var key = (pn.title || '').trim().toLowerCase();
                if (key && !seenTitles.has(key)) {
                    seenTitles.add(key);
                    combined.push(pn);
                } else if (key && seenTitles.has(key)) {
                    var existing = combined.find(function(c) { return (c.title || '').trim().toLowerCase() === key; });
                    if (existing && !existing.pdf && pn.pdf) {
                        existing.pdf = pn.pdf;
                        existing.fileName = pn.fileName || existing.fileName;
                    }
                }
            });

            return combined.length > 0 ? combined : DEFAULT_NOTICES;
        }

        function saveNotices(notices) {
            localStorage.setItem('school_notices', JSON.stringify(notices));
            if (window.lastLocalWrites) {
                window.lastLocalWrites['school_notices'] = Date.now();
            }
            if (typeof flushPushQueueNow === 'function') {
                flushPushQueueNow();
            }
            if (typeof triggerAllUIRefresh === 'function') {
                triggerAllUIRefresh();
            }
            try {
                window.dispatchEvent(new CustomEvent('tickerNoticesUpdated'));
            } catch (e) {}
        }

        function updateNoticeBoardTicker() {
            if (typeof window.updateNoticeTicker === 'function') {
                window.updateNoticeTicker();
                return;
            }
            var storedTicker = localStorage.getItem('school_ticker_notices');
            if (storedTicker) return;

            var notices = getStoredNotices();
            if (!notices || !notices.length) return;

            var latest3 = notices.slice(0, 3).map(function(n) {
                var title = n.title ? (n.title + ' — ') : '';
                var desc = n.description || n.title || '';
                return title + desc;
            });

            try {
                localStorage.setItem('school_ticker_notices', JSON.stringify(latest3));
                if (window.lastLocalWrites) {
                    window.lastLocalWrites['school_ticker_notices'] = Date.now();
                }
            } catch (e) {}

            var tickerEl = document.querySelector('.notice-ticker .notice-text');
            if (tickerEl && latest3.length > 0) {
                tickerEl.innerText = latest3.join("    ★    ");
                var textLength = tickerEl.innerText.length;
                var speed = Math.max(20, Math.round(textLength * 0.22));
                tickerEl.style.animationDuration = speed + 's';
            }
        }

        function handleNoticePdfClick(noticeId, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            var notices = getStoredNotices();
            var notice = notices.find(function(n) { return String(n.id) === String(noticeId); });
            if (!notice) return;
            var pdfData = notice.pdf || notice.file || notice.pdfUrl || notice.attachment;
            if (!pdfData) return;
            if (typeof openNoticePdf === 'function') {
                openNoticePdf(pdfData, notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf');
            } else if (typeof window.openNoticePdf === 'function') {
                window.openNoticePdf(pdfData, notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf');
            } else {
                window.open(pdfData, '_blank');
            }
        }
        window.handleNoticePdfClick = handleNoticePdfClick;

        function renderNotices() {
            var notices = getStoredNotices();
            var noticeGrid = document.querySelector('.notice-grid');
            if (!noticeGrid) return;

            noticeGrid.innerHTML = notices.map(function(n) {
                var iconClass = n.iconClass || 'fa-solid fa-bell';
                var hasPdf = !!(n.pdf || n.file || n.pdfUrl || n.attachment);
                return '<div class="notice-card" data-notice-id="' + n.id + '"' + (hasPdf ? ' data-pdf="true"' : '') + '>' +
                    '<div class="card-header">' +
                    '<i class="' + iconClass + '"></i>' +
                    '<h3>' + n.title + '</h3>' +
                    '</div>' +
                    '<div class="card-body">' +
                    '<div class="notice-date"><i class="fa-regular fa-calendar-alt"></i> ' + n.date + '</div>' +
                    '<p class="notice-desc">' + (n.description || n.desc || '') + '</p>' +
                    '<div class="card-footer-row">' +
                    '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                    '<a href="#" class="btn-read-more">আরও জানুন <i class="fa-solid fa-arrow-right"></i></a>' +
                    (hasPdf ? '<a href="javascript:void(0)" onclick="handleNoticePdfClick(\'' + n.id + '\', event);" class="btn-notice-pdf" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; font-size:12px; font-weight:700; padding:4px 10px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; cursor:pointer;" title="PDF ফাইলটি নতুন ট্যাবে খুলুন"><i class="fa-solid fa-file-pdf"></i> PDF দেখুন</a>' : '') +
                    '</div>' +
                    '<div class="card-actions">' +
                    '<a href="#" class="action-btn action-update" title="আপডেট" onclick="handleEditNotice(this); return false;"><i class="fa-solid fa-pen-to-square"></i></a>' +
                    '<a href="#" class="action-btn action-delete" title="ডিলিট" onclick="handleDeleteNotice(this); return false;"><i class="fa-solid fa-trash"></i></a>' +
                    '<a href="#" class="action-btn action-new" title="নতুন" onclick="openCreateModal(); return false;"><i class="fa-solid fa-plus"></i></a>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');

            buildLatestNewsFromCards();
            updateNoticeBoardTicker();
        }

        window.renderNotices = renderNotices;
        window.updateNoticeBoardTicker = updateNoticeBoardTicker;

        function handleEditNotice(elem) {
            var card = elem.closest ? elem.closest('.notice-card') : null;
            var summary = elem.closest ? elem.closest('.latest-news-summary') : null;
            var notices = getStoredNotices();
            var notice = null;

            if (card) {
                var noticeId = card.getAttribute('data-notice-id');
                var cardTitle = card.querySelector('.card-header h3')?.textContent.trim();
                if (noticeId) {
                    notice = notices.find(function(n) { return String(n.id) === String(noticeId); });
                }
                if (!notice && cardTitle) {
                    notice = notices.find(function(n) { return n.title.trim() === cardTitle; });
                }
                if (!notice && cardTitle) {
                    var cardDate = card.querySelector('.notice-date')?.textContent.replace(/\s+/g, ' ').trim() || '';
                    var cardDesc = card.querySelector('.notice-desc')?.textContent.trim() || '';
                    var iconClass = card.querySelector('.card-header i')?.className || 'fa-solid fa-bullhorn';
                    notice = { id: 'notice_' + Date.now(), title: cardTitle, date: cardDate, iconClass: iconClass, description: cardDesc };
                }
            } else if (summary) {
                var summaryTitle = summary.querySelector('h4')?.textContent.trim();
                if (summaryTitle) {
                    notice = notices.find(function(n) { return n.title.trim() === summaryTitle; });
                }
            }

            if (notice) {
                if (typeof openEditModalWithData === 'function') {
                    openEditModalWithData(notice);
                } else if (typeof openEditModal === 'function') {
                    openEditModal(notice.id);
                }
            }
        }

        function handleDeleteNotice(elem) {
            if (!confirm('আপনি কি এই নোটিশ ডিলিট করতে চান?')) return;

            var card = elem.closest ? elem.closest('.notice-card') : null;
            var summary = elem.closest ? elem.closest('.latest-news-summary') : null;
            var notices = getStoredNotices();
            var noticeId = card ? card.getAttribute('data-notice-id') : null;
            var titleText = card ? card.querySelector('.card-header h3')?.textContent.trim() : (summary ? summary.querySelector('h4')?.textContent.trim() : null);

            // 1. Filter out from school_notices
            try {
                var rawPub = localStorage.getItem('school_notices');
                if (rawPub) {
                    var pubList = JSON.parse(rawPub);
                    if (Array.isArray(pubList)) {
                        pubList = pubList.filter(function(n) {
                            if (noticeId && String(n.id) === String(noticeId)) return false;
                            if (titleText && (n.title || '').trim() === titleText.trim()) return false;
                            return true;
                        });
                        localStorage.setItem('school_notices', JSON.stringify(pubList));
                    }
                }
            } catch (e) {}

            // 2. Filter out from school_ticker_notices if present
            try {
                var rawTicker = localStorage.getItem('school_ticker_notices');
                if (rawTicker) {
                    var tickerList = JSON.parse(rawTicker);
                    if (Array.isArray(tickerList)) {
                        tickerList = tickerList.filter(function(t) {
                            if (typeof t === 'string') {
                                if (titleText && t.trim() === titleText.trim()) return false;
                            } else if (t && typeof t === 'object') {
                                if (noticeId && String(t.id) === String(noticeId)) return false;
                                if (titleText && (t.title || t.text || '').trim() === titleText.trim()) return false;
                            }
                            return true;
                        });
                        localStorage.setItem('school_ticker_notices', JSON.stringify(tickerList));
                    }
                }
            } catch (e) {}

            if (window.lastLocalWrites) {
                window.lastLocalWrites['school_notices'] = Date.now();
                window.lastLocalWrites['school_ticker_notices'] = Date.now();
            }

            if (typeof flushPushQueueNow === 'function') {
                flushPushQueueNow();
            }
            if (typeof triggerAllUIRefresh === 'function') {
                triggerAllUIRefresh();
            }

            if (card) card.remove();
            renderNotices();
        }

        window.handleEditNotice = handleEditNotice;
        window.handleDeleteNotice = handleDeleteNotice;

        // Auto-update event listeners for continuous live synchronization
        window.addEventListener('storage', function(e) {
            if (!e.key || e.key === 'school_ticker_notices' || e.key === 'school_notices') {
                renderNotices();
            }
        });
        window.addEventListener('tickerNoticesUpdated', function() {
            renderNotices();
        });
        window.addEventListener('dbSynced', function() {
            renderNotices();
        });
        window.addEventListener('customUIRefresh', function() {
            renderNotices();
        });
        window.addEventListener('focus', function() {
            renderNotices();
        });
        window.addEventListener('pageshow', function() {
            renderNotices();
        });

        renderNotices();

        // PDF upload change listener with 1MB size limit check
        var noticePdfInput = document.getElementById('notice-pdf-input');
        if (noticePdfInput) {
            noticePdfInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;

                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                    alert('শুধুমাত্র PDF (.pdf) ফাইল আপলোড করা যাবে!');
                    e.target.value = '';
                    return;
                }

                var maxBytes = 1024 * 1024; // 1MB
                if (file.size > maxBytes) {
                    var sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    alert('ফাইলের সাইজ (' + sizeMB + ' MB) ১ মেগাবাইট (1MB) এর বেশি হতে পারবে না! অনুগ্রহ করে ১ মেগাবাইট বা তার কম সাইজের PDF ফাইল আপলোড করুন।');
                    e.target.value = '';
                    return;
                }

                var reader = new FileReader();
                reader.onload = function(evt) {
                    var base64 = evt.target.result;
                    var base64El = document.getElementById('notice-pdf-base64');
                    var filenameEl = document.getElementById('notice-pdf-filename');
                    var previewBox = document.getElementById('notice-pdf-info-box');
                    var previewText = document.getElementById('notice-pdf-info-text');
                    var removeBtn = document.getElementById('remove-notice-pdf-btn');

                    if (base64El) base64El.value = base64;
                    if (filenameEl) filenameEl.value = file.name;
                    var sizeKB = Math.round(file.size / 1024);
                    if (previewText) previewText.textContent = 'যুক্ত হয়েছে: ' + file.name + ' (' + sizeKB + ' KB)';
                    if (previewBox) previewBox.style.display = 'block';
                    if (removeBtn) removeBtn.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            });
        }

        var createForm = document.getElementById('create-notice-form');
        if (createForm) {
            createForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var title = document.getElementById('notice-title').value.trim();
                var date = document.getElementById('notice-date').value.trim();
                var iconClass = document.getElementById('notice-icon').value;
                var desc = document.getElementById('notice-desc').value.trim();
                var editingId = document.getElementById('editing-notice-id')?.value;
                var pdfBase64 = document.getElementById('notice-pdf-base64')?.value || null;
                var pdfFileName = document.getElementById('notice-pdf-filename')?.value || null;

                if (!title || !date || !desc) return;

                var notices = getStoredNotices();

                if (editingId) {
                    var index = notices.findIndex(function(n) { return String(n.id) === String(editingId); });
                    if (index !== -1) {
                        notices[index].title = title;
                        notices[index].date = date;
                        notices[index].iconClass = iconClass;
                        notices[index].description = desc;
                        if (pdfBase64 !== undefined) {
                            notices[index].pdf = pdfBase64;
                            notices[index].fileName = pdfFileName;
                        }
                    } else {
                        var titleIdx = notices.findIndex(function(n) { return n.title.trim() === title; });
                        if (titleIdx !== -1) {
                            notices[titleIdx].title = title;
                            notices[titleIdx].date = date;
                            notices[titleIdx].iconClass = iconClass;
                            notices[titleIdx].description = desc;
                            if (pdfBase64 !== undefined) {
                                notices[titleIdx].pdf = pdfBase64;
                                notices[titleIdx].fileName = pdfFileName;
                            }
                        } else {
                            notices.unshift({ id: editingId, title: title, date: date, iconClass: iconClass, description: desc, pdf: pdfBase64, fileName: pdfFileName });
                        }
                    }
                } else {
                    var newNotice = {
                        id: 'notice_' + Date.now(),
                        title: title,
                        date: date,
                        iconClass: iconClass,
                        description: desc,
                        pdf: pdfBase64,
                        fileName: pdfFileName
                    };
                    notices.unshift(newNotice);
                }

                saveNotices(notices);
                renderNotices();
                closeCreateModal();
            });
        }

        document.addEventListener('click', function(event) {
            var target = event.target;

            // Handle Update Button Click Delegation
            var updateBtn = target.closest ? target.closest('.action-update') : null;
            if (updateBtn) {
                event.preventDefault();
                event.stopPropagation();
                handleEditNotice(updateBtn);
                return;
            }

            // Handle Delete Button Click Delegation
            var deleteBtn = target.closest ? target.closest('.action-delete') : null;
            if (deleteBtn) {
                event.preventDefault();
                event.stopPropagation();
                handleDeleteNotice(deleteBtn);
                return;
            }

            var newsItem = target.closest ? target.closest('#latest-news-list li, #latest-news-list a') : null;
            if (newsItem) {
                event.preventDefault();
                var a = newsItem.tagName === 'A' ? newsItem : newsItem.querySelector('a');
                if (a) {
                    var data = null;
                    var noticeIndex = a.getAttribute('data-notice-index');
                    var cards = document.querySelectorAll('.notice-card');
                    if (noticeIndex !== null && cards[noticeIndex]) {
                        var card = cards[noticeIndex];
                        data = {
                            title: card.querySelector('.card-header h3')?.textContent.trim() || '',
                            date: card.querySelector('.notice-date')?.textContent.replace(/\s+/g, ' ').trim() || '',
                            description: card.querySelector('.notice-desc')?.textContent.trim() || '',
                            iconHtml: card.querySelector('.card-header i')?.outerHTML || '<i class="fa-solid fa-bell"></i>'
                        };
                    } else if (a.getAttribute('data-title')) {
                        data = {
                            title: a.getAttribute('data-title'),
                            date: a.getAttribute('data-date'),
                            description: a.getAttribute('data-desc'),
                            iconHtml: a.getAttribute('data-icon')
                        };
                    }
                    if (data) {
                        openNoticeDetail(data);
                    }
                }
                return;
            }
            
            var createBtn = target.closest ? target.closest('#btn-create-notice, .btn-create, .action-new') : null;
            if (createBtn) {
                event.preventDefault();
                openCreateModal();
                return;
            }

            var closeBtn = target.closest ? target.closest('#modal-close-btn, #btn-cancel-modal') : null;
            if (closeBtn) {
                event.preventDefault();
                closeCreateModal();
                return;
            }

            var modalEl = document.getElementById('notice-modal');
            if (modalEl && target === modalEl) {
                closeCreateModal();
                return;
            }

            var detailModalEl = document.getElementById('detail-modal');
            if (detailModalEl && target === detailModalEl) {
                closeDetailModal();
                return;
            }

            var readMoreBtn = target.closest ? target.closest('.btn-read-more, .btn-summary') : null;
            if (readMoreBtn) {
                event.preventDefault();
                var data = collectNoticeData(readMoreBtn);
                openNoticeDetail(data);
                return;
            }
        });

        // Hero Slider Script
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof renderNotices === 'function') {
                renderNotices();
            }

            var slider = document.getElementById('noticeHeroSlider');
            var prevBtn = document.getElementById('noticeSliderPrev');
            var nextBtn = document.getElementById('noticeSliderNext');
            var dotsContainer = document.getElementById('noticeSliderDots');
            if (!slider) return;

            var slides = slider.querySelectorAll('.slide-item');
            var dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
            var currentIndex = 0;
            var slideCount = slides.length;
            var timer = null;

            function goToSlide(index) {
                if (index < 0) index = slideCount - 1;
                if (index >= slideCount) index = 0;
                currentIndex = index;
                slider.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                dots.forEach(function(dot, idx) {
                    if (idx === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            function nextSlide() {
                goToSlide(currentIndex + 1);
            }

            function prevSlide() {
                goToSlide(currentIndex - 1);
            }

            function startAutoPlay() {
                stopAutoPlay();
                timer = setInterval(nextSlide, 5000);
            }

            function stopAutoPlay() {
                if (timer) clearInterval(timer);
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    nextSlide();
                    startAutoPlay();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    prevSlide();
                    startAutoPlay();
                });
            }

            dots.forEach(function(dot, idx) {
                dot.addEventListener('click', function(e) {
                    e.preventDefault();
                    goToSlide(idx);
                    startAutoPlay();
                });
            });

            var sliderContainer = slider.closest('.slider-container');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', stopAutoPlay);
                sliderContainer.addEventListener('mouseleave', startAutoPlay);
            }

            startAutoPlay();
        });
    