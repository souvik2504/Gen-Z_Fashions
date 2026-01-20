const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

class RazorpayService {
  // Create order
  static async createOrder(amount, orderId, customerInfo = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: orderId,
        payment_capture: 1,
        notes: {
          order_id: orderId,
          customer_name: customerInfo.name || '',
          customer_email: customerInfo.email || ''
        }
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error('Failed to create Razorpay order');
    }
  }

  // FIXED: Verify payment signature
  static verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      console.log('=== SIGNATURE VERIFICATION ===');
      console.log('Order ID:', orderId);
      console.log('Payment ID:', paymentId);
      console.log('Received Signature:', signature);
      console.log('Secret Key exists:', !!process.env.RAZORPAY_KEY_SECRET);

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      console.log('Expected Signature:', expectedSignature);
      console.log('Signatures match:', expectedSignature === signature);

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // Create refund
  static async createRefund(paymentId, amount, reason = '') {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100),
        notes: {
          reason: reason,
          refund_type: 'normal'
        }
      });
      return refund;
    } catch (error) {
      console.error('Refund creation error:', error);
      throw new Error('Failed to create refund');
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(body, signature, secret) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }
}

module.exports = RazorpayService;
