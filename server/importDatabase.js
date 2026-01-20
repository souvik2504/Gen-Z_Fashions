const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function importDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const exportDir = path.join(__dirname, '..', 'database-export');
    
    if (!fs.existsSync(exportDir)) {
      console.error('❌ database-export folder not found!');
      process.exit(1);
    }

    const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(exportDir, file), 'utf8'));
      
      if (data.length > 0) {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        await mongoose.connection.db.collection(collectionName).insertMany(data);
        console.log(`✅ Imported ${collectionName}: ${data.length} documents`);
      } else {
        console.log(`⚠️  Skipped ${collectionName}: empty`);
      }
    }

    console.log('\n🎉 Database imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

importDatabase();
