value = prevVal;
            }
        }

        function saveExamSchedule(event) {
            event.preventDefault();
            const editId = document.getElementById('schedule-edit-id').value;
            const className = document.getElementById('schedule-class').value;

            // Get all checked sections
            const checkedBoxes = document.querySelectorAll('input[name="schedule-section-check"]:checked');
            if (checkedBoxes.length === 0) {
                alert("Please select at least one Section!");
                return;
            }
            const selectedSections = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

            const termName = document.getElementById('schedule-exam-name').value;
            const examType = document.getElementById('schedule-exam-type') ? document.getElementById('schedule-exam-type').value : '';
            const subject = document.getElementById('schedule-subject').value;
            const date = document.getElementById('schedule-date').value;
            const teacher = document.getElementById('schedule-teacher').value.trim();
            const slNo = document.getElementById('schedule-sl-no').value.trim();

            if (!subject) {
                alert("Please select a subject. If none exist, add subjects in the All Subject tab first!");
                return;
            }

            let schedules = loadSchedules();
            if (editId) {
                const idx = schedules.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    const existingCreatedAt = schedules[idx].createdAt || schedules[idx].id;
                    schedules[idx] = {
                        ...schedules[idx],
                        id: editId,
                        class: className,
                        section: selectedSections,
                        term: termName,
                        examType: examType,
                        subject: subject,
                        date: date,
                        teacher: teacher,
                        slNo: slNo,
                        createdAt: existingCreatedAt
                    };
                }
                alert("Exam Schedule Routine updated successfully!");
            } else {
                const now = Date.now();
                const newSchedule = {
                    id: now.toString(),
                    createdAt: now,
                    class: className,
                    section: selectedSections,
                    term: 