/**
 * JAYASOORIYA TRANSPORT - FLEET DATA MODULE
 * =========================================
 * isolated, database-ready JS objects for fleet catalog.
 * In a future backend integration, this file can fetch data directly from an API endpoint:
 *   fetch('/api/vehicles').then(res => res.json()).then(data => renderFleet(data));
 */

const DEFAULT_FLEET = [
    {
        id: "JT-001",
        name: "Isuzu NPR88 Freezer",
        category: "freezer",
        type: "Freezer Truck",
        status: "active",
        statusLabel: "Active / Available",
        description: "Heavy-duty refrigerated transport vehicle featuring a state-of-the-art sub-zero insulation box. Designed for temperature-controlled cold-chain logistics across urban and inter-city routes in Sri Lanka.",
        featured: true,
        images: [
            "assets/vehicles/hero-truck.png",
            "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1586191582066-92a549d44321?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "14.5 ft",
            bodyType: "Refrigerated Freezer Box",
            engine: "4JZ1-TCS Turbo Diesel",
            wheels: "6 Nut Heavy Duty",
            fuelType: "Diesel",
            freezer: "Sub-Zero (-20°C to +15°C)",
            payloadCapacity: "4.5 Tons",
            transmission: "Manual 6-Speed"
        }
    },
    {
        id: "JT-002",
        name: "Isuzu NPR85 Freezer",
        category: "freezer",
        type: "Freezer Truck",
        status: "in_operation",
        statusLabel: "In Operation",
        description: "Reliable medium-duty refrigerated truck optimized for dairy, seafood, and fresh farm produce distribution. Built with dual-temperature monitoring and reinforced thermal insulation.",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1586191582066-92a549d44321?auto=format&fit=crop&w=1200&q=80",
            "assets/vehicles/hero-truck.png",
            "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "14.0 ft",
            bodyType: "Refrigerated Freezer Box",
            engine: "4JJ1-TCS Intercooler Diesel",
            wheels: "6 Nut Heavy Duty",
            fuelType: "Diesel",
            freezer: "Thermo-King (-18°C)",
            payloadCapacity: "4.0 Tons",
            transmission: "Manual 5-Speed"
        }
    },
    {
        id: "JT-003",
        name: "Isuzu Forward Cargo",
        category: "aluminum",
        type: "Aluminum Body",
        status: "active",
        statusLabel: "Active / Available",
        description: "High-capacity aluminum body commercial truck designed for dry goods, commercial cargo, and industrial supplies. Full weatherproof seal and dual side door access for easy loading.",
        featured: true,
        images: [
            "assets/vehicles/aluminum-truck-1.png",
            "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "18.5 ft",
            bodyType: "Corrugated Aluminum Body",
            engine: "6HK1 Heavy Diesel",
            wheels: "6 Nut Reinforced",
            fuelType: "Diesel",
            freezer: "N/A (Dry Cargo)",
            payloadCapacity: "7.5 Tons",
            transmission: "Manual 6-Speed"
        }
    },
    {
        id: "JT-004",
        name: "Isuzu NPR Aluminum Heavy",
        category: "aluminum",
        type: "Aluminum Body",
        status: "active",
        statusLabel: "Active / Available",
        description: "Versatile aluminum container truck suitable for retail distribution, consumer packaged goods, and multi-point city logistics across Colombo and outer provinces.",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=1200&q=80",
            "assets/vehicles/aluminum-truck-1.png",
            "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "14.5 ft",
            bodyType: "High-Grade Aluminum Container",
            engine: "4HL1 Direct Injection",
            wheels: "6 Nut Heavy Duty",
            fuelType: "Diesel",
            freezer: "N/A (Ventilated Dry Box)",
            payloadCapacity: "5.0 Tons",
            transmission: "Manual 5-Speed"
        }
    },
    {
        id: "JT-005",
        name: "Isuzu Elf Compact Freezer",
        category: "freezer",
        type: "Freezer Truck",
        status: "active",
        statusLabel: "Active / Available",
        description: "Agile light freezer truck tailored for narrow urban access, rapid store deliveries, and sensitive healthcare or pharmaceutical cold storage dispatch.",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
            "assets/vehicles/hero-truck.png",
            "https://images.unsplash.com/photo-1586191582066-92a549d44321?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "10.5 ft",
            bodyType: "Compact Refrigerated Box",
            engine: "4HG1 Diesel Engine",
            wheels: "5 Nut Standard",
            fuelType: "Diesel",
            freezer: "Sub-Zero (-15°C)",
            payloadCapacity: "2.5 Tons",
            transmission: "Manual 5-Speed"
        }
    },
    {
        id: "JT-006",
        name: "Isuzu Giga Heavy Distribution",
        category: "aluminum",
        type: "Aluminum Body",
        status: "in_operation",
        statusLabel: "In Operation",
        description: "Heavy-duty multi-axle aluminum box truck for bulk long-distance cargo movement connecting major agricultural and industrial zones across Sri Lanka.",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
            "assets/vehicles/aluminum-truck-1.png",
            "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=1200&q=80"
        ],
        specifications: {
            bodyLength: "22.0 ft",
            bodyType: "Reinforced Aluminum Enclosure",
            engine: "6UZ1 Heavy Duty Turbo",
            wheels: "10 Wheel Heavy Axle",
            fuelType: "Diesel",
            freezer: "N/A (Bulk Cargo)",
            payloadCapacity: "12.0 Tons",
            transmission: "Manual 7-Speed"
        }
    }
];

// LocalStorage key for client-side demo persistence
const FLEET_STORAGE_KEY = 'jayasooriya_fleet_catalog_v1';

/**
 * Retrieves full fleet array (LocalStorage cached or default)
 */
function getFleetData() {
    try {
        const stored = localStorage.getItem(FLEET_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('LocalStorage error, reading default fleet data', e);
    }
    return DEFAULT_FLEET;
}

/**
 * Saves fleet array to LocalStorage
 */
function saveFleetData(data) {
    try {
        localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save fleet data to LocalStorage', e);
        return false;
    }
}

/**
 * Resets fleet catalog back to factory demo defaults
 */
function resetFleetData() {
    try {
        localStorage.removeItem(FLEET_STORAGE_KEY);
    } catch (e) {
        console.error(e);
    }
    return DEFAULT_FLEET;
}

// Make globally accessible in browser environment
if (typeof window !== 'undefined') {
    window.DEFAULT_FLEET = DEFAULT_FLEET;
    window.getFleetData = getFleetData;
    window.saveFleetData = saveFleetData;
    window.resetFleetData = resetFleetData;
}
