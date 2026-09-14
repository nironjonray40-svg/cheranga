import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== APPLYING ADMISSION TOGGLE TO advance.html ===")
with open('advance.html', 'r', encoding='utf-8') as f:
    adv_html = f.read()

# 1. Insert dedicated toggle card right above 2-COLUMN CMS MANAGER LAYOUT in subview-cms-portal
adv_target_col = '<!-- 2-COLUMN CMS MANAGER LAYOUT -->'
adv_toggle_card = """                <!-- DEDICATED ONLINE ADMISSION BUTTON VISIBILITY TOGGLE CARD -->
                <div class="glass-card" style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important; border: 2px solid #cbd5e1 !important; border-radius: 16px; padding: 22px 26px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; box-shadow: 0 4px 12px rgba(2,132,199,0.3);">
                                🎓
                            </div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                    <h4 style="margin: 0; font-size: 1.18rem; font-weight: 800; color: #0f172a;">অনলাইন ভর্তি বাটন ও আবেদন পোর্টাল দৃশ্যমানতা</h4>
                                    <span id="cmsAdmissionStatusBadge" style="font-size: 0.82rem; font-weight: 700; padding: 4px 14px; border-radius: 20px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; display: inline-flex; align-items: center; gap: 6px;">
                                        🟢 দৃশ্যমান ও সক্রিয় (Active)
                                    </span>
                                </div>
                                <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #64748b;">
                                    পাবলিক CMS ওয়েবসাইটের হেডার, মোবাইল ড্রয়ার ও ব্যানারে "অনলাইন ভর্তি" বাটন চালু/বন্ধ (দৃশ্যমান বা হাইড) করুন।
                                </p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                            <button type="button" id="btnToggleAdmissionQuick" class="btn-primary" onclick="toggleCmsAdmissionButtonQuick()"
                                style="padding: 11px 22px; font-size: 0.92rem; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                                <span>👁️ বাটন হাইড / লুকান</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 2-COLUMN CMS MANAGER LAYOUT -->"""

assert adv_target_col in adv_html, "adv_target_col not found in advance.html"
adv_html = adv_html.replace(adv_target_col, adv_toggle_card, 1)

# 2. Update admission checkbox in right column checklist
adv_chk_target = """                            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" id="cmsToggleAdmission" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>🎓 অনলাইন ভর্তি আবেদন ব্যানার ও ফর্ম</span>
                            </label>"""

adv_chk_replacement = """                            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" id="cmsToggleAdmission" checked onchange="handleAdmissionCheckboxChange(this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: #0284c7;">
                                <span style="font-weight: 700; color: #0284c7;">🎓 অনলাইন ভর্তি বাটন ও আবেদন পোর্টাল (Online Admission)</span>
                            </label>"""

assert adv_chk_target in adv_html, "adv_chk_target not found in advance.html"
adv_html = adv_html.replace(adv_chk_target, adv_chk_replacement, 1)

