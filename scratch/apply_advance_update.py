import os
import re

# Load BD_GEO_DATA from cms.html
with open('cms.html', 'r', encoding='utf-8') as f:
    cms_content = f.read()

geo_start = cms_content.find('const BD_GEO_DATA = {')
geo_end = cms_content.find('// Complete 64 District fallback mapping', geo_start)
if geo_start == -1 or geo_end == -1:
    raise Exception("Could not locate BD_GEO_DATA in cms.html")

raw_geo_js = cms_content[geo_start:geo_end].strip()
default_geo_js = raw_geo_js.replace('const BD_GEO_DATA =', 'const DEFAULT_BD_GEO_DATA =')

# =========================================================================
# 1. UPDATE advance.html
# =========================================================================
with open('advance.html', 'r', encoding='utf-8') as f:
    adv_content = f.read()

# 1.1 Add to navbar dropdown if not present
if 'advance?view=address-structure' not in adv_content:
    adv_content = adv_content.replace(
        '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>',
        '<li><a href="advance?view=cms-portal">🌐 CMS Website & Data Import</a></li>\n                        <li><a href="advance?view=address-structure">📍 ভর্তি ফরমের ঠিকানা কনফিগারেশন</a></li>'
    )

# 1.2 Add to advance subnav pills if not present
if 'data-view="address-structure"' not in adv_content:
    adv_content = adv_content.replace(
        '''                <button type="button" class="advance-nav-pill" data-view="cms-portal"
                    onclick="navigateToAdvanceView('cms-portal')">
                    <span>🌐 CMS Website & Import</span>
                </button>''',
        '''                <button type="button" class="advance-nav-pill" data-view="cms-portal"
                    onclick="navigateToAdvanceView('cms-portal')">
                    <span>🌐 CMS Website & Import</span>
                </button>
                <button type="button" class="advance-nav-pill" data-view="address-structure"
                    onclick="navigateToAdvanceView('address-structure')">
                    <span>📍 ভর্তি ফরমের ঠিকানা</span>
                </button>'''
    )

# 1.3 Add switchAdvanceView case
if "else if (viewName === 'address-structure')" not in adv_content:
    switch_target = "initCmsPortalSection();\n            } else {"
    switch_replacement = '''initCmsPortalSection();
            } else if (viewName === 'address-structure') {
                if (titleEl) {
                    titleEl.textContent = "📍 অনলাইন ভর্তি ফরমের ঠিকানা সংক্রান্ত তথ্য ব্যবস্থাপনা";
                    titleEl.classList.remove('blue-title');
                    titleEl.style.fontFamily = "";
                    titleEl.style.fontSize = "";
                    titleEl.style.fontWeight = "";
                    titleEl.style.letterSpacing = "";
                }
                if (subtitleEl) {
                    subtitleEl.textContent = "ভর্তি আবেদন ফরমের ৫. ঠিকানা সংক্রান্ত তথ্য (বিভাগ, জেলা, উপজেলা, ইউনিয়ন ও ডাকঘর) এর অপশনসমূহ পরিচালনা, সংযোজন ও বাতিল করুন";
                    subtitleEl.style.fontFamily = "";
                    subtitleEl.style.fontSize = "";
                    subtitleEl.style.letterSpacing = "";
                }
                initAdmissionAddressManager();
            } else {'''
    adv_content = adv_content.replace(switch_target, switch_replacement)

