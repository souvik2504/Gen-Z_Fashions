import React from "react";
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
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import NotFound from './pages/NotFound';
// Import admin components
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminSettings from "./pages/admin/AdminSettings";
import PaymentCompletion from "./pages/PaymentCompletion";
// import AdminNotifications from './components/admin/AdminNotifications';
import AdminNotifications from './pages/admin/AdminNotifications';


function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
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
                        <Route path="/wishlist"element={<Wishlist />} />
                        <Route path="/about" element={<AboutUs />} /> 
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/size-guide" element={<SizeGuide />} />

                        {/* Admin routes */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminDashboard />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/products"
                          element={
                            <AdminRoute>
                              <AdminProducts />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <AdminRoute>
                              <AdminOrders />
                            </AdminRoute>
                          }
                        />
                        <Route path="/admin/notifications" element={<AdminRoute> <AdminNotifications /></AdminRoute>} />
                        <Route
                          path="/admin/users"
                          element={
                            <AdminRoute>
                              <AdminUsers />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/returns"
                          element={
                            <AdminRoute>
                              <AdminReturns />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <AdminRoute>
                              <AdminSettings />
                            </AdminRoute>
                          }
                        />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
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
}

export default App;
