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
const AUTO_COMPLETE_SECRET = envVars.AUTO_COMPLETE_SECRET;

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

  // 1. Booking starting tomorrow (should send start reminder)
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(14, 0, 0, 0); // 2 PM tomorrow
  
  const startReminderBooking = {
    referenceNumber: `TEST-START-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renter.email || `${renter.phone}@test.com`,
    supplierId: equipment.supplierId,
    bookingItems: [{
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      equipmentReference: equipment.referenceNumber,
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
    startDate: tomorrowStart,
    endDate: new Date(tomorrowStart.getTime() + 2 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };

  // 2. Pending booking ending tomorrow (should send end reminder)
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(18, 0, 0, 0); // 6 PM tomorrow
  
  const endReminderBooking = {
    referenceNumber: `TEST-END-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renter.email || `${renter.phone}@test.com`,
    supplierId: equipment.supplierId,
    bookingItems: [{
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      equipmentReference: equipment.referenceNumber,
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
    startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    endDate: tomorrowEnd,
    createdAt: now,
    updatedAt: now,
  };

  // 3. Pending booking ended 1 hour ago (should be cancelled)
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

  // 4. Paid booking ended 1 hour ago (should be completed)
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

  // 5. Pending sale created exactly 6 days ago (should send reminder)
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  sixDaysAgo.setHours(10, 0, 0, 0); // 10 AM, 6 days ago
  
  const reminderSale = {
    referenceNumber: `TEST-SALE-REMINDER-${Date.now()}`,
    equipmentId: equipment._id,
    buyerId: renter._id,
    buyerEmail: renter.email || `${renter.phone}@test.com`,
    salePrice: equipment.salePrice || 50000,
    status: 'pending',
    createdAt: sixDaysAgo,
    updatedAt: sixDaysAgo,
  };

  // 6. Pending sale created 8 days ago (should be cancelled)
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
    startReminderBooking,
    endReminderBooking,
    expiredPendingBooking,
    expiredPaidBooking
  ]);

  const saleResult = await db.collection('sales').insertMany([
    reminderSale,
    expiredSale
  ]);

  console.log('📋 Created test bookings:');
  console.log(`  1. ${startReminderBooking.referenceNumber} - Paid, starts tomorrow (should send start reminder)`);
  console.log(`  2. ${endReminderBooking.referenceNumber} - Pending, ends tomorrow (should send end reminder)`);
  console.log(`  3. ${expiredPendingBooking.referenceNumber} - Pending, ended 1h ago (should cancel)`);
  console.log(`  4. ${expiredPaidBooking.referenceNumber} - Paid, ended 1h ago (should complete)\n`);
  
  console.log('📋 Created test sales:');
  console.log(`  5. ${reminderSale.referenceNumber} - Pending, exactly 6 days old (should remind)`);
  console.log(`  6. ${expiredSale.referenceNumber} - Pending, 8 days old (should cancel)\n`);

  return {
    bookingIds: Object.values(bookingResult.insertedIds),
    saleIds: Object.values(saleResult.insertedIds)
  };
}

async function triggerCron() {
  console.log('🔄 Triggering cron job...\n');
  
  const response = await fetch('http://localhost:3000/api/cron/auto-complete', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTO_COMPLETE_SECRET}`
    }
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Cron executed successfully:');
    console.log(`   Booking Start Reminders: ${result.result.bookings.startReminders}`);
    console.log(`   Booking End Reminders: ${result.result.bookings.reminders}`);
    console.log(`   Bookings Cancelled: ${result.result.bookings.cancelled}`);
    console.log(`   Bookings Completed: ${result.result.bookings.completed}`);
    console.log(`   Sale Reminders: ${result.result.sales.reminders}`);
    console.log(`   Sales Cancelled: ${result.result.sales.cancelled}\n`);
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
