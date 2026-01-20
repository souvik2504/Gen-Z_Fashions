import React, { createContext, useContext, useState } from 'react';

const SEOContext = createContext();

export const SEOProvider = ({ children }) => {
  const [seoData, setSeoData] = useState({
    title: 'Gen-Z Fashions - Premium Quality T-Shirts Online',
    description: 'Shop premium quality t-shirts online. Wide range of comfortable, stylish t-shirts for men, women, and kids. Free shipping on orders over ₹50.',
    keywords: 't-shirts, online shopping, premium quality, comfortable clothing, fashion',
    canonical: window.location.href,
    image: `${window.location.origin}/logo512.png`,
    type: 'website'
  });

  return (
    <SEOContext.Provider value={{ seoData, setSeoData }}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within SEOProvider');
  }
  return context;
};