# 3. Add JS functions to advance.html
adv_js_target = "function initCmsPortalSection() {"
adv_js_functions = """function updateAdmissionToggleUI(isEnabled) {
            const badge = document.getElementById('cmsAdmissionStatusBadge');
            const quickBtn = document.getElementById('btnToggleAdmissionQuick');
            const chk = document.getElementById('cmsToggleAdmission');

            if (chk) chk.checked = isEnabled;

            if (badge) {
                if (isEnabled) {
                    badge.style.background = '#dcfce7';
                    badge.style.color = '#166534';
                    badge.style.borderColor = '#bbf7d0';
                    badge.innerHTML = '🟢 দৃশ্যমান ও সক্রিয় (Active)';
                } else {
                    badge.style.background = '#fee2e2';
                    badge.style.color = '#991b1b';
                    badge.style.borderColor = '#fecaca';
                    badge.innerHTML = '🔴 হাইড / লুকানো (Hidden)';
                }
            }

            if (quickBtn) {
                if (isEnabled) {
                    quickBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    quickBtn.innerHTML = '<span>👁️ বাটন হাইড / লুকান</span>';
                    quickBtn.title = 'ক্লিক করলে CMS ওয়েবসাইট থেকে অনলাইন ভর্তি বাটন হাইড হয়ে যাবে';
                } else {
                    quickBtn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
                    quickBtn.innerHTML = '<span>👁️ বাটন দৃশ্যমান / সক্রিয় করুন</span>';
                    quickBtn.title = 'ক্লিক করলে CMS ওয়েবসাইটে অনলাইন ভর্তি বাটন পুনরায় দৃশ্যমান হবে';
                }
            }
        }

        function handleAdmissionCheckboxChange(checked) {
            saveCmsAdmissionToggle(checked);
        }

        function toggleCmsAdmissionButtonQuick() {
            const cmsSettings = JSON.parse(localStorage.getItem('school_cms_settings') || '{}');
            const sections = cmsSettings.sections || {};
            const currentState = (sections.admission !== false);
            const newState = !currentState;
            saveCmsAdmissionToggle(newState);
        }

        function saveCmsAdmissionToggle(isEnabled) {
            try {
                const cmsSettings = JSON.parse(localStorage.getItem('school_cms_settings') || '{}');
                if (!cmsSettings.sections) cmsSettings.sections = {};
                cmsSettings.sections.admission = isEnabled;
                cmsSettings.updated_at = Date.now();

                const jsonStr = JSON.stringify(cmsSettings);
                localStorage.setItem('school_cms_settings', jsonStr);

                // Direct sync with SQLite backend
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'school_cms_settings', value: jsonStr })
                }).catch(e => console.log("Offline sync:", e));

                // Broadcast real-time to other tabs (e.g. cms.html)
                if (window.BroadcastChannel) {
                    try {
                        const bc = new BroadcastChannel('school_realtime_db_channel');
                        bc.postMessage({ type: 'set', key: 'school_cms_settings', value: jsonStr, ver: Date.now() });
                        bc.close();
                    } catch (e) {}
                }

                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new CustomEvent('dbSynced', { detail: { key: 'school_cms_settings' } }));

                updateAdmissionToggleUI(isEnabled);

                const msg = isEnabled ? 'অনলাইন ভর্তি বাটন সফলভাবে CMS ওয়েবসাইটে দৃশ্যমান ও সক্রিয় করা হয়েছে!' : 'অনলাইন ভর্তি বাটন সফলভাবে CMS ওয়েবসাইট থেকে হাইড (লুকানো) করা হয়েছে!';
                alert(`✅ ${msg}`);
            } catch (err) {
                console.error("Error saving admission toggle:", err);
                alert("ত্রুটি: সেটিংস সংরক্ষণ করা সম্ভব হয়নি।");
            }
        }

        function initCmsPortalSection() {"""

assert adv_js_target in adv_html, "adv_js_target not found in advance.html"
adv_html = adv_html.replace(adv_js_target, adv_js_functions, 1)

# 4. In initCmsPortalSection, call updateAdmissionToggleUI
adv_init_target = "setChecked('cmsToggleAdmission', s.admission);"
adv_init_replacement = """setChecked('cmsToggleAdmission', s.admission);
                updateAdmissionToggleUI(s.admission !== false);"""

assert adv_init_target in adv_html, "adv_init_target not found in advance.html"
adv_html = adv_html.replace(adv_init_target, adv_init_replacement, 1)

# 5. In saveCmsDisplaySettings, call updateAdmissionToggleUI & broadcast
adv_save_target = "localStorage.setItem('school_cms_settings', jsonStr);"
adv_save_replacement = """localStorage.setItem('school_cms_settings', jsonStr);
                updateAdmissionToggleUI(sections.admission !== false);

                if (window.BroadcastChannel) {
                    try {
                        const bc = new BroadcastChannel('school_realtime_db_channel');
                        bc.postMessage({ type: 'set', key: 'school_cms_settings', value: jsonStr, ver: Date.now() });
                        bc.close();
                    } catch (e) {}
                }"""

assert adv_save_target in adv_html, "adv_save_target not found in advance.html"
adv_html = adv_html.replace(adv_save_target, adv_save_replacement, 1)

with open('advance.html', 'w', encoding='utf-8') as f:
    f.write(adv_html)

print("advance.html successfully updated!")
