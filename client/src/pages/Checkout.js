import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api.js";
import toast from "react-hot-toast";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Circle, Gift, Info } from "lucide-react";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [loyaltyStamps, setLoyaltyStamps] = useState(0);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);

  const [orderTotal, setOrderTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponInfo, setCouponInfo] = useState(null);

  const buyNowProduct = location.state?.buyNowProduct || null;

  // Keep cartItems state synced with context, if you need it independently
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    setCartItems(items || []);
  }, [items]);

  // Recalculate totals when cart or buyNowProduct changes
  useEffect(() => {
    calculateOrderTotal();
  }, [items, buyNowProduct]); // items comes from context

  // When orderTotal changes, update finalTotal (default = no discount)
  useEffect(() => {
    setFinalTotal(orderTotal);
  }, [orderTotal]);

  // Main order total calculator
  const calculateOrderTotal = () => {
    if (buyNowProduct) {
      const subtotal = buyNowProduct.price * buyNowProduct.quantity;
      const shippingCost = subtotal >= 599 ? 0 : 70;
      const total = subtotal + shippingCost;
      setOrderTotal(total);
      setFinalTotal(total);
      return;
    }

    const validCart = items || [];
    if (validCart.length === 0) {
      setOrderTotal(0);
      setFinalTotal(0);
      return;
    }
    const subtotal = validCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = subtotal >= 599 ? 0 : 70;
    const total = subtotal + shippingCost;
    setOrderTotal(total);
    setFinalTotal(total);
  };

  const handleApplyCoupon = async () => {
    let calculatedTotal = 0;
    let atLeastOneProduct = false;

    if (buyNowProduct) {
      const subtotal = buyNowProduct.price * buyNowProduct.quantity;
      const shippingCost = subtotal >= 599 ? 0 : 70;
      calculatedTotal = subtotal + shippingCost;
      atLeastOneProduct = true;
    } else {
      const validCart = items || [];
      atLeastOneProduct = validCart.length > 0;
      const subtotal = validCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = subtotal >= 599 ? 0 : 70;
      calculatedTotal = subtotal + shippingCost;
    }

    if (!atLeastOneProduct || calculatedTotal <= 0) {
      toast.error(
        "Please add products to your cart or use Buy Now before applying coupon."
      );
      return;
    }
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);
    try {
      const res = await API.post(
        "/api/coupons/apply",
        {
          code: couponCode.trim(),
          orderTotal: calculatedTotal,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { discount, newTotal, coupon } = res.data;
      setDiscount(discount);
      setFinalTotal(newTotal);
      setCouponInfo(coupon);
      toast.success(
        `Coupon applied: ${coupon?.description || coupon?.surprise}`
      );
    } catch (error) {
      setDiscount(0);
      setFinalTotal(calculatedTotal);
      setCouponInfo(null);
      const msg = error?.response?.data?.message || "Invalid or expired coupon";
      toast.error(msg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await API.get("/api/loyalty/status", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLoyaltyStamps(res.data.stamps || 0);
      } catch (error) {
        // fail silently or log, it's optional info
        console.error("Error fetching loyalty status:", error);
      } finally {
        setLoadingLoyalty(false);
      }
    };

    fetchLoyalty();
  }, []);

  // Calculate remaining to claim
  const remainingStamps = 10 - loyaltyStamps;

  // const buyNowProduct = location.state?.buyNowProduct || null;

  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || "", // Added name field
    phone: user?.phone || "", // Added phone field
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [selectedPayment, setSelectedPayment] = useState("razorpay");
  const [currentOrder, setCurrentOrder] = useState(null);

  const checkoutItems = buyNowProduct
    ? [
        {
          id: `buynow_${buyNowProduct.product}`,
          product: buyNowProduct.product,
          name: buyNowProduct.name,
          size: buyNowProduct.size,
          color: buyNowProduct.color,
          quantity: buyNowProduct.quantity,
          price: buyNowProduct.price,
          image: buyNowProduct.image,
        },
      ]
    : items;

  const subtotalPrice = buyNowProduct
    ? buyNowProduct.price * buyNowProduct.quantity
    : getTotalPrice();

  const shipping = subtotalPrice >= 599 ? 0 : 70;
  // const baseTotal = subtotalPrice + shipping;
  // const total = finalTotal && finalTotal !== 0 ? finalTotal : baseTotal;
  const beforeTax = subtotalPrice + shipping - discount;
  const tax = beforeTax > 0 ? beforeTax * 0.02 : 0;
  const finalTotalAmount = beforeTax + tax;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (!buyNowProduct && items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, buyNowProduct, items, navigate]);

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Updated validation to include name and phone
  const validateShippingInfo = () => {
    const requiredFields = [
      "name",
      "phone",
      "street",
      "city",
      "state",
      "zipCode",
    ];
    const missing = requiredFields.filter((f) => !shippingInfo[f]);
    return missing.length === 0;
  };

  // Validate phone number format (Indian mobile number)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  // Enhanced validation with specific error messages
  const getValidationErrors = () => {
    const errors = [];

    if (!shippingInfo.name.trim()) {
      errors.push("Name is required");
    }

    if (!shippingInfo.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!validatePhoneNumber(shippingInfo.phone)) {
      errors.push("Please enter a valid 10-digit mobile number");
    }

    if (!shippingInfo.street.trim()) {
      errors.push("Street address is required");
    }

    if (!shippingInfo.city.trim()) {
      errors.push("City is required");
    }

    if (!shippingInfo.state.trim()) {
      errors.push("State is required");
    }

    if (!shippingInfo.zipCode.trim()) {
      errors.push("PIN code is required");
    }

    return errors;
  };

  const handleRazorpayPayment = async () => {
  const validationErrors = getValidationErrors();
  if (validationErrors.length > 0) {
    toast.error(validationErrors[0]);
    return;
  }

  try {
    setLoading(true);

    // 🔥 STEP 1: Create ONLY Razorpay order (NO database order yet)
    const razorpayResponse = await API.post("/api/razorpay/create-order", {
      amount: finalTotalAmount, // Remove orderId from here
      customerInfo: {
        name: shippingInfo.name,
        email: user?.email || "",
        phone: shippingInfo.phone,
      },
    });

    if (!razorpayResponse.data.success) {
      throw new Error("Failed to create Razorpay order");
    }

    // 🔥 STEP 2: Open Razorpay checkout (still no database order)
    const options = {
      key: razorpayResponse.data.key,
      amount: razorpayResponse.data.amount,
      currency: razorpayResponse.data.currency,
      name: "Gen-Z Fashion",
      description: "Payment for your order",
      order_id: razorpayResponse.data.orderId, // This is Razorpay order ID
      prefill: {
        name: shippingInfo.name,
        email: user?.email || "",
        contact: shippingInfo.phone,
      },
      theme: {
        color: "#3B82F6",
      },
      handler: async function (response) {
        console.log("Razorpay payment successful:", response);

        try {
          // 🔥 STEP 3: NOW create database order after successful payment
          const orderData = {
            orderItems: checkoutItems.map((item) => ({
              product: item.product,
              name: item.name,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })),
            shippingAddress: shippingInfo,
            paymentMethod: "razorpay",
            totalPrice: finalTotalAmount,
            couponCode: couponInfo?.code || null,
            isPaid: true, // 🔥 Mark as paid since payment succeeded
            paidAt: new Date(),
            status: "processing",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            paymentResult: {
              id: response.razorpay_payment_id,
              status: 'completed',
              razorpay_signature: response.razorpay_signature
            }
          };

          // Create order in database ONLY after payment success  
          const orderResponse = await axios.post("/api/orders", orderData);
          const createdOrder = orderResponse.data;

          // 🔥 STEP 4: Verify payment signature
          const verifyResponse = await axios.post("/api/razorpay/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: createdOrder._id,
          });

          if (verifyResponse.data.success) {
            if (!buyNowProduct) clearCart();
            toast.success("Payment successful! Order placed.");
            navigate("/orders");
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error("Order creation failed:", error);
          toast.error("Order creation failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: function () {
          // 🔥 User cancelled payment - no database order was created!
          console.log("Payment cancelled by user");
          toast.error("Payment cancelled");
          setLoading(false);
          // Nothing to clean up since no database order exists
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    
    // Reset loading state only after modal opens
    setLoading(false);

  } catch (error) {
    console.error("Payment initiation error:", error);
    toast.error("Failed to initiate payment. Please try again.");
    setLoading(false);
  }
};


  const placeCodOrder = async () => {
  const validationErrors = getValidationErrors();
  if (validationErrors.length > 0) {
    toast.error(validationErrors[0]);
    return;
  }

  try {
    setLoading(true);

    // 🔥 DEBUG: Check coupon state before sending
    console.log("=== FRONTEND COD DEBUG ===");
    console.log("couponInfo state:", couponInfo);
    console.log("couponInfo?.code:", couponInfo?.code);
    console.log("finalTotal:", finalTotal);
    console.log("discount:", discount);

    const orderData = {
      orderItems: checkoutItems.map((item) => ({
        product: item.product,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: shippingInfo, // Now includes name and phone
      paymentMethod: 'cod', // 🔥 CRITICAL: Set payment method as 'cod'
      totalPrice: finalTotal, // 🔥 Use finalTotal (with discount applied)
      couponCode: couponInfo?.code || null, // 🔥 CRITICAL: Include coupon code
      isPaid: false,
      status: 'processing'
    };

    // 🔥 ADD THIS DEBUG SECTION
    console.log("=== COD ORDER DATA BEING SENT ===");
    console.log("Full order data:", orderData);
    console.log("Extracted couponCode:", orderData.couponCode);

    // 🔥 FIX: Use the same endpoint as Razorpay orders
    const response = await axios.post("/api/orders", orderData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    if (!buyNowProduct) clearCart();

    toast.success("Order placed successfully! Please pay on delivery.");
    navigate("/orders");
  } catch (error) {
    console.error("COD order error:", error);
    toast.error("Failed to place COD order. Please contact support.");
  } finally {
    setLoading(false);
  }
};


  if (!isAuthenticated || (!buyNowProduct && items.length === 0)) return null;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Checkout
        </h1>
        {buyNowProduct && (
          <span className="ml-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm">
            Quick Buy
          </span>
        )}
      </div>

      {/* Loyalty progress callout */}
      {!loadingLoyalty && (
        <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg mb-4">
          <Gift className="w-6 h-6" />
          {loyaltyStamps < 10 ? (
            <p>
              You&apos;re just <strong>{remainingStamps}</strong>{" "}
              {remainingStamps === 1 ? "purchase" : "purchases"} away from your
              next loyalty token!
            </p>
          ) : (
            <p>This purchase earns your next loyalty token!</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Shipping Information Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Contact & Shipping Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={shippingInfo.name}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Street Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingInfo.street}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter your street address"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter state"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  required
                  placeholder="Enter PIN code"
                  maxLength="6"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center max-w-md">
            <input
              type="text"
              placeholder="Have a coupon code?"
              value={couponCode}
              onChange={handleCouponChange}
              className="flex-grow border border-gray-300 rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Coupon code"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applyingCoupon}
              className="ml-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded px-4 py-2 transition"
              aria-label="Apply coupon"
            >
              {applyingCoupon ? "Applying..." : "Apply"}
            </button>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Payment Method
            </h2>

            <div className="flex gap-4 mb-4">
              {/* COD Button */}
              <button
                type="button"
                onClick={() => setSelectedPayment("cod")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-semibold transition-all ${
                  selectedPayment === "cod"
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                }`}
                disabled={loading}
              >
                <Circle className="w-5 h-5" />
                COD (Cash on Delivery)
              </button>

              {/* Razorpay Button */}
              <button
                type="button"
                onClick={() => setSelectedPayment("razorpay")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-semibold transition-all ${
                  selectedPayment === "razorpay"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
                disabled={loading}
              >
                <img
                  src="https://razorpay.com/favicon.png"
                  alt="Razorpay"
                  className="w-5 h-5"
                />
                Pay with Razorpay
              </button>
            </div>

            {/* Payment Action Buttons */}
            {selectedPayment === "cod" && (
              <div>
                <button
                  onClick={placeCodOrder}
                  disabled={getValidationErrors().length > 0 || loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading
                    ? "Placing Order..."
                    : `Place Order - ₹${finalTotalAmount.toFixed(2)} (COD)`}
                </button>

                {/* Show validation errors for COD */}
                {getValidationErrors().length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Please fill all required fields marked with *
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedPayment === "razorpay" && (
              <div>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={getValidationErrors().length > 0 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading
                    ? "Processing..."
                    : `Pay ₹${finalTotalAmount.toFixed(2)} with Razorpay`}
                </button>

                {/* Show validation errors for Razorpay */}
                {getValidationErrors().length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Please fill all required fields marked with *
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {checkoutItems.map((item) => (
                <div
                  key={item.id || item.product}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.size} | {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* <div className="border-t dark:border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Discount</span>
                <span>₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-700 pt-3">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              {subtotalPrice < 599 && (
                <p className="text-sm text-red-500">
                  Add ₹{(599 - subtotalPrice).toFixed(2)} for free shipping
                </p>
              )}
              {buyNowProduct && (
                <p className="mt-4 text-green-600 font-semibold">
                  Quick checkout - item won&apos;t be saved to cart
                </p>
              )}
            </div> */}

            <div className="space-y-3">
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 dark:text-gray-300">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
              </div>

              {/* ✅ NEW - Tax row with info button */}
              <div className="flex justify-between items-center relative text-gray-800 dark:text-gray-300">
                <div className="flex items-center space-x-1 ">
                  <span>Tax (2%)</span>
                  <button
                    type="button"
                    onClick={() => setShowTaxInfo(!showTaxInfo)}
                    className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {/* ✅ NEW - Tax info tooltip */}
                  {showTaxInfo && (
                    <div className="absolute top-6 left-0 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 p-2 rounded shadow-md w-56 z-10">
                      Tax includes:<br />
                      • GST<br />
                      • Packaging charges<br />
                      • Platform service fee<br />
                      • Payment gateway charges
                    </div>
                  )}
                </div>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              {/* ✅ UPDATED - Changed from "Total" to "Final Total" */}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-700 pt-3">
                <span>Final Total</span>
                <span>₹{finalTotalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
        <Lock />
        All payments are secure and encrypted.
      </div>
    </div>
  );
};

export default Checkout;