# 1.4 Add subview markup before end of #advance section
subview_markup = '''
            <!-- SUB-VIEW 12: ADMISSION ADDRESS GEO DATA MANAGER (ঠিকানা সংক্রান্ত তথ্য কনফিগারেশন) -->
            <div id="subview-address-structure" class="portal-sub-view">
                <!-- TOP CONTROL & LIVE STATUS BANNER -->
                <div class="glass-card" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: #ffffff !important; border: 1.5px solid #334155 !important; border-radius: 18px; padding: 26px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                        <div>
                            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 14px; border-radius: 30px; font-size: 0.85rem; color: #38bdf8; font-weight: 700; margin-bottom: 12px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                                ভর্তি আবেদন ফরমের অ্যাড্রেস ডেটা কন্ট্রোলার
                            </div>
                            <h3 style="color: #ffffff !important; font-size: 1.65rem; font-weight: 800; margin-bottom: 6px;">অনলাইন ভর্তি ফরমের ঠিকানা সংক্রান্ত তথ্য ব্যবস্থাপনা</h3>
                            <p style="color: #94a3b8 !important; font-size: 0.95rem; margin: 0;">অনলাইন ভর্তি আবেদন ফরমের "৫. ঠিকানা সংক্রান্ত তথ্য" সেকশনের বিভাগ, জেলা, উপজেলা, ইউনিয়ন ও ডাকঘরের অপশনসমূহ যুক্ত ও বাতিল করুন।</p>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button type="button" class="btn-outline" style="background: rgba(255,255,255,0.1) !important; color: #ffffff !important; border-color: rgba(255,255,255,0.3) !important; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.90rem; display: inline-flex; align-items: center; gap: 6px;" onclick="resetAdmissionGeoDataToDefault()">
                                <span>🔄 ডিফল্ট ডেটা রিস্টোর</span>
                            </button>
                            <button type="button" class="btn-outline" style="background: rgba(255,255,255,0.1) !important; color: #ffffff !important; border-color: rgba(255,255,255,0.3) !important; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.90rem; display: inline-flex; align-items: center; gap: 6px;" onclick="exportGeoDataJson()">
                                <span>📥 ব্যাকআপ ডাউনলোড</span>
                            </button>
                            <label class="btn-outline" style="background: rgba(255,255,255,0.1) !important; color: #ffffff !important; border-color: rgba(255,255,255,0.3) !important; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.90rem; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;">
                                <span>📤 ব্যাকআপ আপলোড</span>
                                <input type="file" accept=".json" style="display: none;" onchange="importGeoDataJson(event)">
                            </label>
                        </div>
                    </div>

                    <!-- GEO STATS SUMMARY -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 10px;">
                            <span style="font-size: 0.78rem; color: #94a3b8; display: block; font-weight: 600;">🏛️ মোট বিভাগ</span>
                            <strong id="geoStatDivisions" style="font-size: 1.25rem; color: #38bdf8; font-weight: 800;">০ টি</strong>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 10px;">
                            <span style="font-size: 0.78rem; color: #94a3b8; display: block; font-weight: 600;">🏙️ মোট জেলা</span>
                            <strong id="geoStatDistricts" style="font-size: 1.25rem; color: #38bdf8; font-weight: 800;">০ টি</strong>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 10px;">
                            <span style="font-size: 0.78rem; color: #94a3b8; display: block; font-weight: 600;">🏘️ মোট উপজেলা / থানা</span>
                            <strong id="geoStatUpazilas" style="font-size: 1.25rem; color: #38bdf8; font-weight: 800;">০ টি</strong>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 10px;">
                            <span style="font-size: 0.78rem; color: #94a3b8; display: block; font-weight: 600;">🏡 ইউনিয়ন ও পৌরসভা</span>
                            <strong id="geoStatUnions" style="font-size: 1.25rem; color: #38bdf8; font-weight: 800;">০ টি</strong>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 10px;">
                            <span style="font-size: 0.78rem; color: #94a3b8; display: block; font-weight: 600;">📮 ডাকঘর ও পোস্ট কোড</span>
                            <strong id="geoStatPosts" style="font-size: 1.25rem; color: #10b981; font-weight: 800;">০ টি</strong>
                        </div>
                    </div>
                </div>

                <!-- ADDRESS TABS SELECTOR -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; background: #ffffff; padding: 8px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                    <button type="button" class="btn-outline geo-level-tab active" id="geoTabBtn-division" onclick="switchGeoLevelTab('division')" style="padding: 8px 16px; font-size: 0.90rem; font-weight: 700; border-radius: 8px; background: #0052ff !important; color: #ffffff !important;">
                        🏛️ ১. বিভাগ (Divisions)
                    </button>
                    <button type="button" class="btn-outline geo-level-tab" id="geoTabBtn-district" onclick="switchGeoLevelTab('district')" style="padding: 8px 16px; font-size: 0.90rem; font-weight: 700; border-radius: 8px;">
                        🏙️ ২. জেলা (Districts)
                    </button>
                    <button type="button" class="btn-outline geo-level-tab" id="geoTabBtn-upazila" onclick="switchGeoLevelTab('upazila')" style="padding: 8px 16px; font-size: 0.90rem; font-weight: 700; border-radius: 8px;">
                        🏘️ ৩. উপজেলা / থানা (Upazilas)
                    </button>
                    <button type="button" class="btn-outline geo-level-tab" id="geoTabBtn-union" onclick="switchGeoLevelTab('union')" style="padding: 8px 16px; font-size: 0.90rem; font-weight: 700; border-radius: 8px;">
                        🏡 ৪. ইউনিয়ন / পৌরসভা (Unions)
                    </button>
                    <button type="button" class="btn-outline geo-level-tab" id="geoTabBtn-post" onclick="switchGeoLevelTab('post')" style="padding: 8px 16px; font-size: 0.90rem; font-weight: 700; border-radius: 8px;">
                        📮 ৫. ডাকঘর ও পোস্ট কোড (Post Offices)
                    </button>
                </div>

                <!-- LEVEL 1: DIVISION MANAGER -->
                <div id="geoLevelPanel-division" class="geo-level-panel">
                    <div class="glass-card">
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px;">
                            <!-- Form: Add Division -->
                            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    ➕ নতুন বিভাগ যুক্ত করুন
                                </h4>
                                <form onsubmit="addGeoDivision(event)">
                                    <div class="form-group" style="margin-bottom: 14px;">
                                        <label for="newGeoDivisionName" style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 6px;">বিভাগের নাম:</label>
                                        <input type="text" id="newGeoDivisionName" class="form-control" placeholder="যেমন: রংপুর, ঢাকা বা নতুন কোনো বিভাগ" required style="background: #ffffff; color: #000000; border: 1.5px solid #cbd5e1; height: 40px;">
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 800; justify-content: center;">
                                        ✅ বিভাগ সংরক্ষণ করুন
                                    </button>
                                </form>
                            </div>
                            <!-- List: Current Divisions -->
                            <div>
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    📋 বর্তমানে সক্রিয় বিভাগসমূহ
                                </h4>
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table class="fee-list-table" style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="width: 12%; text-align: center;">ক্র নং</th>
                                                <th style="text-align: left;">বিভাগের নাম</th>
                                                <th style="width: 25%; text-align: center;">অন্তর্ভুক্ত জেলা</th>
                                                <th style="width: 20%; text-align: center;">অ্যাকশন (বাতিল)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="geoDivisionListTbody">
                                            <!-- Loaded dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LEVEL 2: DISTRICT MANAGER -->
                <div id="geoLevelPanel-district" class="geo-level-panel" style="display: none;">
                    <div class="glass-card">
                        <!-- Division Selector Filter -->
                        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; flex-wrap: wrap;">
                            <label for="geoFilterDivForDist" style="font-size: 0.92rem; font-weight: 700; color: #1e40af; margin: 0;">বিভাগ নির্বাচন করুন:</label>
                            <select id="geoFilterDivForDist" class="form-control" style="max-width: 240px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="renderDistrictsManager()">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px;">
                            <!-- Form: Add District -->
                            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    ➕ নির্বাচিত বিভাগে নতুন জেলা যুক্ত করুন
                                </h4>
                                <form onsubmit="addGeoDistrict(event)">
                                    <div class="form-group" style="margin-bottom: 14px;">
                                        <label for="newGeoDistrictName" style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 6px;">জেলার নাম:</label>
                                        <input type="text" id="newGeoDistrictName" class="form-control" placeholder="যেমন: নীলফামারী, দিনাজপুর ইত্যাদি" required style="background: #ffffff; color: #000000; border: 1.5px solid #cbd5e1; height: 40px;">
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 800; justify-content: center;">
                                        ✅ জেলা সংরক্ষণ করুন
                                    </button>
                                </form>
                            </div>
                            <!-- List: Current Districts -->
                            <div>
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;" id="geoDistrictListHeading">
                                    📋 নির্বাচিত বিভাগের জেলাসমূহ
                                </h4>
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table class="fee-list-table" style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="width: 12%; text-align: center;">ক্র নং</th>
                                                <th style="text-align: left;">জেলার নাম</th>
                                                <th style="width: 25%; text-align: center;">অন্তর্ভুক্ত উপজেলা</th>
                                                <th style="width: 20%; text-align: center;">অ্যাকশন (বাতিল)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="geoDistrictListTbody">
                                            <!-- Loaded dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LEVEL 3: UPAZILA MANAGER -->
                <div id="geoLevelPanel-upazila" class="geo-level-panel" style="display: none;">
                    <div class="glass-card">
                        <!-- Cascading Selectors Filter -->
                        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label for="geoFilterDivForUpz" style="font-size: 0.90rem; font-weight: 700; color: #1e40af; margin: 0;">বিভাগ:</label>
                                <select id="geoFilterDivForUpz" class="form-control" style="width: 180px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="onGeoDivChangeForUpz(this.value)">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label for="geoFilterDistForUpz" style="font-size: 0.90rem; font-weight: 700; color: #1e40af; margin: 0;">জেলা:</label>
                                <select id="geoFilterDistForUpz" class="form-control" style="width: 200px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="renderUpazilasManager()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px;">
                            <!-- Form: Add Upazila -->
                            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    ➕ নির্বাচিত জেলায় নতুন উপজেলা / থানা যুক্ত করুন
                                </h4>
                                <form onsubmit="addGeoUpazila(event)">
                                    <div class="form-group" style="margin-bottom: 14px;">
                                        <label for="newGeoUpazilaName" style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 6px;">উপজেলা / থানার নাম:</label>
                                        <input type="text" id="newGeoUpazilaName" class="form-control" placeholder="যেমন: জলঢাকা, সৈয়দপুর ইত্যাদি" required style="background: #ffffff; color: #000000; border: 1.5px solid #cbd5e1; height: 40px;">
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 800; justify-content: center;">
                                        ✅ উপজেলা সংরক্ষণ করুন
                                    </button>
                                </form>
                            </div>
                            <!-- List: Current Upazilas -->
                            <div>
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;" id="geoUpazilaListHeading">
                                    📋 নির্বাচিত জেলার উপজেলাসমূহ
                                </h4>
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table class="fee-list-table" style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="width: 12%; text-align: center;">ক্র নং</th>
                                                <th style="text-align: left;">উপজেলার নাম</th>
                                                <th style="width: 20%; text-align: center;">ইউনিয়ন</th>
                                                <th style="width: 20%; text-align: center;">ডাকঘর</th>
                                                <th style="width: 18%; text-align: center;">অ্যাকশন</th>
                                            </tr>
                                        </thead>
                                        <tbody id="geoUpazilaListTbody">
                                            <!-- Loaded dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LEVEL 4: UNION MANAGER -->
                <div id="geoLevelPanel-union" class="geo-level-panel" style="display: none;">
                    <div class="glass-card">
                        <!-- Cascading Selectors Filter -->
                        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterDivForUnion" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">বিভাগ:</label>
                                <select id="geoFilterDivForUnion" class="form-control" style="width: 150px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="onGeoDivChangeForUnion(this.value)">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterDistForUnion" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">জেলা:</label>
                                <select id="geoFilterDistForUnion" class="form-control" style="width: 170px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="onGeoDistChangeForUnion(this.value)">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterUpzForUnion" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">উপজেলা:</label>
                                <select id="geoFilterUpzForUnion" class="form-control" style="width: 180px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="renderUnionsManager()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px;">
                            <!-- Form: Add Union -->
                            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    ➕ নতুন ইউনিয়ন / পৌরসভা যুক্ত করুন
                                </h4>
                                <form onsubmit="addGeoUnion(event)">
                                    <div class="form-group" style="margin-bottom: 14px;">
                                        <label for="newGeoUnionName" style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 6px;">ইউনিয়ন বা পৌরসভার নাম:</label>
                                        <input type="text" id="newGeoUnionName" class="form-control" placeholder="যেমন: মাথাভাঙ্গা ইউনিয়ন বা জলঢাকা পৌরসভা" required style="background: #ffffff; color: #000000; border: 1.5px solid #cbd5e1; height: 40px;">
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 800; justify-content: center;">
                                        ✅ ইউনিয়ন সংরক্ষণ করুন
                                    </button>
                                </form>
                            </div>
                            <!-- List: Current Unions -->
                            <div>
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;" id="geoUnionListHeading">
                                    📋 নির্বাচিত উপজেলার ইউনিয়ন / পৌরসভাসমূহ
                                </h4>
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table class="fee-list-table" style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="width: 12%; text-align: center;">ক্র নং</th>
                                                <th style="text-align: left;">ইউনিয়ন / পৌরসভার নাম</th>
                                                <th style="width: 25%; text-align: center;">অ্যাকশন (বাতিল)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="geoUnionListTbody">
                                            <!-- Loaded dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LEVEL 5: POST OFFICE MANAGER -->
                <div id="geoLevelPanel-post" class="geo-level-panel" style="display: none;">
                    <div class="glass-card">
                        <!-- Cascading Selectors Filter -->
                        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterDivForPost" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">বিভাগ:</label>
                                <select id="geoFilterDivForPost" class="form-control" style="width: 150px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="onGeoDivChangeForPost(this.value)">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterDistForPost" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">জেলা:</label>
                                <select id="geoFilterDistForPost" class="form-control" style="width: 170px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="onGeoDistChangeForPost(this.value)">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="geoFilterUpzForPost" style="font-size: 0.88rem; font-weight: 700; color: #1e40af; margin: 0;">উপজেলা:</label>
                                <select id="geoFilterUpzForPost" class="form-control" style="width: 180px; background: #ffffff; color: #000000; font-weight: 700; border: 1.5px solid #93c5fd;" onchange="renderPostsManager()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px;">
                            <!-- Form: Add Post Office -->
                            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1.5px solid #cbd5e1;">
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;">
                                    ➕ নতুন ডাকঘর ও পোস্ট কোড যুক্ত করুন
                                </h4>
                                <form onsubmit="addGeoPost(event)">
                                    <div class="form-group" style="margin-bottom: 14px;">
                                        <label for="newGeoPostName" style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 6px;">ডাকঘরের নাম ও পোস্ট কোড:</label>
                                        <input type="text" id="newGeoPostName" class="form-control" placeholder="যেমন: মাথাভাঙ্গা ডাকঘর (৫৩৩১) বা জলঢাকা প্রধান ডাকঘর (৫৩৩০)" required style="background: #ffffff; color: #000000; border: 1.5px solid #cbd5e1; height: 40px;">
                                    </div>
                                    <button type="submit" class="btn-primary" style="width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 800; justify-content: center;">
                                        ✅ ডাকঘর সংরক্ষণ করুন
                                    </button>
                                </form>
                            </div>
                            <!-- List: Current Post Offices -->
                            <div>
                                <h4 style="color: #0f172a; font-weight: 800; margin-bottom: 12px; font-size: 1.05rem;" id="geoPostListHeading">
                                    📋 নির্বাচিত উপজেলার ডাকঘরসমূহ
                                </h4>
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table class="fee-list-table" style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="width: 12%; text-align: center;">ক্র নং</th>
                                                <th style="text-align: left;">ডাকঘর ও পোস্ট কোড</th>
                                                <th style="width: 25%; text-align: center;">অ্যাকশন (বাতিল)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="geoPostListTbody">
                                            <!-- Loaded dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
'''

