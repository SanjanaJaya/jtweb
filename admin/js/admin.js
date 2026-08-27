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
    
    const resetDataBtn = document.getElementById('resetDataBtn');

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
    const vImages = document.getElementById('vImages');

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
            btn.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                    const idx = e.currentTarget.getAttribute('data-index');
                    fleetData.splice(idx, 1);
                    saveData();
                }
            });
        });
    }

    function saveData() {
        if (window.saveFleetData(fleetData)) {
            renderDashboard();
            // Dispatch event for any open main pages to listen (if testing in same context, usually doesn't work across tabs without storage event listener, but good practice)
            window.dispatchEvent(new Event('fleetDataUpdated'));
        } else {
            alert('Failed to save data!');
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
            // Default images placeholder
            vImages.value = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80";
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
            
            sLength.value = v.specifications.bodyLength || '';
            sEngine.value = v.specifications.engine || '';
            sPayload.value = v.specifications.payloadCapacity || '';
            sFreezer.value = v.specifications.freezer || '';
            
            vImages.value = v.images ? v.images.join(', ') : '';
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
        
        // Parse Images
        let imgArray = vImages.value.split(',').map(i => i.trim()).filter(i => i.length > 0);
        if (imgArray.length === 0) {
            imgArray = ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"];
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
                bodyLength: sLength.value,
                bodyType: vCategory.value === 'freezer' ? 'Refrigerated Box' : 'Aluminum Container',
                engine: sEngine.value,
                wheels: "Standard",
                fuelType: "Diesel",
                freezer: sFreezer.value,
                payloadCapacity: sPayload.value
            }
        };

        const idx = parseInt(editModeIndex.value);
        if (idx === -1) {
            fleetData.push(newVehicle);
        } else {
            fleetData[idx] = newVehicle;
        }

        saveData();
        closeModal();
    });

    /**
     * Search & Reset Logic
     */
    tableSearch.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderDashboard();
    });

    resetDataBtn.addEventListener('click', () => {
        if (confirm('Warning: This will restore the original demo fleet and overwrite your changes. Continue?')) {
            fleetData = window.resetFleetData();
            // Need to reload window to get clean state if deeply modified, or just clone DEFAULT_FLEET
            if (typeof window.DEFAULT_FLEET !== 'undefined') {
                fleetData = JSON.parse(JSON.stringify(window.DEFAULT_FLEET));
                saveData();
            } else {
                location.reload();
            }
        }
    });

    // Init
    renderDashboard();

});
