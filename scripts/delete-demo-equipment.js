const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const DEMO_TAG = 'DEMO_EQUIPMENT';

async function deleteDemoEquipment() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('construction_rental');
    
    // Delete by reference number pattern
    const result = await db.collection('equipment').deleteMany({
      referenceNumber: { $regex: `^${DEMO_TAG}-` }
    });

    // Also delete by description tag (backup method)
    const result2 = await db.collection('equipment').deleteMany({
      description: { $regex: DEMO_TAG }
    });

    const totalDeleted = result.deletedCount + result2.deletedCount;
    
    if (totalDeleted > 0) {
      console.log(`✅ Successfully deleted ${totalDeleted} demo equipment items`);
    } else {
      console.log('ℹ️  No demo equipment found to delete');
    }
    
  } catch (error) {
    console.error('❌ Error deleting demo equipment:', error);
  } finally {
    await client.close();
  }
}

deleteDemoEquipment();
