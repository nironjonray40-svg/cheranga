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
                    term: termName,
                    examType: examType,
                    subject: subject,
                    date: date,
                    teacher: teacher,
                    slNo: slNo
                };
                schedules.push(newSchedule);
                alert("Exam Schedule Routine added successfully!");
            }
            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
            if (termName) {
                localStorage.setItem('school_active_exam_filter', termName);
            }
            try {
                window.dispatchEvent(new CustomEvent('dbSynced'));
            } catch (e) { }

            resetScheduleForm();
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
            toggleCreateScheduleForm();
        }

        function deleteExamSchedule(id) {
            if (!confirm("Are you sure you want to delete this schedule?")) return;
            const schedules = loadSchedules();
            const filtered = schedules.filter(s => s.id !== id);
            localStorage.setItem('school_exam_schedules', JSON.stringify(filtered));
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
        }

        function resetScheduleForm() {
            document.getElementById('exam-schedule-form').reset();
            document.getElementById('schedule-edit-id').value = "";
            document.querySelector('#create-schedule-card .portal-form-title').innerText = "Create Exam Schedule";
            document.querySelector('#exam-schedule-form button[type="submit"]').innerText = "Save Schedule";

            const modeSwitcher = document.getElementById('schedule-mode-switcher');
            if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';

            // Clear checkbox styles
            document.querySelectorAll('input[name="schedule-section-check"]').forEach(cb => {
                cb.checked = false;
                toggleSectionBadgeStyle(cb);
            });
            setScheduleCreationMode('single');
            updateScheduleClassDependencies();
            populateScheduleExamTypesDropdown();
            updateScheduleDistLivePreview();
        }

        function editExamSchedule(id) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(id));
            if (!sch) return