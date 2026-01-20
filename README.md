# Gen-Z Fashion - E-commerce Platform

A modern, full-stack e-commerce platform built with MERN stack for trendy fashion clothing.

## 🚀 Features

- **User Authentication** - Secure login/register with JWT
- **Product Catalog** - Browse and search trendy clothing
- **Shopping Cart** - Add/remove items with persistent storage
- **Loyalty Program** - Earn stamps and claim surprise gifts
- **Coupon System** - Rarity-based discount coupons (Common to Legendary)
- **Payment Integration** - Razorpay & Cash on Delivery
- **Order Management** - Track order status and history
- **Admin Panel** - Manage products, orders, and users
- **Email Notifications** - Order confirmations and updates

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Context API
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT tokens
- **Payment:** Razorpay integration
- **Email:** Nodemailer with Gmail

## 📦 Installation

1. Clone the repository:
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME


2. Install dependencies:
Install backend dependencies    
    npm install

Install frontend dependencies
    cd client
    npm install
    cd ..


3. Environment Setup:
    cp .env.example .env


4. Start the application:
Start backend server
    npm run server

Start frontend (in new terminal)
    npm run client

Or start both together
    npm run dev


## 🔧 Environment Variables

Create a `.env` file in the root directory:

    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_gmail_address
    EMAIL_PASS=your_gmail_app_password
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    CLIENT_URL=http://localhost:3000
    PORT=5000


## 📱 Usage

1. **User Registration/Login**
2. **Browse Products** - Filter by category, size, color
3. **Add to Cart** - Persistent cart across sessions
4. **Apply Coupons** - Use earned surprise gift coupons
5. **Checkout** - Choose payment method (Razorpay/COD)
6. **Track Orders** - Monitor order status and history
7. **Loyalty Program** - Earn stamps and claim rewards

## 🎯 Loyalty & Rewards

- Earn **1 stamp** per purchase
- **10 stamps** = 1 surprise gift
- **5 rarity levels**: Common → Uncommon → Rare → Epic → Legendary
- Higher loyalty levels get better coupon chances

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Souvik dalui**
- GitHub: [@souvik2504](https://github.com/souvik2504)
- Email: daluisouvik839@gmail.com

## 🙏 Acknowledgments

- React team for the amazing framework
- Razorpay for payment integration
- MongoDB for database solutions
