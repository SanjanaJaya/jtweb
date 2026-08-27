/**
 * JAYASOORIYA TRANSPORT - FLEET UI CONTROLLER
 * Renders the fleet grid, handles filtering, search, and the detailed vehicle modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const fleetGrid = document.getElementById('fleetGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('fleetSearchInput');
    
    const vehicleModal = document.getElementById('vehicleModal');
    const modalContent = document.getElementById('modalContent');
    const closeVehicleModal = document.getElementById('closeVehicleModal');

    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    // State
    let currentFleetData = [];
    let currentFilter = 'all';
    let currentSearchTerm = '';
    
    // Lightbox State
    let currentGalleryImages = [];
    let currentLightboxIndex = 0;

    /**
     * Initialize Fleet
     */
    async function initFleet() {
        if (typeof window.getFleetData !== 'function') {
            console.error("Fleet Data Module not loaded!");
            return;
        }
        // Initial render from local cache
        currentFleetData = window.getFleetData();
        renderFleet();

        // Async fetch from Neon DB if available
        if (typeof window.fetchVehiclesFromNeon === 'function') {
            try {
                const neonVehicles = await window.fetchVehiclesFromNeon();
                if (neonVehicles && neonVehicles.length > 0) {
                    currentFleetData = neonVehicles;
                    renderFleet();
                    console.log("Loaded live fleet data from Neon Postgres!");
                }
            } catch (e) {
                console.warn("Could not fetch from Neon DB, using default data.", e);
            }
        }
    }

    /**
     * Render Fleet Grid
     */
    function renderFleet() {
        if (!fleetGrid) return;
        
        fleetGrid.innerHTML = '';

        // Apply Filters
        let filteredData = currentFleetData.filter(vehicle => {
            // Category/Status filter
            let matchFilter = true;
            if (currentFilter === 'freezer') matchFilter = vehicle.category === 'freezer';
            if (currentFilter === 'aluminum') matchFilter = vehicle.category === 'aluminum';
            if (currentFilter === 'status-active') matchFilter = vehicle.status === 'active';
            if (currentFilter === 'status-operation') matchFilter = vehicle.status === 'in_operation';

            // Search filter
            let matchSearch = true;
            if (currentSearchTerm) {
                const term = currentSearchTerm.toLowerCase();
                matchSearch = vehicle.name.toLowerCase().includes(term) || 
                              vehicle.id.toLowerCase().includes(term) ||
                              vehicle.type.toLowerCase().includes(term);
            }

            return matchFilter && matchSearch;
        });

        if (filteredData.length === 0) {
            fleetGrid.innerHTML = `
                <div class="empty-fleet-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <i data-lucide="truck" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <h3>No Vehicles Available</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">There are currently no vehicles in the database. Add new vehicles using the <a href="admin/index.html" style="color: var(--primary); font-weight:600;">Admin Panel</a>.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Render Cards
        filteredData.forEach(vehicle => {
            const statusClass = vehicle.status === 'active' ? 'status-active' : 'status-operation';
            const mainImg = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80';
            
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.innerHTML = `
                <div class="vehicle-card-image-wrap">
                    <img src="${mainImg}" alt="${vehicle.name}" class="vehicle-card-img" loading="lazy">
                    <div class="vehicle-badge-id">${vehicle.id}</div>
                    <div class="vehicle-badge-status ${statusClass}">${vehicle.statusLabel}</div>
                </div>
                <div class="vehicle-card-body">
                    <div class="vehicle-category-tag">${vehicle.type}</div>
                    <h3 class="vehicle-card-title">${vehicle.name}</h3>
                    
                    <div class="vehicle-specs-summary">
                        <div class="spec-pill"><i data-lucide="ruler"></i> ${vehicle.specifications.bodyLength}</div>
                        <div class="spec-pill"><i data-lucide="settings"></i> ${vehicle.specifications.engine}</div>
                        <div class="spec-pill"><i data-lucide="snowflake"></i> ${vehicle.specifications.freezer.includes('N/A') ? 'Dry Box' : 'Refrigerated'}</div>
                    </div>

                    <div class="vehicle-card-footer">
                        <button class="btn btn-secondary view-vehicle-btn" data-id="${vehicle.id}" style="width: 100%;">Explore Vehicle <i data-lucide="arrow-right"></i></button>
                    </div>
                </div>
            `;
            fleetGrid.appendChild(card);
        });

        lucide.createIcons();

        // Attach listeners to new buttons
        document.querySelectorAll('.view-vehicle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vId = e.currentTarget.getAttribute('data-id');
                openVehicleModal(vId);
            });
        });
    }

    /**
     * Filter Listeners
     */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.getAttribute('data-filter');
            renderFleet();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            renderFleet();
        });
    }

    /**
     * Open Detailed Vehicle Modal
     */
    function openVehicleModal(id) {
        const vehicle = currentFleetData.find(v => v.id === id);
        if (!vehicle) return;

        currentGalleryImages = vehicle.images && vehicle.images.length > 0 ? vehicle.images : ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'];
        
        let thumbnailsHtml = currentGalleryImages.map((img, idx) => `
            <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                <img src="${img}" alt="Thumbnail ${idx}">
            </div>
        `).join('');

        let specsHtml = Object.entries(vehicle.specifications || {}).map(([key, val]) => {
            let formattedVal = val ? String(val).trim() : '';
            
            // Enforce ft unit for Body Length
            if (key === 'bodyLength' && formattedVal && !/ft|feet|m/i.test(formattedVal)) {
                formattedVal += ' ft';
            }
            // Enforce Tons unit for Payload Capacity
            if (key === 'payloadCapacity' && formattedVal && !/ton|tons|t|kg/i.test(formattedVal)) {
                formattedVal += ' Tons';
            }
            // Enforce °C unit for Freezer Unit
            if (key === 'freezer' && vehicle.category === 'freezer' && formattedVal && !/°C|C|celsius/i.test(formattedVal) && /-?\d+/.test(formattedVal)) {
                formattedVal += '°C';
            }

            // Format camelCase key to Title Case
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `
                <div class="spec-cell">
                    <span class="spec-key">${formattedKey}</span>
                    <span class="spec-val">${formattedVal}</span>
                </div>
            `;
        }).join('');

        const statusClass = vehicle.status === 'active' ? 'status-active' : 'status-operation';

        modalContent.innerHTML = `
            <div class="modal-gallery-side">
                <div class="main-image-container">
                    <img src="${currentGalleryImages[0]}" alt="${vehicle.name}" class="modal-main-img" id="modalMainImg">
                    <div class="lightbox-trigger-badge" id="openLightboxBtn"><i data-lucide="maximize"></i> Full Screen</div>
                </div>
                <div class="modal-thumbnails-strip" id="modalThumbnails">
                    ${thumbnailsHtml}
                </div>
            </div>
            
            <div class="modal-info-side">
                <div class="modal-header-meta">
                    <span class="section-tag" style="margin-bottom:0;">${vehicle.id}</span>
                    <span class="vehicle-badge-status ${statusClass}" style="position:static;">${vehicle.statusLabel}</span>
                </div>
                
                <h2 class="modal-vehicle-title">${vehicle.name}</h2>
                <p class="modal-vehicle-desc">${vehicle.description}</p>
                
                <div class="specs-grid-title"><i data-lucide="list"></i> Technical Specifications</div>
                <div class="specs-grid-table">
                    ${specsHtml}
                </div>
                
                <div class="modal-action-footer">
                    <button class="btn btn-primary" onclick="window.inquireAboutVehicle('${vehicle.id}')" style="width:100%;">
                        Request Quote for ${vehicle.id} <i data-lucide="calendar"></i>
                    </button>
                </div>
            </div>
        `;

        lucide.createIcons();
        vehicleModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Setup Thumbnail listeners
        const modalMainImg = document.getElementById('modalMainImg');
        const thumbs = document.querySelectorAll('.thumb-item');
        
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                thumbs.forEach(t => t.classList.remove('active'));
                const tItem = e.currentTarget;
                tItem.classList.add('active');
                const idx = parseInt(tItem.getAttribute('data-idx'));
                modalMainImg.src = currentGalleryImages[idx];
            });
        });

        // Setup Lightbox trigger
        document.getElementById('openLightboxBtn')?.addEventListener('click', () => {
            const activeThumb = document.querySelector('.thumb-item.active');
            const startIdx = activeThumb ? parseInt(activeThumb.getAttribute('data-idx')) : 0;
            openLightbox(startIdx);
        });
        
        modalMainImg?.addEventListener('click', () => {
            const activeThumb = document.querySelector('.thumb-item.active');
            const startIdx = activeThumb ? parseInt(activeThumb.getAttribute('data-idx')) : 0;
            openLightbox(startIdx);
        });
    }

    function closeVehicleModalFunc() {
        vehicleModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeVehicleModal) {
        closeVehicleModal.addEventListener('click', closeVehicleModalFunc);
    }
    
    // Close on backdrop click
    if (vehicleModal) {
        vehicleModal.addEventListener('click', (e) => {
            if (e.target === vehicleModal) closeVehicleModalFunc();
        });
    }

    // Expose close to window for main.js interop
    window.closeVehicleModalGlobal = closeVehicleModalFunc;


    /**
     * Lightbox Logic
     */
    function openLightbox(index) {
        currentLightboxIndex = index;
        updateLightboxImage();
        lightboxModal.classList.add('active');
    }

    function updateLightboxImage() {
        if (currentGalleryImages.length > 0) {
            lightboxImage.src = currentGalleryImages[currentLightboxIndex];
        }
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
            updateLightboxImage();
        });
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxImage();
        });
    }

    // Init
    initFleet();

    // Listen for custom event from admin panel updates
    window.addEventListener('fleetDataUpdated', () => {
        initFleet();
    });
});