if 'id="subview-address-structure"' not in adv_content:
    adv_content = adv_content.replace(
        '            </div>\n        </section>',
        '            </div>\n' + subview_markup + '\n        </section>'
    )

# 1.5 Build JavaScript Logic for Address Management
js_logic = """
        // =========================================================================
        // --- ADMISSION ADDRESS GEO DATA MANAGER & ENGINE ---
        // =========================================================================
        """ + default_geo_js + """

        function getAdmissionGeoData() {
            try {
                const saved = localStorage.getItem('bd_geo_admission_data');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Could not read bd_geo_admission_data:', e);
            }
            return JSON.parse(JSON.stringify(DEFAULT_BD_GEO_DATA));
        }

        function saveAdmissionGeoData(data, message) {
            try {
                localStorage.setItem('bd_geo_admission_data', JSON.stringify(data));
                renderGeoStatsCounters();
                if (message) {
                    showGeoSuccessToast(message);
                }
            } catch (e) {
                alert('ডেটা সংরক্ষণ ব্যর্থ: ' + e.message);
            }
        }

        function showGeoSuccessToast(msg) {
            let toast = document.getElementById('geoToastNotification');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'geoToastNotification';
                toast.style.cssText = 'position: fixed; bottom: 25px; right: 25px; z-index: 999999; background: #0f172a; color: #ffffff; padding: 14px 22px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; border: 1.5px solid #38bdf8; box-shadow: 0 10px 25px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease; opacity: 0; transform: translateY(20px);';
                document.body.appendChild(toast);
            }
            toast.innerHTML = '<span style="color: #10b981; font-size: 1.2rem;">✓</span> <span>' + escapeHtml(msg) + '</span>';
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }, 3000);
        }

        function switchGeoLevelTab(tabName) {
            document.querySelectorAll('.geo-level-tab').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = '';
                btn.style.color = '';
            });
            const activeBtn = document.getElementById('geoTabBtn-' + tabName);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.style.setProperty('background', '#0052ff', 'important');
                activeBtn.style.setProperty('color', '#ffffff', 'important');
            }

            document.querySelectorAll('.geo-level-panel').forEach(panel => {
                panel.style.display = 'none';
            });
            const activePanel = document.getElementById('geoLevelPanel-' + tabName);
            if (activePanel) {
                activePanel.style.display = 'block';
            }

            if (tabName === 'division') renderDivisionsManager();
            else if (tabName === 'district') renderDistrictsManager();
            else if (tabName === 'upazila') renderUpazilasManager();
            else if (tabName === 'union') renderUnionsManager();
            else if (tabName === 'post') renderPostsManager();
        }

        function renderGeoStatsCounters() {
            const data = getAdmissionGeoData();
            let divCount = 0;
            let distCount = 0;
            let upzCount = 0;
            let unionCount = 0;
            let postCount = 0;

            for (const div in data) {
                divCount++;
                const dists = data[div] || {};
                for (const dist in dists) {
                    distCount++;
                    const upzs = dists[dist] || {};
                    for (const upz in upzs) {
                        upzCount++;
                        const node = upzs[upz] || {};
                        unionCount += (node.unions || []).length;
                        postCount += (node.posts || []).length;
                    }
                }
            }

            const elDiv = document.getElementById('geoStatDivisions');
            const elDist = document.getElementById('geoStatDistricts');
            const elUpz = document.getElementById('geoStatUpazilas');
            const elUnion = document.getElementById('geoStatUnions');
            const elPost = document.getElementById('geoStatPosts');

            if (elDiv) elDiv.textContent = divCount + ' টি';
            if (elDist) elDist.textContent = distCount + ' টি';
            if (elUpz) elUpz.textContent = upzCount + ' টি';
            if (elUnion) elUnion.textContent = unionCount + ' টি';
            if (elPost) elPost.textContent = postCount + ' টি';
        }

        function populateAllGeoDropdownFilters() {
            const data = getAdmissionGeoData();
            const divKeys = Object.keys(data);

            // 1. Division for District filter
            const selDistDiv = document.getElementById('geoFilterDivForDist');
            if (selDistDiv) {
                const prev = selDistDiv.value;
                selDistDiv.innerHTML = divKeys.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (divKeys.includes(prev)) selDistDiv.value = prev;
            }

            // 2. Division for Upazila filter
            const selUpzDiv = document.getElementById('geoFilterDivForUpz');
            if (selUpzDiv) {
                const prev = selUpzDiv.value;
                selUpzDiv.innerHTML = divKeys.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (divKeys.includes(prev)) selUpzDiv.value = prev;
            }
            onGeoDivChangeForUpz(selUpzDiv ? selUpzDiv.value : (divKeys[0] || ''));

            // 3. Division for Union filter
            const selUnionDiv = document.getElementById('geoFilterDivForUnion');
            if (selUnionDiv) {
                const prev = selUnionDiv.value;
                selUnionDiv.innerHTML = divKeys.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (divKeys.includes(prev)) selUnionDiv.value = prev;
            }
            onGeoDivChangeForUnion(selUnionDiv ? selUnionDiv.value : (divKeys[0] || ''));

            // 4. Division for Post filter
            const selPostDiv = document.getElementById('geoFilterDivForPost');
            if (selPostDiv) {
                const prev = selPostDiv.value;
                selPostDiv.innerHTML = divKeys.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (divKeys.includes(prev)) selPostDiv.value = prev;
            }
            onGeoDivChangeForPost(selPostDiv ? selPostDiv.value : (divKeys[0] || ''));
        }

        function onGeoDivChangeForUpz(divVal) {
            const data = getAdmissionGeoData();
            const dists = data[divVal] ? Object.keys(data[divVal]) : [];
            const sel = document.getElementById('geoFilterDistForUpz');
            if (sel) {
                const prev = sel.value;
                sel.innerHTML = dists.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (dists.includes(prev)) sel.value = prev;
            }
            renderUpazilasManager();
        }

        function onGeoDivChangeForUnion(divVal) {
            const data = getAdmissionGeoData();
            const dists = data[divVal] ? Object.keys(data[divVal]) : [];
            const sel = document.getElementById('geoFilterDistForUnion');
            if (sel) {
                const prev = sel.value;
                sel.innerHTML = dists.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (dists.includes(prev)) sel.value = prev;
            }
            onGeoDistChangeForUnion(sel ? sel.value : (dists[0] || ''));
        }

        function onGeoDistChangeForUnion(distVal) {
            const data = getAdmissionGeoData();
            const divVal = document.getElementById('geoFilterDivForUnion') ? document.getElementById('geoFilterDivForUnion').value : '';
            const upzs = (data[divVal] && data[divVal][distVal]) ? Object.keys(data[divVal][distVal]) : [];
            const sel = document.getElementById('geoFilterUpzForUnion');
            if (sel) {
                const prev = sel.value;
                sel.innerHTML = upzs.map(u => '<option value="' + escapeHtml(u) + '">' + escapeHtml(u) + '</option>').join('');
                if (upzs.includes(prev)) sel.value = prev;
            }
            renderUnionsManager();
        }

        function onGeoDivChangeForPost(divVal) {
            const data = getAdmissionGeoData();
            const dists = data[divVal] ? Object.keys(data[divVal]) : [];
            const sel = document.getElementById('geoFilterDistForPost');
            if (sel) {
                const prev = sel.value;
                sel.innerHTML = dists.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                if (dists.includes(prev)) sel.value = prev;
            }
            onGeoDistChangeForPost(sel ? sel.value : (dists[0] || ''));
        }

        function onGeoDistChangeForPost(distVal) {
            const data = getAdmissionGeoData();
            const divVal = document.getElementById('geoFilterDivForPost') ? document.getElementById('geoFilterDivForPost').value : '';
            const upzs = (data[divVal] && data[divVal][distVal]) ? Object.keys(data[divVal][distVal]) : [];
            const sel = document.getElementById('geoFilterUpzForPost');
            if (sel) {
                const prev = sel.value;
                sel.innerHTML = upzs.map(u => '<option value="' + escapeHtml(u) + '">' + escapeHtml(u) + '</option>').join('');
                if (upzs.includes(prev)) sel.value = prev;
            }
            renderPostsManager();
        }

        // --- LEVEL 1: DIVISION CRUD ---
        function renderDivisionsManager() {
            const data = getAdmissionGeoData();
            const tbody = document.getElementById('geoDivisionListTbody');
            if (!tbody) return;

            const divKeys = Object.keys(data);
            if (divKeys.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 18px;">কোনো বিভাগ যুক্ত নেই। নতুন বিভাগ যোগ করুন।</td></tr>';
                return;
            }

            tbody.innerHTML = divKeys.map((div, i) => {
                const distCount = data[div] ? Object.keys(data[div]).length : 0;
                return '<tr>' +
                    '<td style="text-align: center; font-weight: 700;">' + (i + 1) + '</td>' +
                    '<td><strong>' + escapeHtml(div) + '</strong></td>' +
                    '<td style="text-align: center;"><span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 0.82rem;">' + distCount + ' টি জেলা</span></td>' +
                    '<td style="text-align: center;">' +
                        '<button type="button" class="btn-danger" style="padding: 5px 12px; font-size: 0.80rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="deleteGeoDivision(\\'' + escapeHtml(div) + '\\')">' +
                            '🗑️ বাতিল' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function addGeoDivision(e) {
            e.preventDefault();
            const input = document.getElementById('newGeoDivisionName');
            const name = input ? input.value.trim() : '';
            if (!name) return;

            const data = getAdmissionGeoData();
            if (data[name]) {
                alert("'" + name + "' বিভাগটি ইতিমধ্যে তালিকায় রয়েছে!");
                return;
            }

            data[name] = {};
            saveAdmissionGeoData(data, "✅ '" + name + "' বিভাগ সফলভাবে যুক্ত হয়েছে!");
            if (input) input.value = '';
            populateAllGeoDropdownFilters();
            renderDivisionsManager();
        }

        function deleteGeoDivision(divName) {
            if (!confirm("আপনি কি নিশ্চিত যে '" + divName + "' বিভাগ এবং এর আওতাধীন সকল জেলা ও উপজেলা বাতিল করতে চান?")) return;
            const data = getAdmissionGeoData();
            delete data[divName];
            saveAdmissionGeoData(data, "🗑️ '" + divName + "' বিভাগ বাতিল করা হয়েছে!");
            populateAllGeoDropdownFilters();
            renderDivisionsManager();
        }

        // --- LEVEL 2: DISTRICT CRUD ---
        function renderDistrictsManager() {
            const data = getAdmissionGeoData();
            const selDiv = document.getElementById('geoFilterDivForDist');
            const divName = selDiv ? selDiv.value : '';
            const tbody = document.getElementById('geoDistrictListTbody');
            const heading = document.getElementById('geoDistrictListHeading');
            if (!tbody) return;

            if (heading) heading.textContent = '📋 ' + (divName ? "'" + divName + "' বিভাগের " : '') + 'জেলাসমূহ';

            const dists = data[divName] || {};
            const distKeys = Object.keys(dists);

            if (distKeys.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 18px;">\\'' + escapeHtml(divName) + '\\' বিভাগে কোনো জেলা যুক্ত নেই। বামের ফর্ম থেকে নতুন জেলা যোগ করুন।</td></tr>';
                return;
            }

            tbody.innerHTML = distKeys.map((dist, i) => {
                const upzCount = dists[dist] ? Object.keys(dists[dist]).length : 0;
                return '<tr>' +
                    '<td style="text-align: center; font-weight: 700;">' + (i + 1) + '</td>' +
                    '<td><strong>' + escapeHtml(dist) + '</strong></td>' +
                    '<td style="text-align: center;"><span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 0.82rem;">' + upzCount + ' টি উপজেলা</span></td>' +
                    '<td style="text-align: center;">' +
                        '<button type="button" class="btn-danger" style="padding: 5px 12px; font-size: 0.80rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="deleteGeoDistrict(\\'' + escapeHtml(divName) + '\\', \\'' + escapeHtml(dist) + '\\')">' +
                            '🗑️ বাতিল' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function addGeoDistrict(e) {
            e.preventDefault();
            const selDiv = document.getElementById('geoFilterDivForDist');
            const divName = selDiv ? selDiv.value : '';
            const input = document.getElementById('newGeoDistrictName');
            const distName = input ? input.value.trim() : '';

            if (!divName) {
                alert('অনুগ্রহ করে প্রথমে একটি বিভাগ নির্বাচন করুন!');
                return;
            }
            if (!distName) return;

            const data = getAdmissionGeoData();
            if (!data[divName]) data[divName] = {};
            if (data[divName][distName]) {
                alert("'" + distName + "' জেলাটি '" + divName + "' বিভাগে ইতিমধ্যে রয়েছে!");
                return;
            }

            data[divName][distName] = {};
            saveAdmissionGeoData(data, "✅ '" + distName + "' জেলা '" + divName + "' বিভাগে সফলভাবে যুক্ত হয়েছে!");
            if (input) input.value = '';
            populateAllGeoDropdownFilters();
            renderDistrictsManager();
        }

        function deleteGeoDistrict(divName, distName) {
            if (!confirm("আপনি কি নিশ্চিত যে '" + divName + "' বিভাগের '" + distName + "' জেলাটি বাতিল করতে চান?")) return;
            const data = getAdmissionGeoData();
            if (data[divName] && data[divName][distName]) {
                delete data[divName][distName];
                saveAdmissionGeoData(data, "🗑️ '" + distName + "' জেলা বাতিল করা হয়েছে!");
                populateAllGeoDropdownFilters();
                renderDistrictsManager();
            }
        }

        // --- LEVEL 3: UPAZILA CRUD ---
        function renderUpazilasManager() {
            const data = getAdmissionGeoData();
            const divName = document.getElementById('geoFilterDivForUpz') ? document.getElementById('geoFilterDivForUpz').value : '';
            const distName = document.getElementById('geoFilterDistForUpz') ? document.getElementById('geoFilterDistForUpz').value : '';
            const tbody = document.getElementById('geoUpazilaListTbody');
            const heading = document.getElementById('geoUpazilaListHeading');
            if (!tbody) return;

            if (heading) heading.textContent = '📋 ' + (distName ? "'" + distName + "' জেলার " : '') + 'উপজেলাসমূহ';

            const upzs = (data[divName] && data[divName][distName]) ? data[divName][distName] : {};
            const upzKeys = Object.keys(upzs);

            if (upzKeys.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 18px;">\\'' + escapeHtml(distName) + '\\' জেলায় কোনো উপজেলা যুক্ত নেই। নতুন উপজেলা যোগ করুন।</td></tr>';
                return;
            }

            tbody.innerHTML = upzKeys.map((upz, i) => {
                const node = upzs[upz] || {};
                const unionCount = (node.unions || []).length;
                const postCount = (node.posts || []).length;
                return '<tr>' +
                    '<td style="text-align: center; font-weight: 700;">' + (i + 1) + '</td>' +
                    '<td><strong>' + escapeHtml(upz) + '</strong></td>' +
                    '<td style="text-align: center;"><span style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 0.80rem;">' + unionCount + ' টি ইউনিয়ন</span></td>' +
                    '<td style="text-align: center;"><span style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 0.80rem;">' + postCount + ' টি ডাকঘর</span></td>' +
                    '<td style="text-align: center;">' +
                        '<button type="button" class="btn-danger" style="padding: 5px 12px; font-size: 0.80rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="deleteGeoUpazila(\\'' + escapeHtml(divName) + '\\', \\'' + escapeHtml(distName) + '\\', \\'' + escapeHtml(upz) + '\\')">' +
                            '🗑️ বাতিল' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function addGeoUpazila(e) {
            e.preventDefault();
            const divName = document.getElementById('geoFilterDivForUpz') ? document.getElementById('geoFilterDivForUpz').value : '';
            const distName = document.getElementById('geoFilterDistForUpz') ? document.getElementById('geoFilterDistForUpz').value : '';
            const input = document.getElementById('newGeoUpazilaName');
            const upzName = input ? input.value.trim() : '';

            if (!divName || !distName) {
                alert('অনুগ্রহ করে বিভাগ ও জেলা নির্বাচন করুন!');
                return;
            }
            if (!upzName) return;

            const data = getAdmissionGeoData();
            if (!data[divName]) data[divName] = {};
            if (!data[divName][distName]) data[divName][distName] = {};
            if (data[divName][distName][upzName]) {
                alert("'" + upzName + "' উপজেলাটি '" + distName + "' জেলায় ইতিমধ্যে রয়েছে!");
                return;
            }

            data[divName][distName][upzName] = { unions: [upzName + ' সদর', upzName + ' পৌরসভা'], posts: [upzName + ' প্রধান ডাকঘর'] };
            saveAdmissionGeoData(data, "✅ '" + upzName + "' উপজেলা '" + distName + "' জেলায় সফলভাবে যুক্ত হয়েছে!");
            if (input) input.value = '';
            populateAllGeoDropdownFilters();
            renderUpazilasManager();
        }

        function deleteGeoUpazila(divName, distName, upzName) {
            if (!confirm("আপনি কি নিশ্চিত যে '" + distName + "' জেলার '" + upzName + "' উপজেলাটি বাতিল করতে চান?")) return;
            const data = getAdmissionGeoData();
            if (data[divName] && data[divName][distName] && data[divName][distName][upzName]) {
                delete data[divName][distName][upzName];
                saveAdmissionGeoData(data, "🗑️ '" + upzName + "' উপজেলা বাতিল করা হয়েছে!");
                populateAllGeoDropdownFilters();
                renderUpazilasManager();
            }
        }

        // --- LEVEL 4: UNION CRUD ---
        function renderUnionsManager() {
            const data = getAdmissionGeoData();
            const divName = document.getElementById('geoFilterDivForUnion') ? document.getElementById('geoFilterDivForUnion').value : '';
            const distName = document.getElementById('geoFilterDistForUnion') ? document.getElementById('geoFilterDistForUnion').value : '';
            const upzName = document.getElementById('geoFilterUpzForUnion') ? document.getElementById('geoFilterUpzForUnion').value : '';
            const tbody = document.getElementById('geoUnionListTbody');
            const heading = document.getElementById('geoUnionListHeading');
            if (!tbody) return;

            if (heading) heading.textContent = '📋 ' + (upzName ? "'" + upzName + "' উপজেলার " : '') + 'ইউনিয়ন ও পৌরসভাসমূহ';

            const node = (data[divName] && data[divName][distName] && data[divName][distName][upzName]) ? data[divName][distName][upzName] : null;
            const unions = node && Array.isArray(node.unions) ? node.unions : [];

            if (unions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 18px;">\\'' + escapeHtml(upzName) + '\\' উপজেলায় কোনো ইউনিয়ন যুক্ত নেই। বামের ফর্ম থেকে নতুন ইউনিয়ন যুক্ত করুন।</td></tr>';
                return;
            }

            tbody.innerHTML = unions.map((un, i) => {
                return '<tr>' +
                    '<td style="text-align: center; font-weight: 700;">' + (i + 1) + '</td>' +
                    '<td><strong>' + escapeHtml(un) + '</strong></td>' +
                    '<td style="text-align: center;">' +
                        '<button type="button" class="btn-danger" style="padding: 5px 12px; font-size: 0.80rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="deleteGeoUnion(\\'' + escapeHtml(divName) + '\\', \\'' + escapeHtml(distName) + '\\', \\'' + escapeHtml(upzName) + '\\', \\'' + escapeHtml(un) + '\\')">' +
                            '🗑️ বাতিল' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function addGeoUnion(e) {
            e.preventDefault();
            const divName = document.getElementById('geoFilterDivForUnion') ? document.getElementById('geoFilterDivForUnion').value : '';
            const distName = document.getElementById('geoFilterDistForUnion') ? document.getElementById('geoFilterDistForUnion').value : '';
            const upzName = document.getElementById('geoFilterUpzForUnion') ? document.getElementById('geoFilterUpzForUnion').value : '';
            const input = document.getElementById('newGeoUnionName');
            const unionName = input ? input.value.trim() : '';

            if (!divName || !distName || !upzName) {
                alert('অনুগ্রহ করে বিভাগ, জেলা ও উপজেলা নির্বাচন করুন!');
                return;
            }
            if (!unionName) return;

            const data = getAdmissionGeoData();
            if (!data[divName] || !data[divName][distName] || !data[divName][distName][upzName]) {
                alert('নির্বাচিত উপজেলা পাওয়া যায়নি!');
                return;
            }

            if (!Array.isArray(data[divName][distName][upzName].unions)) {
                data[divName][distName][upzName].unions = [];
            }

            if (data[divName][distName][upzName].unions.includes(unionName)) {
                alert("'" + unionName + "' ইউনিয়নটি ইতিমধ্যে তালিকায় রয়েছে!");
                return;
            }

            data[divName][distName][upzName].unions.push(unionName);
            saveAdmissionGeoData(data, "✅ '" + unionName + "' ইউনিয়ন '" + upzName + "' উপজেলায় সফলভাবে যুক্ত হয়েছে!");
            if (input) input.value = '';
            renderUnionsManager();
        }

        function deleteGeoUnion(divName, distName, upzName, unionName) {
            if (!confirm("আপনি কি নিশ্চিত যে '" + unionName + "' ইউনিয়নটি বাতিল করতে চান?")) return;
            const data = getAdmissionGeoData();
            if (data[divName] && data[divName][distName] && data[divName][distName][upzName]) {
                const arr = data[divName][distName][upzName].unions || [];
                data[divName][distName][upzName].unions = arr.filter(u => u !== unionName);
                saveAdmissionGeoData(data, "🗑️ '" + unionName + "' ইউনিয়ন বাতিল করা হয়েছে!");
                renderUnionsManager();
            }
        }

        // --- LEVEL 5: POST OFFICE CRUD ---
        function renderPostsManager() {
            const data = getAdmissionGeoData();
            const divName = document.getElementById('geoFilterDivForPost') ? document.getElementById('geoFilterDivForPost').value : '';
            const distName = document.getElementById('geoFilterDistForPost') ? document.getElementById('geoFilterDistForPost').value : '';
            const upzName = document.getElementById('geoFilterUpzForPost') ? document.getElementById('geoFilterUpzForPost').value : '';
            const tbody = document.getElementById('geoPostListTbody');
            const heading = document.getElementById('geoPostListHeading');
            if (!tbody) return;

            if (heading) heading.textContent = '📋 ' + (upzName ? "'" + upzName + "' উপজেলার " : '') + 'ডাকঘর ও পোস্ট কোডসমূহ';

            const node = (data[divName] && data[divName][distName] && data[divName][distName][upzName]) ? data[divName][distName][upzName] : null;
            const posts = node && Array.isArray(node.posts) ? node.posts : [];

            if (posts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 18px;">\\'' + escapeHtml(upzName) + '\\' উপজেলায় কোনো ডাকঘর যুক্ত নেই। বামের ফর্ম থেকে নতুন ডাকঘর যোগ করুন।</td></tr>';
                return;
            }

            tbody.innerHTML = posts.map((po, i) => {
                return '<tr>' +
                    '<td style="text-align: center; font-weight: 700;">' + (i + 1) + '</td>' +
                    '<td><strong>' + escapeHtml(po) + '</strong></td>' +
                    '<td style="text-align: center;">' +
                        '<button type="button" class="btn-danger" style="padding: 5px 12px; font-size: 0.80rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="deleteGeoPost(\\'' + escapeHtml(divName) + '\\', \\'' + escapeHtml(distName) + '\\', \\'' + escapeHtml(upzName) + '\\', \\'' + escapeHtml(po) + '\\')">' +
                            '🗑️ বাতিল' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function addGeoPost(e) {
            e.preventDefault();
            const divName = document.getElementById('geoFilterDivForPost') ? document.getElementById('geoFilterDivForPost').value : '';
            const distName = document.getElementById('geoFilterDistForPost') ? document.getElementById('geoFilterDistForPost').value : '';
            const upzName = document.getElementById('geoFilterUpzForPost') ? document.getElementById('geoFilterUpzForPost').value : '';
            const input = document.getElementById('newGeoPostName');
            const postName = input ? input.value.trim() : '';

            if (!divName || !distName || !upzName) {
                alert('অনুগ্রহ করে বিভাগ, জেলা ও উপজেলা নির্বাচন করুন!');
                return;
            }
            if (!postName) return;

            const data = getAdmissionGeoData();
            if (!data[divName] || !data[divName][distName] || !data[divName][distName][upzName]) {
                alert('নির্বাচিত উপজেলা পাওয়া যায়নি!');
                return;
            }

            if (!Array.isArray(data[divName][distName][upzName].posts)) {
                data[divName][distName][upzName].posts = [];
            }

            if (data[divName][distName][upzName].posts.includes(postName)) {
                alert("'" + postName + "' ডাকঘরটি ইতিমধ্যে তালিকায় রয়েছে!");
                return;
            }

            data[divName][distName][upzName].posts.push(postName);
            saveAdmissionGeoData(data, "✅ '" + postName + "' ডাকঘর '" + upzName + "' উপজেলায় সফলভাবে যুক্ত হয়েছে!");
            if (input) input.value = '';
            renderPostsManager();
        }

        function deleteGeoPost(divName, distName, upzName, postName) {
            if (!confirm("আপনি কি নিশ্চিত যে '" + postName + "' ডাকঘরটি বাতিল করতে চান?")) return;
            const data = getAdmissionGeoData();
            if (data[divName] && data[divName][distName] && data[divName][distName][upzName]) {
                const arr = data[divName][distName][upzName].posts || [];
                data[divName][distName][upzName].posts = arr.filter(p => p !== postName);
                saveAdmissionGeoData(data, "🗑️ '" + postName + "' ডাকঘর বাতিল করা হয়েছে!");
                renderPostsManager();
            }
        }

        // --- BACKUP / RESTORE / EXPORT / IMPORT ---
        function resetAdmissionGeoDataToDefault() {
            if (!confirm('আপনি কি নিশ্চিত যে ঠিকানা সংক্রান্ত তথ্য ডিফল্ট অবস্থায় রিস্টোর করতে চান? এতে কাস্টম যোগ করা তথ্যগুলো রিসেট হয়ে যাবে।')) return;
            localStorage.setItem('bd_geo_admission_data', JSON.stringify(DEFAULT_BD_GEO_DATA));
            showGeoSuccessToast('✅ ডিফল্ট ঠিকানা তথ্য সফলভাবে রিস্টোর হয়েছে!');
            initAdmissionAddressManager();
        }

        function exportGeoDataJson() {
            try {
                const data = getAdmissionGeoData();
                const jsonStr = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'admission_address_geo_data_' + new Date().toISOString().slice(0, 10) + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                alert('এক্সপোর্ট ব্যর্থ: ' + e.message);
            }
        }

        function importGeoDataJson(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        localStorage.setItem('bd_geo_admission_data', JSON.stringify(parsed));
                        alert('✅ ঠিকানা সংক্রান্ত ডেটা ফাইল থেকে সফলভাবে ইমপোর্ট ও রিস্টোর করা হয়েছে!');
                        initAdmissionAddressManager();
                    } else {
                        alert('অবৈধ JSON ফাইল স্ট্রাকচার!');
                    }
                } catch (err) {
                    alert('JSON ফাইল পড়তে সমস্যা হয়েছে: ' + err.message);
                }
            };
            reader.readAsText(file);
        }

        function initAdmissionAddressManager() {
            renderGeoStatsCounters();
            populateAllGeoDropdownFilters();
            renderDivisionsManager();
            renderDistrictsManager();
            renderUpazilasManager();
            renderUnionsManager();
            renderPostsManager();
        }
"""

