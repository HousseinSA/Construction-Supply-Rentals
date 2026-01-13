const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) env[key.trim()] = valueParts.join('=').trim();
    }
  });
  return env;
}

const envVars = loadEnv();
const MONGODB_URI = envVars.MONGODB_URI;

async function createTestData(db) {
  const now = new Date();
  
  // Get a renter
  const renter = await db.collection('users').findOne({ userType: 'renter' }) || 
                 await db.collection('users').findOne({});
  
  // Get equipment
  const equipment = await db.collection('equipment').findOne({ status: 'approved' });
  
  if (!renter || !equipment) {
    throw new Error('Need at least 1 user and 1 equipment');
  }

  console.log('✅ Creating test data...\n');

  // 1. Pending booking ending in 12 hours (should send reminder)
  const reminderBooking = {
    referenceNumber: `TEST-REMINDER-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renter.email || `${renter.phone}@test.com`,
    supplierId: equipment.supplierId,
    bookingItems: [{
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      pricingType: 'daily',
      rate: equipment.pricing?.dailyRate || 1000,
      usage: 1,
      usageUnit: 'days',
      subtotal: equipment.pricing?.dailyRate || 1000,
      supplierId: equipment.supplierId
    }],
    totalPrice: equipment.pricing?.dailyRate || 1000,
    grandTotal: equipment.pricing?.dailyRate || 1000,
    status: 'pending',
    startDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
    createdAt: now,
    updatedAt: now,
  };

  // 2. Pending booking ended 1 hour ago (should be cancelled)
  const expiredPendingBooking = {
    referenceNumber: `TEST-EXPIRED-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renter.email || `${renter.phone}@test.com`,
    supplierId: equipment.supplierId,
    bookingItems: [{
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      pricingType: 'daily',
      rate: equipment.pricing?.dailyRate || 1000,
      usage: 1,
      usageUnit: 'days',
      subtotal: equipment.pricing?.dailyRate || 1000,
      supplierId: equipment.supplierId
    }],
    totalPrice: equipment.pricing?.dailyRate || 1000,
    grandTotal: equipment.pricing?.dailyRate || 1000,
    status: 'pending',
    startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  };

  // 3. Paid booking ended 1 hour ago (should be completed)
  const expiredPaidBooking = {
    referenceNumber: `TEST-PAID-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renter.email || `${renter.phone}@test.com`,
    supplierId: equipment.supplierId,
    bookingItems: [{
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      pricingType: 'daily',
      rate: equipment.pricing?.dailyRate || 1000,
      usage: 1,
      usageUnit: 'days',
      subtotal: equipment.pricing?.dailyRate || 1000,
      supplierId: equipment.supplierId
    }],
    totalPrice: equipment.pricing?.dailyRate || 1000,
    grandTotal: equipment.pricing?.dailyRate || 1000,
    status: 'paid',
    startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  };

  // 4. Pending sale created 6.5 days ago (should send reminder)
  const reminderSale = {
    referenceNumber: `TEST-SALE-REMINDER-${Date.now()}`,
    equipmentId: equipment._id,
    buyerId: renter._id,
    buyerEmail: renter.email || `${renter.phone}@test.com`,
    salePrice: equipment.salePrice || 50000,
    status: 'pending',
    createdAt: new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000), // 6.5 days ago
    updatedAt: new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000),
  };

  // 5. Pending sale created 8 days ago (should be cancelled)
  const expiredSale = {
    referenceNumber: `TEST-SALE-EXPIRED-${Date.now()}`,
    equipmentId: equipment._id,
    buyerId: renter._id,
    buyerEmail: renter.email || `${renter.phone}@test.com`,
    salePrice: equipment.salePrice || 50000,
    status: 'pending',
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
  };

  const bookingResult = await db.collection('bookings').insertMany([
    reminderBooking,
    expiredPendingBooking,
    expiredPaidBooking
  ]);

  const saleResult = await db.collection('sales').insertMany([
    reminderSale,
    expiredSale
  ]);

  console.log('📋 Created test bookings:');
  console.log(`  1. ${reminderBooking.referenceNumber} - Pending, ends in 12h (should remind)`);
  console.log(`  2. ${expiredPendingBooking.referenceNumber} - Pending, ended 1h ago (should cancel)`);
  console.log(`  3. ${expiredPaidBooking.referenceNumber} - Paid, ended 1h ago (should complete)\n`);
  
  console.log('📋 Created test sales:');
  console.log(`  4. ${reminderSale.referenceNumber} - Pending, 6.5 days old (should remind)`);
  console.log(`  5. ${expiredSale.referenceNumber} - Pending, 8 days old (should cancel)\n`);

  return {
    bookingIds: Object.values(bookingResult.insertedIds),
    saleIds: Object.values(saleResult.insertedIds)
  };
}

async function triggerCron() {
  console.log('🔄 Triggering cron job...\n');
  
  const response = await fetch('http://localhost:3000/api/cron/auto-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Cron executed successfully:');
    console.log(`   Bookings Completed: ${result.result.bookings.completed}`);
    console.log(`   Bookings Cancelled: ${result.result.bookings.cancelled}`);
    console.log(`   Booking Reminders: ${result.result.bookings.reminders}`);
    console.log(`   Sales Cancelled: ${result.result.sales.cancelled}`);
    console.log(`   Sale Reminders: ${result.result.sales.reminders}\n`);
  } else {
    console.log('❌ Cron failed:', result.error);
  }
}

async function checkResults(db, data) {
  console.log('📊 Checking results:\n');
  
  const bookings = await db.collection('bookings').find({
    _id: { $in: data.bookingIds }
  }).toArray();

  console.log('Bookings:');
  bookings.forEach(b => {
    console.log(`  ${b.referenceNumber}: ${b.status.toUpperCase()}`);
  });

  const sales = await db.collection('sales').find({
    _id: { $in: data.saleIds }
  }).toArray();

  console.log('\nSales:');
  sales.forEach(s => {
    console.log(`  ${s.referenceNumber}: ${s.status.toUpperCase()}`);
  });

  console.log('\n📧 Check ADMIN_EMAIL for notification emails\n');
}

async function cleanup(db, data) {
  await db.collection('bookings').deleteMany({ _id: { $in: data.bookingIds } });
  await db.collection('sales').deleteMany({ _id: { $in: data.saleIds } });
  console.log('🗑️  Test data cleaned up\n');
}

async function main() {
  let client;
  try {
    console.log('🚀 Instant Cron Test\n');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('construction_rental');
    
    console.log('✅ Connected to MongoDB\n');

    const data = await createTestData(db);
    await triggerCron();
    await checkResults(db, data);
    await cleanup(db, data);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) await client.close();
  }
}

main();
