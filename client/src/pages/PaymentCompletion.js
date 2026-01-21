import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api.js';
import toast from 'react-hot-toast';
import { CheckCircle, Upload, CreditCard } from 'lucide-react';

const PaymentCompletion = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    upiId: '',
    bankName: '',
    paymentApp: '',
    screenshot: null
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await API.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPaymentDetails = async (e) => {
    e.preventDefault();
    
    if (!paymentDetails.transactionId) {
      toast.error('Please enter transaction ID');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('transactionId', paymentDetails.transactionId);

      if (order.paymentMethod === 'upi') {
        if (!paymentDetails.upiId) {
          toast.error('Please enter your UPI ID');
          return;
        }
        formData.append('upiId', paymentDetails.upiId);
        if (paymentDetails.screenshot) {
          formData.append('screenshot', paymentDetails.screenshot);
        }
        await API.post('/api/payment/verify-upi-payment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (order.paymentMethod === 'netbanking') {
        if (!paymentDetails.bankName) {
          toast.error('Please select your bank');
          return;
        }
        formData.append('bankName', paymentDetails.bankName);
        await API.post('/api/payment/netbanking-payment', formData);
      } else if (order.paymentMethod === 'qrcode') {
        if (!paymentDetails.paymentApp) {
          toast.error('Please select payment app used');
          return;
        }
        formData.append('paymentApp', paymentDetails.paymentApp);
        if (paymentDetails.screenshot) {
          formData.append('screenshot', paymentDetails.screenshot);
        }
        await API.post('/api/payment/qrcode-payment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Payment details submitted successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Order Created Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Order #{order._id.slice(-8)} - ₹{order.totalPrice.toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Complete Your Payment
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Please complete the payment using the details provided during checkout, then enter your transaction details below.
            </p>
          </div>

          {/* Payment Details Form */}
          <form onSubmit={handleSubmitPaymentDetails} className="space-y-4">
            {/* Common Transaction ID field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={paymentDetails.transactionId}
                onChange={(e) => setPaymentDetails(prev => ({...prev, transactionId: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter transaction ID from your payment app"
                required
              />
            </div>

            {/* UPI specific fields */}
            {order.paymentMethod === 'upi' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your UPI ID *
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.upiId}
                    onChange={(e) => setPaymentDetails(prev => ({...prev, upiId: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="yourname@paytm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentDetails(prev => ({...prev, screenshot: e.target.files[0]}))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Net Banking specific fields */}
            {order.paymentMethod === 'netbanking' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name *
                </label>
                <select
                  value={paymentDetails.bankName}
                  onChange={(e) => setPaymentDetails(prev => ({...prev, bankName: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select your bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* QR Code specific fields */}
            {order.paymentMethod === 'qrcode' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment App Used *
                  </label>
                  <select
                    value={paymentDetails.paymentApp}
                    onChange={(e) => setPaymentDetails(prev => ({...prev, paymentApp: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select payment app</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentDetails(prev => ({...prev, screenshot: e.target.files[0]}))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Payment Details'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/orders')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletion;
