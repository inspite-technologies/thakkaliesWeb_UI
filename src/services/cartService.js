import { API_BASE_URL, getAuthHeaders, getAuthHeaderOnly, isAuthenticated } from './api';

const CART_URL = `${API_BASE_URL}/cart`;

/**
 * Fetch cart items from backend
 */
export const fetchCartItems = async () => {
    if (!isAuthenticated()) return null;

    const response = await fetch(CART_URL, {
        headers: getAuthHeaderOnly()
    });
    return response.json();
};

/**
 * Add product to cart
 * @param {string} productId - Product ID to add
 */
export const addToCartApi = async (productId) => {
    if (!isAuthenticated()) return null;

    const response = await fetch(CART_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productIds: [productId] })
    });
    return response.json();
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID to update
 * @param {number} quantity - New quantity
 */
export const updateCartQuantityApi = async (productId, quantity) => {
    if (!isAuthenticated()) return null;

    console.log(`🛒 Updating cart item ${productId} to quantity ${quantity}`);
    const response = await fetch(`${CART_URL}/update/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('❌ Cart update failed:', data);
    }
    return data;
};

/**
 * Remove item from cart (sets quantity to 0)
 * @param {string} productId - Product ID to remove
 */
export const removeFromCartApi = async (productId) => {
    return updateCartQuantityApi(productId, 0);
};

/**
 * Transform cart items from API response to frontend format
 * @param {Array} items - Raw cart items from API
 */
export const normalizeCartItems = (items) => {
    const itemMap = new Map();

    items.forEach(item => {
        const pid = item.productId;
        if (!pid) return;

        if (itemMap.has(pid)) {
            itemMap.get(pid).quantity += item.quantity;
        } else {
            itemMap.set(pid, {
                _id: pid,
                product: {
                    id: pid,
                    name: item.productName,
                    price: item.price,
                    image: item.image || '/product-placeholder.jpg',
                    category: item.categoryName || 'General',
                    shop: item.storeName
                },
                quantity: item.quantity
            });
        }
    });

    return Array.from(itemMap.values());
};
