/**
 * Normalizes image URLs from the backend.
 * Fixes issues with missing hostnames, port 7071, and common malformed paths.
 * 
 * @param {string} url - The raw URL or path from the backend
 * @returns {string} - The normalized URL or placeholder if invalid
 */
export const normalizeImageUrl = (url) => {
    if (!url) return '/product-placeholder.png';

    // If it's already a full URL (http or https) and not the problematic :7071
    if ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes(':7071')) {
        return url;
    }

    // Handle Cloudinary paths (often stored as just the relative path or with eCommerce_uploads)
    if (url.includes('cloudinary.com')) {
        return url;
    }

    // Handle the specific :7071 error reported by the user
    // Usually this happens when a hostname is missing but a port is prefixed
    if (url.startsWith(':7071')) {
        // If it's just the port and a path, it's definitely broken. 
        // We should try to use the backend host or just a placeholder since we don't know the intended host.
        // For now, let's treat it as a path relative to the backend if it looks like one.
        const path = url.replace(':7071', '');
        if (path.startsWith('/') && path.includes('.')) {
            return `http://localhost:5001${path}`;
        }
        return '/product-placeholder.png';
    }

    // If it starts with / or looks like a local path but is served by the backend
    if (url.startsWith('/') || !url.includes('://')) {
        // Check if it's already a local public asset
        if (url.startsWith('/product-') || url.startsWith('/favicon') || url.startsWith('/hero-')) {
            return url;
        }
        // Otherwise, assume it's a backend asset
        return `http://localhost:5001${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Final fallback
    return url;
};
