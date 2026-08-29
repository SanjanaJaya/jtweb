/**
 * JAYASOORIYA TRANSPORT — Netlify Serverless DB Proxy
 * =====================================================
 * This function is the ONLY place the Neon connection string lives.
 * The browser calls /.netlify/functions/db, this function calls Neon.
 * Your database password never touches the client.
 *
 * Set NEON_CONNECTION_STRING in: Netlify Dashboard → Site → Environment Variables
 */

exports.handler = async function (event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // CORS headers — allow your Netlify domain and localhost
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    const connectionString = process.env.NEON_CONNECTION_STRING;
    if (!connectionString) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database not configured. Set NEON_CONNECTION_STRING in Netlify environment variables.' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { query, params = [] } = body;
    if (!query) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing query' }) };
    }

    try {
        // Build the Neon HTTP API endpoint from the connection string
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
            body: JSON.stringify({ query, params })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Neon query failed');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ rows: data.rows || data })
        };
    } catch (err) {
        console.error('DB Proxy Error:', err.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
