// Create file: client/src/components/SearchBox.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

const SearchBox = ({ className = '', placeholder = "Search products..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Get recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch search suggestions (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 1) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (term) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&limit=5`);
      const data = await response.json();
      
      // Extract unique product names and categories
      const productSuggestions = data.products?.slice(0, 5).map(product => ({
        type: 'product',
        text: product.name,
        id: product._id,
        image: product.images?.[0],
        price: product.price
      })) || [];

      setSuggestions(productSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToRecentSearches = (term) => {
    if (!term || term.length < 2) return;
    
    const updated = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchValue = searchTerm) => {
    if (!searchValue.trim()) return;
    
    saveToRecentSearches(searchValue.trim());
    navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/products/${suggestion.id}`);
    } else {
      handleSearch(suggestion.text);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRecentSearch = (term) => {
    handleSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const popularSearches = ['t-shirt', 'men', 'women', 'graphic tee', 'casual'];

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          
          {/* Search Icon */}
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
              }}
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                Products
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {suggestion.image && (
                    <img
                      src={suggestion.image}
                      alt={suggestion.text}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-tshirt.jpg';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {suggestion.text}
                    </div>
                    {suggestion.price && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{suggestion.price}
                      </div>
                    )}
                  </div>
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!loading && suggestions.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(term)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!loading && suggestions.length === 0 && searchTerm.length === 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                Popular Searches
              </div>
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && suggestions.length === 0 && searchTerm.length > 1 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No products found</p>
              <button
                onClick={handleSubmit}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Search for "{searchTerm}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
