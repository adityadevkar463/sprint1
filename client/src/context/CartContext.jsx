import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCartItems(response.data.cartItems);
      setCartTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartItemCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

