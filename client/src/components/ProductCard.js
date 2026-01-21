import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  // JSON-LD structured data for product
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0] || `${siteUrl}/placeholder-tshirt.jpg`,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Gen-Z Fashions"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": product.sizes?.some(s => s.stock > 0) 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Gen-Z Fashions"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews || 0
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/products/${product._id}`}>
          <div className="relative w-full h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={
                product.images?.[0]
                  ? `${process.env.REACT_APP_API_URL}${product.images[0]}`
                  : '/placeholder-tshirt.jpg'
              }
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-tshirt.jpg';
              }}
            />
            {product.featured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Featured
              </div>
            )}
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/products/${product._id}`}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              ({product.numReviews || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {product.category}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {product.sizes?.slice(0, 4).map((sizeObj, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
              >
                {sizeObj.size}
              </span>
            ))}
            {product.sizes?.length > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{product.sizes.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
