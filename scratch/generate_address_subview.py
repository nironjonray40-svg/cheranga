# Python script to generate address manager HTML and JS for advance.html

address_subview_html = '''
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

print("Address subview HTML generated with length:", len(address_subview_html))
