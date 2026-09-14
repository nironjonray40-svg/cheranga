# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# ==========================================
# 1. Update Room Seat Topshet.html
# ==========================================
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_content = f.read()

# Helpers to add to Room Seat Topshet.html
staff_sig_helpers = '''
        function getRoomTopshetStaffList() {
            try {
                return JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                return [];
            }
        }

        function getRoomTopshetHeadmasterSignature(deptOrClass) {
            if (typeof getHeadmasterByDepartment === 'function') {
                const hm = getHeadmasterByDepartment(deptOrClass);
                if (hm) {
                    const sig = hm.signature || hm.signatureUrl || hm.signatureData || hm.sign || hm.signatureImage;
                    if (sig) return sig;
                }
            }

            const staffList = getRoomTopshetStaffList();
            const checkIsHm = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
                    return false;
                }
                return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('headteacher') || des.includes('head teacher') || des.includes('principal') || des.includes('অধ্যক্ষ') || des.includes('সুপারিনটেনডেন্ট') || des.includes('superintendent');
            };

            const hm = staffList.find(checkIsHm);
            if (hm) {
                const sig = hm.signature || hm.signatureUrl || hm.signatureData || hm.sign || hm.signatureImage;
                if (sig) return sig;
            }

            const settings = safeJsonParse('school_settings', {});
            return settings?.headmasterSignature || '';
        }

        function getRoomTopshetPreparerSignature() {
            const staffList = getRoomTopshetStaffList();

            const checkIsPreparer = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                return des.includes('কম্পিউটার অপারেটর') || des.includes('অপারেটর') || des.includes('প্রস্তুতকারী') || des.includes('অফিস সহকারী') || des.includes('ডাটা এন্ট্রি') || des.includes('হিসাব রক্ষক') || des.includes('সহকারী শিক্ষক') || des.includes('সহ: শিক্ষক') || des.includes('operator') || des.includes('clerk') || des.includes('accountant') || des.includes('assistant teacher');
            };

            // 1. Check logged-in user if they match a staff member
            const currentUserId = localStorage.getItem('school_user_id') || localStorage.getItem('school_user_name') || '';
            if (currentUserId) {
                const loggedStaff = staffList.find(s => s && (s.id === currentUserId || s.name === currentUserId || s.nameBn === currentUserId || s.mobile === currentUserId || s.phone === currentUserId));
                if (loggedStaff) {
                    const sig = loggedStaff.signature || loggedStaff.signatureUrl || loggedStaff.signatureData || loggedStaff.sign || loggedStaff.signatureImage;
                    if (sig) return sig;
                }
            }

            // 2. Find staff with preparer/operator designation having signature
            const prepWithSig = staffList.find(s => checkIsPreparer(s) && (s.signature || s.signatureUrl || s.signatureData || s.sign || s.signatureImage));
            if (prepWithSig) {
                return prepWithSig.signature || prepWithSig.signatureUrl || prepWithSig.signatureData || prepWithSig.sign || prepWithSig.signatureImage;
            }

            // 3. Fallback: Any non-headmaster staff member with signature
            const checkIsHm = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('principal') || des.includes('অধ্যক্ষ');
            };

            const anyOtherWithSig = staffList.find(s => !checkIsHm(s) && (s.signature || s.signatureUrl || s.signatureData || s.sign || s.signatureImage));
            if (anyOtherWithSig) {
                return anyOtherWithSig.signature || anyOtherWithSig.signatureUrl || anyOtherWithSig.signatureData || anyOtherWithSig.sign || anyOtherWithSig.signatureImage;
            }

            const settings = safeJsonParse('school_settings', {});
            return settings?.preparerSignature || settings?.operatorSignature || '';
        }
'''

# Insert helper functions before updateRoomTopshetLive
if 'function getRoomTopshetHeadmasterSignature' not in room_content:
    room_content = room_content.replace('function updateRoomTopshetLive() {', staff_sig_helpers + '\n        function updateRoomTopshetLive() {', 1)

# In updateRoomTopshetLive, compute signatures and use in footer HTML
target_room_loop_start = """            filteredAllocList.forEach(({ rId, item }) => {
                const roomNo = item.room ? (item.room.number || item.room.name || rId) : rId;"""

