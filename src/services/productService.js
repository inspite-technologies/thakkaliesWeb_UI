import { API_BASE_URL, getAuthHeaderOnly } from './api';

const PRODUCT_URL = `${API_BASE_URL}/products`;

/**
 * Fetch product details by ID
 * @param {string} productId - The ID of the product to fetch
 */
export const fetchProductDetailsApi = async (productId) => {
    try {
        const response = await fetch(`${PRODUCT_URL}/${productId}`, {
            headers: getAuthHeaderOnly()
        });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return { success: false, error: error.message };
    }
};
