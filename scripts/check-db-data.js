const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('construction_rental');
    
    console.log('\n📂 Categories:');
    const categories = await db.collection('categories').find({}).toArray();
    categories.forEach(c => console.log(`  - ${c.name} (slug: ${c.slug})`));
    
    console.log('\n🔧 Equipment Types:');
    const equipmentTypes = await db.collection('equipmentTypes').find({}).toArray();
    equipmentTypes.forEach(et => console.log(`  - ${et.name} (slug: ${et.slug}, categoryId: ${et.categoryId})`));
    
    console.log('\n👤 Admin User:');
    const admin = await db.collection('users').findOne({ email: 'admin@gmail.com' });
    console.log(admin ? `  ✅ Found: ${admin.email}` : '  ❌ Not found');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkData();
