import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Copy, CheckCircle, XCircle } from "lucide-react";

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/loyalty/status", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // 🔥 NEW: Sort coupons to show newest first
      const sortedCoupons = response.data.claimedCoupons.sort((a, b) => {
        // Sort by creation date (newest first), fallback to claimed date
        const dateA = new Date(a.createdAt || a.claimedAt || a.receivedAt);
        const dateB = new Date(b.createdAt || b.claimedAt || b.receivedAt);
        return dateB - dateA; // Newest first
      });
      
      setCoupons(sortedCoupons);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // 🔥 NEW: Get relative time for recent coupons
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Coupon code copied");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
        My Coupons
        {/* 🔥 NEW: Show total count */}
        {!loading && coupons.length > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({coupons.length})
          </span>
        )}
      </h3>

      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-black dark:text-white">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎫</div>
          <p className="text-black dark:text-white font-medium">You have no coupons yet.</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Complete your loyalty card to earn surprise coupons!
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <ul className="space-y-4 pr-2">
            {coupons.map((coupon, index) => {
              const expired = new Date(coupon.expiresAt) < new Date();
              const used = !!coupon.usedAt;
              const isNew = index < 3 && !used && !expired; // 🔥 NEW: Mark first 3 unused coupons as "new"
              
              return (
                <li
                  key={coupon.code}
                  className={`relative flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    expired || used
                      ? "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      : "bg-green-50 dark:bg-green-900 border-green-400 text-green-800 dark:text-green-300 hover:shadow-md"
                  }`}
                >
                  {/* 🔥 NEW: "New" badge for recent coupons */}
                  {isNew && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                      NEW
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <code className={`font-mono text-lg tracking-widest select-all ${
                        used ? 'line-through' : 'font-bold'
                      }`}>
                        {coupon.code}
                      </code>
                      
                      {/* 🔥 NEW: Rarity badge if available */}
                      {coupon.rarity && !used && !expired && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          coupon.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          coupon.rarity === 'epic' ? 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          coupon.rarity === 'rare' ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          coupon.rarity === 'uncommon' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {coupon.rarity?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium mb-1">
                      {coupon.description || coupon.surprise}
                    </div>
                    
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {/* 🔥 UPDATED: DD/MM/YYYY format */}
                      <div>
                        Expires: {formatDate(coupon.expiresAt)}
                      </div>
                      
                      {/* 🔥 NEW: Show when coupon was received */}
                      <div className="text-gray-500 dark:text-gray-500">
                        Received: {getRelativeTime(coupon.createdAt || coupon.claimedAt || coupon.receivedAt)}
                      </div>
                      
                      {/* 🔥 NEW: Show minimum order if exists */}
                      {coupon.minOrder > 0 && !used && !expired && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          Min. order: ₹{coupon.minOrder}
                        </div>
                      )}
                    </div>
                    
                    {used && (
                      <div className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Used on {formatDate(coupon.usedAt)}</span>
                      </div>
                    )}
                    
                    {expired && !used && (
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2 flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Expired</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => copyCode(coupon.code)}
                    disabled={expired || used}
                    title={
                      expired
                        ? "Coupon expired"
                        : used
                        ? "Coupon already used"
                        : "Copy code"
                    }
                    className={`ml-4 p-2 rounded-lg transition-all duration-200 ${
                      expired || used 
                        ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-600" 
                        : "text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transform hover:scale-110"
                    }`}
                  >
                    {copied === coupon.code ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
