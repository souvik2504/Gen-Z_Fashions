import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SEOProvider } from "./contexts/SEOContext";
import ScrollToTop from './components/ScrollToTop';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";

// Core pages - Eager load
import Home from "./pages/Home";

// Route-based code splitting - Lazy load
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin components - Lazy load
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const PaymentCompletion = lazy(() => import("./pages/PaymentCompletion"));


function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Don't render GoogleOAuthProvider if client ID is missing
  if (!googleClientId) {
    console.warn('Google Client ID is missing. Google OAuth will be disabled.');
  }

  // Suspense fallback component
  const RouteLoader = () => <PageLoader loading={true} text="Loading..." />;

  const AppContent = () => (
    <HelmetProvider>
      <SEOProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Navbar />
                  <main className="container mx-auto px-4 pt-0">
                    <Suspense fallback={<RouteLoader />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                          path="/products/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/about" element={<AboutUs />} /> 
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/size-guide" element={<SizeGuide />} />

                        {/* Admin routes */}
                        <Route
                          path="/admin"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminDashboard />
                              </AdminRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/admin/products"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminProducts />
                              </AdminRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminOrders />
                              </AdminRoute>
                            </Suspense>
                          }
                        />
                        <Route 
                          path="/admin/notifications" 
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminNotifications />
                              </AdminRoute>
                            </Suspense>
                          } 
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminUsers />
                              </AdminRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/admin/returns"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminReturns />
                              </AdminRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <AdminRoute>
                                <AdminSettings />
                              </AdminRoute>
                            </Suspense>
                          }
                        />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      className: "dark:bg-gray-800 dark:text-white",
                    }}
                  />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        </GoogleOAuthProvider>
      </SEOProvider>
    </HelmetProvider>
  );

  // Conditionally wrap with GoogleOAuthProvider only if client ID exists
  // return googleClientId ? (
  //   <GoogleOAuthProvider clientId={googleClientId}>
  //     <AppContent />
  //   </GoogleOAuthProvider>
  // ) : (
  //   <AppContent />
  // );
}

export default App;
