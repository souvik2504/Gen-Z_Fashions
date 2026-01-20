// Enhanced version: client/src/components/SliderToggle.js
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const SliderToggle = ({ isOn, onToggle, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-8 w-16 rounded-full transition-all duration-300 focus:outline-none focus:ring-offset-2 ${
        isOn 
          ? 'bg-gray-800 dark:bg-gray-700' 
          : 'bg-orange-500 dark:bg-blue-600'
      } ${className}`}
      aria-label="Toggle theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        {/* Sun Icon (Left Side) */}
        <Sun 
          className={`h-4 w-4 transition-opacity duration-300 ${
            isOn ? 'text-gray-500 opacity-50' : 'text-white opacity-100'
          }`} 
        />
        
        {/* Moon Icon (Right Side) */}
        <Moon 
          className={`h-4 w-4 transition-opacity duration-300 ${
            isOn ? 'text-white opacity-100' : 'text-blue-300 opacity-50'
          }`} 
        />
      </div>

      {/* Slider Circle */}
      <span
        className={`relative inline-block h-6 w-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 z-10 ${
          isOn ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {/* Active Icon in Circle */}
        <span className="flex items-center justify-center h-full w-full">
          {isOn ? (
            <Moon className="h-3 w-3 text-gray-800" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-600" />
          )}
        </span>
      </span>
    </button>
  );
};

export default SliderToggle;