replacement_room_loop_start = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            filteredAllocList.forEach(({ rId, item }) => {
                const roomNo = item.room ? (item.room.number || item.room.name || rId) : rId;"""

if target_room_loop_start in room_content:
    room_content = room_content.replace(target_room_loop_start, replacement_room_loop_start, 1)

# Update footer HTML in Room Seat Topshet.html
old_room_footer = """                            <!-- Footer Signatures Section -->

                            <div class="footer-signatures">

                                <div class="sig-col" style="display: none !important;">

                                    <div class="sig-line"></div>

                                    কক্ষ পরিদর্শক

                                </div>

                                <div class="sig-col">

                                    <div class="sig-line"></div>

                                    প্রস্তুতকারী

                                </div>

                                <div class="sig-col">

                                    <div class="sig-line"></div>

                                    প্রধান শিক্ষক

                                </div>

                            </div>"""

new_room_footer = """                            <!-- Footer Signatures Section -->

                            <div class="footer-signatures">

                                <div class="sig-col" style="display: none !important;">

                                    <div style="height: 0.5in;"></div>

                                    <div class="sig-line"></div>

                                    কক্ষ পরিদর্শক

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">

                                        ${prepSigImg}

                                    </div>

                                    <div class="sig-line"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 3px;">প্রস্তুতকারী</div>

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">

                                        ${hmSigImg}

                                    </div>

                                    <div class="sig-line"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 3px;">প্রধান শিক্ষক</div>

                                </div>

                            </div>"""

if old_room_footer in room_content:
    room_content = room_content.replace(old_room_footer, new_room_footer, 1)
    print("[OK] Updated footer signatures in Room Seat Topshet.html")
else:
    print("[WARN] Could not find old_room_footer in Room Seat Topshet.html")

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_content)
print("[SUCCESS] Room Seat Topshet.html updated!")


# ==========================================
# 2. Update seat-plan.html
# ==========================================
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Insert helper functions before updateRoomTopshetLive in seat-plan.html
if 'function getRoomTopshetHeadmasterSignature' not in seat_content:
    seat_content = seat_content.replace('        function updateRoomTopshetLive() {', staff_sig_helpers + '\n        function updateRoomTopshetLive() {', 1)

target_seat_loop_start = """            filteredAllocList.forEach(({ rId, item }) => {
                const roomNo = item.room ? (item.room.number || item.room.name || rId) : rId;"""

replacement_seat_loop_start = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            filteredAllocList.forEach(({ rId, item }) => {
                const roomNo = item.room ? (item.room.number || item.room.name || rId) : rId;"""

# Replace in updateRoomTopshetLive inside seat-plan.html
idx_topshet = seat_content.find('ROOM SEAT TOPSHET ENGINE')
if idx_topshet != -1:
    sub_content = seat_content[idx_topshet:]
    if target_seat_loop_start in sub_content:
        sub_content = sub_content.replace(target_seat_loop_start, replacement_seat_loop_start, 1)
        seat_content = seat_content[:idx_topshet] + sub_content
        print("[OK] Added signature variables to updateRoomTopshetLive in seat-plan.html")

# Update footer HTML in seat-plan.html
old_seat_footer = """                            <!-- Footer Signatures Section -->
                            <div class="footer-signatures">
                                <div class="sig-col" style="display: none !important;">
                                    <div class="sig-line"></div>
                                    কক্ষ পরিদর্শক
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    প্রস্তুতকারী
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    প্রধান শিক্ষক
                                </div>
                            </div>"""

new_seat_footer = """                            <!-- Footer Signatures Section -->
                            <div class="footer-signatures">
                                <div class="sig-col" style="display: none !important;">
                                    <div style="height: 0.5in;"></div>
                                    <div class="sig-line"></div>
                                    কক্ষ পরিদর্শক
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
                                        ${prepSigImg}
                                    </div>
                                    <div class="sig-line"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 3px;">প্রস্তুতকারী</div>
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
                                        ${hmSigImg}
                                    </div>
                                    <div class="sig-line"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 3px;">প্রধান শিক্ষক</div>
                                </div>
                            </div>"""

if old_seat_footer in seat_content:
    seat_content = seat_content.replace(old_seat_footer, new_seat_footer, 1)
    print("[OK] Updated footer signatures in seat-plan.html")
else:
    print("[WARN] Could not find old_seat_footer in seat-plan.html")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_content)
print("[SUCCESS] seat-plan.html updated!")
