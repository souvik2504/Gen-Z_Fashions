import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, Trash2, ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistItems();
    }
  }, [isAuthenticated]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlistItems(res.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlistItems((prev) => prev.filter(item => item.product._id !== productId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const addToCartFromWishlist = (item) => {
    // Use the same signature as your addToCart in ProductDetail.js
    const defaultSize = item.product.sizes?.[0]?.size || 'M';
    const defaultColor = item.product.colors?.[0] || 'Default';

    addToCart(item.product, defaultSize, defaultColor, 1);
    toast.success('Item added to cart');
  };

  const goToProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <Heart className="mx-auto w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">Please login to view your wishlist.</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Heart className="w-8 h-8 text-red-600" /> My Wishlist
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-16 text-gray-700 dark:text-gray-400">
          <Heart className="mx-auto w-20 h-20 mb-4" />
          <p className="mb-4 text-lg">Your wishlist is empty.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col justify-between"
            >
              <div className="relative">
                <img
                  src={item.product.images?.[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <button
                  onClick={() => removeFromWishlist(item.product._id)}
                  title="Remove from wishlist"
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 dark:hover:bg-red-900 transition"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer"
                  onClick={() => goToProductDetails(item.product._id)}
                >
                  {item.product.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-4">
                  ₹{item.product.price}
                </p>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => addToCartFromWishlist(item)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-lg font-semibold flex-grow"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => goToProductDetails(item.product._id)}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
