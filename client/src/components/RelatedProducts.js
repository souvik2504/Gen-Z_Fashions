import React, { useState, useEffect } from 'react';
import API from '../api.js';
import ProductCard from './ProductCard';
import Loader from './Loader';

const RelatedProducts = ({ productId, currentProductName }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('RelatedProducts: productId:', productId);
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching related products for:', productId);
      const response = await API.get(`/api/products/${productId}/related`);
      console.log('API Response:', response.data);
      
      setRelatedProducts(response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug render
  console.log('Render state:', { 
    productId, 
    loading, 
    error, 
    productsCount: relatedProducts.length 
  });

  // if (loading) {
  //   return (
  //     <section className="mt-16 bg-blue-100 dark:bg-blue-900 p-6 rounded">
  //       <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
  //         Loading Similar Products...
  //       </h2>
  //       <p>Fetching products for ID: {productId}</p>
  //     </section>
  //   );
  // }

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Similar Products
        </h2>
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Finding similar products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-16 bg-red-100 dark:bg-red-900 p-6 rounded">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">
          Error Loading Similar Products
        </h2>
        <p className="text-red-600 dark:text-red-300">Error: {error}</p>
        <p className="text-sm text-red-500">Product ID: {productId}</p>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <section className="mt-16 bg-yellow-100 dark:bg-yellow-900 p-6 rounded">
        <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
          No Similar Products Found
        </h2>
        <p className="text-yellow-600 dark:text-yellow-300">
          No related products available for this item.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-16 bg-green-100 dark:bg-green-900 p-6 rounded">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
        You Might Also Like
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
