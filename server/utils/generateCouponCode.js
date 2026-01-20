const crypto = require('crypto');
const User = require('../models/user');

async function generateCouponCode(length = 8) {
  let code = '';
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
    // Optionally, check if this code already exists for any user
    exists = await User.exists({ 'loyalty.claimedCoupons.code': code });
  }

  return code;
}

module.exports = generateCouponCode;
