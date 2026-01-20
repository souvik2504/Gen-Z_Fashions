// Update client/src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        item => item.product === action.payload.product && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product === action.payload.product &&
            item.size === action.payload.size &&
            item.color === action.payload.color
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    // 🔥 NEW: Set cart from database
    case 'SET_DATABASE_CART':
      const dbItems = action.payload.items?.map(item => ({
        id: `${item.product._id || item.product}-${item.size}-${item.color}`,
        product: item.product._id || item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      })) || [];

      return {
        ...state,
        items: dbItems,
        loading: false
      };

    // 🔥 NEW: Set loading state
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    loading: false // 🔥 NEW: Add loading state
  });

  // 🔥 UPDATED: Handle authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in - load from database and sync local cart
      loadDatabaseCart();
    } else if (!isAuthenticated) {
      // User logged out - clear cart and save empty state
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
      console.log('🧹 Cart cleared due to logout');
    }
  }, [isAuthenticated, user]);

  // 🔥 NEW: Load cart from database for authenticated users
  const loadDatabaseCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📦 Loading cart from database...');
      
      // Get local cart items for syncing
      const localCartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // If there are local items, sync them first
      if (localCartItems.length > 0) {
        console.log('🔄 Syncing', localCartItems.length, 'local items to database');
        await syncLocalCartToDatabase(localCartItems);
        localStorage.removeItem('cart'); // Clear local cart after sync
      }
      
      // Fetch cart from database
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      dispatch({ type: 'SET_DATABASE_CART', payload: response.data });
      console.log('✅ Database cart loaded with', response.data.totalItems, 'items');
      
    } catch (error) {
      console.error('❌ Error loading database cart:', error);
      // Fallback to local cart
      loadLocalCart();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 🔥 NEW: Sync local cart items to database
  const syncLocalCartToDatabase = async (localItems) => {
    try {
      const transformedItems = localItems.map(item => ({
        product: item.product,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }));

      await axios.post('/api/cart/sync', {
        localCartItems: transformedItems
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Local cart synced to database');
    } catch (error) {
      console.error('❌ Error syncing local cart:', error);
    }
  };

  // 🔥 NEW: Load cart from local storage for guest users
  const loadLocalCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
        console.log('📦 Local cart loaded with', cartData.length, 'items');
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('cart');
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  // 🔥 UPDATED: Save to localStorage only for guest users
  useEffect(() => {
    if (!isAuthenticated && state.items.length >= 0) {
      try {
        localStorage.setItem('cart', JSON.stringify(state.items));
        console.log('💾 Cart saved to localStorage');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [state.items, isAuthenticated]);

  // 🔥 UPDATED: Add to cart with database integration
  const addToCart = async (product, size, color, quantity = 1) => {
    try {
      if (isAuthenticated) {
        // Add to database cart
        console.log('🛒 Adding to database cart:', { product: product._id, size, color, quantity });
        
        const response = await axios.post('/api/cart/add', {
          productId: product._id,
          size,
          color,
          quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        dispatch({ type: 'SET_DATABASE_CART', payload: response.data.cart });
        console.log('✅ Item added to database cart');
        
      } else {
        // Add to local cart (existing logic)
        dispatch({
          type: 'ADD_TO_CART',
          payload: {
            id: `${product._id}-${size}-${color}`,
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '/placeholder-tshirt.jpg',
            size,
            color,
            quantity
          }
        });
        console.log('✅ Item added to local cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      
      // Fallback to local cart if database fails
      if (isAuthenticated) {
        dispatch({
          type: 'ADD_TO_CART',
          payload: {
            id: `${product._id}-${size}-${color}`,
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '/placeholder-tshirt.jpg',
            size,
            color,
            quantity
          }
        });
      }
    }
  };

  // 🔥 UPDATED: Remove from cart with database integration
  const removeFromCart = async (id) => {
    try {
      if (isAuthenticated) {
        // Parse ID to get product details
        const [productId, size, color] = id.split('-');
        
        console.log('🗑️ Removing from database cart:', { productId, size, color });
        
        const response = await axios.delete('/api/cart/remove', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          data: { productId, size, color }
        });
        
        dispatch({ type: 'SET_DATABASE_CART', payload: response.data.cart });
        console.log('✅ Item removed from database cart');
        
      } else {
        // Remove from local cart (existing logic)
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
        console.log('✅ Item removed from local cart');
      }
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      
      // Fallback to local removal if database fails
      if (isAuthenticated) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
      }
    }
  };

  // 🔥 UPDATED: Update quantity with database integration
  const updateQuantity = async (id, quantity) => {
    try {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      if (isAuthenticated) {
        // Parse ID to get product details
        const [productId, size, color] = id.split('-');
        
        console.log('🔄 Updating database cart:', { productId, size, color, quantity });
        
        const response = await axios.put('/api/cart/update', {
          productId,
          size,
          color,
          quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        dispatch({ type: 'SET_DATABASE_CART', payload: response.data.cart });
        console.log('✅ Cart updated in database');
        
      } else {
        // Update local cart (existing logic)
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
        console.log('✅ Local cart updated');
      }
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
      
      // Fallback to local update if database fails
      if (isAuthenticated) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      }
    }
  };

  // 🔥 UPDATED: Clear cart with database integration
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        console.log('🧹 Clearing database cart');
        
        await axios.delete('/api/cart/clear', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log('✅ Database cart cleared');
      } else {
        console.log('🧹 Clearing local cart');
        localStorage.removeItem('cart');
      }
      
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      toast.error('Failed to clear cart');
      
      // Fallback to local clear
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
    }
  };

  // 🔥 NEW: Refresh cart from database
  const refreshCart = () => {
    if (isAuthenticated) {
      loadDatabaseCart();
    } else {
      loadLocalCart();
    }
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      loading: state.loading, // 🔥 NEW: Expose loading state
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart, // 🔥 NEW: Expose refresh function
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
