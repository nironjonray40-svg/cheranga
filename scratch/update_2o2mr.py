with open('2O2mr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make backup
with open('2O2mr.html.bak', 'w', encoding='utf-8') as f:
    f.write(html)

# 1. Update CSS for header
old_css = """  /* School Header */
  .header {
    text-align: center;
    margin-bottom: 6px;
  }

  .header h1 {
    font-family: 'Kalpurush', 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 900;
    color: var(--omr-pink);
    letter-spacing: 0.8px;
    margin-bottom: 2px;
    text-transform: uppercase;
  }

  .header p {
    font-family: 'Kalpurush', 'Times New Roman', serif;
    font-size: 13px;
    font-weight: bold;
    color: var(--omr-pink);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }"""

new_css = """  /* School Header */
  .header {
    text-align: center;
    margin-bottom: 6px;
    overflow: hidden;
  }

  .header h1 {
    font-family: 'Kalpurush', 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 900;
    color: var(--omr-pink);
    letter-spacing: 0.8px;
    margin-bottom: 2px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.15;
  }

  .header p {
    font-family: 'Kalpurush', 'Times New Roman', serif;
    font-size: 13px;
    font-weight: bold;
    color: var(--omr-pink);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }"""

assert old_css in html, "old_css not found in 2O2mr.html"
html = html.replace(old_css, new_css, 1)

# 2. Add classes to Left and Right headers
old_header = """    <!-- School Header -->
    <div class="header">
      <h1>আলহেরা এডুকেয়ার হোম হাই স্কুল</h1>
      <p>জলঢাকা, নীলফামারী</p>
    </div>"""

new_header = """    <!-- School Header -->
    <div class="header">
      <h1 class="omr-school-name">আলহেরা এডুকেয়ার হোম হাই স্কুল</h1>
      <p class="omr-school-address">জলঢাকা, নীলফামারী</p>
    </div>"""

count = html.count(old_header)
print(f"Found {count} instances of old_header")
assert count == 2, f"Expected 2 headers, found {count}"
html = html.replace(old_header, new_header)

# 3. Add client-side sync script before </body>
sync_script = """
<!-- REAL-TIME INSTITUTION PROFILE SYNC (Preserving 100% Original Design) -->
<script id="omr-institution-sync">
(function() {
  function getSchoolData() {
    var settings = null;
    try {
      if (window.__SERVER_SYNC_DATA__ && window.__SERVER_SYNC_DATA__.school_settings) {
        var raw = window.__SERVER_SYNC_DATA__.school_settings;
        settings = typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
    } catch(e) {}
    if (!settings) {
      try {
        var raw = localStorage.getItem('school_settings');
        if (raw) settings = JSON.parse(raw);
      } catch(e) {}
    }
    if (!settings) {
      try {
        var raw = sessionStorage.getItem('school_settings');
        if (raw) settings = JSON.parse(raw);
      } catch(e) {}
    }
    return settings;
  }

  function adjustFontSizeToFit(el, maxFontSize) {
    if (!el) return;
    el.style.fontSize = maxFontSize + 'px';
    var minFontSize = 13;
    var currentSize = maxFontSize;
    while (el.scrollWidth > el.clientWidth && currentSize > minFontSize) {
      currentSize -= 1;
      el.style.fontSize = currentSize + 'px';
    }
  }

  function applySchoolInfo(settings) {
    if (!settings) return;
    var name = settings.schoolSubtitle || settings.schoolName || '';
    var addr = settings.schoolAddress || '';
    
    if (name) {
      document.title = 'ওএমআর শিট - ' + name;
      var nameEls = document.querySelectorAll('.omr-school-name');
      nameEls.forEach(function(el) {
        el.textContent = name;
        adjustFontSizeToFit(el, 24);
      });
    }

    if (addr) {
      var addrEls = document.querySelectorAll('.omr-school-address');
      addrEls.forEach(function(el) {
        el.textContent = addr;
        adjustFontSizeToFit(el, 13);
      });
    }
  }

  // 1. Initial application
  var initial = getSchoolData();
  if (initial) applySchoolInfo(initial);

  // 2. Fetch fresh data from ERP API in real-time
  try {
    fetch('/api/db?keys=school_settings')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.school_settings) {
          var fresh = typeof data.school_settings === 'string' ? JSON.parse(data.school_settings) : data.school_settings;
          applySchoolInfo(fresh);
        }
      })
      .catch(function() {});
  } catch(e) {}

  // 3. Real-time sync when settings change in another tab
  window.addEventListener('storage', function(e) {
    if (!e.key || e.key === 'school_settings') {
      var s = getSchoolData();
      if (s) applySchoolInfo(s);
    }
  });

  // 4. Guarantee latest school info right before printing
  window.addEventListener('beforeprint', function() {
    var s = getSchoolData();
    if (s) applySchoolInfo(s);
  });
})();
</script>
</body>"""

assert "</body>" in html, "</body> not found in 2O2mr.html"
html = html.replace("</body>", sync_script, 1)

with open('2O2mr.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("2O2mr.html updated successfully!")
