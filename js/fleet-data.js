/**
 * JAYASOORIYA TRANSPORT - FLEET DATA MODULE
 * =========================================
 * Clean database-driven fleet data module.
 * No hardcoded demo trucks. Data is fetched live from Neon PostgreSQL DB.
 */

const DEFAULT_FLEET = [];
const DEFAULT_GALLERY = [];

// LocalStorage keys
const FLEET_STORAGE_KEY = 'jayasooriya_fleet_catalog_v2';
const GALLERY_STORAGE_KEY = 'jayasooriya_fleet_gallery_v1';

/**
 * Retrieves fleet array (LocalStorage cached or default)
 */
function getFleetData() {
    try {
        const stored = localStorage.getItem(FLEET_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('LocalStorage error reading fleet data', e);
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
        console.error('Failed to save fleet data', e);
        return false;
    }
}

/**
 * Resets fleet catalog
 */
function resetFleetData() {
    try {
        localStorage.removeItem(FLEET_STORAGE_KEY);
    } catch (e) {
        console.error(e);
    }
    return DEFAULT_FLEET;
}

/**
 * Retrieves gallery array (LocalStorage cached or default)
 */
function getGalleryData() {
    try {
        const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('LocalStorage error reading gallery data', e);
    }
    return DEFAULT_GALLERY;
}

/**
 * Saves gallery array to LocalStorage
 */
function saveGalleryData(data) {
    try {
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save gallery data', e);
        return false;
    }
}

/**
 * Resets gallery data
 */
function resetGalleryData() {
    try {
        localStorage.removeItem(GALLERY_STORAGE_KEY);
    } catch (e) {
        console.error(e);
    }
    return DEFAULT_GALLERY;
}

// Make globally accessible in browser environment
if (typeof window !== 'undefined') {
    window.DEFAULT_FLEET = DEFAULT_FLEET;
    window.DEFAULT_GALLERY = DEFAULT_GALLERY;
    window.getFleetData = getFleetData;
    window.saveFleetData = saveFleetData;
    window.resetFleetData = resetFleetData;
    window.getGalleryData = getGalleryData;
    window.saveGalleryData = saveGalleryData;
    window.resetGalleryData = resetGalleryData;
}

