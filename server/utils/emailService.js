const nodemailer = require('nodemailer');

// Create SMTP transporter with custom configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // For development
    }
  });
};

// Professional no-reply email template
const getWelcomeEmailTemplate = (userName, welcomeCoupon, userEmail = null) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to Gen-Z Fashion!</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .no-reply-notice {
                background: #ffeaa7;
                color: #2d3436;
                padding: 12px;
                text-align: center;
                font-size: 13px;
                border-bottom: 1px solid #fdcb6e;
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { 
                padding: 40px 30px; 
                background: white; 
            }
            .coupon-box { 
                background: linear-gradient(135deg, #00b894, #00cec9); 
                color: white; 
                padding: 25px; 
                border-radius: 10px; 
                margin: 25px 0; 
                text-align: center; 
                box-shadow: 0 4px 15px rgba(0,184,148,0.3);
            }
            .coupon-code { 
                font-size: 24px; 
                font-weight: bold; 
                letter-spacing: 3px; 
                margin: 15px 0; 
                padding: 10px; 
                background: rgba(255,255,255,0.2); 
                border-radius: 5px; 
                border: 2px dashed white;
            }
            .features-list {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .features-list ul {
                margin: 0;
                padding-left: 20px;
            }
            .features-list li {
                margin: 8px 0;
                color: #2d3436;
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #fd79a8, #e84393); 
                color: white; 
                padding: 15px 35px; 
                text-decoration: none; 
                border-radius: 25px; 
                margin: 25px 0; 
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(232,67,147,0.3);
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
            .footer a { 
                color: #74b9ff; 
                text-decoration: none; 
            }
            .support-info {
                background: #e8f4fd;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #0984e3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- No-Reply Notice -->
            <div class="no-reply-notice">
                📧 <strong>This is an automated no-reply email.</strong> Please do not reply to this message.
            </div>
            
            <!-- Header -->
            <div class="header">
                <h1>🎉 Welcome to Gen-Z Fashion!</h1>
                <p>Account confirmation and getting started guide</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <h2>Hello ${userName}! 👋</h2>
                
                <p>Thank you for creating your account with Gen-Z Fashion. Your account has been successfully set up and is ready to use.</p>
                
                <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>✅ Account Details Confirmed:</h3>
                    <p><strong>Email:</strong> ${userEmail || 'Your registered email'}</p>
                    <p><strong>Account Status:</strong> Active</p>
                    <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                ${welcomeCoupon ? `
                <div class="coupon-box">
                    <h3>🎁 Your Welcome Gift is Here!</h3>
                    <div class="coupon-code">${welcomeCoupon.code}</div>
                    <p><strong>${welcomeCoupon.description || welcomeCoupon.surprise}</strong></p>
                    <p><small>Valid until: ${new Date(welcomeCoupon.expiresAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</small></p>
                </div>
                ` : ''}
                
                <div class="features-list">
                    <h3>🌟 Here's what awaits you:</h3>
                    <ul>
                        <li><strong>Latest Collections:</strong> Browse our newest t-shirt designs</li>
                        <li><strong>Wishlist Feature:</strong> Save your favorite items for later</li>
                        <li><strong>Loyalty Rewards:</strong> Earn stamps with every purchase</li>
                        <li><strong>Exclusive Offers:</strong> Get special member-only discounts</li>
                        <li><strong>Fast Delivery:</strong> Quick shipping to your doorstep</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/products" class="cta-button">
                        Start Shopping Now 🛍️
                    </a>
                </div>
                
                <div class="support-info">
                    <h4>📞 Need Help?</h4>
                    <p>Our support team is here to help! For any questions or assistance:</p>
                    <p><strong>Email:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                </div>
                
                <p>Thank you for choosing Gen-Z Fashion. We can't wait to see you rocking our designs!</p>
                
                <p><strong>Happy Shopping! 🎊</strong></p>
                
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>📧 This email was sent from a no-reply address</strong></p>
                <p>For support inquiries, please contact: <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                <p style="margin-top: 20px;">© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>You received this email because you signed up for Gen-Z Fashion.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Add this new template function to your emailService.js

const getOrderConfirmationTemplate = (orderData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    orderDate,
    estimatedDelivery,
    trackingNumber = null
  } = orderData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .no-reply-notice {
                background: #d4edda;
                color: #155724;
                padding: 12px;
                text-align: center;
                font-size: 13px;
                border-bottom: 1px solid #c3e6cb;
            }
            .header { 
                background: linear-gradient(135deg, #28a745, #20c997); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .order-number {
                background: rgba(255,255,255,0.2);
                padding: 10px;
                border-radius: 5px;
                margin-top: 15px;
                font-size: 18px;
                font-weight: bold;
            }
            .content { 
                padding: 30px; 
            }
            .order-summary {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .order-item:last-child {
                border-bottom: none;
            }
            .item-details {
                flex: 1;
            }
            .item-name {
                font-weight: bold;
                color: #2d3436;
                margin-bottom: 5px;
            }
            .item-specs {
                font-size: 14px;
                color: #636e72;
                margin-bottom: 5px;
            }
            .item-price {
                font-weight: bold;
                color: #28a745;
                font-size: 16px;
            }
            .shipping-info {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .delivery-box {
                background: linear-gradient(135deg, #fd79a8, #e84393);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .delivery-date {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
            }
            .total-section {
                background: #2d3436;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
            }
            .total-final {
                font-size: 18px;
                font-weight: bold;
                border-top: 1px solid #74b9ff;
                padding-top: 10px;
                margin-top: 10px;
            }
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            .track-button {
                display: inline-block;
                background: linear-gradient(135deg, #0984e3, #74b9ff);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                font-weight: bold;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
            .footer a { 
                color: #74b9ff; 
                text-decoration: none; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- No-Reply Notice -->
            <div class="no-reply-notice">
                ✅ <strong>Order Confirmed!</strong> This is an automated confirmation email.
            </div>
            
            <!-- Header -->
            <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Thank you for your purchase</p>
                <div class="order-number">
                    Order #${orderNumber}
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <h2>Hi ${customerName}!</h2>
                
                <p>Great news! We've received your order and it's being processed. Here are your order details:</p>
                
                <!-- Order Summary -->
                <div class="order-summary">
                    <h3>📦 Order Summary</h3>
                    
                    ${orderItems.map(item => `
                    <div class="order-item">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-specs">
                                Size: ${item.size} | Color: ${item.color} | Quantity: ${item.quantity}
                            </div>
                        </div>
                        <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    `).join('')}
                </div>
                
                <!-- Delivery Information -->
                <div class="delivery-box">
                    <h3>🚚 Estimated Delivery</h3>
                    <div class="delivery-date">${estimatedDelivery}</div>
                    <p>We'll send you tracking information once your order ships!</p>
                </div>
                
                <!-- Shipping Address -->
                <div class="shipping-info">
                    <h3>📍 Shipping Address</h3>
                    <p><strong>${shippingAddress.name}</strong></p>
                    <p>${shippingAddress.street}</p>
                    <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
                    <p>${shippingAddress.country}</p>
                    <p><strong>Phone:</strong> ${shippingAddress.phone}</p>
                </div>
                
                <!-- Order Total -->
                <div class="total-section">
                    <h3>💰 Order Total</h3>
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${(totalPrice - (totalPrice >= 599 ? 0 : 70)).toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${totalPrice >= 599 ? 'Free' : '₹70.00'}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total Paid:</span>
                        <span>₹${totalPrice.toFixed(2)}</span>
                    </div>
                    <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
                        Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                </div>
                
                <!-- Call to Action -->
                <div class="cta-section">
                    <a href="${process.env.FRONTEND_URL}/orders" class="track-button">
                        View Order Details 📋
                    </a>
                    ${trackingNumber ? `
                    <a href="${process.env.FRONTEND_URL}/track/${trackingNumber}" class="track-button">
                        Track Package 📍
                    </a>
                    ` : ''}
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h4>📞 Need Help?</h4>
                    <p>If you have any questions about your order, feel free to contact us:</p>
                    <p><strong>Email:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                    <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
                
                <p>Thank you for choosing Gen-Z Fashion! We appreciate your business.</p>
                
                <p><strong>Happy Shopping! 🛍️</strong></p>
                
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>📧 This is an automated order confirmation</strong></p>
                <p>For support: <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                <p style="margin-top: 20px;">© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Order #${orderNumber} | ${new Date(orderDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Add these new template functions to your emailService.js

// Order Cancellation Email Template
const getOrderCancellationTemplate = (orderData) => {
  const {
    orderNumber,
    customerName,
    orderItems,
    totalPrice,
    refundAmount,
    refundMethod,
    cancellationReason,
    cancellationDate
  } = orderData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Cancelled - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #e17055, #fd79a8); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .cancellation-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .refund-info {
                background: #d4edda;
                border-left: 4px solid #28a745;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .order-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Order Cancelled</h1>
                <p>Order #${orderNumber}</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName},</h2>
                
                <div class="cancellation-box">
                    <h3>🚫 Your order has been cancelled</h3>
                    <p><strong>Cancellation Date:</strong> ${new Date(cancellationDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
                </div>

                <div class="order-details">
                    <h3>📦 Cancelled Items</h3>
                    ${orderItems.map(item => `
                    <div style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">
                        <strong>${item.name}</strong><br>
                        Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | ₹${(item.price * item.quantity).toFixed(2)}
                    </div>
                    `).join('')}
                    <div style="text-align: right; margin-top: 15px; font-weight: bold;">
                        Total: ₹${totalPrice.toFixed(2)}
                    </div>
                </div>

                ${refundAmount ? `
                <div class="refund-info">
                    <h3>💰 Refund Information</h3>
                    <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                    <p><strong>Refund Method:</strong> ${refundMethod}</p>
                    <p><strong>Processing Time:</strong> 5-7 business days</p>
                    <p>Your refund will be processed automatically and credited to your original payment method.</p>
                </div>
                ` : ''}

                <p>We're sorry to see you cancel your order. If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/products" 
                       style="background: linear-gradient(135deg, #0984e3, #74b9ff); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                        Continue Shopping 🛍️
                    </a>
                </div>

                <p>Thank you for choosing Gen-Z Fashion.</p>
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Order #${orderNumber} | Cancelled on ${new Date(cancellationDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Order Shipped Email Template
const getOrderShippedTemplate = (orderData) => {
  const {
    orderNumber,
    customerName,
    orderItems,
    shippingAddress,
    trackingNumber,
    estimatedDelivery,
    courierPartner
  } = orderData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Shipped - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #fd79a8, #fdcb6e); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .tracking-box {
                background: linear-gradient(135deg, #00b894, #00cec9);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .tracking-number {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 15px 0;
                padding: 10px;
                background: rgba(255,255,255,0.2);
                border-radius: 5px;
            }
            .delivery-info {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #0984e3;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Order Shipped!</h1>
                <p>Your package is on its way</p>
            </div>
            
            <div class="content">
                <h2>Great news, ${customerName}! 🎉</h2>
                
                <p>Your order has been shipped and is on its way to you. Here are your shipping details:</p>

                <div class="tracking-box">
                    <h3>📍 Track Your Package</h3>
                    <div class="tracking-number">${trackingNumber}</div>
                    <p>Courier Partner: ${courierPartner || 'Express Delivery'}</p>
                </div>

                <div class="delivery-info">
                    <h3>🚚 Delivery Information</h3>
                    <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
                    <p><strong>Shipping Address:</strong></p>
                    <div style="margin-left: 20px;">
                        ${shippingAddress.name}<br>
                        ${shippingAddress.street}<br>
                        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                        ${shippingAddress.country}<br>
                        Phone: ${shippingAddress.phone}
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📦 Shipped Items</h3>
                    ${orderItems.map(item => `
                    <div style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">
                        <strong>${item.name}</strong><br>
                        <span style="color: #636e72;">Size: ${item.size} | Color: ${item.color} | Quantity: ${item.quantity}</span>
                    </div>
                    `).join('')}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/track/${trackingNumber}" 
                       style="background: linear-gradient(135deg, #0984e3, #74b9ff); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                        Track Package 📍
                    </a>
                    <a href="${process.env.FRONTEND_URL}/orders" 
                       style="background: linear-gradient(135deg, #fd79a8, #e84393); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                        View Order 📋
                    </a>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>📞 Questions about your shipment?</h4>
                    <p>Contact us at: <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                </div>

                <p>Thank you for shopping with Gen-Z Fashion!</p>
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Order #${orderNumber} | Tracking: ${trackingNumber}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Order Delivered Email Template
const getOrderDeliveredTemplate = (orderData) => {
  const {
    orderNumber,
    customerName,
    orderItems,
    deliveredDate,
    totalPrice
  } = orderData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Delivered - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #00b894, #00cec9); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .delivery-celebration {
                background: linear-gradient(135deg, #fd79a8, #fdcb6e);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 25px 0;
            }
            .review-section {
                background: #e8f4fd;
                padding: 25px;
                border-radius: 10px;
                margin: 25px 0;
                text-align: center;
                border-left: 4px solid #0984e3;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Delivered Successfully!</h1>
                <p>Your Gen-Z Fashion order has arrived</p>
            </div>
            
            <div class="content">
                <div class="delivery-celebration">
                    <h2>Congratulations, ${customerName}! 🎊</h2>
                    <p style="font-size: 18px; margin: 20px 0;">Your order has been delivered successfully!</p>
                    <p><strong>Delivered on:</strong> ${new Date(deliveredDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>

                <p>We hope you love your new Gen-Z Fashion items! Here's what was delivered:</p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📦 Delivered Items</h3>
                    ${orderItems.map(item => `
                    <div style="border-bottom: 1px solid #e9ecef; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${item.name}</strong><br>
                            <span style="color: #636e72;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</span>
                        </div>
                        <div style="font-weight: bold; color: #28a745;">
                            ₹${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                    `).join('')}
                    <div style="text-align: right; margin-top: 15px; font-size: 18px; font-weight: bold; color: #2d3436;">
                        Total: ₹${totalPrice.toFixed(2)}
                    </div>
                </div>

                <div class="review-section">
                    <h3>⭐ How was your experience?</h3>
                    <p>We'd love to hear your feedback! Your review helps other customers and helps us improve.</p>
                    <div style="margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL}/orders/${orderNumber}/review" 
                           style="background: linear-gradient(135deg, #fd79a8, #e84393); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                            Write a Review ⭐
                        </a>
                    </div>
                </div>

                <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                    <h4>🎁 Special Offers for You!</h4>
                    <p>As a valued customer, enjoy these exclusive benefits:</p>
                    <ul style="margin: 10px 0;">
                        <li>🏆 <strong>Loyalty Points:</strong> Earned points for this purchase</li>
                        <li>🔄 <strong>Easy Returns:</strong> 7-day return policy</li>
                        <li>🎯 <strong>Personalized Recommendations:</strong> Based on your style</li>
                        <li>📧 <strong>Exclusive Offers:</strong> Member-only discounts</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/products" 
                       style="background: linear-gradient(135deg, #0984e3, #74b9ff); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                        Shop More 🛍️
                    </a>
                    <a href="${process.env.FRONTEND_URL}/orders" 
                       style="background: linear-gradient(135deg, #00b894, #00cec9); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                        View Orders 📋
                    </a>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>❓ Need help with your order?</h4>
                    <p>Questions? Issues? We're here to help!</p>
                    <p><strong>Support:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                    <p><strong>Returns:</strong> Easy returns within 7 days of delivery</p>
                </div>

                <p>Thank you for choosing Gen-Z Fashion. We hope you love your new items and look forward to serving you again!</p>
                
                <p><strong>Rock your style! 🤘</strong></p>
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Order #${orderNumber} | Delivered ${new Date(deliveredDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


// Add this new template function to your emailService.js

const getReturnRequestTemplate = (returnData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    orderItems,
    returnReason,
    returnDetails,
    requestDate,
    totalPrice,
    returnPolicy
  } = returnData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Return Request Received - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .no-reply-notice {
                background: #fff3cd;
                color: #856404;
                padding: 12px;
                text-align: center;
                font-size: 13px;
                border-bottom: 1px solid #ffeaa7;
            }
            .header { 
                background: linear-gradient(135deg, #fd79a8, #fdcb6e); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { 
                padding: 30px; 
            }
            .return-summary {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .return-items {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #fd79a8;
            }
            .item-row {
                border-bottom: 1px solid #e9ecef;
                padding: 10px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .item-row:last-child {
                border-bottom: none;
            }
            .status-box {
                background: linear-gradient(135deg, #0984e3, #74b9ff);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .next-steps {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #0984e3;
            }
            .contact-info {
                background: #d4edda;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
            .footer a { 
                color: #74b9ff; 
                text-decoration: none; 
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #fd79a8, #e84393);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px 5px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Notice -->
            <div class="no-reply-notice">
                📧 <strong>Return Request Confirmation</strong> - We've received your return request
            </div>
            
            <!-- Header -->
            <div class="header">
                <h1>🔄 Return Request Received</h1>
                <p>We're processing your return request</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <h2>Hi ${customerName}! 👋</h2>
                
                <p>Thank you for submitting your return request. We've received it and our team will review it shortly.</p>
                
                <!-- Return Request Summary -->
                <div class="return-summary">
                    <h3>📋 Return Request Summary</h3>
                    <p><strong>Order Number:</strong> #${orderNumber}</p>
                    <p><strong>Request Date:</strong> ${new Date(requestDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p><strong>Return Reason:</strong> ${returnReason}</p>
                    ${returnDetails ? `<p><strong>Additional Details:</strong> ${returnDetails}</p>` : ''}
                </div>

                <!-- Status Box -->
                <div class="status-box">
                    <h3>📊 Current Status</h3>
                    <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">
                        UNDER REVIEW
                    </div>
                    <p>Expected response time: 1-2 business days</p>
                </div>

                <!-- Items to Return -->
                <div class="return-items">
                    <h3>📦 Items in Return Request</h3>
                    ${orderItems.map(item => `
                    <div class="item-row">
                        <div>
                            <strong>${item.name}</strong><br>
                            <span style="color: #636e72; font-size: 14px;">
                                Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}
                            </span>
                        </div>
                        <div style="font-weight: bold; color: #2d3436;">
                            ₹${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                    `).join('')}
                    <div style="text-align: right; margin-top: 15px; font-size: 16px; font-weight: bold; color: #2d3436; border-top: 2px solid #dee2e6; padding-top: 10px;">
                        Total Return Value: ₹${totalPrice.toFixed(2)}
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="next-steps">
                    <h3>🚀 What Happens Next?</h3>
                    <ol style="padding-left: 20px;">
                        <li><strong>Review Process:</strong> Our team will review your return request within 1-2 business days</li>
                        <li><strong>Approval Email:</strong> You'll receive an email with approval status and return instructions</li>
                        <li><strong>Package Pickup:</strong> If approved, we'll arrange pickup or provide return shipping details</li>
                        <li><strong>Quality Check:</strong> Items will be inspected upon receipt</li>
                        <li><strong>Refund Processing:</strong> Refund will be processed within 5-7 business days after approval</li>
                    </ol>
                </div>

                <!-- Return Policy Reminder -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6c757d;">
                    <h4>📜 Return Policy Reminder</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Items must be in original condition with tags attached</li>
                        <li>Returns accepted within 7 days of delivery</li>
                        <li>Original packaging preferred but not mandatory</li>
                        <li>Refund will be credited to original payment method</li>
                    </ul>
                </div>

                <!-- Contact Information -->
                <div class="contact-info">
                    <h4>📞 Need Help or Have Questions?</h4>
                    <p>Our customer support team is here to assist you:</p>
                    <p><strong>Email:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                    <p><strong>Return Request ID:</strong> #${orderNumber}-RTN</p>
                    <p><strong>Response Time:</strong> Within 24 hours</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/orders/${orderNumber}" class="button">
                        View Order Details 📋
                    </a>
                    <a href="${process.env.FRONTEND_URL}/support" class="button">
                        Contact Support 💬
                    </a>
                </div>

                <p>Thank you for your patience. We'll get back to you soon!</p>
                
                <p>Best regards,<br><strong>The Gen-Z Fashion Returns Team</strong></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>📧 This is an automated return confirmation</strong></p>
                <p>For support: <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                <p style="margin-top: 20px;">© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Return Request #${orderNumber}-RTN | ${new Date(requestDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


// Add these new template functions to your emailService.js

// Return Approved Email Template
const getReturnApprovedTemplate = (returnData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    orderItems,
    returnReason,
    approvalDate,
    pickupInstructions,
    totalRefundAmount
  } = returnData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Return Approved - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #00b894, #00cec9); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .approval-box {
                background: linear-gradient(135deg, #00b894, #00cec9);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .next-steps {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #0984e3;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Return Approved!</h1>
                <p>Your return request has been approved</p>
            </div>
            
            <div class="content">
                <h2>Great news, ${customerName}! 🎉</h2>
                
                <p>We've reviewed your return request and it has been <strong>approved</strong>.</p>
                
                <div class="approval-box">
                    <h3>🎯 Return Approved</h3>
                    <p><strong>Order #${orderNumber}</strong></p>
                    <p>Approved on: ${new Date(approvalDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                    <p><strong>Expected Refund: ₹${totalRefundAmount.toFixed(2)}</strong></p>
                </div>

                <div class="next-steps">
                    <h3>🚀 What's Next?</h3>
                    <ol>
                        <li><strong>Package Preparation:</strong> Please pack the items in their original packaging (if available)</li>
                        <li><strong>Pickup Scheduling:</strong> We'll contact you within 24 hours to schedule pickup</li>
                        <li><strong>Quality Check:</strong> Items will be inspected upon pickup</li>
                        <li><strong>Refund Processing:</strong> Refund will be initiated within 2-3 business days after pickup</li>
                    </ol>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>📋 Return Guidelines</h4>
                    <ul>
                        <li>Keep items in original condition with tags (if attached)</li>
                        <li>Include original packaging if available</li>
                        <li>Be available during scheduled pickup time</li>
                        <li>Have order confirmation ready for verification</li>
                    </ul>
                </div>

                <p>Thank you for choosing Gen-Z Fashion. We'll process your return as quickly as possible!</p>
                <p>Best regards,<br><strong>Gen-Z Fashion Returns Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Return Request #${orderNumber}-RTN</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Return Rejected Email Template
const getReturnRejectedTemplate = (returnData) => {
  const {
    orderNumber,
    customerName,
    rejectionReason,
    rejectionDate,
    appealProcess
  } = returnData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Return Request Update - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #e17055, #fd79a8); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .rejection-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .appeal-section {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #0984e3;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Return Request Update</h1>
                <p>Regarding your return request</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName},</h2>
                
                <p>We've carefully reviewed your return request for Order #${orderNumber}.</p>
                
                <div class="rejection-box">
                    <h3>📝 Return Request Status</h3>
                    <p><strong>Status:</strong> Unable to Process</p>
                    <p><strong>Date:</strong> ${new Date(rejectionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                    <p><strong>Reason:</strong> ${rejectionReason}</p>
                </div>

                <div class="appeal-section">
                    <h3>🤝 Have Questions or Want to Appeal?</h3>
                    <p>If you believe this decision was made in error or have additional information to provide, we're here to help:</p>
                    <ul>
                        <li>Contact our support team with your order details</li>
                        <li>Provide additional photos or documentation if relevant</li>
                        <li>We'll review your case within 24-48 hours</li>
                    </ul>
                    <p><strong>Support Email:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}">${process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'}</a></p>
                </div>

                <p>We appreciate your understanding and thank you for being a valued customer.</p>
                <p>Best regards,<br><strong>Gen-Z Fashion Customer Service</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Return Request #${orderNumber}-RTN</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Return Picked Up Email Template
const getReturnPickedUpTemplate = (returnData) => {
  const {
    orderNumber,
    customerName,
    pickupDate,
    trackingNumber,
    expectedRefundDays
  } = returnData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Return Picked Up - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #0984e3, #74b9ff); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .pickup-box {
                background: linear-gradient(135deg, #0984e3, #74b9ff);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .timeline {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Return Picked Up!</h1>
                <p>Your return is on its way to us</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}! 👋</h2>
                
                <p>Great news! We've successfully picked up your return items.</p>
                
                <div class="pickup-box">
                    <h3>✅ Pickup Confirmed</h3>
                    <p><strong>Order #${orderNumber}</strong></p>
                    <p>Picked up on: ${new Date(pickupDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    ${trackingNumber ? `<p><strong>Tracking:</strong> ${trackingNumber}</p>` : ''}
                </div>

                <div class="timeline">
                    <h3>⏰ What Happens Next?</h3>
                    <div style="margin: 15px 0;">
                        <strong>✅ Day 1:</strong> Items picked up from your location<br>
                        <strong>🚚 Day 2-3:</strong> Items arrive at our processing center<br>
                        <strong>🔍 Day 3-4:</strong> Quality inspection and verification<br>
                        <strong>💰 Day 4-5:</strong> Refund processed and initiated<br>
                        <strong>🏦 Day 5-7:</strong> Refund credited to your account
                    </div>
                </div>

                <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>💡 What to Expect</h4>
                    <ul>
                        <li>Items will be inspected within 2-3 business days</li>
                        <li>You'll receive an email once inspection is complete</li>
                        <li>Refund will be processed to your original payment method</li>
                        <li>Expected refund timeline: ${expectedRefundDays || '5-7'} business days</li>
                    </ul>
                </div>

                <p>Thank you for your patience! We'll keep you updated throughout the process.</p>
                <p>Best regards,<br><strong>Gen-Z Fashion Returns Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Return #${orderNumber}-RTN | Picked up ${new Date(pickupDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Refund Processing Email Template
const getRefundProcessingTemplate = (refundData) => {
  const {
    orderNumber,
    customerName,
    refundAmount,
    refundMethod,
    processingDate,
    expectedCompletionDays,
    transactionId
  } = refundData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Refund Being Processed - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #fdcb6e, #fd79a8); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .processing-box {
                background: linear-gradient(135deg, #fdcb6e, #fd79a8);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .refund-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #fdcb6e;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Refund Processing</h1>
                <p>Your refund is being processed</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}! 👋</h2>
                
                <p>Good news! Your return has been approved and we're now processing your refund.</p>
                
                <div class="processing-box">
                    <h3>🔄 Refund in Progress</h3>
                    <p><strong>Amount: ₹${refundAmount.toFixed(2)}</strong></p>
                    <p>Processing started: ${new Date(processingDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                    <p>Expected completion: ${expectedCompletionDays || '3-5'} business days</p>
                </div>

                <div class="refund-details">
                    <h3>📋 Refund Details</h3>
                    <p><strong>Order Number:</strong> #${orderNumber}</p>
                    <p><strong>Refund Method:</strong> ${refundMethod || 'Original Payment Method'}</p>
                    <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                    ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
                    <p><strong>Processing Date:</strong> ${new Date(processingDate).toLocaleDateString()}</p>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>⏰ Timeline</h4>
                    <ul>
                        <li><strong>Day 1:</strong> Refund initiated in our system</li>
                        <li><strong>Day 1-2:</strong> Processing with payment gateway</li>
                        <li><strong>Day 2-5:</strong> Refund reflects in your account</li>
                    </ul>
                    <p><em>Note: Bank processing times may vary. You'll receive a confirmation email once the refund is completed.</em></p>
                </div>

                <p>Thank you for your patience during this process!</p>
                <p>Best regards,<br><strong>Gen-Z Fashion Finance Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Refund Reference: ${orderNumber}-REF</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Refund Completed Email Template
const getRefundCompletedTemplate = (refundData) => {
  const {
    orderNumber,
    customerName,
    refundAmount,
    refundMethod,
    completionDate,
    transactionId,
    bankProcessingNote
  } = refundData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Refund Completed - Gen-Z Fashion</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #00b894, #00cec9); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .success-box {
                background: linear-gradient(135deg, #00b894, #00cec9);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .completion-details {
                background: #d4edda;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Refund Completed!</h1>
                <p>Your refund has been successfully processed</p>
            </div>
            
            <div class="content">
                <h2>Excellent news, ${customerName}! 🎉</h2>
                
                <p>Your refund has been successfully completed and the amount has been credited back to your account.</p>
                
                <div class="success-box">
                    <h3>💰 Refund Successful</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 15px 0;">₹${refundAmount.toFixed(2)}</p>
                    <p>Completed on: ${new Date(completionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>

                <div class="completion-details">
                    <h3>📋 Refund Summary</h3>
                    <p><strong>Order Number:</strong> #${orderNumber}</p>
                    <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                    <p><strong>Refund Method:</strong> ${refundMethod || 'Original Payment Method'}</p>
                    <p><strong>Completion Date:</strong> ${new Date(completionDate).toLocaleDateString()}</p>
                    ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
                </div>

                <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>🏦 Bank Processing</h4>
                    <p>${bankProcessingNote || 'The refund has been processed from our end. Depending on your bank, it may take 1-2 additional business days to reflect in your account statement.'}</p>
                    <p><strong>If you don't see the refund:</strong></p>
                    <ul>
                        <li>Check your bank statement in 1-2 business days</li>
                        <li>Contact your bank with the transaction ID above</li>
                        <li>Contact our support team if needed</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/products" 
                       style="background: linear-gradient(135deg, #0984e3, #74b9ff); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px;">
                        Continue Shopping 🛍️
                    </a>
                </div>

                <p>Thank you for choosing Gen-Z Fashion. We appreciate your business and hope to serve you again soon!</p>
                <p>Best regards,<br><strong>Gen-Z Fashion Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>Refund Completed: ${orderNumber}-REF | ${new Date(completionDate).toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const getBackInStockTemplate = (stockData) => {
  const {
    customerName,
    productName,
    productImage,
    productPrice,
    size,
    color,
    currentStock,
    productUrl
  } = stockData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Back in Stock - ${productName}</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 650px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #00b894, #00cec9); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { padding: 30px; }
            .product-section {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .product-image {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
            }
            .product-details {
                flex: 1;
            }
            .stock-alert {
                background: linear-gradient(135deg, #00b894, #00cec9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
            }
            .cta-button {
                background: linear-gradient(135deg, #fd79a8, #e84393);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                display: inline-block;
                margin: 10px;
            }
            .footer { 
                background: #2d3436; 
                color: #b2bec3; 
                padding: 30px; 
                text-align: center; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Good News!</h1>
                <p>Your requested item is back in stock</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}! 👋</h2>
                
                <p>Great news! The item you requested to be notified about is now available:</p>
                
                <div class="product-section">
                    <img src="${productImage}" alt="${productName}" class="product-image" />
                    <div class="product-details">
                        <h3 style="margin: 0 0 10px 0; color: #2d3436;">${productName}</h3>
                        <p style="margin: 5px 0; color: #636e72;"><strong>Size:</strong> ${size}</p>
                        <p style="margin: 5px 0; color: #636e72;"><strong>Color:</strong> ${color}</p>
                        <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #00b894;">₹${productPrice}</p>
                    </div>
                </div>

                <div class="stock-alert">
                    <h3>✅ Now Available!</h3>
                    <p style="font-size: 18px; margin: 10px 0;">
                        <strong>${currentStock} pieces</strong> in stock
                    </p>
                    <p>Don't wait too long - limited quantity available!</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${productUrl}" class="cta-button">
                        Shop Now 🛍️
                    </a>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>⏰ Limited Time!</h4>
                    <p>This notification was sent because you requested to be notified when this item became available. Items may sell out quickly, so we recommend purchasing soon if you're still interested.</p>
                </div>

                <p>Thank you for choosing Gen-Z Fashion!</p>
                <p>Best regards,<br><strong>The Gen-Z Fashion Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 Gen-Z Fashion. All rights reserved.</p>
                <p>You received this email because you subscribed for stock notifications.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send professional no-reply welcome email
const sendWelcomeEmail = async (userEmail, userName, welcomeCoupon = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: '🎉 Welcome to Gen-Z Fashion - Your Welcome Gift Inside!',
      html: getWelcomeEmailTemplate(userName, welcomeCoupon, userEmail),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '3',
        'X-Mailer': 'Gen-Z Fashion System',
        'List-Unsubscribe': '<mailto:unsubscribe@genzfashion.com>',
        'X-Entity-Ref-ID': 'welcome-email-001',
        'Precedence': 'bulk',
        'X-MC-Important': 'true',
        'X-MC-Track': 'opens,clicks'
      },
      // Prevent replies
      replyTo: {
        name: 'Gen-Z Fashion Support',
        address: process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'
      }
    };

    console.log(`📧 Sending welcome email to: ${userEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ SMTP connection error:', error);
    return false;
  }
};

// Helper function to calculate estimated delivery
const calculateEstimatedDelivery = (paymentMethod, city, state) => {
  const orderDate = new Date();
  let deliveryDays = 5; // Default 5 days
  
  // Adjust based on payment method
  if (paymentMethod === 'cod') {
    deliveryDays += 1; // COD takes 1 extra day
  }
  
  // Adjust based on location (you can expand this)
  const majorCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'];
  if (majorCities.includes(city.toLowerCase())) {
    deliveryDays -= 1; // Major cities get faster delivery
  }
  
  // Add delivery days to current date
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + deliveryDays);
  
  return deliveryDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    // Calculate estimated delivery
    const estimatedDelivery = calculateEstimatedDelivery(
      orderData.paymentMethod, 
      orderData.shippingAddress.city, 
      orderData.shippingAddress.state
    );
    
    // Prepare email data
    const emailData = {
      ...orderData,
      estimatedDelivery
    };
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: orderData.customerEmail,
      subject: `Order Confirmed #${orderData.orderNumber} - Gen-Z Fashion`,
      html: getOrderConfirmationTemplate(emailData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2', // High priority for order confirmations
        'X-Mailer': 'Gen-Z Fashion Order System',
        'List-Unsubscribe': '<mailto:unsubscribe@genzfashion.com>',
        'X-Entity-Ref-ID': `order-confirmation-${orderData.orderNumber}`
      },
      replyTo: {
        name: 'Gen-Z Fashion Support',
        address: process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'
      }
    };

    console.log(`📧 Sending order confirmation email to: ${orderData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order cancellation email
const sendOrderCancellationEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: orderData.customerEmail,
      subject: `Order Cancelled #${orderData.orderNumber} - Gen-Z Fashion`,
      html: getOrderCancellationTemplate(orderData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2',
        'X-Mailer': 'Gen-Z Fashion Order System',
        'X-Entity-Ref-ID': `order-cancelled-${orderData.orderNumber}`
      }
    };

    console.log(`📧 Sending order cancellation email to: ${orderData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order cancellation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order shipped email
const sendOrderShippedEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: orderData.customerEmail,
      subject: `Order Shipped #${orderData.orderNumber} - Track Your Package!`,
      html: getOrderShippedTemplate(orderData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2',
        'X-Mailer': 'Gen-Z Fashion Shipping System',
        'X-Entity-Ref-ID': `order-shipped-${orderData.orderNumber}`
      }
    };

    console.log(`📧 Sending order shipped email to: ${orderData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order shipped email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order shipped email:', error);
    return { success: false, error: error.message };
  }
};

// Send order delivered email
const sendOrderDeliveredEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: orderData.customerEmail,
      subject: `Order Delivered #${orderData.orderNumber} - Thank You!`,
      html: getOrderDeliveredTemplate(orderData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2',
        'X-Mailer': 'Gen-Z Fashion Delivery System',
        'X-Entity-Ref-ID': `order-delivered-${orderData.orderNumber}`
      }
    };

    console.log(`📧 Sending order delivered email to: ${orderData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order delivered email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order delivered email:', error);
    return { success: false, error: error.message };
  }
};

// Send return request confirmation email
const sendReturnRequestEmail = async (returnData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: returnData.customerEmail,
      subject: `Return Request Received #${returnData.orderNumber} - Gen-Z Fashion`,
      html: getReturnRequestTemplate(returnData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2',
        'X-Mailer': 'Gen-Z Fashion Returns System',
        'X-Entity-Ref-ID': `return-request-${returnData.orderNumber}`
      },
      replyTo: {
        name: 'Gen-Z Fashion Support',
        address: process.env.SUPPORT_EMAIL || 'tshirtwala247@gmail.com'
      }
    };

    console.log(`📧 Sending return request confirmation email to: ${returnData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Return request confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending return request confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send return approved email
const sendReturnApprovedEmail = async (returnData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: returnData.customerEmail,
      subject: `Return Approved #${returnData.orderNumber} - Gen-Z Fashion`,
      html: getReturnApprovedTemplate(returnData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '2',
        'X-Mailer': 'Gen-Z Fashion Returns System'
      }
    };

    console.log(`📧 Sending return approved email to: ${returnData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Return approved email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending return approved email:', error);
    return { success: false, error: error.message };
  }
};

// Send return rejected email
const sendReturnRejectedEmail = async (returnData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: returnData.customerEmail,
      subject: `Return Request Update #${returnData.orderNumber} - Gen-Z Fashion`,
      html: getReturnRejectedTemplate(returnData)
    };

    console.log(`📧 Sending return rejected email to: ${returnData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Return rejected email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending return rejected email:', error);
    return { success: false, error: error.message };
  }
};

// Send return picked up email
const sendReturnPickedUpEmail = async (returnData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: returnData.customerEmail,
      subject: `Return Picked Up #${returnData.orderNumber} - Gen-Z Fashion`,
      html: getReturnPickedUpTemplate(returnData)
    };

    console.log(`📧 Sending return picked up email to: ${returnData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Return picked up email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending return picked up email:', error);
    return { success: false, error: error.message };
  }
};

// Send refund processing email
const sendRefundProcessingEmail = async (refundData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: refundData.customerEmail,
      subject: `Refund Processing #${refundData.orderNumber} - Gen-Z Fashion`,
      html: getRefundProcessingTemplate(refundData)
    };

    console.log(`📧 Sending refund processing email to: ${refundData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Refund processing email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending refund processing email:', error);
    return { success: false, error: error.message };
  }
};

// Send refund completed email
const sendRefundCompletedEmail = async (refundData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: refundData.customerEmail,
      subject: `Refund Completed #${refundData.orderNumber} - Gen-Z Fashion`,
      html: getRefundCompletedTemplate(refundData)
    };

    console.log(`📧 Sending refund completed email to: ${refundData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Refund completed email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending refund completed email:', error);
    return { success: false, error: error.message };
  }
};

// Add the email sending function
const sendBackInStockEmail = async (stockData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Gen-Z Fashion',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: stockData.customerEmail,
      subject: `🎉 Back in Stock: ${stockData.productName} (${stockData.color} - ${stockData.size})`,
      html: getBackInStockTemplate(stockData),
      headers: {
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '1', // High priority
        'X-Mailer': 'Gen-Z Fashion Stock Alert System'
      }
    };

    console.log(`📧 Sending back-in-stock email to: ${stockData.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Back-in-stock email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending back-in-stock email:', error);
    return { success: false, error: error.message };
  }
};


module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,    
  sendOrderShippedEmail,      
  sendOrderDeliveredEmail, 
  sendReturnRequestEmail, 
  sendReturnApprovedEmail,          
  sendReturnRejectedEmail,          
  sendReturnPickedUpEmail,          
  sendRefundProcessingEmail,        
  sendRefundCompletedEmail,
  sendBackInStockEmail,
  testEmailConnection,
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getOrderCancellationTemplate,   
  getOrderShippedTemplate,        
  getOrderDeliveredTemplate,
  getReturnRequestTemplate,
  getReturnApprovedTemplate,        
  getReturnRejectedTemplate,
  getReturnPickedUpTemplate,        
  getRefundProcessingTemplate,      
  getRefundCompletedTemplate,
  getBackInStockTemplate, 
  calculateEstimatedDelivery 
};
