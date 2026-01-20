import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';

const RazorpayCheckout = ({ 
  amount, 
  orderId, 
  customerInfo, 
  onSuccess, 
  onError,
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating Razorpay order...', { amount, orderId });

      // Create order on backend
      const response = await axios.post('/api/razorpay/create-order', {
        amount,
        orderId,
        customerInfo
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const { orderId: razorpayOrderId, key } = response.data;

      // Razorpay checkout options
      const options = {
        key: key, // Razorpay key from backend
        amount: amount * 100, // amount in paise
        currency: 'INR',
        name: 'Gen-Z Fashions',
        description: `Payment for Order #${orderId.slice(-8)}`,
        image: '/logo192.png', // Your logo
        order_id: razorpayOrderId,
        
        // Customer details
        prefill: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          contact: customerInfo.phone || ''
        },

        // Available payment methods
        config: {
          display: {
            blocks: {
              utib: { // Net Banking
                name: 'Net Banking',
                instruments: [
                  { method: 'netbanking' }
                ]
              },
              other: { // Other methods
                name: 'Other Payment Methods',
                instruments: [
                  { method: 'card' },
                  { method: 'upi' },
                  { method: 'wallet' },
                  { method: 'emi' }
                ]
              }
            },
            hide: [
              { method: 'paylater' } // Hide pay later options
            ],
            sequence: ['block.utib', 'block.other']
          }
        },

        // Theme customization
        theme: {
          color: '#3B82F6' // Blue color
        },

        // Payment success handler
        handler: async function (response) {
          console.log('Razorpay payment response:', response);
          
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post('/api/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                method: verifyResponse.data.paymentMethod
              });
            } else {
              throw new Error(verifyResponse.data.message);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            onError(error);
          }
        },

        // Payment modal settings
        modal: {
          ondismiss: function() {
            console.log('Razorpay checkout dismissed');
            toast.error('Payment cancelled');
            onError(new Error('Payment cancelled by user'));
          },
          
          // Auto-close on successful payment
          escape: false,
          backdropclose: false
        },

        // Notes for the payment
        notes: {
          order_id: orderId,
          customer_name: customerInfo.name || '',
          website: 'tshirtstore.com'
        }
      };

      console.log('Opening Razorpay checkout...', options);

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        onError(new Error(response.error.description));
      });

      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.message || 'Failed to initiate payment');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Methods Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
          Available Payment Methods
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Smartphone className="w-4 h-4" />
            <span>UPI</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Building2 className="w-4 h-4" />
            <span>Net Banking</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Wallet className="w-4 h-4" />
            <span>Wallets</span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handleRazorpayPayment}
        disabled={loading || disabled}
        className="w-full bg-blue-600 dark:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Opening Payment Gateway...
          </>
        ) : (
          <>
            <img 
              src="https://razorpay.com/favicon.png" 
              alt="Razorpay" 
              className="w-5 h-5 mr-2"
            />
            Pay ₹{amount.toFixed(2)} with Razorpay
          </>
        )}
      </button>

      {/* Security Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>🔒 Secured by Razorpay • All payment methods supported</p>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
