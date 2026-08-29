/**
 * ADMIN PANEL LOGIC
 * Manages fleet CRUD operations and syncs with localStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Check if fleet data module is loaded
    if (typeof window.getFleetData !== 'function') {
        alert('Fleet Data module not found! Ensure fleet-data.js is loaded.');
        return;
    }

    let fleetData = window.getFleetData();
    let currentSearchTerm = '';

    // DOM Elements
    const kpiTotal = document.getElementById('kpiTotal');
    const kpiActive = document.getElementById('kpiActive');
    const kpiFreezer = document.getElementById('kpiFreezer');
    const kpiAluminum = document.getElementById('kpiAluminum');
    
    const tableBody = document.getElementById('vehicleTableBody');
    const tableSearch = document.getElementById('tableSearch');
    
    const adminModal = document.getElementById('adminModal');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const vehicleForm = document.getElementById('vehicleForm');
    const modalTitle = document.getElementById('modalTitle');

    // Form Inputs
    const editModeIndex = document.getElementById('editModeIndex');
    const vId = document.getElementById('vId');
    const vName = document.getElementById('vName');
    const vCategory = document.getElementById('vCategory');
    const vStatus = document.getElementById('vStatus');
    const vDesc = document.getElementById('vDesc');
    const sLength = document.getElementById('sLength');
    const sEngine = document.getElementById('sEngine');
    const sPayload = document.getElementById('sPayload');
    const sFreezer = document.getElementById('sFreezer');
    const sFuel = document.getElementById('sFuel');
    const sWheels = document.getElementById('sWheels');
    
    const imageUrlsContainer = document.getElementById('imageUrlsContainer');
    const addImageUrlBtn = document.getElementById('addImageUrlBtn');

    /**
     * Dynamic Image Link Builder
     */
    function createImageUrlRow(url = '') {
        const row = document.createElement('div');
        row.className = 'image-url-row';
        row.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 4px;';
        
        row.innerHTML = `
            <div style="width: 42px; height: 42px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-dark); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative;">
                <img class="img-preview" src="${url || ''}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" style="width:100%; height:100%; object-fit:cover; display:${url ? 'block' : 'none'};">
                <div class="img-fallback" style="display:${url ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; color:var(--text-muted);">
                    <i data-lucide="image" style="width:18px; height:18px;"></i>
                </div>
            </div>
            <input type="url" class="form-control image-url-input" value="${url}" placeholder="https://i.postimg.cc/..." style="flex: 1;">
            <button type="button" class="btn btn-danger remove-img-btn" style="padding: 8px 12px; border-radius: var(--radius-sm);" title="Remove Image">
                <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
            </button>
        `;

        const input = row.querySelector('.image-url-input');
        const imgPreview = row.querySelector('.img-preview');
        const imgFallback = row.querySelector('.img-fallback');
        const removeBtn = row.querySelector('.remove-img-btn');

        input.addEventListener('input', () => {
            const val = input.value.trim();
            if (val) {
                imgPreview.src = val;
            } else {
                imgPreview.style.display = 'none';
                if (imgFallback) imgFallback.style.display = 'flex';
            }
        });

        removeBtn.addEventListener('click', () => {
            const allRows = imageUrlsContainer.querySelectorAll('.image-url-row');
            if (allRows.length > 1) {
                row.remove();
            } else {
                input.value = '';
                imgPreview.style.display = 'none';
                if (imgFallback) imgFallback.style.display = 'flex';
            }
        });

        return row;
    }

    function renderImageUrlInputs(urlsArray = []) {
        if (!imageUrlsContainer) return;
        imageUrlsContainer.innerHTML = '';
        const list = (Array.isArray(urlsArray) && urlsArray.length > 0) ? urlsArray : [''];
        list.forEach(url => {
            imageUrlsContainer.appendChild(createImageUrlRow(url));
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    if (addImageUrlBtn) {
        addImageUrlBtn.addEventListener('click', () => {
            const newRow = createImageUrlRow('');
            imageUrlsContainer.appendChild(newRow);
            if (typeof lucide !== 'undefined') lucide.createIcons();
            const newInputs = imageUrlsContainer.querySelectorAll('.image-url-input');
            const lastInput = newInputs[newInputs.length - 1];
            if (lastInput) lastInput.focus();
        });
    }

    /**
     * Render Dashboard
     */
    function renderDashboard() {
        // Update KPIs
        kpiTotal.innerText = fleetData.length;
        kpiActive.innerText = fleetData.filter(v => v.status === 'active').length;
        kpiFreezer.innerText = fleetData.filter(v => v.category === 'freezer').length;
        kpiAluminum.innerText = fleetData.filter(v => v.category === 'aluminum').length;

        // Filter for table
        let displayData = fleetData;
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            displayData = fleetData.filter(v => 
                v.id.toLowerCase().includes(term) || 
                v.name.toLowerCase().includes(term)
            );
        }

        // Render Table
        tableBody.innerHTML = '';
        if (displayData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">No vehicles found.</td></tr>`;
        } else {
            displayData.forEach((vehicle, index) => {
                const globalIndex = fleetData.findIndex(v => v.id === vehicle.id);
                const statusClass = vehicle.status === 'active' ? 'status-active' : 'status-operation';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${vehicle.id}</strong></td>
                    <td>${vehicle.name}</td>
                    <td style="text-transform: capitalize;">${vehicle.type}</td>
                    <td><span class="status-badge ${statusClass}">${vehicle.statusLabel}</span></td>
                    <td class="text-right">
                        <button class="btn btn-outline edit-btn" data-index="${globalIndex}" style="padding: 4px 8px;"><i data-lucide="edit"></i> Edit</button>
                        <button class="btn btn-danger delete-btn" data-index="${globalIndex}" style="padding: 4px 8px; margin-left: 5px;"><i data-lucide="trash-2"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
        lucide.createIcons();
        attachTableListeners();
    }

    function attachTableListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                openModal(idx);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                    const idx = e.currentTarget.getAttribute('data-index');
                    const deletedVehicle = fleetData[idx];
                    fleetData.splice(idx, 1);
                    
                    if (deletedVehicle && deletedVehicle.id && typeof window.deleteVehicleFromNeon === 'function') {
                        try {
                            await window.deleteVehicleFromNeon(deletedVehicle.id);
                            console.log("Deleted vehicle from Neon DB:", deletedVehicle.id);
                        } catch (err) {
                            console.warn("Could not delete from Neon DB:", err);
                        }
                    }
                    
                    saveData();
                }
            });
        });
    }

    async function saveData(savedVehicle) {
        window.saveFleetData(fleetData);
        renderDashboard();
        window.dispatchEvent(new Event('fleetDataUpdated'));

        if (savedVehicle && typeof window.saveVehicleToNeon === 'function') {
            try {
                await window.saveVehicleToNeon(savedVehicle);
                console.log("Saved vehicle to Neon DB:", savedVehicle.id);
            } catch (err) {
                console.warn("Could not save to Neon DB:", err);
            }
        }
    }

    /**
     * Modal Logic
     */
    function openModal(index = -1) {
        if (index === -1) {
            // Add Mode
            modalTitle.innerText = "Add New Vehicle";
            editModeIndex.value = -1;
            vehicleForm.reset();
            if (sWheels) sWheels.value = "6 Nut Heavy Duty";
            renderImageUrlInputs(["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"]);
        } else {
            // Edit Mode
            modalTitle.innerText = "Edit Vehicle";
            editModeIndex.value = index;
            const v = fleetData[index];
            
            vId.value = v.id;
            vName.value = v.name;
            vCategory.value = v.category;
            vStatus.value = v.status;
            vDesc.value = v.description;
            
            sLength.value = v.specifications ? (v.specifications.bodyLength || '') : '';
            sEngine.value = v.specifications ? (v.specifications.engine || '') : '';
            sPayload.value = v.specifications ? (v.specifications.payloadCapacity || '') : '';
            sFreezer.value = v.specifications ? (v.specifications.freezer || '') : '';
            if (sFuel) sFuel.value = v.specifications ? (v.specifications.fuelType || 'Diesel') : 'Diesel';
            if (sWheels) sWheels.value = v.specifications ? (v.specifications.wheels || '6 Nut Heavy Duty') : '6 Nut Heavy Duty';
            
            renderImageUrlInputs(v.images || []);
        }
        
        adminModal.classList.add('active');
    }

    function closeModal() {
        adminModal.classList.remove('active');
    }

    addVehicleBtn.addEventListener('click', () => openModal(-1));
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Parse Images from Dynamic Inputs
        const imgInputs = document.querySelectorAll('.image-url-input');
        let imgArray = Array.from(imgInputs).map(i => i.value.trim()).filter(i => i.length > 0);
        if (imgArray.length === 0) {
            imgArray = ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"];
        }

        // Auto-format Units
        let formattedLength = sLength.value.trim();
        if (formattedLength && !/ft|feet|m/i.test(formattedLength)) formattedLength += ' ft';

        let formattedPayload = sPayload.value.trim();
        if (formattedPayload && !/ton|tons|t|kg/i.test(formattedPayload)) formattedPayload += ' Tons';

        let formattedFreezer = sFreezer.value.trim();
        if (vCategory.value !== 'freezer') {
            formattedFreezer = 'N/A (Dry Cargo)';
        } else if (formattedFreezer && !/°C|C|celsius/i.test(formattedFreezer) && /-?\d+/.test(formattedFreezer)) {
            formattedFreezer += '°C';
        }

        const newVehicle = {
            id: vId.value,
            name: vName.value,
            category: vCategory.value,
            type: vCategory.value === 'freezer' ? 'Freezer Truck' : 'Aluminum Body',
            status: vStatus.value,
            statusLabel: vStatus.value === 'active' ? 'Active / Available' : 'In Operation',
            description: vDesc.value,
            images: imgArray,
            specifications: {
                bodyLength: formattedLength || '14.5 ft',
                bodyType: vCategory.value === 'freezer' ? 'Refrigerated Box' : 'Aluminum Container',
                engine: sEngine.value,
                wheels: (sWheels && sWheels.value.trim()) ? sWheels.value.trim() : '6 Nut Heavy Duty',
                fuelType: sFuel ? sFuel.value : 'Diesel',
                freezer: formattedFreezer || 'Sub-Zero (-20°C to +15°C)',
                payloadCapacity: formattedPayload || '4.5 Tons'
            }
        };

        const idx = parseInt(editModeIndex.value);
        if (idx === -1) {
            fleetData.push(newVehicle);
        } else {
            fleetData[idx] = newVehicle;
        }

        saveData(newVehicle);
        closeModal();
    });

    /**
     * Mobile Sidebar Drawer Controls (iOS / Android)
     */
    const adminMobileToggle = document.getElementById('adminMobileToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (adminSidebar) adminSidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (adminSidebar) adminSidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (adminMobileToggle) {
        adminMobileToggle.addEventListener('click', openSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    /**
     * Search Input Logic
     */
    if (tableSearch) {
        tableSearch.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            renderDashboard();
        });
    }

    /**
     * TAB NAVIGATION & INQUIRIES & GALLERY LOGIC
     */
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tab]');
    const fleetTabContent = document.getElementById('fleetTabContent');
    const inquiriesTabContent = document.getElementById('inquiriesTabContent');
    const galleryTabContent = document.getElementById('galleryTabContent');
    
    const topbarTitle = document.getElementById('topbarTitle');
    const topbarActions = document.getElementById('topbarActions');
    const addVehicleBtnEl = document.getElementById('addVehicleBtn');
    const addGalleryPhotoBtn = document.getElementById('addGalleryPhotoBtn');

    const inquiriesTableBody = document.getElementById('inquiriesTableBody');
    const refreshInquiriesBtn = document.getElementById('refreshInquiriesBtn');

    const galleryTableBody = document.getElementById('galleryTableBody');
    const openAddGalleryModalBtn = document.getElementById('openAddGalleryModalBtn');
    const galleryModal = document.getElementById('galleryModal');
    const closeGalleryModalBtn = document.getElementById('closeGalleryModalBtn');
    const cancelGalleryModalBtn = document.getElementById('cancelGalleryModalBtn');
    const galleryForm = document.getElementById('galleryForm');
    const gTitle = document.getElementById('gTitle');
    const gUrl = document.getElementById('gUrl');
    const gCategory = document.getElementById('gCategory');
    const gVehicleId = document.getElementById('gVehicleId');

    let galleryData = typeof window.getGalleryData === 'function' ? window.getGalleryData() : [];

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.currentTarget.getAttribute('data-tab');

            // Update Active Link
            navItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Switch Views
            if (targetTab === 'inquiries') {
                if (fleetTabContent) fleetTabContent.style.display = 'none';
                if (galleryTabContent) galleryTabContent.style.display = 'none';
                if (inquiriesTabContent) inquiriesTabContent.style.display = 'block';
                if (topbarTitle) topbarTitle.innerText = 'Customer Quote Inquiries';
                if (addVehicleBtnEl) addVehicleBtnEl.style.display = 'none';
                if (addGalleryPhotoBtn) addGalleryPhotoBtn.style.display = 'none';
                renderInquiries();
            } else if (targetTab === 'gallery') {
                if (fleetTabContent) fleetTabContent.style.display = 'none';
                if (inquiriesTabContent) inquiriesTabContent.style.display = 'none';
                if (galleryTabContent) galleryTabContent.style.display = 'block';
                if (topbarTitle) topbarTitle.innerText = 'Fleet Photo Gallery';
                if (addVehicleBtnEl) addVehicleBtnEl.style.display = 'none';
                if (addGalleryPhotoBtn) addGalleryPhotoBtn.style.display = 'inline-flex';
                renderGalleryAdmin();
            } else {
                if (fleetTabContent) fleetTabContent.style.display = 'block';
                if (inquiriesTabContent) inquiriesTabContent.style.display = 'none';
                if (galleryTabContent) galleryTabContent.style.display = 'none';
                if (topbarTitle) topbarTitle.innerText = 'Fleet Management';
                if (addVehicleBtnEl) addVehicleBtnEl.style.display = 'inline-flex';
                if (addGalleryPhotoBtn) addGalleryPhotoBtn.style.display = 'none';
                renderDashboard();
            }

            // Close Mobile Sidebar on Selection
            closeSidebar();
        });
    });

    /**
     * Render Fleet Gallery Table
     */
    async function renderGalleryAdmin() {
        if (!galleryTableBody) return;

        galleryData = typeof window.getGalleryData === 'function' ? window.getGalleryData() : [];

        // Fetch live from Neon DB if available
        if (typeof window.fetchGalleryFromNeon === 'function') {
            try {
                const neonGallery = await window.fetchGalleryFromNeon();
                if (neonGallery && neonGallery.length > 0) {
                    galleryData = neonGallery;
                }
            } catch (e) {
                console.warn("Could not fetch gallery from Neon DB:", e);
            }
        }

        galleryTableBody.innerHTML = '';
        if (galleryData.length === 0) {
            galleryTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 2rem; color: var(--text-muted);">No photos in gallery. Click + Add Photo to upload.</td></tr>`;
            return;
        }

        galleryData.forEach((photo, idx) => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>
                    <img src="${photo.url}" alt="Fleet Photo" style="width:60px; height:42px; object-fit:cover; border-radius:6px; border:1px solid var(--border);">
                </td>
                <td style="max-width:350px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><a href="${photo.url}" target="_blank" style="color:var(--primary); font-size:13px; font-weight:600;">${photo.url}</a></td>
                <td class="text-right">
                    <button class="btn btn-danger delete-gal-btn" data-id="${photo.id || idx}" data-url="${photo.url}" style="padding: 4px 8px;"><i data-lucide="trash-2"></i></button>
                </td>
            `;
            galleryTableBody.appendChild(tr);
        });

        lucide.createIcons();

        document.querySelectorAll('.delete-gal-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to remove this photo from the gallery?')) {
                    const galId = e.currentTarget.getAttribute('data-id');
                    const galUrl = e.currentTarget.getAttribute('data-url');

                    galleryData = galleryData.filter(g => g.id !== galId && g.url !== galUrl);
                    if (typeof window.saveGalleryData === 'function') {
                        window.saveGalleryData(galleryData);
                    }

                    if (typeof window.deleteGalleryItemFromNeon === 'function') {
                        try {
                            await window.deleteGalleryItemFromNeon(galId || galUrl);
                            console.log("Deleted gallery photo from Neon DB");
                        } catch (err) {
                            console.warn("Could not delete gallery item from Neon DB:", err);
                        }
                    }

                    window.dispatchEvent(new Event('fleetDataUpdated'));
                    renderGalleryAdmin();
                }
            });
        });
    }

    /**
     * Gallery Modal Handlers
     */
    function openGalleryModal() {
        if (galleryForm) galleryForm.reset();
        if (galleryModal) galleryModal.classList.add('active');
    }

    function closeGalleryModal() {
        if (galleryModal) galleryModal.classList.remove('active');
    }

    if (openAddGalleryModalBtn) openAddGalleryModalBtn.addEventListener('click', openGalleryModal);
    if (addGalleryPhotoBtn) addGalleryPhotoBtn.addEventListener('click', openGalleryModal);
    if (closeGalleryModalBtn) closeGalleryModalBtn.addEventListener('click', closeGalleryModal);
    if (cancelGalleryModalBtn) cancelGalleryModalBtn.addEventListener('click', closeGalleryModal);

    if (galleryForm) {
        galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPhoto = {
                id: `gal-${Date.now()}`,
                url: gUrl.value.trim()
            };

            galleryData.unshift(newPhoto);
            if (typeof window.saveGalleryData === 'function') {
                window.saveGalleryData(galleryData);
            }

            if (typeof window.saveGalleryItemToNeon === 'function') {
                try {
                    await window.saveGalleryItemToNeon(newPhoto);
                    console.log("Saved gallery photo to Neon DB!");
                } catch (err) {
                    console.warn("Could not save gallery photo to Neon DB:", err);
                }
            }

            window.dispatchEvent(new Event('fleetDataUpdated'));
            closeGalleryModal();
            renderGalleryAdmin();
        });
    }

    /**
     * Render Customer Inquiries from Neon DB
     */
    async function renderInquiries() {
        if (!inquiriesTableBody) return;
        inquiriesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Loading inquiries from Neon DB...</td></tr>`;

        if (typeof window.queryNeon === 'function') {
            try {
                const rows = await window.queryNeon(`SELECT * FROM inquiries ORDER BY id DESC`);
                if (rows && rows.length > 0) {
                    inquiriesTableBody.innerHTML = '';
                    rows.forEach(inq => {
                        const tr = document.createElement('tr');
                        const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent';
                        tr.innerHTML = `
                            <td><strong>${inq.customer_name || 'N/A'}</strong></td>
                            <td>${inq.customer_phone || 'N/A'}</td>
                            <td>${inq.customer_email || 'N/A'}</td>
                            <td><span class="badge" style="background:var(--primary); color:#fff;">${inq.vehicle_id || 'General'}</span></td>
                            <td style="max-width:250px; font-size:13px;">${inq.message || '-'}</td>
                            <td style="color:var(--text-muted); font-size:13px;">${dateStr}</td>
                        `;
                        inquiriesTableBody.appendChild(tr);
                    });
                    lucide.createIcons();
                    return;
                }
            } catch (err) {
                console.warn("Could not fetch inquiries from Neon DB:", err);
            }
        }
        
        inquiriesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No customer inquiries found.</td></tr>`;
    }

    if (refreshInquiriesBtn) {
        refreshInquiriesBtn.addEventListener('click', renderInquiries);
    }

    // Init
    renderDashboard();

});
