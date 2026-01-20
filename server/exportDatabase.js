const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const collections = ['products', 'users', 'orders', 'reviews', 'banners', 'carts', 'wishlists', 'surprises', 'notifications'];

async function exportDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const exportDir = path.join(__dirname, '..', 'database-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    for (const collectionName of collections) {
      try {
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        fs.writeFileSync(
          path.join(exportDir, `${collectionName}.json`),
          JSON.stringify(data, null, 2)
        );
        console.log(`✅ Exported ${collectionName}: ${data.length} documents`);
      } catch (err) {
        console.log(`⚠️  Collection ${collectionName} not found or empty`);
      }
    }

    console.log(`\n🎉 Database exported to: ${exportDir}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

exportDatabase();
