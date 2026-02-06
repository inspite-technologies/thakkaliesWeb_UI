import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { mockUser, mockAddresses, mockOrders } from '../data/mockData.js';

const StoreContext = createContext(undefined);

const API_BASE_URL = 'http://localhost:5001/user';

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState(mockOrders);
  const [deliveryLocation, setDeliveryLocation] = useState('Infopark, Kochi');

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      // Backend returns { success: true, data: { items: [...] } }
      if (result.success && result.data && Array.isArray(result.data.items)) {
        const itemMap = new Map();
        result.data.items.forEach(item => {
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
        setCart(Array.from(itemMap.values()));
      } else {
        setCart([]); // Reset if no items or malformed data
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.data) {
        const normalized = result.data.map(item => {
          const p = item.productId;
          if (!p) return null;
          return {
            id: p._id,
            name: p.productName || p.name || 'Unnamed Product',
            price: p.price,
            image: p.image || (p.images && p.images.length > 0 ? p.images[0] : '/product-placeholder.jpg'),
            category: p.categoryName || p.category?.name || p.category?.categoryName || p.category || 'Uncategorized',
            shop: p.storeName || p.storeId?.storeName || p.shop || 'Unknown Store'
          };
        }).filter(Boolean);
        setWishlist(normalized);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/getUser`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.data) {
        const userData = result.data;
        setUser({
          ...userData,
          name: userData.fullName || userData.name,
          phone: userData.phoneNumber || userData.phone
        });
        if (userData.addresses) {
          setAddresses(userData.addresses.map(addr => ({
            ...addr,
            type: addr.addressType || 'home'
          })));
        }
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
    }
  }, [isLoggedIn, fetchWishlist, fetchCart, fetchUserDetails]);

  const requestOTP = useCallback(async (phone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await response.json();
      console.log("OTP received (debug):", data.otp);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request OTP');
      }
      return true;
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (phone, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        // The backend returns user details in data.data
        const userData = data.data;
        setUser({
          ...userData,
          name: userData.fullName || userData.name,
          phone: userData.phoneNumber || userData.phone
        });
        setIsLoggedIn(true);
        // Store token if available
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
        const response = await fetch(`http://localhost:5001/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds: [productId] })
        });
        const result = await response.json();
        if (result.success) {
          fetchCart(); // Refresh from backend to ensure consistency
          return;
        } else {
          toast.error(result.msg || 'Failed to add to cart');
          return;
        }
      } catch (error) {
        console.error('Add to cart backend error:', error);
      }
    }

    // Local fallback/handling if not logged in or backend fails silently
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
        const response = await fetch(`http://localhost:5001/cart/update/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        const result = await response.json();
        if (response.ok) {
          fetchCart();
          return;
        } else {
          toast.error(result.msg || 'Failed to update quantity');
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
      // Backend handles removal via update with quantity 0
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
          await fetch(`http://localhost:5001/likes/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          await fetch('http://localhost:5001/likes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
          });
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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: details.name,
          email: details.email
        }),
      });
      const result = await response.json();
      if (response.ok) {
        fetchUserDetails();
        return true;
      }
      toast.error(result.msg || 'Failed to update profile');
      return false;
    } catch (error) {
      console.error('Update user details error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const addAddress = useCallback(async (addressData) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressType: addressData.type || 'home',
          fullAddress: addressData.fullAddress,
          city: addressData.city || 'Kochi',
          district: addressData.district || 'Ernakulam',
          state: addressData.state || 'Kerala',
          pincode: parseInt(addressData.pincode) || 0,
          landmark: addressData.landmark || '',
          phoneNumber: parseInt(addressData.phone?.replace(/\D/g, '')) || 0,
          isDefault: addressData.isDefault || false
        }),
      });
      const result = await response.json();
      if (response.ok) {
        fetchUserDetails();
        return true;
      }
      toast.error(result.msg || 'Failed to add address');
      return false;
    } catch (error) {
      console.error('Add address error:', error);
      return false;
    }
  }, [fetchUserDetails]);

  const updateAddress = useCallback(async (id, addressData) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/address/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressType: addressData.type,
          fullAddress: addressData.fullAddress,
          landmark: addressData.landmark,
          pincode: parseInt(addressData.pincode)
        }),
      });
      if (response.ok) {
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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/address/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
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
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/address/default/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `ORD-${20000 + orders.length + 1}`,
      orderDate: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  }, [orders.length, clearCart]);

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
