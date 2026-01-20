// Create file: client/src/pages/NotFound.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  RefreshCw,
  AlertTriangle,
  Compass,
  Lightbulb
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const popularPages = [
    { 
      title: 'Home', 
      path: '/', 
      icon: Home, 
      description: 'Return to our homepage' 
    },
    { 
      title: 'All Products', 
      path: '/products', 
      icon: ShoppingBag, 
      description: 'Browse our t-shirt collection' 
    },
    { 
      title: 'Men\'s T-Shirts', 
      path: '/products?category=men', 
      icon: ShoppingBag, 
      description: 'Shop men\'s collection' 
    },
    { 
      title: 'Women\'s T-Shirts', 
      path: '/products?category=women', 
      icon: ShoppingBag, 
      description: 'Shop women\'s collection' 
    },
    { 
      title: 'Size Guide', 
      path: '/size-guide', 
      icon: MapPin, 
      description: 'Find your perfect fit' 
    },
    { 
      title: 'FAQ', 
      path: '/faq', 
      icon: Lightbulb, 
      description: 'Get answers to common questions' 
    }
  ];

  const helpfulTips = [
    {
      icon: Search,
      title: 'Try Searching',
      description: 'Use our search feature to find what you\'re looking for'
    },
    {
      icon: RefreshCw,
      title: 'Refresh the Page',
      description: 'Sometimes a simple refresh can solve the problem'
    },
    {
      icon: Compass,
      title: 'Check Navigation',
      description: 'Use our main navigation menu to browse categories'
    },
    {
      icon: Phone,
      title: 'Contact Support',
      description: 'Our team is here to help you find what you need'
    }
  ];

  return (
    <>
      <SEO
        title="404 - Page Not Found | Gen-Z Fashion"
        description="Sorry, the page you're looking for doesn't exist. Explore our t-shirt collection or return to our homepage."
        canonical={`${siteUrl}/404`}
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 transition-colors">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              {/* Large 404 Text */}
              <div className="text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 select-none">
                404
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full opacity-70 animate-bounce"></div>
              <div className="absolute -top-2 -right-6 w-6 h-6 bg-pink-400 rounded-full opacity-70 animate-bounce delay-300"></div>
              <div className="absolute -bottom-2 left-1/4 w-4 h-4 bg-green-400 rounded-full opacity-70 animate-bounce delay-700"></div>
              
              {/* T-shirt Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              The page you're looking for seems to have wandered off into the fashion void.
            </p>
            <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>URL: {location.pathname}</span>
            </div>
          </div>

          {/* Auto Redirect Notice */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-4 inline-block">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-5 h-5" />
              <span>Redirecting to homepage in {countdown} seconds</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for t-shirts, styles, colors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Navigation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {popularPages.map((page, index) => {
                const IconComponent = page.icon;
                return (
                  <Link
                    key={index}
                    to={page.path}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {page.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {page.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What You Can Do
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {helpfulTips.map((tip, index) => {
                const IconComponent = tip.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {tip.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </Link>
              
              <button
                onClick={() => navigate(-1)}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 px-8 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
              
              <Link
                to="/products"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Now</span>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need Help? Contact Our Support Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>tshirtwala247@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91-XXXX-XXXX-XX</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>24/7 Live Chat</span>
              </div>
            </div>
          </div>

          {/* Fun Message */}
          <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm">
            <p>
              Don't worry, even our best t-shirts sometimes go missing in the laundry! 👕✨
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
