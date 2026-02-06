import { API_BASE_URL, getAuthHeaders, isAuthenticated } from './api';

const ORDER_URL = `${API_BASE_URL}/order`;

/**
 * Get Razorpay payment key
 */
export const getPaymentKeyApi = async () => {
    const response = await fetch(`${ORDER_URL}/payment`, {
        method: 'GET'
    });
    return response.json();
};

/**
 * Fetch all orders for the user
 */
export const fetchOrdersApi = async () => {
    if (!isAuthenticated()) return null;

    const response = await fetch(ORDER_URL, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return response.json();
};

/**
 * Create order on backend
 * @param {string} addressId - Delivery address ID
 */
export const createOrderApi = async (addressId) => {
    if (!isAuthenticated()) return null;

    const response = await fetch(ORDER_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ addressId })
    });
    return response.json();
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Razorpay payment response data
 */
export const verifyPaymentApi = async (paymentData) => {
    if (!isAuthenticated()) return null;

    const response = await fetch(`${ORDER_URL}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature
        })
    });
    return response.json();
};

/**
 * Initialize Razorpay checkout
 * @param {Object} options - Razorpay options
 * @returns {Promise} - Resolves with order ID on success
 */
export const initializeRazorpayCheckout = (options) => {
    return new Promise((resolve, reject) => {
        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response) {
            reject(new Error(response.error.description || 'Payment failed'));
        });

        rzp.open();
    });
};

/**
 * Create Razorpay checkout options
 * @param {Object} params - Parameters for checkout
 */
export const createRazorpayOptions = ({
    key,
    amount,
    currency,
    orderId,
    user,
    onSuccess,
    onDismiss
}) => {
    return {
        key,
        amount,
        currency,
        name: "Thakkalies",
        description: "Grocery Order Payment",
        order_id: orderId,
        handler: onSuccess,
        prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone
        },
        theme: {
            color: "#006A52"
        },
        modal: {
            ondismiss: onDismiss
        }
    };
};
