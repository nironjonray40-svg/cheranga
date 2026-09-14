
// BLOCK 2

        // --- CONTACT FORM SUBMISSION ---
        function sendContactMessage(event) {
            event.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const msg = document.getElementById('contact-msg').value;

            // Save to localStorage database
            let messages = localStorage.getItem('contact_messages');
            if (messages) {
                try {
                    messages = JSON.parse(messages);
                } catch (e) {
                    messages = [];
                }
            } else {
                messages = [];
            }

            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const timestamp = new Date().toLocaleDateString('en-US', options);

            messages.unshift({
                name: name,
                email: email,
                message: msg,
                date: timestamp
            });

            localStorage.setItem('contact_messages', JSON.stringify(messages));

            // Simulate sending message
            document.getElementById('contact-success-msg').style.display = "block";
            document.getElementById('contact-form').reset();

            setTimeout(() => {
                const el = document.getElementById('contact-success-msg');
                if (el) el.style.display = "none";
            }, 6000);
        }
    