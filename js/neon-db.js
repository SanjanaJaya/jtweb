/**
 * JAYASOORIYA TRANSPORT - NEON POSTGRES INTEGRATION
 * ==================================================
 * Direct Serverless HTTP Driver connection to Neon PostgreSQL database.
 */

// 1. NEON POSTGRES CONNECTION STRING:
const NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_8LwEDF4ekVYH@ep-little-smoke-ax2x3j4h-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

/**
 * Execute SQL Query against Neon via HTTP API
 */
async function queryNeon(sqlQuery, params = []) {
    if (!NEON_CONNECTION_STRING || NEON_CONNECTION_STRING.includes("YOUR_NEON_CONNECTION_STRING_HERE")) {
        console.warn("Neon Postgres connection string not configured. Falling back to local data.");
        return null;
    }

    try {
        const urlObj = new URL(NEON_CONNECTION_STRING);
        // Strip -pooler for Neon's HTTP API endpoint
        const host = urlObj.hostname.replace('-pooler', '');
        const password = urlObj.password;
        
        const endpoint = `https://${host}/sql`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${password}`
            },
            body: JSON.stringify({
                query: sqlQuery,
                params: params
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to execute Neon query');
        }

        const data = await response.json();
        return data.rows || data;
    } catch (err) {
        console.error("Neon DB Error:", err);
        return null;
    }
}

/**
 * Fetch all vehicles from Neon DB
 */
async function fetchVehiclesFromNeon() {
    const rows = await queryNeon(`SELECT * FROM vehicles ORDER BY id ASC`);
    if (!rows || !Array.isArray(rows) || rows.length === 0) return null;
    
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

// Export to window
if (typeof window !== 'undefined') {
    window.NEON_CONNECTION_STRING = NEON_CONNECTION_STRING;
    window.queryNeon = queryNeon;
    window.fetchVehiclesFromNeon = fetchVehiclesFromNeon;
    window.saveVehicleToNeon = saveVehicleToNeon;
    window.deleteVehicleFromNeon = deleteVehicleFromNeon;
    window.sendInquiryToNeon = sendInquiryToNeon;
}
