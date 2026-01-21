import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/PageLoader';
import ReviewModal from '../components/ReviewModal';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  Truck, 
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Phone,
  User,
  CreditCard,
  Star,
  MessageSquare
} from 'lucide-react';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Order details modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewOrderItem, setReviewOrderItem] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(new Set());

    // 🔥 NEW: Return modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [returningOrder, setReturningOrder] = useState(null);

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery taking too long',
    'Need to change size/color',
    'Financial reasons',
    'Other'
  ];

  // 🔥 NEW: Return reasons
  const returnReasons = [
    'Defective/Damaged product',
    'Wrong item received',
    'Size/fit issues',
    'Quality not as expected',
    'Product not as described',
    'Changed my mind',
    'Found better price elsewhere',
    'Delivery was too late',
    'Other'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchReviewedItems();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/orders/myorders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewedItems = async () => {
    try {
      const response = await API.get('/api/reviews/user-reviews');
      const reviewedOrderItems = response.data.map(review => review.orderItem);
      setReviewedItems(new Set(reviewedOrderItems));
    } catch (error) {
      console.error('Error fetching reviewed items:', error);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      
      const response = await API.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 🔥 COMPLETELY FIXED: Review functions with robust product ID extraction
  const handleReviewClick = (order, orderItem) => {
    console.log('=== REVIEW CLICK DEBUG ===');
    console.log('Order Item:', orderItem);
    console.log('Order Item Product:', orderItem.product);
    
    // Extract the actual product ID string with all possible cases handled
    let productId;
    
    try {
      if (typeof orderItem.product === 'string') {
        // Case 1: product is already a string ID
        productId = orderItem.product;
      } else if (orderItem.product && typeof orderItem.product === 'object') {
        // Case 2: product is an object (populated)
        if (typeof orderItem.product._id === 'string') {
          productId = orderItem.product._id;
        } else if (orderItem.product._id && typeof orderItem.product._id === 'object') {
          // Case 3: _id is a MongoDB ObjectId
          productId = orderItem.product._id.toString();
        } else if (orderItem.product._id) {
          // Case 4: Try to convert _id to string
          productId = String(orderItem.product._id);
        } else {
          // Case 5: No _id field, try to convert whole object
          productId = String(orderItem.product);
        }
      } else {
        // Case 6: Fallback
        productId = String(orderItem.product || '');
      }

      console.log('Extracted Product ID:', productId);
      console.log('Product ID type:', typeof productId);
      
      // Validate that we have a valid string ID
      if (!productId || typeof productId !== 'string' || productId === '[object Object]') {
        throw new Error('Invalid product ID extracted');
      }
      
    } catch (error) {
      console.error('Error extracting product ID:', error);
      console.error('Original product data:', orderItem.product);
      toast.error('Unable to process product information for review');
      return;
    }
    
    setReviewOrder(order);
    setReviewOrderItem(orderItem);
    setReviewProduct({
      _id: productId, // Use the extracted string ID
      name: orderItem.name,
      image: orderItem.image
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log('=== REVIEW SUBMIT DEBUG ===');
      console.log('Review Data:', reviewData);
      console.log('Review Product:', reviewProduct);

      // Validate required data
      if (!reviewProduct?._id) {
        toast.error('Product information missing');
        return;
      }
      
      if (!reviewOrder?._id) {
        toast.error('Order information missing');
        return;
      }
      
      if (!reviewOrderItem?._id) {
        toast.error('Order item information missing');
        return;
      }

      // Get the product ID and ensure it's a string
      let productId = reviewProduct._id;
      
      // Additional safety check to ensure string conversion
      if (typeof productId !== 'string') {
        if (productId && productId._id) {
          productId = String(productId._id);
        } else {
          productId = String(productId);
        }
      }

      // Final validation to prevent [object Object]
      if (!productId || productId === '[object Object]' || typeof productId !== 'string') {
        console.error('Invalid product ID after conversion:', productId);
        toast.error('Invalid product information. Please try again.');
        return;
      }

      console.log('Final Product ID (validated):', productId);

      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('orderId', reviewOrder._id);
      formData.append('orderItemId', reviewOrderItem._id);
      formData.append('rating', reviewData.rating.toString());
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      formData.append('size', reviewOrderItem.size || 'N/A');
      formData.append('color', reviewOrderItem.color || 'N/A');

      // Debug FormData
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (${typeof value})`);
      }

      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await API.post('/api/reviews', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Review response:', response.data);
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      
      // Update reviewed items
      setReviewedItems(prev => new Set([...prev, reviewOrderItem._id]));
      fetchOrders();

    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
    }
  };

  // 🔥 NEW: Return functions
  const canReturnOrder = (order) => {
    // Can return within 7 days of delivery
    if (!order.isDelivered || order.status !== 'delivered') {
      return false;
    }
    
    const deliveryDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysDiff = (now - deliveryDate) / (1000 * 60 * 60 * 24);
    
    return daysDiff <= 7 && order.returnStatus !== 'requested' && order.returnStatus !== 'approved';
  };

  const handleReturnClick = (order) => {
    setOrderToReturn(order);
    setReturnReason('');
    setReturnDetails('');
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnReason) {
      toast.error('Please select a reason for return');
      return;
    }

    if (!returnDetails.trim()) {
      toast.error('Please provide details about the return');
      return;
    }

    setReturningOrder(orderToReturn._id);
    
    try {
      await API.put(`/api/orders/${orderToReturn._id}/return`, {
        reason: returnReason,
        details: returnDetails.trim()
      });
      
      toast.success('Return request submitted successfully! We will process it within 24 hours.');
      setShowReturnModal(false);
      setOrderToReturn(null);
      setReturnReason('');
      setReturnDetails('');
      fetchOrders();
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setReturningOrder(null);
    }
  };

  const canReviewItem = (order, orderItem) => {
    return order.isDelivered && 
           order.status === 'delivered' && 
           !reviewedItems.has(orderItem._id);
  };

  const canCancelOrder = (order) => {
    const allowedStatuses = ['pending', 'processing'];
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
    const cancellationWindow = order.isPaid ? 1 : 24;
    
    return (
      allowedStatuses.includes(order.status) &&
      !order.isDelivered &&
      hoursDiff <= cancellationWindow
    );
  };

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    setCancellingOrder(orderToCancel._id);
    
    try {
      await API.put(`/api/orders/${orderToCancel._id}/cancel`, {
        reason: cancelReason
      });
      
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      setOrderToCancel(null);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'returned': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (isPaid, paymentMethod) => {
    if (paymentMethod === 'cod') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
    return isPaid 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

    // 🔥 NEW: Get return status color
    const getReturnStatusColor = (returnStatus) => {
    switch (returnStatus) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pickup_scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'refund_processing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'refund_completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return '';
    }
  };

  // Update the getReturnStatusLabel function
  const getReturnStatusLabel = (returnStatus) => {
    switch (returnStatus) {
      case 'requested': return 'Return Requested';
      case 'approved': return 'Return Approved';
      case 'rejected': return 'Return Rejected';
      case 'pickup_scheduled': return 'Pickup Scheduled';
      case 'picked_up': return 'Item Picked Up';
      case 'refund_processing': return 'Refund Processing';
      case 'refund_completed': return 'Refund Completed';
      default: return returnStatus;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-gray-200 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your orders.</p>
          <Link
            to="/login"
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageLoader loading={loading} text="Loading your orders...">
      <div className="container mx-auto px-4 py-8 bg-gray-200 dark:bg-gray-900 min-h-screen transition-colors">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              No orders yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              When you place orders, they'll appear here.
            </p>
            <Link
              to="/products"
              className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    {/* 🔥 NEW: Return status badge */}
                    {order.returnStatus && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getReturnStatusColor(
                          order.returnStatus
                        )}`}
                      >
                        Return {order.returnStatus}
                      </span>
                    )}
                    
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                        order.isPaid,
                        order.paymentMethod
                      )}`}
                    >
                      {order.paymentMethod === 'cod' 
                        ? 'Cash on Delivery' 
                        : order.isPaid 
                          ? 'Paid' 
                          : 'Payment Pending'
                      }
                    </span>

                    <div className="flex items-center text-lg font-bold text-gray-800 dark:text-white">
                    ₹{order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Order Items with Review Options */}
                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden">
                            <Link 
                              to={`/products/${item.product._id}`}
                              className="block w-full h-full hover:opacity-80 transition-opacity duration-200"
                            >
                              <img
                                src={item.image || '/placeholder-tshirt.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onError={(e) => {
                                  e.target.src = '/placeholder-tshirt.jpg';
                                }}
                              />
                            </Link>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.size} | {item.color} | Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Review Button for Delivered Items */}
                        <div className="flex space-x-2">
                          {canReviewItem(order, item) ? (
                            <button
                              onClick={() => handleReviewClick(order, item)}
                              className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors text-sm"
                            >
                              <Star className="w-4 h-4" />
                              <span>Write Review</span>
                            </button>
                          ) : reviewedItems.has(item._id) ? (
                            <span className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Reviewed</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {order.isPaid ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Paid
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400 text-sm">
                        <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-2"></div>
                        {order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Payment Pending'}
                      </span>
                    )}

                    {order.isDelivered ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <Truck className="w-4 h-4 mr-1" />
                        Delivered
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <Truck className="w-4 h-4 mr-1" />
                        {order.status === 'shipped' ? 'In Transit' : 'Not Shipped'}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleViewDetails(order._id)}
                      className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    
                     {/* 🔥 REPLACED: Reorder button with Return button */}
                    {canReturnOrder(order) && (
                      <button 
                        onClick={() => handleReturnClick(order)}
                        className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Return Order</span>
                      </button>
                    )}

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        disabled={cancellingOrder === order._id}
                        className="flex items-center space-x-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingOrder === order._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>Cancel Order</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {/* Return Information */}
                {order.returnStatus && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          {getReturnStatusLabel(order.returnStatus)}
                        </span>
                      </div>
                      {order.returnStatus === 'refund_completed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          ✓ Refund Complete
                        </span>
                      )}
                    </div>
                    
                    {order.returnReason && (
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Reason: {order.returnReason}
                      </p>
                    )}
                    
                    {order.refundAmount && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Refund Amount: ₹{order.refundAmount.toFixed(2)}
                        {order.refundCompletedAt && (
                          <span className="ml-2 text-xs text-gray-600">
                            (Completed on {new Date(order.refundCompletedAt).toLocaleDateString()})
                          </span>
                        )}
                      </p>
                    )}
                    
                    {order.returnRequestedAt && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Requested on: {new Date(order.returnRequestedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Cancellation Info */}
                {order.status === 'cancelled' && order.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Order Cancelled
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Reason: {order.cancellationReason}
                    </p>
                    {order.cancellationDate && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Cancelled on: {new Date(order.cancellationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <ReviewModal
            product={reviewProduct}
            order={reviewOrder}
            orderItem={reviewOrderItem}
            onSubmit={handleReviewSubmit}
            onClose={() => setShowReviewModal(false)}
          />
        )}

        {/* 🔥 NEW: Return Order Modal */}
        {showReturnModal && orderToReturn && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
              <div className="flex items-center mb-4">
                <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Return Order
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Request return for order #{orderToReturn._id.slice(-8)}. 
                You have 7 days from delivery to return items.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for return *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional details *
                </label>
                <textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Please describe the issue in detail. This helps us process your return faster."
                  maxLength="500"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {returnDetails.length}/500 characters
                </p>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Return Policy:</strong><br />
                  • Returns are processed within 24-48 hours<br />
                  • Refund will be processed within 5-7 business days<br />
                  • Items should be in original condition<br />
                  • Free return pickup for defective items
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setOrderToReturn(null);
                    setReturnReason('');
                    setReturnDetails('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnSubmit}
                  disabled={!returnReason || !returnDetails.trim() || returningOrder}
                  className="flex-1 px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {returningOrder === orderToReturn._id ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {loadingDetails ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : selectedOrder ? (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Order Info</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order ID: #{selectedOrder._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>

                      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Payment Info</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Method: {selectedOrder.paymentMethod.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total: ₹{selectedOrder.totalPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Delivery Info</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: {selectedOrder.isDelivered ? 'Delivered' : 'Not Delivered'}
                        </p>
                        {selectedOrder.deliveredAt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Delivered: {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Shipping Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <User className="w-4 h-4 mr-2" />
                            {selectedOrder.shippingAddress.name}
                          </p>
                          <p className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Phone className="w-4 h-4 mr-2" />
                            {selectedOrder.shippingAddress.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedOrder.shippingAddress.street}<br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                            {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {selectedOrder.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                              <img
                                src={item.image || '/placeholder-tshirt.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/placeholder-tshirt.jpg';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-white">{item.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Size: {item.size} | Color: {item.color}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800 dark:text-white">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Details */}
                    {selectedOrder.paymentResult && (
                      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {selectedOrder.paymentResult.id && (
                            <p className="text-gray-600 dark:text-gray-400">
                              Payment ID: {selectedOrder.paymentResult.id}
                            </p>
                          )}
                          {selectedOrder.paymentResult.method && (
                            <p className="text-gray-600 dark:text-gray-400">
                              Method: {selectedOrder.paymentResult.method}
                            </p>
                          )}
                          {selectedOrder.paymentResult.razorpay_order_id && (
                            <p className="text-gray-600 dark:text-gray-400">
                              Razorpay Order ID: {selectedOrder.paymentResult.razorpay_order_id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Total Breakdown */}
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Order Summary</h3>
                      <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{(selectedOrder.totalPrice - (selectedOrder.totalPrice >= 599 ? 0 : 70)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{selectedOrder.totalPrice >= 599 ? 'Free' : '₹70.00'}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Failed to load order details
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && orderToCancel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Cancel Order
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to cancel order #{orderToCancel._id.slice(-8)}? 
                This action cannot be undone.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a reason</option>
                  {cancelReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {orderToCancel.isPaid && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Refund Information:</strong><br />
                    Your refund of ₹{orderToCancel.totalPrice.toFixed(2)} will be processed within 5-7 business days.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason || cancellingOrder}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default Orders;
