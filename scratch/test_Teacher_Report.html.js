
// BLOCK 2

  let currentFontPercent = 100;
  let currentOrientation = 'landscape';
  let customRowsPerPage = 'auto';
  let lastLoadedStaffData = [];
  let lastSyncHash = '';
  let showSigLeft = true;
  let showSigRight = true;

  let sigPositions = {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  };

  try {
    const savedPos = localStorage.getItem('teacher_report_sig_positions');
    if (savedPos) {
      const parsed = JSON.parse(savedPos);
      if (parsed && typeof parsed === 'object') {
        sigPositions = {
          left: parsed.left || { x: 0, y: 0 },
          right: parsed.right || { x: 0, y: 0 }
        };
      }
    }
  } catch (e) {}

  let savedMemoNumber = '';
  try {
    savedMemoNumber = localStorage.getItem('teacher_report_memo_no') || '';
  } catch (e) {}

  function onMemoInput(el) {
    savedMemoNumber = el.innerText.trim();
    try {
      localStorage.setItem('teacher_report_memo_no', savedMemoNumber);
    } catch (e) {}
  }

  function onMemoFocus(el) {
    if (el.innerText.trim() === '....................................' || el.innerText.trim() === '..................') {
      el.innerText = '';
    }
  }

  function onMemoBlur(el) {
    if (!el.innerText.trim()) {
      el.innerText = '....................................';
      savedMemoNumber = '';
      try {
        localStorage.removeItem('teacher_report_memo_no');
      } catch (e) {}
    } else {
      savedMemoNumber = el.innerText.trim();
      try {
        localStorage.setItem('teacher_report_memo_no', savedMemoNumber);
      } catch (e) {}
    }
  }

  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  function toBengaliDigits(number) {
    if (number === null || number === undefined) return '';
    return String(number).replace(/[0-9]/g, d => bnNums[parseInt(d, 10)] || d);
  }

  function formatBengaliDate(dateStr) {
    if (!dateStr) return '—';
    const str = String(dateStr).trim();
    if (!str) return '—';
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return toBengaliDigits(`${parts[2]}/${parts[1]}/${parts[0]}`);
    }
    const slashParts = str.split('/');
    if (slashParts.length === 3) {
      return toBengaliDigits(str);
    }
    return toBengaliDigits(str);
  }

  function getCurrentBengaliDate() {
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const now = new Date();
    const day = toBengaliDigits(String(now.getDate()).padStart(2, '0'));
    const month = months[now.getMonth()];
    const year = toBengaliDigits(now.getFullYear());
    return `${day} ${month}, ${year} ইং`;
  }

  function formatMobileBangla(mobile) {
    if (!mobile) return '—';
    const clean = String(mobile).replace(/[^\d+]/g, '');
    return toBengaliDigits(clean);
  }

  // --- Real-time Renderer & Multi-Page A4 Sheet Generator ---
  function renderTeacherReportLive() {
    let settings = {};
    try {
      settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
    } catch (e) {
      settings = {};
    }

    let staffList = [];
    try {
      const stored = localStorage.getItem('school_staff');
      if (stored) {
        staffList = JSON.parse(stored);
      }
    } catch (e) {
      staffList = [];
    }

    // Default mock list if empty
    if (!staffList || !Array.isArray(staffList) || staffList.length === 0) {
      staffList = [
        {
          staffId: "1029384",
          name: "মোঃ রফিকুল ইসলাম",
          designation: "প্রধান শিক্ষক",
          qualification: "এম.এ, বি.এড",
          subject: "গণিত",
          nid: "১৯৮৫২৬৯১২৩৪৫৬৭৮৯০",
          gender: "পুরুষ",
          instName: settings.schoolName || "জেলা মডেল হাই স্কুল",
          instType: "সরকারি",
          mobile: "০১৭১২-১১২২৩৩",
          email: "rafiq.head@school.edu.bd",
          joining: "2015-03-12",
          mpoStatus: "MPO",
          presentAddr: "বাড়ি-১২, রোড-০৫, সেক্টর-০৪, উত্তরা, ঢাকা"
        },
        {
          staffId: "N-847291",
          name: "সুরাইয়া বেগম",
          designation: "সহকারী শিক্ষক",
          qualification: "এম.এ (ইংরেজি)",
          subject: "ইংরেজি",
          nid: "১৯৯১২৬৯৮৭৬৫৪৩২১০৯",
          gender: "নারী",
          instName: "আইডিয়াল একাডেমি",
          instType: "বেসরকারি",
          mobile: "০১৮১৫-৪৪৫৫৬৬",
          email: "suraiya.eng@gmail.com",
          joining: "2018-06-01",
          mpoStatus: "MPO",
          presentAddr: "ধানমন্ডি, ঢাকা"
        },
        {
          staffId: "EMP-502",
          name: "তানভীর আহমেদ",
          designation: "অফিস সহকারী",
          qualification: "এইচএসসি",
          subject: "—",
          nid: "১৯৮৮২৬৯৫৫৪৪৩৩২২১১",
          gender: "পুরুষ",
          instName: settings.schoolName || "জেলা মডেল হাই স্কুল",
          instType: "সরকারি",
          mobile: "০১৯১১-৭৭৮৮৯৯",
          email: "tanvir.admin@school.edu.bd",
          joining: "2020-01-10",
          mpoStatus: "MPO",
          presentAddr: "মিরপুর-১০, ঢাকা"
        },
        {
          staffId: "T-903821",
          name: "নাসরিন আক্তার",
          designation: "সহকারী শিক্ষক",
          qualification: "বিএসসি (অনার্স), এমএসসি",
          subject: "সাধারণ বিজ্ঞান",
          nid: "১৯৯৬২৬৯৬৬৭৭৮৮৯৯০০",
          gender: "নারী",
          instName: "আইডিয়াল একাডেমি",
          instType: "বেসরকারি",
          mobile: "০১৬৭৭-৯৯০০১১",
          email: "nasrin.sci@gmail.com",
          joining: "2022-09-15",
          mpoStatus: "Non MPO",
          presentAddr: "উত্তরা, ঢাকা"
        }
      ];
    }

    lastLoadedStaffData = staffList;

    // School details
    const defaultSchoolName = settings.schoolName || "জেলা মডেল হাই স্কুল ও কলেজ";
    const defaultAddress = settings.schoolAddress || "ডাকঘর: জেলা সদর, জেলা: রংপুর";
    let subTitleText = settings.schoolSubtitle || "";
    if (!subTitleText) {
      const eiinText = settings.eiin ? ` | ইআইআইএন (EIIN): ${toBengaliDigits(settings.eiin)}` : ' | ইআইআইএন (EIIN): ১২৩৪৫৬';
      const codeText = settings.schoolCode ? ` | কোড: ${toBengaliDigits(settings.schoolCode)}` : ' | কোড: ১০৮৫১';
      subTitleText = `${defaultAddress}${eiinText}${codeText}`;
    }

    // Logo HTML
    const customLogo = localStorage.getItem('school_logo');
    let logoInnerHtml = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="46" fill="#1e3a8a"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
        <path d="M50 22 L61 41 L83 44 L67 60 L71 82 L50 71 L29 82 L33 60 L17 44 L39 41 Z" fill="#f59e0b"/>
        <circle cx="50" cy="50" r="16" fill="#ffffff"/>
        <path d="M42 54 L50 38 L58 54 Z" fill="#1e3a8a"/>
      </svg>
    `;
    if (customLogo) {
      logoInnerHtml = `<img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">`;
    }

    // Headmaster Resolution
    let headmasterName = settings.headmasterName || settings.headTeacherName || settings.headTeacher || settings.principalName || settings.principal || settings.headmaster || '';
    let headmasterTitle = settings.headmasterDesignation || settings.headTeacherDesignation || settings.principalDesignation || '';
    
    const headmaster = staffList.find(s => {
      const des = ((s.designation || '') + ' ' + (s.role || '') + ' ' + (s.category || '')).toLowerCase();
      return des.includes('headmaster') || des.includes('head master') || des.includes('head teacher') || 
             des.includes('headteacher') || des.includes('principal') || des.includes('প্রধান শিক্ষক') || 
             des.includes('ভারপ্রাপ্ত প্রধান শিক্ষক') || des.includes('অধ্যক্ষ') || des.includes('সুপারিনটেনডেন্ট') ||
             des.includes('superintendent') || des.includes('অধ্যক্ষা');
    });

    if (headmaster) {
      if (!headmasterName && headmaster.name) headmasterName = headmaster.name;
      if (!headmasterTitle && (headmaster.designation || headmaster.role)) headmasterTitle = headmaster.designation || headmaster.role;
    }
    if (!headmasterName) headmasterName = "মোঃ রফিকুল ইসলাম";
    if (!headmasterTitle) headmasterTitle = "প্রধান শিক্ষক";

    // Operator Resolution
    let operatorName = settings.operatorName || '';
    let operatorTitle = settings.operatorDesignation || 'কম্পিউটার অপারেটর';

    const operator = staffList.find(s => {
      const des = ((s.designation || '') + ' ' + (s.role || '') + ' ' + (s.category || '')).toLowerCase();
      return des.includes('operator') || des.includes('computer') || des.includes('কম্পিউটার') || 
             des.includes('অফিস সহকারী') || des.includes('সহকারী');
    });

    if (operator) {
      if (!operatorName && operator.name) operatorName = operator.name;
      if (!settings.operatorDesignation && (operator.designation || operator.role)) operatorTitle = operator.designation || operator.role;
    }
    if (!operatorName) operatorName = "তানভীর আহমেদ";

    // Column states
    const colState = {
      'col-sl': document.getElementById('chk-col-sl')?.checked ?? true,
      'col-photo': document.getElementById('chk-col-photo')?.checked ?? true,
      'col-name': document.getElementById('chk-col-name')?.checked ?? true,
      'col-rank': document.getElementById('chk-col-rank')?.checked ?? true,
      'col-qualification': document.getElementById('chk-col-qualification')?.checked ?? true,
      'col-subject': document.getElementById('chk-col-subject')?.checked ?? true,
      'col-nid': document.getElementById('chk-col-nid')?.checked ?? true,
      'col-gender': document.getElementById('chk-col-gender')?.checked ?? true,
      'col-id': document.getElementById('chk-col-id')?.checked ?? true,
      'col-inst-name': document.getElementById('chk-col-inst-name')?.checked ?? false,
      'col-inst-type': document.getElementById('chk-col-inst-type')?.checked ?? false,
      'col-mobile': document.getElementById('chk-col-mobile')?.checked ?? true,
      'col-email': document.getElementById('chk-col-email')?.checked ?? true,
      'col-date': document.getElementById('chk-col-date')?.checked ?? true,
      'col-mpo': document.getElementById('chk-col-mpo')?.checked ?? true,
      'col-address': document.getElementById('chk-col-address')?.checked ?? true
    };

    // Calculate Rows Per Page (Pagination)
    let rowsPerPage = 10;
    if (customRowsPerPage === 'all') {
      rowsPerPage = staffList.length || 1;
    } else if (customRowsPerPage === 'auto') {
      rowsPerPage = (currentOrientation === 'portrait') ? 16 : 10;
    } else {
      rowsPerPage = parseInt(customRowsPerPage, 10) || 10;
    }

    const totalPages = Math.max(1, Math.ceil(staffList.length / rowsPerPage));
    const pageBadge = document.getElementById('total-pages-badge');
    if (pageBadge) {
      pageBadge.innerText = `📄 মোট ${toBengaliDigits(totalPages)} পেজ`;
    }

    const container = document.getElementById('pages-render-container');
    if (!container) return;

    let containerHtml = '';

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const pageNum = pageIdx + 1;
      const startIndex = pageIdx * rowsPerPage;
      const pageStaff = staffList.slice(startIndex, startIndex + rowsPerPage);
      const isPortrait = (currentOrientation === 'portrait');

      let tableRowsHtml = '';
      pageStaff.forEach((staff, i) => {
        const globalIndex = startIndex + i;
        const slBn = toBengaliDigits(String(globalIndex + 1).padStart(2, '0'));
        const nameStr = staff.name || '—';
        const rankStr = staff.designation || staff.role || (staff.category === 'Teacher' ? 'সহকারী শিক্ষক' : 'কর্মচারী');
        const qualStr = staff.qualification || staff.education || staff.edu || staff.lastQualification || '—';
        const subStr = staff.subject || '—';
        const nidStr = staff.nid ? toBengaliDigits(staff.nid) : '—';
        
        let genderStr = 'পুরুষ';
        const genLower = (staff.gender || '').toLowerCase();
        if (genLower.includes('female') || genLower.includes('নারী') || genLower.includes('মহিলা')) {
          genderStr = 'নারী';
        } else if (genLower.includes('male') || genLower.includes('পুরুষ')) {
          genderStr = 'পুরুষ';
        } else if (staff.gender) {
          genderStr = staff.gender;
        }

        const idStr = staff.staffId || staff.id || staff.index || '—';
        const instNameStr = staff.instName || staff.institution || defaultSchoolName;
        
        const isGovt = (staff.instType === 'সরকারি' || settings.schoolType === 'সরকারি');
        const instTypeBadge = isGovt ? '<span class="badge badge-govt">সরকারি</span>' : '<span class="badge badge-non-govt">বেসরকারি</span>';

        const mobStr = formatMobileBangla(staff.mobile);
        const emailStr = staff.email || '—';
        const joinStr = formatBengaliDate(staff.joining);

        const mpoRaw = (staff.mpoStatus || staff.mpo || '').toLowerCase();
        const isNonMpo = mpoRaw.includes('non') || mpoRaw.includes('নন');
        const mpoBadge = isNonMpo ? '<span class="badge badge-non-mpo">Non MPO</span>' : '<span class="badge badge-mpo">MPO</span>';

        const addrStr = staff.presentAddr || staff.presentAddress || staff.address || staff.currentAddress || '—';

        const photoHtml = staff.photo ? `<div class="photo-frame"><img src="${staff.photo}" alt="ছবি"></div>` : `<div class="photo-frame">ছবি</div>`;

        tableRowsHtml += `
          <tr data-global-idx="${globalIndex}">
            <td class="align-center col-sl ${colState['col-sl'] ? '' : 'col-hidden'}">
              <div class="sl-wrapper">
                <span class="sl-number">${slBn}</span>
                <div class="row-order-btns no-print">
                  <button class="btn-row-move" onclick="moveStaffItem(${globalIndex}, -1)" title="উপরে তুলুন">▲</button>
                  <button class="btn-row-move" onclick="moveStaffItem(${globalIndex}, 1)" title="নিচে নামান">▼</button>
                </div>
              </div>
            </td>
            <td class="col-photo ${colState['col-photo'] ? '' : 'col-hidden'}">${photoHtml}</td>
            <td class="align-left col-name ${colState['col-name'] ? '' : 'col-hidden'}"><strong>${nameStr}</strong></td>
            <td class="align-left col-rank ${colState['col-rank'] ? '' : 'col-hidden'}">${rankStr}</td>
            <td class="align-left col-qualification ${colState['col-qualification'] ? '' : 'col-hidden'}">${qualStr}</td>
            <td class="align-left col-subject ${colState['col-subject'] ? '' : 'col-hidden'}">${subStr}</td>
            <td class="align-center col-nid ${colState['col-nid'] ? '' : 'col-hidden'}">${nidStr}</td>
            <td class="align-center col-gender ${colState['col-gender'] ? '' : 'col-hidden'}">${genderStr}</td>
            <td class="align-center col-id ${colState['col-id'] ? '' : 'col-hidden'}">${idStr}</td>
            <td class="align-left col-inst-name ${colState['col-inst-name'] ? '' : 'col-hidden'}">${instNameStr}</td>
            <td class="align-center col-inst-type ${colState['col-inst-type'] ? '' : 'col-hidden'}">${instTypeBadge}</td>
            <td class="align-center col-mobile ${colState['col-mobile'] ? '' : 'col-hidden'}">${mobStr}</td>
            <td class="align-left col-email ${colState['col-email'] ? '' : 'col-hidden'}">${emailStr}</td>
            <td class="align-center col-date ${colState['col-date'] ? '' : 'col-hidden'}">${joinStr}</td>
            <td class="align-center col-mpo ${colState['col-mpo'] ? '' : 'col-hidden'}">${mpoBadge}</td>
            <td class="align-left col-address ${colState['col-address'] ? '' : 'col-hidden'}">${addrStr}</td>
          </tr>
        `;
      });

      const pageSheetHtml = `
        <div class="a4-page-sheet ${isPortrait ? 'portrait-mode' : ''}" data-page="${pageNum}">

          <!-- Header Card & Meta Info Bar (Only on Page 1) -->
          ${(pageNum === 1) ? `
          <div class="header-card">
            <table class="header-table">
              <tr>
                <td class="logo-cell">
                  <div class="logo-badge">${logoInnerHtml}</div>
                </td>
                <td class="title-cell">
                  <div class="institution-title">${defaultSchoolName}</div>
                  <div class="institution-sub">${subTitleText}</div>
                  <div class="form-badge-wrapper">
                    <span class="form-title-badge">শিক্ষক ও কর্মচারীর তথ্যছক</span>
                  </div>
                </td>
                <td class="header-right-cell"></td>
              </tr>
            </table>
          </div>

          <!-- Meta Info Bar (Only on Page 1) -->
          <div class="meta-bar">
            <table class="meta-table">
              <tr>
                <td style="width: 38%; text-align: left;">
                  <strong>স্মারক নং:</strong> 
                  <span contenteditable="true" class="editable-memo" oninput="onMemoInput(this)" onfocus="onMemoFocus(this)" onblur="onMemoBlur(this)" title="এখানে ক্লিক করে আপনার স্মারক নং টাইপ করুন">${savedMemoNumber || '....................................'}</span>
                </td>
                <td style="width: 32%; text-align: center;"><strong>মোট :</strong> ${toBengaliDigits(String(staffList.length).padStart(2, '0'))} জন</td>
                <td style="width: 30%; text-align: right;"><strong>তারিখ:</strong> ${getCurrentBengaliDate()}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- Data Table -->
          <div class="table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-sl ${colState['col-sl'] ? '' : 'col-hidden'}" style="width: 3.5%;">ক্র. নং</th>
                  <th class="col-photo ${colState['col-photo'] ? '' : 'col-hidden'}" style="width: 4.5%;">ছবি</th>
                  <th class="col-name ${colState['col-name'] ? '' : 'col-hidden'}" style="width: 14%;">শিক্ষক/কর্মচারীর নাম</th>
                  <th class="col-rank ${colState['col-rank'] ? '' : 'col-hidden'}" style="width: 8.5%;">পদবী</th>
                  <th class="col-qualification ${colState['col-qualification'] ? '' : 'col-hidden'}" style="width: 9.5%;">সর্বশেষ শিক্ষাগত যোগ্যতা</th>
                  <th class="col-subject ${colState['col-subject'] ? '' : 'col-hidden'}" style="width: 7%;">বিষয়</th>
                  <th class="col-nid ${colState['col-nid'] ? '' : 'col-hidden'}" style="width: 9.5%;">NID</th>
                  <th class="col-gender ${colState['col-gender'] ? '' : 'col-hidden'}" style="width: 4.5%;">লিঙ্গ</th>
                  <th class="col-id ${colState['col-id'] ? '' : 'col-hidden'}" style="width: 6.5%;">Staff ID / ইনডেক্স</th>
                  <th class="col-inst-name ${colState['col-inst-name'] ? '' : 'col-hidden'}" style="width: 9%;">প্রতিষ্ঠানের নাম</th>
                  <th class="col-inst-type ${colState['col-inst-type'] ? '' : 'col-hidden'}" style="width: 6%;">প্রতিষ্ঠানের ধরন</th>
                  <th class="col-mobile ${colState['col-mobile'] ? '' : 'col-hidden'}" style="width: 9%;">মোবাইল নম্বর</th>
                  <th class="col-email ${colState['col-email'] ? '' : 'col-hidden'}" style="width: 11%;">ইমেইল ঠিকানা</th>
                  <th class="col-date ${colState['col-date'] ? '' : 'col-hidden'}" style="width: 6.5%;">যোগদানের তারিখ</th>
                  <th class="col-mpo ${colState['col-mpo'] ? '' : 'col-hidden'}" style="width: 5.5%;">MPO স্ট্যাটাস</th>
                  <th class="col-address ${colState['col-address'] ? '' : 'col-hidden'}" style="width: 11%;">বর্তমান ঠিকানা</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Footer Signature Area (Only on the last page when multi-page) -->
          <div class="footer-container">
            ${(pageNum === totalPages) ? `
            <table class="sig-table">
              <tr>
                <td style="width: 33%;">
                  <div class="sig-block sig-block-left draggable-sig-box" data-sig-type="left" style="transform: translate(${sigPositions.left.x}px, ${sigPositions.left.y}px); ${showSigLeft ? 'visibility: visible;' : 'visibility: hidden; opacity: 0;'}">
                    <div class="sig-drag-handle no-print" title="মাউস দিয়ে চেপে ধরে যেকোনো জায়গায় সরান">✥ ড্র্যাগ করে সরান</div>
                    <div class="sig-line-dash"></div>
                    <div class="sig-name" contenteditable="true" title="এখানে ক্লিক করে প্রস্তুতকারীর নাম পরিবর্তন করতে পারেন">${operatorName}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে পদবী পরিবর্তন করতে পারেন">${operatorTitle}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে স্কুলের নাম পরিবর্তন করতে পারেন">${defaultSchoolName}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে স্কুলের ঠিকানা পরিবর্তন করতে পারেন">${defaultAddress}</div>
                  </div>
                </td>
                <td style="width: 34%;">
                  <div class="seal-box">
                    <span style="display: none;">প্রতিষ্ঠানের</span>
                    <span style="display: none;">গোল সিল</span>
                  </div>
                </td>
                <td style="width: 33%;">
                  <div class="sig-block sig-block-right draggable-sig-box" data-sig-type="right" style="transform: translate(${sigPositions.right.x}px, ${sigPositions.right.y}px); ${showSigRight ? 'visibility: visible;' : 'visibility: hidden; opacity: 0;'}">
                    <div class="sig-drag-handle no-print" title="মাউস দিয়ে চেপে ধরে যেকোনো জায়গায় সরান">✥ ড্র্যাগ করে সরান</div>
                    <div class="sig-line-dash"></div>
                    <div class="sig-name" contenteditable="true" title="এখানে ক্লিক করে প্রধান শিক্ষকের নাম পরিবর্তন করতে পারেন">${headmasterName}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে পদবী পরিবর্তন করতে পারেন">${headmasterTitle}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে স্কুলের নাম পরিবর্তন করতে পারেন">${defaultSchoolName}</div>
                    <div class="sig-desc" contenteditable="true" title="এখানে ক্লিক করে স্কুলের ঠিকানা পরিবর্তন করতে পারেন">${defaultAddress}</div>
                  </div>
                </td>
              </tr>
            </table>
            ` : ''}
            <div class="page-bottom-index">পৃষ্ঠা নং: ${toBengaliDigits(pageNum)} / ${toBengaliDigits(totalPages)}</div>
          </div>

        </div>
      `;

      containerHtml += pageSheetHtml;
    }

    container.innerHTML = containerHtml;
    initSigDragging();
  }

  let activeDrag = null;

  function initSigDragging() {
    document.querySelectorAll('.draggable-sig-box').forEach(box => {
      box.removeEventListener('mousedown', onSigMouseDown);
      box.removeEventListener('touchstart', onSigTouchStart);
      box.addEventListener('mousedown', onSigMouseDown);
      box.addEventListener('touchstart', onSigTouchStart, { passive: false });
    });
  }

  function onSigMouseDown(e) {
    if (e.button !== 0) return;
    if (e.target.isContentEditable || e.target.getAttribute('contenteditable') === 'true' || e.target.closest('[contenteditable="true"]')) {
      return;
    }
    startSigDrag(e.currentTarget, e.clientX, e.clientY, e);
  }

  function onSigTouchStart(e) {
    if (e.target.isContentEditable || e.target.getAttribute('contenteditable') === 'true' || e.target.closest('[contenteditable="true"]')) {
      return;
    }
    if (e.touches && e.touches.length === 1) {
      startSigDrag(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY, e);
    }
  }

  function startSigDrag(el, clientX, clientY, e) {
    const sigType = el.getAttribute('data-sig-type');
    if (!sigType) return;
    if (e && e.preventDefault) e.preventDefault();

    const currentX = sigPositions[sigType] ? sigPositions[sigType].x : 0;
    const currentY = sigPositions[sigType] ? sigPositions[sigType].y : 0;

    activeDrag = {
      sigType,
      el,
      startX: clientX,
      startY: clientY,
      initX: currentX,
      initY: currentY,
      curX: currentX,
      curY: currentY
    };

    document.querySelectorAll(sigType === 'left' ? '.sig-block-left' : '.sig-block-right').forEach(targetEl => {
      targetEl.classList.add('is-dragging');
    });
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', onSigMouseMove);
    window.addEventListener('mouseup', onSigMouseUp);
    window.addEventListener('touchmove', onSigTouchMove, { passive: false });
    window.addEventListener('touchend', onSigTouchEnd);
    window.addEventListener('touchcancel', onSigTouchEnd);
  }

  function onSigMouseMove(e) {
    if (!activeDrag) return;
    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;
    activeDrag.curX = activeDrag.initX + dx;
    activeDrag.curY = activeDrag.initY + dy;

    const targets = document.querySelectorAll(activeDrag.sigType === 'left' ? '.sig-block-left' : '.sig-block-right');
    targets.forEach(t => {
      t.style.transform = `translate(${activeDrag.curX}px, ${activeDrag.curY}px)`;
    });
  }

  function onSigTouchMove(e) {
    if (!activeDrag || !e.touches || e.touches.length === 0) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - activeDrag.startX;
    const dy = touch.clientY - activeDrag.startY;
    activeDrag.curX = activeDrag.initX + dx;
    activeDrag.curY = activeDrag.initY + dy;

    const targets = document.querySelectorAll(activeDrag.sigType === 'left' ? '.sig-block-left' : '.sig-block-right');
    targets.forEach(t => {
      t.style.transform = `translate(${activeDrag.curX}px, ${activeDrag.curY}px)`;
    });
  }

  function onSigMouseUp() {
    endSigDrag();
  }

  function onSigTouchEnd() {
    endSigDrag();
  }

  function endSigDrag() {
    if (!activeDrag) return;
    const sigType = activeDrag.sigType;
    sigPositions[sigType] = {
      x: Math.round(activeDrag.curX),
      y: Math.round(activeDrag.curY)
    };

    try {
      localStorage.setItem('teacher_report_sig_positions', JSON.stringify(sigPositions));
    } catch (e) {}

    document.querySelectorAll(sigType === 'left' ? '.sig-block-left' : '.sig-block-right').forEach(targetEl => {
      targetEl.classList.remove('is-dragging');
      targetEl.style.transform = `translate(${sigPositions[sigType].x}px, ${sigPositions[sigType].y}px)`;
    });

    document.body.style.userSelect = '';
    activeDrag = null;

    window.removeEventListener('mousemove', onSigMouseMove);
    window.removeEventListener('mouseup', onSigMouseUp);
    window.removeEventListener('touchmove', onSigTouchMove);
    window.removeEventListener('touchend', onSigTouchEnd);
    window.removeEventListener('touchcancel', onSigTouchEnd);
  }

  function resetSigPositions() {
    sigPositions = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
    try {
      localStorage.removeItem('teacher_report_sig_positions');
    } catch (e) {}
    document.querySelectorAll('.sig-block-left').forEach(el => {
      el.style.transform = 'translate(0px, 0px)';
    });
    document.querySelectorAll('.sig-block-right').forEach(el => {
      el.style.transform = 'translate(0px, 0px)';
    });
  }

  function moveStaffItem(globalIndex, direction) {
    let list = [...lastLoadedStaffData];
    const targetIdx = globalIndex + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap items
    const temp = list[globalIndex];
    list[globalIndex] = list[targetIdx];
    list[targetIdx] = temp;

    lastLoadedStaffData = list;
    try {
      localStorage.setItem('school_staff', JSON.stringify(list));
    } catch(e) {}
    renderTeacherReportLive();
  }

  function changeRowsPerPage(val) {
    customRowsPerPage = val;
    renderTeacherReportLive();
  }

  function changeFontSize(delta) {
    currentFontPercent = Math.max(70, Math.min(160, currentFontPercent + delta));
    document.getElementById('font-scale-label').innerText = currentFontPercent + '%';
    document.documentElement.style.setProperty('--font-scale', currentFontPercent / 100);
  }

  function resetFontSize() {
    currentFontPercent = 100;
    document.getElementById('font-scale-label').innerText = '100%';
    document.documentElement.style.setProperty('--font-scale', 1);
  }

  function setOrientation(mode) {
    currentOrientation = mode;
    const pageStyle = document.getElementById('dynamic-page-style');
    const toolbarWrapper = document.querySelector('.toolbar-wrapper');
    const btnLand = document.getElementById('btn-landscape');
    const btnPort = document.getElementById('btn-portrait');

    if (mode === 'portrait') {
      pageStyle.innerHTML = `@page { size: A4 portrait; margin: 0.3in; }`;
      if (toolbarWrapper) toolbarWrapper.style.maxWidth = '210mm';
      btnLand.classList.remove('btn-active');
      btnPort.classList.add('btn-active');
    } else {
      pageStyle.innerHTML = `@page { size: A4 landscape; margin: 0.3in; }`;
      if (toolbarWrapper) toolbarWrapper.style.maxWidth = '297mm';
      btnPort.classList.remove('btn-active');
      btnLand.classList.add('btn-active');
    }

    renderTeacherReportLive();
  }

  function toggleCol(colClass, isChecked) {
    const els = document.querySelectorAll('.' + colClass);
    els.forEach(el => {
      if (isChecked) {
        el.classList.remove('col-hidden');
      } else {
        el.classList.add('col-hidden');
      }
    });
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    document.getElementById('colMenu').classList.toggle('show');
  }

  window.addEventListener('click', function(e) {
    const menu = document.getElementById('colMenu');
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
  });

  function toggleSigSection(side, forceState) {
    const isLeft = (side === 'left');
    let isVisible;
    if (typeof forceState === 'boolean') {
      isVisible = forceState;
    } else {
      isVisible = isLeft ? !showSigLeft : !showSigRight;
    }

    if (isLeft) {
      showSigLeft = isVisible;
      const btn = document.getElementById('btn-sig-left');
      const chk = document.getElementById('check-sig-left');
      if (btn) {
        btn.className = isVisible ? 'btn btn-active' : 'btn';
        btn.innerHTML = isVisible ? '✍️ প্রস্তুতকারী স্বাক্ষর' : '✍️ প্রস্তুতকারী স্বাক্ষর (অফ)';
      }
      if (chk) chk.checked = isVisible;
    } else {
      showSigRight = isVisible;
      const btn = document.getElementById('btn-sig-right');
      const chk = document.getElementById('check-sig-right');
      if (btn) {
        btn.className = isVisible ? 'btn btn-active' : 'btn';
        btn.innerHTML = isVisible ? '✍️ প্রধান শিক্ষক স্বাক্ষর' : '✍️ প্রধান শিক্ষক স্বাক্ষর (অফ)';
      }
      if (chk) chk.checked = isVisible;
    }

    document.querySelectorAll(isLeft ? '.sig-block-left' : '.sig-block-right').forEach(el => {
      el.style.visibility = isVisible ? 'visible' : 'hidden';
      el.style.opacity = isVisible ? '1' : '0';
    });
  }

  function exportToWord(format = 'docx') {
    const isPortrait = (currentOrientation === 'portrait');
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const pageWidth = isPortrait ? '210mm' : '297mm';
    const pageHeight = isPortrait ? '297mm' : '210mm';
    
    // Clone entire multi-page container
    const containerClone = document.getElementById('pages-render-container').cloneNode(true);
    
    // Remove UI-only helper buttons like row-order-btns
    containerClone.querySelectorAll('.row-order-btns').forEach(el => el.remove());
    
    // Remove hidden columns from export
    containerClone.querySelectorAll('.col-hidden').forEach(el => el.remove());

    const sheets = containerClone.querySelectorAll('.a4-page-sheet');
    let multiPageContent = '';
    sheets.forEach((sheet, idx) => {
      const pageBreakStyle = (idx < sheets.length - 1) ? 'page-break-after: always; mso-break-type: section-break;' : 'page-break-after: avoid;';
      multiPageContent += `<div class="a4-sheet-word" style="${pageBreakStyle} margin-bottom: 30px;">${sheet.innerHTML}</div>`;
    });

    if (format === 'doc') {
      const wordHTML = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>শিক্ষক ও কর্মচারীর তথ্যছক</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Rashi+Hebrew:wght@100..900&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 {
              size: ${pageWidth} ${pageHeight};
              mso-page-orientation: ${orientation};
              margin: 0.3in 0.3in 0.3in 0.3in;
              mso-header-margin: 0.3in;
              mso-footer-margin: 0.3in;
            }
            div.Section1 { page: Section1; font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'SolaimanLipi', 'Kalpurush', serif; color: #000; }
            body { font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'SolaimanLipi', 'Kalpurush', serif; font-size: 10pt; color: #000; background: #fff; }
            table { border-collapse: collapse; width: 100%; }
            .header-card { background-color: #ffffff; margin-bottom: 8px; }
            .institution-title { font-size: 22pt; font-weight: bold; text-align: center; color: #000; }
            .institution-sub { font-size: 10.5pt; text-align: center; color: #000; margin-bottom: 4px; }
            .form-title-badge { display: inline-block; background-color: #fff; color: #000; border: 1px solid #000; font-size: 12.5pt; font-weight: bold; padding: 2px 18px; border-radius: 20px; }
            .meta-bar { border: 1px solid #000; padding: 5px 12px; margin-bottom: 10px; font-size: 10pt; }
            .data-table { width: 100%; border: 1px solid #000; font-size: 9.6pt; }
            .data-table th { background-color: #fff; color: #000; font-weight: bold; text-align: center; border: 1px solid #000; padding: 6px 4px; }
            .data-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; color: #000; }
            .photo-frame { width: 34px; height: 40px; border: 1px dashed #000; text-align: center; line-height: 40px; font-size: 8.5pt; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 8.5pt; font-weight: bold; }
            .footer-container { margin-top: 30px; }
            .sig-line-dash { border-top: 1.5px dashed #000; width: 180px; margin: 0 auto 5px auto; }
            .sig-name { font-size: 11pt; font-weight: bold; }
            .sig-desc { font-size: 9.5pt; }
            .align-center { text-align: center; }
            .align-left { text-align: left; }
          </style>
        </head>
        <body>
          <div class="Section1">${multiPageContent}</div>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', wordHTML], { type: 'application/msword;charset=utf-8' });
      triggerDownload(blob, 'Teacher_Report.doc');
      return;
    }

    const blob = buildDocxBlob(multiPageContent, isPortrait);
    triggerDownload(blob, 'Teacher_Report.docx');
  }

  function triggerDownload(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function buildDocxBlob(htmlContent, isPortrait) {
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const width = isPortrait ? '11906' : '16838';
    const height = isPortrait ? '16838' : '11906';

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="htm" ContentType="text/html"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.htm"/>
</Relationships>`;

    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="rId1"/>
    <w:sectPr>
      <w:pgSz w:w="${width}" w:h="${height}" w:orient="${orientation}"/>
      <w:pgMar w:top="432" w:right="432" w:bottom="432" w:left="432"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const fullHtm = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'SolaimanLipi', 'Kalpurush', serif; font-size: 10pt; color: #000000; background: #ffffff; }
  table { border-collapse: collapse; width: 100%; }
  .header-card { background-color: #ffffff; margin-bottom: 8px; }
  .institution-title { font-size: 22pt; font-weight: bold; text-align: center; color: #000000; }
  .institution-sub { font-size: 10.5pt; text-align: center; color: #000000; margin-bottom: 4px; }
  .form-title-badge { display: inline-block; background-color: #ffffff; color: #000000; border: 1px solid #000000; font-size: 12.5pt; font-weight: bold; padding: 2px 18px; border-radius: 20px; }
  .meta-bar { border: 1px solid #000000; padding: 5px 12px; margin-bottom: 10px; font-size: 10pt; }
  .data-table { width: 100%; border: 1px solid #000000; font-size: 9.6pt; }
  .data-table th { background-color: #ffffff; color: #000000; font-weight: bold; text-align: center; border: 1px solid #000000; padding: 6px 4px; }
  .data-table td { border: 1px solid #000000; padding: 5px 4px; vertical-align: middle; color: #000000; }
  .photo-frame { width: 34px; height: 40px; border: 1px dashed #000000; text-align: center; line-height: 40px; font-size: 8.5pt; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 8.5pt; font-weight: bold; }
  .footer-container { margin-top: 30px; }
  .sig-line-dash { border-top: 1.5px dashed #000000; width: 180px; margin: 0 auto 5px auto; }
  .sig-name { font-size: 11pt; font-weight: bold; }
  .sig-desc { font-size: 9.5pt; }
  .align-center { text-align: center; }
  .align-left { text-align: left; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const files = [
      { name: '[Content_Types].xml', data: contentTypesXml },
      { name: '_rels/.rels', data: relsXml },
      { name: 'word/_rels/document.xml.rels', data: docRelsXml },
      { name: 'word/document.xml', data: docXml },
      { name: 'word/afchunk.htm', data: '\ufeff' + fullHtm }
    ];

    return makeZip(files);
  }

  function makeZip(files) {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }

    function crc32(buf) {
      let crc = 0 ^ (-1);
      for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
      }
      return (crc ^ (-1)) >>> 0;
    }

    const enc = new TextEncoder();
    const entries = [];
    let offset = 0;

    for (const f of files) {
      const nameBytes = enc.encode(f.name);
      const dataBytes = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const header = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, size, true);
      view.setUint32(22, size, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
      header.set(nameBytes, 30);

      entries.push({ nameBytes, dataBytes, crc, size, offset, header });
      offset += header.length + dataBytes.length;
    }

    const cdEntries = [];
    let cdSize = 0;

    for (const f of entries) {
      const cd = new Uint8Array(46 + f.nameBytes.length);
      const view = new DataView(cd.buffer);
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint16(14, 0, true);
      view.setUint32(16, f.crc, true);
      view.setUint32(20, f.size, true);
      view.setUint32(24, f.size, true);
      view.setUint16(28, f.nameBytes.length, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, f.offset, true);
      cd.set(f.nameBytes, 46);

      cdEntries.push(cd);
      cdSize += cd.length;
    }

    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, entries.length, true);
    eocdView.setUint16(10, entries.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, offset, true);
    eocdView.setUint16(20, 0, true);

    const parts = [];
    for (const f of entries) {
      parts.push(f.header);
      parts.push(f.dataBytes);
    }
    for (const cd of cdEntries) {
      parts.push(cd);
    }
    parts.push(eocd);

    return new Blob(parts, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  // --- Real-Time Event Handlers & Auto Sync Watcher ---
  window.addEventListener('DOMContentLoaded', () => {
    renderTeacherReportLive();
  });

  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === 'school_staff' || e.key === 'school_settings' || e.key === 'school_logo') {
      renderTeacherReportLive();
    }
  });

  window.addEventListener('dbSynced', () => {
    renderTeacherReportLive();
  });

  window.addEventListener('message', () => {
    renderTeacherReportLive();
  });

  // Polling watchdog to auto-detect any changes in background or across tabs
  setInterval(() => {
    const currentHash = (localStorage.getItem('school_staff') || '') + 
                        '|' + (localStorage.getItem('school_settings') || '') + 
                        '|' + (localStorage.getItem('school_logo') || '');
    if (currentHash !== lastSyncHash) {
      lastSyncHash = currentHash;
      renderTeacherReportLive();
    }
  }, 1000);

  // Global handle for parent/iframe calls
  window.renderTeacherReportLive = renderTeacherReportLive;

  // --- Navigation Handlers ---
  function handleGoBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'staff.html';
    }
  }

  function handleClosePage() {
    try {
      window.close();
    } catch (e) {}
    // Fallback if window.close is restricted by browser tab policies
    setTimeout(() => {
      window.location.href = 'staff.html';
    }, 150);
  }
