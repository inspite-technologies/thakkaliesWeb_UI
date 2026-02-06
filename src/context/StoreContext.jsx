import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { mockUser, mockAddresses, mockOrders } from '../data/mockData.js';
import { normalizeImageUrl } from '../utils/utils.js';

// Import services
import {
  fetchCartItems,
  addToCartApi,
  updateCartQuantityApi,
  normalizeCartItems
} from '../services/cartService';

import {
  fetchWishlistItems,
  addToWishlistApi,
  removeFromWishlistApi,
  normalizeWishlistItems
} from '../services/wishlistService';

import {
  requestOtpApi,
  verifyOtpApi,
  fetchUserDetailsApi,
  updateUserDetailsApi,
  normalizeUserData,
  normalizeAddresses
} from '../services/userService';

import {
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '../services/addressService';

import {
  getPaymentKeyApi,
  createOrderApi,
  verifyPaymentApi,
  createRazorpayOptions,
  fetchOrdersApi
} from '../services/orderService';

import {
  fetchProductDetailsApi
} from '../services/productService';

/**
 * Normalize order data from backend to frontend format
 */
export const normalizeOrders = (backendOrders) => {
  if (!Array.isArray(backendOrders)) return [];

  return backendOrders.map(order => {
    // Backend provides address as a string, frontend expects an object
    const deliveryAddress = typeof order.address === 'string'
      ? { type: 'Delivery', fullAddress: order.address, landmark: '' }
      : (order.address || { type: 'Delivery', fullAddress: 'Address not available', landmark: '' });

    return {
      id: order._id || order.id,
      orderNumber: order.razorpayOrderId || `ORD-${(order._id || order.id).slice(-6).toUpperCase()}`,
      orderDate: order.createdAt,
      status: (order.status || 'confirmed').toLowerCase(),
      total: order.amount || 0,
      subtotal: order.subtotal || order.amount || 0, // Fallback to total if subtotal missing
      deliveryFee: order.deliveryFee || 0,
      taxes: order.taxes || 0,
      items: (order.items || []).map(item => ({
        product: {
          id: item.productId,
          name: item.productName || 'Product',
          price: item.price || 0,
          image: normalizeImageUrl(item.image) // Use normalizeImageUrl even for placeholders
        },
        quantity: item.quantity || 1
      })),
      deliveryAddress,
      paymentStatus: order.paymentStatus || 'Pending',
      paymentMethod: order.paymentMethod || 'Online Payment (Razorpay)'
    };
  });
};

const StoreContext = createContext(undefined);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState('Infopark, Kochi');

  const fetchCart = useCallback(async () => {
    try {
      const result = await fetchCartItems();
      if (result?.success && result.data && Array.isArray(result.data.items)) {
        setCart(normalizeCartItems(result.data.items));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const result = await fetchWishlistItems();
      if (result?.data) {
        setWishlist(normalizeWishlistItems(result.data));
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await fetchOrdersApi();
      if (result?.success && result.data) {
        const normalizedOrders = normalizeOrders(result.data);
        setOrders(normalizedOrders);

        // Enrich with images dynamically
        const productIds = new Set();
        normalizedOrders.forEach(order => {
          order.items.forEach(item => {
            if (item.product.id) productIds.add(item.product.id);
          });
        });

        if (productIds.size > 0) {
          const productDetails = await Promise.all(
            Array.from(productIds).map(id => fetchProductDetailsApi(id))
          );

          const imageMap = {};
          productDetails.forEach(res => {
            if (res?.data) {
              // The backend returns normalized data in .data
              const id = res.data._id || res.data.id;
              imageMap[id] = res.data.image;
            }
          });

          setOrders(prevOrders => prevOrders.map(order => ({
            ...order,
            items: order.items.map(item => ({
              ...item,
              product: {
                ...item.product,
                image: normalizeImageUrl(imageMap[item.product.id] || item.product.image)
              }
            }))
          })));
        }
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const result = await fetchUserDetailsApi();
      if (result?.data) {
        setUser(normalizeUserData(result.data));
        setAddresses(normalizeAddresses(result.data.addresses));
      }
    } catch (error) {
      console.error('Fetch user details error:', error);
    }
  }, []);

  useEffect(() => {
    const initStore = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    initStore();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
      fetchCart();
      fetchUserDetails();
      fetchOrders();
    }
  }, [isLoggedIn, fetchWishlist, fetchCart, fetchUserDetails, fetchOrders]);

  const requestOTP = useCallback(async (phone) => {
    try {
      const data = await requestOtpApi(phone);
      console.log("OTP received (debug):", data.otp);
      return true;
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (phone, otp) => {
    try {
      const data = await verifyOtpApi(phone, otp);
      if (data.data) {
        setUser(normalizeUserData(data.data));
        setIsLoggedIn(true);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setCart([]);
    localStorage.removeItem('token');
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const token = localStorage.getItem('token');
    const productId = product.id || product._id;

    if (token) {
      try {
        const result = await addToCartApi(productId);
        if (result?.success) {
          fetchCart();
          return;
        } else {
          toast.error(result?.msg || 'Failed to add to cart');
          return;
        }
      } catch (error) {
        console.error('Add to cart backend error:', error);
      }
    }

    // Local fallback/handling if not logged in or backend fails
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const result = await updateCartQuantityApi(productId, quantity);
        if (result?.success) {
          fetchCart();
          return;
        } else {
          console.error('Update quantity failed:', result);
          toast.error(result?.msg || 'Failed to update quantity');
          return;
        }
      } catch (error) {
        console.error('Update quantity backend error:', error);
      }
    }

    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [cart, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    const token = localStorage.getItem('token');

    if (token) {
      return updateQuantity(productId, 0);
    }

    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleWishlist = useCallback(async (product) => {
    const productId = product.id || product._id;
    const isLiked = wishlist.some(item => (item.id || item._id) === productId);
    const token = localStorage.getItem('token');

    // Update local state first for responsiveness
    if (isLiked) {
      setWishlist(prev => prev.filter(item => (item.id || item._id) !== productId));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    // Sync with backend if logged in
    if (token) {
      try {
        if (isLiked) {
          await removeFromWishlistApi(productId);
        } else {
          await addToWishlistApi(productId);
        }
      } catch (error) {
        console.error('Toggle wishlist backend error:', error);
      }
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => (item.id || item._id) === productId);
  }, [wishlist]);

  const updateUserDetails = useCallback(async (details) => {
    try {
      const result = await updateUserDetailsApi(details);
      if (result?.response?.ok) {
        fetchUserDetails();
        return true;
      }
      toast.error(result?.data?.msg || 'Failed to update profile');
      return false;
    } catch (error) {
      console.error('Update user details error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const addAddress = useCallback(async (addressData) => {
    try {
      const result = await addAddressApi(addressData);
      if (result?.response?.ok) {
        fetchUserDetails();
        return true;
      }
      toast.error(result?.data?.msg || 'Failed to add address');
      return false;
    } catch (error) {
      console.error('Add address error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const updateAddress = useCallback(async (id, addressData) => {
    try {
      const result = await updateAddressApi(id, addressData);
      if (result?.response?.ok) {
        fetchUserDetails();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update address error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const deleteAddress = useCallback(async (id) => {
    try {
      const response = await deleteAddressApi(id);
      if (response?.ok) {
        fetchUserDetails();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete address error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const setDefaultAddress = useCallback(async (id) => {
    try {
      const response = await setDefaultAddressApi(id);
      if (response?.ok) {
        fetchUserDetails();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Set default address error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const placeOrder = useCallback(async (orderData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      // 1. Create Order on Backend
      const addressId = orderData.deliveryAddress._id || orderData.deliveryAddress.id;
      const orderResult = await createOrderApi(addressId);

      if (!orderResult?.success) {
        throw new Error(orderResult?.msg || 'Failed to create order');
      }

      const { razorpay, order } = orderResult;

      if (!razorpay || !razorpay.orderId) {
        throw new Error('Invalid order response from server');
      }

      console.log('💳 Initiating Razorpay with:', {
        key: razorpay.key ? 'EXISTS' : 'MISSING',
        orderId: razorpay.orderId,
        amount: razorpay.amount,
        currency: razorpay.currency
      });

      // 2. Open Razorpay Checkout
      return new Promise((resolve, reject) => {
        const options = createRazorpayOptions({
          key: razorpay.key, // Use key directly from order creation response
          amount: razorpay.amount,
          currency: razorpay.currency,
          orderId: razorpay.orderId,
          user: user || { name: 'Customer', phone: '' }, // Fallback if user is null
          onSuccess: async function (response) {
            try {
              // 4. Verify Payment
              const verifyResult = await verifyPaymentApi(response);

              if (verifyResult?.success) {
                const finalOrderId = order.orderId || order._id || order.id;
                clearCart();
                fetchOrders(); // Refresh orders list
                resolve({ id: finalOrderId });
              } else {
                toast.error('Payment verification failed');
                reject(new Error('Payment verification failed'));
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              reject(error);
            }
          },
          onDismiss: function () {
            toast.error('Payment cancelled');
            reject(new Error('Payment cancelled'));
          }
        });

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description || 'Payment failed');
          reject(new Error(response.error.description));
        });

        rzp.open();
      });

    } catch (error) {
      console.error('Place order error:', error);
      toast.error(error.message || 'Failed to place order');
      throw error;
    }
  }, [user, clearCart]);

  return (
    <StoreContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        requestOTP,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateUserDetails,
        orders,
        placeOrder,
        deliveryLocation,
        setDeliveryLocation,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
