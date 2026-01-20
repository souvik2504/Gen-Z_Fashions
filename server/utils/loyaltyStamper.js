const Order = require('../models/order');
const User = require('../models/User');

async function stampEligibleOrders() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const eligibleOrders = await Order.find({
    isDelivered: true,
    status: 'delivered',
    loyaltyStampAdded: { $ne: true },
    deliveredAt: { $lte: sevenDaysAgo },
  });

  let totalStamped = 0;

  for (const order of eligibleOrders) {
    if (order.loyaltyStampAdded) continue;
    if (order.returnStatus && order.returnStatus !== null) continue;
    if (order.status === 'cancelled') continue;

    const totalQuantity = order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (totalQuantity <= 0) continue;

    const user = await User.findById(order.user);
    if (!user) continue;

    const currentStamps = user.loyalty.stamps || 0;
    const availableSlots = 10 - currentStamps;
    const stampsToAdd = Math.min(totalQuantity, availableSlots);

    if (stampsToAdd <= 0) continue;

    user.loyalty.stamps = currentStamps + stampsToAdd;
    await user.save();

    order.loyaltyStampAdded = true;
    await order.save();

    totalStamped += stampsToAdd;
  }

  return totalStamped;
}

module.exports = stampEligibleOrders;
