const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product');

dotenv.config();                 // loads .env
const MONGODB_URI = process.env.MONGODB_URI;

const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    description: '100 % cotton, preshrunk, perfect everyday tee.',
    price: 19.99,
    category: 'unisex',
    sizes: [
      { size: 'S',  stock: 20 },
      { size: 'M',  stock: 25 },
      { size: 'L',  stock: 15 },
      { size: 'XL', stock: 10 }
    ],
    colors: ['white'],
    images: [
      'https://via.placeholder.com/600x600/FFFFFF/000000?text=White+T-Shirt'
    ],
    featured: true
  },
  {
    name: 'Retro Graphic Tee',
    description: 'Soft-touch fabric with a vintage print.',
    price: 24.99,
    category: 'men',
    sizes: [
      { size: 'M', stock: 18 },
      { size: 'L', stock: 12 }
    ],
    colors: ['black', 'navy'],
    images: [
    //   'https://via.placeholder.com/600x600/000000/FFFFFF?text=Graphic+Tee'
        'D:/Tshirt%20Store/ttttt.jpg'
    ],
    featured: false
  },
  {
    name: 'Kids Rainbow Tee',
    description: 'Bright colours, durable stitching—made for play.',
    price: 14.5,
    category: 'kids',
    sizes: [
      { size: 'XS', stock: 30 },
      { size: 'S',  stock: 25 },
      { size: 'M',  stock: 20 }
    ],
    colors: ['yellow', 'pink', 'blue'],
    images: [
      'https://via.placeholder.com/600x600/FFDF00/000000?text=Kids+Tee'
    ],
    featured: false
  }
];

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    await Product.deleteMany();              // clear existing products
    await Product.insertMany(sampleProducts);
    console.log('🌱  Sample products inserted successfully');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
