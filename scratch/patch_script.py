import re

with open('scratch/script_7.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Helper functions at top
hook_needle = "const state = {"
hook_pos = js.find(hook_needle)
assert hook_pos != -1
state_end_pos = js.find("};\n", hook_pos) + 3

global_helpers = """
    // Expose Global Action Handlers Immediately
    window.handleBlankOmrClick = function() {
      window.open('2O2mr.html', '_blank');
      if (typeof showToast === 'function') {
        showToast('ব্লাংক OMR শিট নতুন ট্যাবে ওপেন হচ্ছে...', 'info', 'fa-file-arrow-down');
      }
    };

    window.openAnswerKeyModalDirect = function() {
      if (typeof selectAnswerKeySet === 'function') {
        selectAnswerKeySet(state.currentEditingKeySet || 'ক');
      }
      const m = document.getElementById('modalAnswerKey');
      if (m) {
        m.classList.add('active');
        m.style.display = 'flex';
      }
      if (window.switchKeyModalTab) {
        window.switchKeyModalTab(state && state.uploadedKeyPreview ? 'source' : 'bubble');
      }
    };

    window.closeAnswerKeyModalDirect = function() {
      const m = document.getElementById('modalAnswerKey');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    };

    window.closeStudentEditModal = function() {
      const m = document.getElementById('modalViewEdit');
      if (m) {
        m.classList.remove('active');
        m.style.display = 'none';
      }
    };
"""
js = js[:state_end_pos] + global_helpers + js[state_end_pos:]

# 2. Export showToast
js = js.replace("function showToast(message, type = 'info', icon = 'fa-info-circle') {", 
                "window.showToast = function showToast(message, type = 'info', icon = 'fa-info-circle') {")

# 3. Guard editSet
old_edit_set = """    editSet.addEventListener('change', () => {
      if (!state.tempEditStudent) return;
      state.tempEditStudent.set = editSet.value;
      updateModalScorePreview();
      renderModalOmrBubbles();
    });"""

new_edit_set = """    if (editSet) {
      editSet.addEventListener('change', () => {
        if (!state.tempEditStudent) return;
        state.tempEditStudent.set = editSet.value;
        updateModalScorePreview();
        renderModalOmrBubbles();
      });
    }"""
js = js.replace(old_edit_set, new_edit_set)

# 4. Guard btnSaveEdit
pos_save_edit = js.find("btnSaveEdit.addEventListener('click', () => {")
assert pos_save_edit != -1
pos_close_modals = js.find("[btnCloseModal, btnCancelEdit].forEach(", pos_save_edit)
assert pos_close_modals != -1
block_save_edit = js[pos_save_edit:pos_close_modals]
new_block_save_edit = "if (btnSaveEdit) {\n      " + block_save_edit.strip() + "\n    }\n\n    "
js = js[:pos_save_edit] + new_block_save_edit + js[pos_close_modals:]

# 5. Guard close modal buttons
old_close_edit = """[btnCloseModal, btnCancelEdit].forEach(el => {
      el.addEventListener('click', () => { modalViewEdit.style.display = 'none'; });
    });"""
new_close_edit = """[btnCloseModal, btnCancelEdit].forEach(el => {
      if (el) {
        el.addEventListener('click', () => {
          if (modalViewEdit) {
            modalViewEdit.style.display = 'none';
            modalViewEdit.classList.remove('active');
          }
        });
      }
    });"""
js = js.replace(old_close_edit, new_close_edit)

# 6. Guard btnOpenKeyModal
old_open_key = """btnOpenKeyModal.addEventListener('click', () => {
      selectAnswerKeySet(state.currentEditingKeySet || 'ক');
      modalAnswerKey.style.display = 'flex';
      if (window.switchKeyModalTab) {
        window.switchKeyModalTab(state.uploadedKeyPreview ? 'source' : 'bubble');
      }
    });"""
new_open_key = """if (btnOpenKeyModal) {
      btnOpenKeyModal.addEventListener('click', () => {
        window.openAnswerKeyModalDirect();
      });
    }"""
js = js.replace(old_open_key, new_open_key)

# 7. Guard btnCloseKeyModal
old_close_key = """btnCloseKeyModal.addEventListener('click', () => {
      modalAnswerKey.style.display = 'none';
    });"""
new_close_key = """if (btnCloseKeyModal) {
      btnCloseKeyModal.addEventListener('click', () => {
        window.closeAnswerKeyModalDirect();
      });
    }"""
js = js.replace(old_close_key, new_close_key)

# 8. Guard btnSaveAnswerKeys
pos_save_keys = js.find("btnSaveAnswerKeys.addEventListener('click', () => {")
assert pos_save_keys != -1
pos_export_excel = js.find("btnExportExcel.addEventListener('click', () => {", pos_save_keys)
assert pos_export_excel != -1
block_save_keys = js[pos_save_keys:pos_export_excel]
new_block_save_keys = "if (btnSaveAnswerKeys) {\n      " + block_save_keys.strip().replace(
    "modalAnswerKey.style.display = 'none';",
    "modalAnswerKey.style.display = 'none';\n        modalAnswerKey.classList.remove('active');"
) + "\n    }\n\n    "
js = js[:pos_save_keys] + new_block_save_keys + js[pos_export_excel:]

# 9. Guard btnDownloadBlankOMR
pos_blank = js.find("btnDownloadBlankOMR.addEventListener('click', () => {")
assert pos_blank != -1
pos_reset = js.find("// Reset All Data", pos_blank)
assert pos_reset != -1
new_blank_block = """if (btnDownloadBlankOMR) {
      btnDownloadBlankOMR.addEventListener('click', () => {
        window.handleBlankOmrClick();
      });
    }

    """
js = js[:pos_blank] + new_blank_block + js[pos_reset:]

# 10. Update modalViewEdit display in renderModalOmrBubbles or open
js = js.replace("modalViewEdit.style.display = 'flex';", "modalViewEdit.style.display = 'flex'; modalViewEdit.classList.add('active');")
js = js.replace("modalViewEdit.style.display = 'none';", "modalViewEdit.style.display = 'none'; modalViewEdit.classList.remove('active');")

# 11. Clear message in saveOmrToExamsApi
old_save_empty = "showToast('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর ফলাফল নেই', 'warning');"
new_save_empty = "showToast('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর ওএমআর ফলাফল নেই। অনুগ্রহ করে প্রথমে ওএমআর শিট মূল্যায়ন করুন অথবা \"নমুনা ডেটা লোড করুন\" বাটনে ক্লিক করুন।', 'warning', 'fa-triangle-exclamation');"
js = js.replace(old_save_empty, new_save_empty)

with open('scratch/script_7_fixed.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Saved script_7_fixed.js successfully.")
