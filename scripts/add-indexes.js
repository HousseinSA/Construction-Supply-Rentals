// Script to add database indexes for performance optimization
const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function addIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    
    // Equipment indexes
    console.log('Creating equipment indexes...')
    await db.collection('equipment').createIndex({ status: 1, isAvailable: 1, listingType: 1 })
    await db.collection('equipment').createIndex({ categoryId: 1, status: 1, isAvailable: 1 })
    await db.collection('equipment').createIndex({ isAvailable: 1 })
    
    // Bookings indexes
    console.log('Creating bookings indexes...')
    await db.collection('bookings').createIndex({ status: 1 })
    await db.collection('bookings').createIndex({ renterId: 1, createdAt: -1 })
    await db.collection('bookings').createIndex({ 'bookingItems.equipmentId': 1 })
    
    // Sales indexes
    console.log('Creating sales indexes...')
    await db.collection('sales').createIndex({ status: 1 })
    await db.collection('sales').createIndex({ buyerId: 1, createdAt: -1 })
    await db.collection('sales').createIndex({ equipmentId: 1 })
    await db.collection('sales').createIndex({ supplierId: 1 })
    
    console.log('✅ All indexes created successfully!')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
  } finally {
    await client.close()
  }
}

addIndexes()
