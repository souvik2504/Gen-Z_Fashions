import React from 'react';
import Loader from './Loader';

const PageLoader = ({ 
  loading, 
  children, 
  text = 'Loading...', 
  minHeight = 'min-h-screen',
  showText = true 
}) => {
  if (loading) {
    return (
      <div className={`${minHeight} flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <Loader />
        {showText && (
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  return children;
};

export default PageLoader;
