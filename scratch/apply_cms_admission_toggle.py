import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== APPLYING ADMISSION TOGGLE RESPONSIVENESS TO cms.html ===")
with open('cms.html', 'r', encoding='utf-8') as f:
    cms_html = f.read()

# 1. Update header CTA button
hdr_btn_target = """            <!-- Quick Action CTA -->
            <div class="nav-cta-btns" id="navCtaBtnsContainer">
                <button type="button" class="btn-portal-action" onclick="openAdmissionModal('form')">
                    <i class="fa-solid fa-paper-plane"></i> অনলাইন ভর্তি
                </button>"""

hdr_btn_replacement = """            <!-- Quick Action CTA -->
            <div class="nav-cta-btns" id="navCtaBtnsContainer">
                <button type="button" class="btn-portal-action cms-admission-btn" id="cmsHeaderAdmissionBtn" onclick="openAdmissionModal('form')">
                    <i class="fa-solid fa-paper-plane"></i> অনলাইন ভর্তি
                </button>"""

assert hdr_btn_target in cms_html, "hdr_btn_target not found in cms.html"
cms_html = cms_html.replace(hdr_btn_target, hdr_btn_replacement, 1)

# 2. Update mobile drawer button
mob_btn_target = """            <li style="margin-top: 10px; display: flex; gap: 8px;">
                <button class="btn-portal-action" style="flex: 1; justify-content: center;"
                    onclick="toggleMobileNav(); openAdmissionModal();">
                    <i class="fa-solid fa-paper-plane"></i> ভর্তি আবেদন
                </button>"""

mob_btn_replacement = """            <li id="mobileAdmissionLi" style="margin-top: 10px; display: flex; gap: 8px;">
                <button class="btn-portal-action cms-admission-btn" id="cmsMobileAdmissionBtn" style="flex: 1; justify-content: center;"
                    onclick="toggleMobileNav(); openAdmissionModal();">
                    <i class="fa-solid fa-paper-plane"></i> ভর্তি আবেদন
                </button>"""

assert mob_btn_target in cms_html, "mob_btn_target not found in cms.html"
cms_html = cms_html.replace(mob_btn_target, mob_btn_replacement, 1)

# 3. Update applySectionVisibilities in cms.html
vis_target = """            if (s.notices === false) hideSection('notices');
            if (s.admission === false) hideSection('admission');"""

vis_replacement = """            if (s.notices === false) hideSection('notices');
            
            // --- ONLINE ADMISSION VISIBILITY (বাটন ও সেকশন দৃশ্যমানতা নিয়ন্ত্রণ) ---
            const isAdmissionEnabled = (s.admission !== false);
            
            // 1. Header CTA button
            const headerAdmBtn = document.getElementById('cmsHeaderAdmissionBtn') || document.querySelector('.nav-cta-btns .btn-portal-action');
            if (headerAdmBtn) {
                headerAdmBtn.style.display = isAdmissionEnabled ? 'inline-flex' : 'none';
            }
            
            // 2. Mobile Drawer CTA button
            const mobileAdmBtn = document.getElementById('cmsMobileAdmissionBtn') || document.querySelector('#mobileDrawer .btn-portal-action');
            if (mobileAdmBtn) {
                mobileAdmBtn.style.display = isAdmissionEnabled ? 'inline-flex' : 'none';
            }
            
            // 3. Hero & Banner admission buttons
            document.querySelectorAll('.cms-admission-btn, .hero-slide-btn-adm, button[onclick*="openAdmissionModal"]').forEach(btn => {
                if (btn !== headerAdmBtn && btn !== mobileAdmBtn) {
                    btn.style.display = isAdmissionEnabled ? '' : 'none';
                }
            });
            
            // 4. Section #admission
            if (!isAdmissionEnabled) {
                hideSection('admission');
            } else {
                const admSec = document.getElementById('admission');
                if (admSec) admSec.style.display = '';
            }"""

assert vis_target in cms_html, "vis_target not found in cms.html"
cms_html = cms_html.replace(vis_target, vis_replacement, 1)

# 4. Ensure BroadcastChannel and storage events update settings in real-time
storage_target = """            // Instant cross-tab sync when ERP saves updates
            window.addEventListener('storage', (e) => {"""

storage_replacement = """            // Real-time BroadcastChannel listener for instant cross-tab sync
            if (window.BroadcastChannel) {
                try {
                    const bc = new BroadcastChannel('school_realtime_db_channel');
                    bc.onmessage = (ev) => {
                        if (ev.data && ev.data.key === 'school_cms_settings') {
                            CMS_CONFIG = safeParse(ev.data.value, CMS_CONFIG);
                            applySectionVisibilities();
                        }
                    };
                } catch(e) {}
            }

            // Instant cross-tab sync when ERP saves updates
            window.addEventListener('storage', (e) => {
                if (e.key === 'school_cms_settings' || !e.key) {
                    CMS_CONFIG = getStoreData('school_cms_settings', {}) || {};
                    applySectionVisibilities();
                }"""

assert storage_target in cms_html, "storage_target not found in cms.html"
cms_html = cms_html.replace(storage_target, storage_replacement, 1)

with open('cms.html', 'w', encoding='utf-8') as f:
    f.write(cms_html)

print("cms.html successfully updated!")
