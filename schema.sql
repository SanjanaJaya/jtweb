-- ==============================================================================
-- JAYASOORIYA TRANSPORT - NEON POSTGRESQL DATABASE DDL SCHEMA
-- ==============================================================================

-- 1. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    status_label VARCHAR(50) NOT NULL DEFAULT 'Active / Available',
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. FLEET GALLERY TABLE (Pure image URLs)
CREATE TABLE IF NOT EXISTS fleet_gallery (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) DEFAULT 'general',
    vehicle_id VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
