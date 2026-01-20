// Create file: client/src/pages/FAQ.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  ChevronDown, 
  ChevronRight,
  Search,
  ShoppingCart,
  Truck,
  RefreshCw,
  CreditCard,
  Shirt,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  Clock
} from 'lucide-react';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});
  
  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'orders', label: 'Orders & Payment', icon: ShoppingCart },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', label: 'Returns & Exchanges', icon: RefreshCw },
    { id: 'sizing', label: 'Sizing & Fit', icon: Shirt },
    { id: 'account', label: 'Account & Support', icon: MessageCircle }
  ];

  const faqData = [
    // Orders & Payment
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order?',
      answer: `Placing an order is simple! Follow these steps:
      
      1. Browse our collection and select your favorite t-shirt
      2. Choose your size and color
      3. Click "Add to Cart" or "Buy Now"
      4. Review your cart and proceed to checkout
      5. Enter your shipping information and payment details
      6. Confirm your order and you're done!
      
      You'll receive an order confirmation email immediately after placing your order.`
    },
    {
      id: 2,
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: `We accept various payment methods to make shopping convenient:
      
      • Credit/Debit Cards (Visa, MasterCard, American Express)
      • PayPal
      • UPI (Google Pay, PhonePe, Paytm)
      • Net Banking
      • Cash on Delivery (COD) for select locations
      • Digital Wallets (Amazon Pay, Paytm Wallet)
      
      All payments are processed securely through encrypted connections.`
    },
    {
      id: 3,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: `Order modifications depend on the order status:
      
      **Before Processing (within 1 hour):**
      • You can cancel or modify your order
      • Full refund will be processed
      • Contact us immediately at tshirtwala247@gmail.com
      
      **After Processing:**
      • Cancellation may not be possible
      • You can return the item after delivery
      • Return process applies as per our return policy
      
      For COD orders, you have 24 hours to cancel without any charges.`
    },
    {
      id: 4,
      category: 'orders',
      question: 'Do you offer discounts or coupon codes?',
      answer: `Yes! We regularly offer various discounts:
      
      • **New Customer Discount:** 15% off your first order
      • **Seasonal Sales:** Up to 50% off during festivals
      • **Bulk Orders:** Special discounts on orders above ₹2000
      • **Loyalty Program:** Earn points on every purchase
      • **Newsletter Subscribers:** Exclusive discount codes
      
      Follow us on social media and subscribe to our newsletter for the latest offers!`
    },

    // Shipping & Delivery
    {
      id: 5,
      category: 'shipping',
      question: 'What are your shipping charges and delivery times?',
      answer: `Our shipping is fast and affordable:
      
      **Delivery Times:**
      • Metro Cities: 2-3 business days
      • Other Cities: 3-5 business days
      • Remote Areas: 5-7 business days
      
      **Shipping Charges:**
      • Orders above ₹999: FREE shipping
      • Orders below ₹999: ₹99 shipping fee
      • Express Delivery: ₹199 (1-2 days in metro cities)
      
      We use trusted courier partners like BlueDart, Delhivery, and India Post.`
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: `Currently, we ship to 15+ countries including:
      
      **Available Countries:**
      • USA, Canada
      • UK, Germany, France
      • Australia, New Zealand
      • UAE, Saudi Arabia
      • Singapore, Malaysia
      
      **International Shipping:**
      • Delivery Time: 7-14 business days
      • Shipping Cost: Calculated at checkout
      • Customs duties may apply (buyer's responsibility)
      
      We're constantly expanding our international reach!`
    },
    {
      id: 7,
      category: 'shipping',
      question: 'How can I track my order?',
      answer: `Tracking your order is easy:
      
      **Via Email:**
      • You'll receive a tracking number via email once shipped
      • Click the tracking link to see real-time updates
      
      **Via Website:**
      • Log into your account and go to "My Orders"
      • Click on the order to see tracking details
      
      **Via SMS:**
      • You'll receive SMS updates at key delivery milestones
      
      If you face any tracking issues, contact our support team with your order number.`
    },

    // Returns & Exchanges
    {
      id: 8,
      category: 'returns',
      question: 'What is your return policy?',
      answer: `We offer a hassle-free return policy:
      
      **Return Window:** 7 days from delivery date
      
      **Eligible Items:**
      • Unused and unwashed items
      • Items with original tags
      • Items in original packaging
      
      **Return Process:**
      1. Initiate return request in "My Orders"
      2. Our team will schedule pickup
      3. Quality check after pickup
      4. Refund processed within 5-7 business days
      
      **Note:** Custom/personalized items cannot be returned unless defective.`
    },
    {
      id: 9,
      category: 'returns',
      question: 'Can I exchange my t-shirt for a different size or color?',
      answer: `Yes! We offer easy exchanges:
      
      **Exchange Conditions:**
      • Within 7 days of delivery
      • Item must be unused with tags
      • Desired size/color must be in stock
      
      **Exchange Process:**
      1. Initiate exchange request online
      2. We'll arrange pickup of original item
      3. New item ships once we receive returned item
      4. No additional shipping charges
      
      **Size Guide:** Use our detailed size guide to choose the perfect fit and avoid exchanges.`
    },
    {
      id: 10,
      category: 'returns',
      question: 'How long does it take to get my refund?',
      answer: `Refund timelines vary by payment method:
      
      **Credit/Debit Cards:** 5-7 business days
      **UPI/Net Banking:** 2-3 business days
      **Digital Wallets:** 1-2 business days
      **Cash on Delivery:** Bank transfer in 3-5 days
      
      **Refund Process:**
      1. Item picked up and quality checked
      2. Refund initiated within 24 hours
      3. Amount credited as per timeline above
      4. Email confirmation sent
      
      Bank processing times may vary. Contact us if refund is delayed beyond mentioned timeline.`
    },

    // Sizing & Fit
    {
      id: 11,
      category: 'sizing',
      question: 'How do I choose the right size?',
      answer: `Finding your perfect fit is important:
      
      **Use Our Size Guide:**
      • Detailed measurements for chest, length, shoulder
      • Available on every product page
      • Compare with your best-fitting t-shirt
      
      **Size Tips:**
      • Measure yourself or a well-fitting t-shirt
      • Consider shrinkage (pre-shrunk cotton)
      • When in doubt, size up for comfort
      
      **Fit Types:**
      • **Regular Fit:** Classic comfortable fit
      • **Slim Fit:** Closer to body, modern silhouette
      • **Oversized:** Relaxed, trendy loose fit
      
      Still confused? Chat with our support team!`
    },
    {
      id: 12,
      category: 'sizing',
      question: 'What if the t-shirt doesn\'t fit properly?',
      answer: `No worries! We've got you covered:
      
      **Exchange Options:**
      • Free size exchange within 7 days
      • Easy online exchange process
      • No questions asked policy
      
      **Steps for Size Exchange:**
      1. Go to "My Orders" in your account
      2. Select "Exchange" for the item
      3. Choose new size (subject to availability)
      4. Schedule pickup online
      5. New size ships once we receive original
      
      **Prevention Tips:**
      • Always check our size guide
      • Read customer reviews for fit insights
      • Contact support for personalized advice`
    },
    {
      id: 13,
      category: 'sizing',
      question: 'Are your t-shirts pre-shrunk?',
      answer: `Yes! All our t-shirts are pre-shrunk:
      
      **Pre-Shrinking Process:**
      • All cotton t-shirts undergo pre-shrinking treatment
      • Minimal shrinkage (less than 2%) after washing
      • Size consistency maintained after multiple washes
      
      **Care Instructions:**
      • Wash in cold water for best results
      • Avoid hot water and high heat drying
      • Follow care label instructions
      
      **Fabric Quality:**
      • 100% combed cotton for softness
      • Bio-washed for comfort
      • Color-fast printing that won't fade
      
      Our quality ensures your t-shirt maintains its fit and look wash after wash!`
    },

    // Account & Support
    {
      id: 14,
      category: 'account',
      question: 'Do I need to create an account to place an order?',
      answer: `You have both options:
      
      **Guest Checkout:**
      • No account needed for one-time purchases
      • Enter details at checkout
      • Order confirmation via email
      
      **Account Benefits:**
      • Order history and tracking
      • Faster checkout process
      • Address book for quick ordering
      • Wishlist to save favorites
      • Early access to sales
      • Loyalty points earning
      
      **Creating Account:**
      • Quick 2-minute signup process
      • Email verification required
      • Secure password protection
      
      We recommend creating an account for the best shopping experience!`
    },
    {
      id: 15,
      category: 'account',
      question: 'How can I contact customer support?',
      answer: `We're here to help 24/7:
      
      **Contact Methods:**
      • **Email:** tshirtwala247@gmail.com
      • **Phone:** +91-XXXX-XXXX-XX (9 AM - 9 PM)
      • **Live Chat:** Available on website
      • **WhatsApp:** Quick queries and order updates
      
      **Response Times:**
      • Live Chat: Instant response
      • Email: Within 2-4 hours
      • Phone: Immediate assistance
      • WhatsApp: Within 30 minutes
      
      **What We Help With:**
      • Order assistance and tracking
      • Size and product guidance
      • Return and exchange support
      • Payment and refund queries
      
      Our friendly support team is always ready to assist you!`
    },
    {
      id: 16,
      category: 'account',
      question: 'Is my personal information secure?',
      answer: `Absolutely! Your privacy and security are our top priorities:
      
      **Data Protection:**
      • SSL encryption for all transactions
      • Secure payment gateways only
      • No storage of payment card details
      • Regular security audits
      
      **Information Usage:**
      • Personal data used only for order processing
      • No sharing with third parties without consent
      • Email communications only for orders and offers
      • Option to unsubscribe anytime
      
      **Account Security:**
      • Strong password requirements
      • Secure login protocols
      • Account activity monitoring
      • Easy password reset options
      
      Read our Privacy Policy for complete details on data handling.`
    }
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO
        title="FAQ - Frequently Asked Questions | Gen-Z Fashion"
        description="Find answers to common questions about orders, shipping, returns, sizing, and more. Get help with your Gen-Z Fashion t-shirt shopping experience."
        keywords="FAQ, help, support, orders, shipping, returns, sizing guide, customer service, gen-z fashion"
        canonical={`${siteUrl}/faq`}
        image={`${siteUrl}/og-faq.jpg`}
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 mt-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Find quick answers to common questions about shopping, orders, and more.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="py-12 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Need Immediate Help?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Can't find what you're looking for? Contact our support team directly.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Get instant help from our support team</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                    Start Chat
                  </button>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">tshirtwala247@gmail.com</p>
                  <a 
                    href="mailto:tshirtwala247@gmail.com"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors inline-block"
                  >
                    Send Email
                  </a>
                </div>
                
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Mon-Sun: 9 AM - 9 PM</p>
                  <a 
                    href="tel:+911234567890"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors inline-block"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No FAQs Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try adjusting your search or category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                  >
                    View All FAQs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        {openItems[faq.id] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {openItems[faq.id] && (
                        <div className="px-6 pb-4 border-t dark:border-gray-700">
                          <div className="pt-4 text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Still Need Help Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Our friendly support team is here to help you 24/7. Don't hesitate to reach out!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Contact Support
                  <MessageCircle className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                >
                  Continue Shopping
                  <ShoppingCart className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FAQ;
