import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Gen-Z Fashions</h3>
            <p className="text-gray-300 dark:text-gray-400 mb-4">
              Your go-to destination for premium quality t-shirts. 
              Comfortable, stylish, and affordable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  onClick={() => window.location.href = '/products'} // 🔥 Force navigation
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=men" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  onClick={() => window.location.href = '/products?category=men'} // 🔥 Force navigation
                >
                  Men's T-Shirts
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=women" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  onClick={() => window.location.href = '/products?category=women'} // 🔥 Force navigation
                >
                  Women's T-Shirts
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=kids" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  onClick={() => window.location.href = '/products?category=kids'} // 🔥 Force navigation
                >
                  Kids T-Shirts
                </Link>
              </li>
            </ul>
          </div>


          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-300 dark:text-gray-400">
                  123 Fashion Street, City, State 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-300 dark:text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-300 dark:text-gray-400">tshirtwala247@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300 dark:text-gray-400">
            © 2024 Gen-Z Fashions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  