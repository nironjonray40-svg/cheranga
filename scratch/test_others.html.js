
// BLOCK 1

            // --- DEFAULT SEED DATA ---
            const defaultClubs = [
                { id: 'club_1', name: 'Science Club', color: 'var(--neon-purple)', desc: 'This club constantly works on creating new scientific projects and discoveries.' },
                { id: 'club_2', name: 'Debate Society', color: 'var(--neon-cyan)', desc: 'Organizes regular debate sessions and tournaments to foster rational speakers.' },
                { id: 'club_3', name: 'Sports Club', color: 'var(--neon-pink)', desc: 'Committed to building top-tier sports teams in football, cricket, and indoor games.' },
                { id: 'club_4', name: 'Cultural Club', color: 'var(--neon-green)', desc: 'Nurturing talents through practice in music, dance, recitation, and drama.' }
            ];

            const defaultGallery = [
                { id: 'gal_1', title: 'Annual Sports Competition', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop' },
                { id: 'gal_2', title: 'Science & Technology Fair', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop' },
                { id: 'gal_3', title: 'Multimedia Class Session', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop' },
                { id: 'gal_4', title: 'Computer Lab Practice', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' },
                { id: 'gal_5', title: 'Inter-class Debate Session', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
                { id: 'gal_6', title: 'Well-equipped School Library', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop' }
            ];

            // --- LOCAL STORAGE HELPERS ---
            function getStoredClubs() {
                const data = localStorage.getItem('school_others_clubs');
                if (!data) {
                    localStorage.setItem('school_others_clubs', JSON.stringify(defaultClubs));
                    return defaultClubs;
                }
                try { return JSON.parse(data); } catch (e) { return defaultClubs; }
            }

            function saveStoredClubs(clubs) {
                localStorage.setItem('school_others_clubs', JSON.stringify(clubs));
                renderClubs();
            }

            function getStoredGallery() {
                const data = localStorage.getItem('school_others_gallery');
                if (!data) {
                    localStorage.setItem('school_others_gallery', JSON.stringify(defaultGallery));
                    return defaultGallery;
                }
                try { return JSON.parse(data); } catch (e) { return defaultGallery; }
            }

            function saveStoredGallery(gallery) {
                localStorage.setItem('school_others_gallery', JSON.stringify(gallery));
                renderGallery();
            }

            // --- RENDERING FUNCTIONS ---
            function renderClubs() {
                const container = document.getElementById('clubs-grid-container');
                if (!container) return;
                const clubs = getStoredClubs();
                container.innerHTML = clubs.map(club => `
                    <div class="stat-card" style="border-color:${club.color || 'var(--neon-purple)'}; position:relative; padding-top:40px; text-align:left;">
                        <div style="position:absolute; top:10px; right:10px; display:flex; gap:6px;">
                            <button onclick="openEditClubModal('${club.id}')" title="Edit Club" style="background:rgba(34,211,238,0.15); border:1px solid rgba(34,211,238,0.3); color:#22d3ee; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                <span>Edit</span>
                            </button>
                            <button onclick="deleteClub('${club.id}')" title="Delete Club" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                <span>Delete</span>
                            </button>
                        </div>
                        <div class="stat-number" style="font-size:1.4rem; color:${club.color || 'var(--neon-purple)'}; font-weight:700;">${escapeHtml(club.name)}</div>
                        <p style="font-size:0.85rem; color:var(--muted-text); margin-top:8px; line-height:1.4;">${escapeHtml(club.desc)}</p>
                    </div>
                `).join('');
            }

            function renderGallery() {
                const container = document.getElementById('gallery-grid-container');
                if (!container) return;
                const gallery = getStoredGallery();
                container.innerHTML = gallery.map(item => `
                    <div class="gallery-card" style="background:#140c33; border:1px solid rgba(255,255,255,0.15); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                        <div style="position:relative; width:100%; height:200px; overflow:hidden;">
                            <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop'">
                            <div style="position:absolute; top:10px; right:10px; display:flex; gap:6px; z-index:2;">
                                <button onclick="openEditGalleryModal('${item.id}')" title="Edit Photo" style="background:rgba(34,211,238,0.3); border:1px solid rgba(34,211,238,0.5); color:#fff; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px; backdrop-filter:blur(4px);">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    <span>Edit</span>
                                </button>
                                <button onclick="deleteGalleryItem('${item.id}')" title="Delete Photo" style="background:rgba(239,68,68,0.3); border:1px solid rgba(239,68,68,0.5); color:#fff; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px; backdrop-filter:blur(4px);">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                        <div style="padding:12px 14px; background:#1a103c; border-top:1px solid rgba(255,255,255,0.1); text-align:center;">
                            <div style="font-size:0.95rem; color:#ffffff; font-weight:600; line-height:1.3;">${escapeHtml(item.title)}</div>
                        </div>
                    </div>
                `).join('');
            }

            function escapeHtml(str) {
                if (!str) return '';
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }

            // --- CLUB MODAL HANDLERS ---
            function openAddClubModal() {
                document.getElementById('club-modal-title').textContent = 'Add New Club';
                document.getElementById('club-edit-id').value = '';
                document.getElementById('club-name-input').value = '';
                document.getElementById('club-color-input').value = 'var(--neon-purple)';
                document.getElementById('club-desc-input').value = '';
                document.getElementById('club-modal-overlay').style.display = 'flex';
            }

            function openEditClubModal(id) {
                const clubs = getStoredClubs();
                const club = clubs.find(c => c.id === id);
                if (!club) return;
                document.getElementById('club-modal-title').textContent = 'Edit Club';
                document.getElementById('club-edit-id').value = club.id;
                document.getElementById('club-name-input').value = club.name || '';
                document.getElementById('club-color-input').value = club.color || 'var(--neon-purple)';
                document.getElementById('club-desc-input').value = club.desc || '';
                document.getElementById('club-modal-overlay').style.display = 'flex';
            }

            function closeClubModal() {
                document.getElementById('club-modal-overlay').style.display = 'none';
            }

            function saveClubForm(e) {
                e.preventDefault();
                const id = document.getElementById('club-edit-id').value;
                const name = document.getElementById('club-name-input').value.trim();
                const color = document.getElementById('club-color-input').value;
                const desc = document.getElementById('club-desc-input').value.trim();

                if (!name || !desc) return;

                let clubs = getStoredClubs();
                if (id) {
                    const idx = clubs.findIndex(c => c.id === id);
                    if (idx !== -1) {
                        clubs[idx] = { id, name, color, desc };
                    }
                } else {
                    const newId = 'club_' + Date.now();
                    clubs.push({ id: newId, name, color, desc });
                }

                saveStoredClubs(clubs);
                closeClubModal();
            }

            function deleteClub(id) {
                if (!confirm('Are you sure you want to delete this club?')) return;
                let clubs = getStoredClubs().filter(c => c.id !== id);
                saveStoredClubs(clubs);
            }

            // --- GALLERY MODAL HANDLERS ---
            function openAddGalleryModal() {
                document.getElementById('gallery-modal-title').textContent = 'Add New Photo';
                document.getElementById('gallery-edit-id').value = '';
                document.getElementById('gallery-title-input').value = '';
                document.getElementById('gallery-url-input').value = '';
                document.getElementById('gallery-modal-overlay').style.display = 'flex';
            }

            function openEditGalleryModal(id) {
                const gallery = getStoredGallery();
                const item = gallery.find(g => g.id === id);
                if (!item) return;
                document.getElementById('gallery-modal-title').textContent = 'Edit Photo';
                document.getElementById('gallery-edit-id').value = item.id;
                document.getElementById('gallery-title-input').value = item.title || '';
                document.getElementById('gallery-url-input').value = item.url || '';
                document.getElementById('gallery-modal-overlay').style.display = 'flex';
            }

            function closeGalleryModal() {
                document.getElementById('gallery-modal-overlay').style.display = 'none';
            }

            function saveGalleryForm(e) {
                e.preventDefault();
                const id = document.getElementById('gallery-edit-id').value;
                const title = document.getElementById('gallery-title-input').value.trim();
                const url = document.getElementById('gallery-url-input').value.trim();

                if (!title || !url) return;

                let gallery = getStoredGallery();
                if (id) {
                    const idx = gallery.findIndex(g => g.id === id);
                    if (idx !== -1) {
                        gallery[idx] = { id, title, url };
                    }
                } else {
                    const newId = 'gal_' + Date.now();
                    gallery.push({ id: newId, title, url });
                }

                saveStoredGallery(gallery);
                closeGalleryModal();
            }

            function deleteGalleryItem(id) {
                if (!confirm('Are you sure you want to delete this photo?')) return;
                let gallery = getStoredGallery().filter(g => g.id !== id);
                saveStoredGallery(gallery);
            }

            // Initial render on load
            document.addEventListener('DOMContentLoaded', () => {
                renderClubs();
                renderGallery();
            });
        