if 'function initAdmissionAddressManager' not in adv_content:
    adv_content = adv_content.replace(
        'window.initCmsPortalSection = initCmsPortalSection;',
        js_logic + '\n        window.initCmsPortalSection = initCmsPortalSection;\n' +
        '        window.initAdmissionAddressManager = initAdmissionAddressManager;\n' +
        '        window.switchGeoLevelTab = switchGeoLevelTab;\n' +
        '        window.addGeoDivision = addGeoDivision;\n' +
        '        window.deleteGeoDivision = deleteGeoDivision;\n' +
        '        window.addGeoDistrict = addGeoDistrict;\n' +
        '        window.deleteGeoDistrict = deleteGeoDistrict;\n' +
        '        window.addGeoUpazila = addGeoUpazila;\n' +
        '        window.deleteGeoUpazila = deleteGeoUpazila;\n' +
        '        window.addGeoUnion = addGeoUnion;\n' +
        '        window.deleteGeoUnion = deleteGeoUnion;\n' +
        '        window.addGeoPost = addGeoPost;\n' +
        '        window.deleteGeoPost = deleteGeoPost;\n' +
        '        window.resetAdmissionGeoDataToDefault = resetAdmissionGeoDataToDefault;\n' +
        '        window.exportGeoDataJson = exportGeoDataJson;\n' +
        '        window.importGeoDataJson = importGeoDataJson;\n'
    )

with open('advance.html', 'w', encoding='utf-8') as f:
    f.write(adv_content)

print("advance.html successfully updated!")
