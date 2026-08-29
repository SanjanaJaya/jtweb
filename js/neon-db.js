/**
 * JAYASOORIYA TRANSPORT - NEON POSTGRES INTEGRATION
 * ==================================================
 * On Netlify: queries are routed through /.netlify/functions/db (serverless proxy).
 * Locally: queries go directly to Neon via window.NEON_CONNECTION_STRING from config.js.
 *
 * This keeps the database password out of the browser on production.
 */

/**
 * Detect whether we are running on Netlify (production) or locally.
 * On Netlify, window.NEON_CONNECTION_STRING won't be set, so we use the proxy.
 */
function isUsingProxy() {
    return !window.NEON_CONNECTION_STRING ||
        window.NEON_CONNECTION_STRING.includes('YOUR_NEON_CONNECTION_STRING_HERE');
}

/**
 * Execute SQL Query — routes to Netlify proxy or direct Neon HTTP API.
 */
async function queryNeon(sqlQuery, params = []) {

    // ── PRODUCTION PATH: use the Netlify serverless proxy ──────────────────
    if (isUsingProxy()) {
        try {
            const response = await fetch('/.netlify/functions/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: sqlQuery, params })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Proxy query failed');
            }

            const data = await response.json();
            return data.rows || data;
        } catch (err) {
            console.error('Neon Proxy Error:', err.message);
            return null;
        }
    }

    // ── LOCAL DEV PATH: direct Neon HTTP API using config.js ───────────────
    const connectionString = window.NEON_CONNECTION_STRING;
    try {
        const urlObj = new URL(connectionString);
        const host = urlObj.hostname.replace('-pooler', '');
        const password = urlObj.password;
        const endpoint = `https://${host}/sql`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${password}`
            },
            body: JSON.stringify({ query: sqlQuery, params })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to execute Neon query');
        }

        const data = await response.json();
        return data.rows || data;
    } catch (err) {
        console.error('Neon DB Error:', err.message);
        return null;
    }
}

/**
 * Fetch all vehicles from Neon DB
 */
async function fetchVehiclesFromNeon() {
    const rows = await queryNeon(`SELECT * FROM vehicles ORDER BY id ASC`);
    if (!rows || !Array.isArray(rows)) return null;

    return rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        type: r.type,
        status: r.status,
        statusLabel: r.status_label,
        description: r.description,
        featured: r.featured,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
        specifications: typeof r.specifications === 'string' ? JSON.parse(r.specifications) : r.specifications
    }));
}

/**
 * Insert or Update a vehicle in Neon DB
 */
async function saveVehicleToNeon(v) {
    const sql = `
        INSERT INTO vehicles (id, name, category, type, status, status_label, description, featured, images, specifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            status_label = EXCLUDED.status_label,
            description = EXCLUDED.description,
            featured = EXCLUDED.featured,
            images = EXCLUDED.images,
            specifications = EXCLUDED.specifications;
    `;
    const params = [
        v.id,
        v.name,
        v.category,
        v.type || (v.category === 'freezer' ? 'Freezer Truck' : 'Aluminum Body'),
        v.status,
        v.statusLabel || (v.status === 'active' ? 'Active / Available' : 'In Operation'),
        v.description || '',
        v.featured || false,
        JSON.stringify(v.images || []),
        JSON.stringify(v.specifications || {})
    ];
    return await queryNeon(sql, params);
}

/**
 * Delete a vehicle from Neon DB by Vehicle Code (id)
 */
async function deleteVehicleFromNeon(id) {
    return await queryNeon(`DELETE FROM vehicles WHERE id = $1`, [id]);
}

/**
 * Send customer inquiry to Neon DB
 */
async function sendInquiryToNeon(inquiryData) {
    const sql = `
        INSERT INTO inquiries (customer_name, customer_email, customer_phone, service_type, vehicle_id, message)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
    `;
    const params = [
        inquiryData.name,
        inquiryData.email || '',
        inquiryData.phone,
        inquiryData.serviceType || 'general',
        inquiryData.vehicleId || null,
        inquiryData.message || ''
    ];
    return await queryNeon(sql, params);
}

/**
 * Fetch all gallery photos from Neon DB
 */
async function fetchGalleryFromNeon() {
    const rows = await queryNeon(`SELECT * FROM fleet_gallery ORDER BY id DESC`);
    if (!rows || !Array.isArray(rows)) return null;

    return rows.map(r => ({
        id: r.id ? String(r.id) : `gal-${Math.random()}`,
        url: r.url
    }));
}

/**
 * Save or insert gallery photo item in Neon DB
 */
async function saveGalleryItemToNeon(item) {
    const sql = `
        INSERT INTO fleet_gallery (url)
        VALUES ($1)
        RETURNING id;
    `;
    return await queryNeon(sql, [item.url]);
}

/**
 * Delete a gallery photo item from Neon DB
 */
async function deleteGalleryItemFromNeon(id) {
    if (!isNaN(id)) {
        return await queryNeon(`DELETE FROM fleet_gallery WHERE id = $1`, [parseInt(id, 10)]);
    } else {
        return await queryNeon(`DELETE FROM fleet_gallery WHERE url = $1`, [id]);
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.queryNeon = queryNeon;
    window.fetchVehiclesFromNeon = fetchVehiclesFromNeon;
    window.saveVehicleToNeon = saveVehicleToNeon;
    window.deleteVehicleFromNeon = deleteVehicleFromNeon;
    window.sendInquiryToNeon = sendInquiryToNeon;
    window.fetchGalleryFromNeon = fetchGalleryFromNeon;
    window.saveGalleryItemToNeon = saveGalleryItemToNeon;
    window.deleteGalleryItemFromNeon = deleteGalleryItemFromNeon;
}
