const crypto = require('crypto');

class NetBankingService {
  static supportedBanks = [
    { code: 'SBI', name: 'State Bank of India', gateway: 'sbi_gateway' },
    { code: 'HDFC', name: 'HDFC Bank', gateway: 'hdfc_gateway' },
    { code: 'ICICI', name: 'ICICI Bank', gateway: 'icici_gateway' },
    { code: 'AXIS', name: 'Axis Bank', gateway: 'axis_gateway' },
    { code: 'KOTAK', name: 'Kotak Mahindra Bank', gateway: 'kotak_gateway' }
  ];

  // Generate payment form for specific bank
  static generatePaymentForm(bankCode, amount, orderId, returnUrl) {
    const bank = this.supportedBanks.find(b => b.code === bankCode);
    if (!bank) {
      throw new Error('Unsupported bank');
    }

    // Generate secure hash
    const hash = this.generateHash(orderId, amount, bankCode);

    return {
      bankName: bank.name,
      gatewayUrl: `https://payment.${bank.gateway}.com/payment`,
      formData: {
        merchant_id: process.env.MERCHANT_ID,
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        return_url: returnUrl,
        hash: hash,
        bank_code: bankCode
      }
    };
  }

  // Generate secure hash for payment
  static generateHash(orderId, amount, bankCode) {
    const data = `${orderId}|${amount}|${bankCode}|${process.env.MERCHANT_SECRET}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Verify payment response
  static verifyPaymentResponse(responseData) {
    const { order_id, amount, status, transaction_id, hash } = responseData;
    const expectedHash = this.generateHash(order_id, amount, responseData.bank_code);
    
    return {
      valid: hash === expectedHash,
      status: status,
      transactionId: transaction_id,
      orderId: order_id
    };
  }
}

module.exports = NetBankingService;
