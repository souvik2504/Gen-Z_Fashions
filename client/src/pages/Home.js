import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import WelcomeModal from "../components/WelcomeModal";
import ProductCard from "../components/ProductCard";
import PageLoader from "../components/PageLoader";
import SEO from "../components/SEO";
import BannerSlideshow from "../components/BannerSlideshow";
import { ChevronRight } from "lucide-react";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
  try {
    setLoading(true);
    // 🔥 FIX: Use the dedicated featured endpoint
    const response = await axios.get("/api/products/featured?limit=8");
    console.log('Featured products response:', response.data); // Debug log
    setFeaturedProducts(response.data); // No need for .products since /featured returns array directly
  } catch (error) {
    console.error("Error fetching featured products:", error);
    setFeaturedProducts([]);
  } finally {
    setLoading(false);
  }
};

  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  return (
    <>
      <SEO
        title="Gen-Z Fashions - Premium Quality T-Shirts Online | Free Shipping"
        description="Shop premium quality t-shirts online. Wide range of comfortable, stylish t-shirts for men, women, and kids. Free shipping on orders over ₹50. Best prices guaranteed."
        keywords="t-shirts online, premium t-shirts, men t-shirts, women t-shirts, kids t-shirts, online shopping, comfortable clothing, fashion, free shipping"
        canonical={`${siteUrl}/`}
        image={`${siteUrl}/og-home.jpg`}
        type="website"
      />

      {!isAuthenticated && <WelcomeModal />}

      <PageLoader loading={loading} text="Loading amazing t-shirts...">
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
          {/* <div className="container mx-auto px-4 py-8 space-y-16"> */}

          {/* Hero Section */}
          <section className="mt-3 mb-3">
            {/* <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Premium T-Shirts for Everyone
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover our collection of high-quality, comfortable, and stylish t-shirts 
              perfect for any occasion. From casual wear to statement pieces.
            </p>
            <Link
              to="/products"
              className="bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
            >
              Shop Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div> */}
            <BannerSlideshow />
          </section>

          {/* Categories Section */}
          <section className="mb-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                Shop by Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "men",
                    image:
                      "https://veirdo.in/cdn/shop/files/Artboard_1.jpg?v=1726317512",
                  },
                  {
                    name: "women",
                    image:
                      "https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/466939/clientProducts/31205234/images/default.jpg",
                  },
                  {
                    name: "unisex",
                    image:
                      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&crop=center",
                  },
                  {
                    name: "kids",
                    image:
                      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop&crop=center",
                  },
                ].map((category) => (
                  <Link
                    key={category.name}
                    to={`/products?category=${category.name}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden mx-auto my-auto">
                      <img
                        src={category.image}
                        alt={`${category.name} t-shirts`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mx-auto my-auto"
                        onError={(e) => {
                          // Fallback to colored placeholder if image fails
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white"
                        style={{ display: "none" }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">👕</div>
                          <h3 className="text-xl font-bold capitalize">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize text-center">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="mb-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Featured Products
                </h2>
                <Link
                  to="/products"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold inline-flex items-center transition-colors"
                >
                  View All
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-80"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-gray-100 dark:bg-gray-800 py-12 transition-colors">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    Quality Guarantee
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Premium materials and craftsmanship in every t-shirt
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    Fast Shipping
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Free shipping on orders over ₹599. Quick delivery guaranteed
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 5a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    Easy Returns
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    7-day return policy. No questions asked
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageLoader>
    </>
  );
};

export default Home;
