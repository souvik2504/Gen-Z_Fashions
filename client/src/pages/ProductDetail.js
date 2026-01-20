import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api.js";
import toast from "react-hot-toast";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import PageLoader from "../components/PageLoader";
import ImageZoom from '../components/ImageZoom';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  ThumbsUp,
  User,
  Calendar,
  Check,
  BellIcon,
  X,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && product) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, product]);

  // 🔥 NEW: Helper functions for variant-based products
  const getAvailableColors = () => {
    if (!product) return [];
    
    if (product.variants && product.variants.length > 0) {
      // New format: get unique colors from variants
      const colors = product.variants.map(v => v.color);
      return [...new Set(colors)];
    } else if (product.colors) {
      // Fallback for old format
      return product.colors;
    }
    return [];
  };

  const getAvailableSizes = () => {
  if (!product) return [];
  
  if (product.variants && product.variants.length > 0) {
    // New format: get ALL sizes available for selected color (not filtering by stock)
    if (!selectedColor) return [];
    
    // Get all predefined sizes first
    const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    // Filter to show only sizes that exist as variants for this color
    const availableSizesForColor = allSizes.filter(size => {
      return product.variants.some(v => v.size === size && v.color === selectedColor);
    });
    
    return availableSizesForColor; // 🔥 FIXED: Show all sizes, don't filter by stock
    
  } else if (product.sizes) {
    // Fallback for old format - show all sizes
    return product.sizes.map(s => s.size);
  }
  return [];
};

  const getCurrentVariantStock = () => {
    if (!product || !selectedSize || !selectedColor) return 0;
    
    if (product.variants && product.variants.length > 0) {
      // New format: find specific variant
      const variant = product.variants.find(v => 
        v.size === selectedSize && v.color === selectedColor
      );
      return variant ? variant.stock : 0;
    } else if (product.sizes) {
      // Fallback for old format
      const sizeStock = product.sizes.find(s => s.size === selectedSize);
      return sizeStock ? sizeStock.stock : 0;
    }
    return 0;
  };

  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();
  const currentStock = getCurrentVariantStock();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/products/${id}`);
      setProduct(response.data);

      console.log('🔍 Product data:', response.data);
      console.log('🔍 Has variants?', !!response.data.variants);
      console.log('🔍 Variants:', response.data.variants);
      console.log('🔍 Old sizes:', response.data.sizes);
      console.log('🔍 Old colors:', response.data.colors);

      // 🔍 DEBUG: Check variants for Black color specifically
    if (response.data.variants) {
      const blackVariants = response.data.variants.filter(v => v.color === 'Black');
      console.log('🔍 Black variants:', blackVariants);
      
      blackVariants.forEach(variant => {
        console.log(`🔍 Black ${variant.size}: ${variant.stock} stock`);
      });
    }

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATED: Initialize selected color and size after product loads
  useEffect(() => {
    if (product && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [product, availableColors.length]);

  useEffect(() => {
    if (product && selectedColor && availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [product, selectedColor, availableSizes.length]);

  // 🔥 NEW: Handle color change (reset size selection)
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedSize(''); // Reset size when color changes
    setQuantity(1); // Reset quantity
  };

  // 🔥 NEW: Handle size change
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantity when size changes
  };

  const fetchRelatedProducts = async () => {
    try {
      console.log("Related products requested for product ID:", id);
      const response = await API.get(`/api/products/${id}/related`);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await API.get(`/api/wishlist/check/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await API.delete(`/api/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await API.post(
          "/api/wishlist",
          { productId: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  // 🔥 UPDATED: Use new stock calculation
  const getAvailableStock = () => {
    return currentStock;
  };

  const handleAddToCart = () => {

    if (!isAuthenticated) {
    toast.error("Please login to add items to cart");
    navigate("/login");
    return;
  }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (currentStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (currentStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    const buyNowProduct = {
      product: product._id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      quantity,
      price: product.price,
      image: product.images?.[0] || "/placeholder-tshirt.jpg",
    };

    navigate("/checkout", { state: { buyNowProduct } });
  };

  const handleQuantityChange = (increment) => {
    const newQuantity = quantity + increment;
    const maxStock = getAvailableStock();

    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleNotifyMe = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color first");
      return;
    }

    setNotifyLoading(true);
    setNotifySuccess(false);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to subscribe for notifications");
        setNotifyLoading(false);
        return;
      }

      const response = await fetch("/api/notify-me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          size: selectedSize,
          color: selectedColor, // 🔥 Include color in notify request
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotifySuccess(true);
        toast.success("You'll be notified when this item is back in stock!");
      } else {
        toast.error(data.message || "Failed to subscribe for notifications.");
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setNotifyLoading(false);
    }
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!product) {
    return null;
  }

  return (
    <PageLoader loading={loading} text="Loading product details...">
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              
              <ImageZoom
                src={
                  product.images?.[currentImageIndex] ||
                  "/placeholder-tshirt.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-tshirt.jpg";
                }}
              />
               {/* Zoom indicator */}
              {/* Wishlist Button as heart icon, top-right */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
                  bg-white bg-opacity-50 backdrop-blur-sm shadow-md
                  transition-colors duration-300
                  ${
                    inWishlist
                      ? "text-red-500"
                      : "text-gray-700 dark:text-gray-300"
                  }
                  ${
                    wishlistLoading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-white hover:bg-opacity-70"
                  }`}
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-tshirt.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {product.rating?.toFixed(1) || "0.0"} (
                  {product.numReviews || 0} reviews)
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ₹{product.price}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 🔥 UPDATED: Color Selection (shown first) */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 border rounded-lg transition-colors capitalize ${
                        selectedColor === color
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 UPDATED: Size Selection (shown after color) */}
            {selectedColor && availableSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Size
                  {selectedColor && (
                    <span className="text-sm text-gray-500 ml-2">
                      (for {selectedColor})
                    </span>
                  )}
                   <Link
                    to="/size-guide"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm ml-3"
                  >
                    Size Guide
                  </Link>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    // 🔥 NEW: Get stock for this specific size
                    const sizeStock = product.variants.find(v => 
                      v.size === size && v.color === selectedColor
                    )?.stock || 0;
                    const isOutOfStock = sizeStock === 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-2 border rounded-lg transition-colors relative ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-500 text-white"
                            : isOutOfStock
                            ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400"
                        }`}
                      >
                        {size}
                        {/* 🔥 NEW: Show "Sold Out" indicator */}
                        {isOutOfStock && (
                          <span className="block text-xs text-red-500 mt-1">
                            Sold Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🔥 NEW: Selection Status */}
            {selectedColor && selectedSize && (
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Selected:</strong> {selectedColor} • {selectedSize}
                  {currentStock > 0 ? (
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      • {currentStock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 ml-2">
                      • Out of stock
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Show message if no sizes available for selected color */}
            {selectedColor && availableSizes.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  No sizes available for {selectedColor}. Try selecting a different color.
                </p>
              </div>
            )}

            {/* Quantity */}
            {selectedSize && selectedColor && currentStock > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4 text-black dark:text-white" />
                    </button>
                    <span className="px-4 py-2 font-semibold text-gray-800 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= currentStock}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 text-black dark:text-white" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStock} available
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {currentStock > 0 && selectedSize && selectedColor ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{isAuthenticated ? "Add to Cart" : "Login to Add to Cart"}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 dark:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>{isAuthenticated ? "Buy Now" : "Login to Buy Now"}</span>
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-400 dark:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {!selectedColor || !selectedSize 
                      ? "Select Size & Color" 
                      : "Out of Stock"
                    }
                  </span>
                </button>
              )}
            </div>

            {/* Notify Me and Share */}
            <div className="flex space-x-4">
              <button
                onClick={handleNotifyMe}
                disabled={currentStock > 0 || !selectedSize || !selectedColor || notifyLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors
                  ${
                    currentStock === 0 && selectedSize && selectedColor
                      ? "bg-orange-50 dark:bg-orange-900 border border-orange-500 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-800"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }
                  ${notifyLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                title={
                  !selectedSize || !selectedColor
                    ? "Select size and color first"
                    : currentStock > 0
                    ? "Product is in stock"
                    : "Notify me when this variant is back in stock"
                }
              >
                <BellIcon className={`w-5 h-5`} />
                <span>
                  {notifyLoading
                    ? "Subscribing..."
                    : notifySuccess
                    ? "Subscribed!"
                    : "Notify Me"}
                </span>
              </button>

              <button
                onClick={shareProduct}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Stock Status */}
            {selectedSize && selectedColor && (
              <div className="flex items-center space-x-2">
                {currentStock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {currentStock} in stock for {selectedColor} • {selectedSize}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Out of stock for {selectedColor} • {selectedSize}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product._id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${relatedProduct._id}`)}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={
                        relatedProduct.images?.[0] || "/placeholder-tshirt.jpg"
                      }
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/placeholder-tshirt.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2 truncate">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold">
                      ₹{relatedProduct.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

// Reviews Section Component (unchanged)
const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // 🔥 NEW: Current scroll position
  const [sortBy, setSortBy] = useState("newest");
  const reviewsPerPage = 2; // 🔥 NEW: Show 2 reviews at a time

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  // 🔥 NEW: Reset to first page when reviews change
  useEffect(() => {
    setCurrentIndex(0);
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/product/${productId}`, {
        params: { sort: sortBy, limit: 50 } // Get more reviews for scrolling
      });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // 🔥 NEW: Navigation functions
  const canGoNext = currentIndex + reviewsPerPage < reviews.length;
  const canGoPrev = currentIndex > 0;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentPage = Math.floor(currentIndex / reviewsPerPage) + 1;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + reviewsPerPage);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(Math.max(0, currentIndex - reviewsPerPage));
    }
  };

  // 🔥 NEW: Get current reviews to display
  const getCurrentReviews = () => {
    return reviews.slice(currentIndex, currentIndex + reviewsPerPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Header with total count and controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.length > reviewsPerPage && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing {currentIndex + 1}-{Math.min(currentIndex + reviewsPerPage, reviews.length)} of {reviews.length} reviews
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No reviews yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to review this product!
          </p>
        </div>
      ) : (
        <>
          {/* 🔥 NEW: Scrollable Reviews Container */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {getCurrentReviews().map((review, index) => (
                <div
                  key={review._id}
                  className={`p-6 transition-colors duration-200 ${
                    index === 0 ? '' : 'bg-gray-750 dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {review.user.name}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {review.isVerifiedPurchase && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                ✅ Verified Purchase
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                      {review.title}
                    </h4>
                  )}

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {review.comment}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Size: {review.size}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Color: {review.color}
                    </span>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Review image ${imgIndex + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleHelpfulVote(review._id)}
                      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpfulVotes || 0})</span>
                    </button>
                    
                    <div className="text-xs text-gray-400">
                      Review #{currentIndex + index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 NEW: Navigation Controls */}
          {reviews.length > reviewsPerPage && (
            <div className="flex items-center justify-between mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  canGoPrev
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              {/* Page Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, pageIndex) => (
                    <div
                      key={pageIndex}
                      className={`w-2 h-2 rounded-full ${
                        pageIndex === currentPage - 1
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  canGoNext
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* 🔥 NEW: Quick Stats */}
          {reviews.length > 0 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">{reviews.length}</span> customer reviews available
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Average rating: <span className="font-semibold">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ★
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetail;
