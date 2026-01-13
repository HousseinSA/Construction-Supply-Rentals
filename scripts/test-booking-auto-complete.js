const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    const env = {};
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (err) {
    console.error('❌ Could not read .env.local file:', err.message);
    process.exit(1);
  }
}

const envVars = loadEnv();
const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function createTestBookings(db) {
  console.log('\n📝 Fetching real equipment and users...\n');
  
  // Get any user with userType 'renter' from construction_rental database
  const users = await db.collection('users').find({ userType: 'renter' }).toArray();
  if (users.length === 0) {
    const allUsers = await db.collection('users').find({}).toArray();
    if (allUsers.length === 0) {
      throw new Error('No users found in database');
    }
    const renter = allUsers[0];
    console.log(`✅ Using user: ${renter.email || renter.phone}`);
  } else {
    var renter = users[Math.floor(Math.random() * users.length)];
    console.log(`✅ Using renter: ${renter.email || renter.phone}`);
  }

  // Get available equipment with different pricing types
  const kmEquipment = await db.collection('equipment').findOne({ 
    'pricing.kmRate': { $exists: true, $gt: 0 },
    status: 'approved'
  });
  
  const dailyEquipment = await db.collection('equipment').findOne({ 
    'pricing.dailyRate': { $exists: true, $gt: 0 },
    status: 'approved'
  });
  
  const hourlyEquipment = await db.collection('equipment').findOne({ 
    'pricing.hourlyRate': { $exists: true, $gt: 0 },
    status: 'approved'
  });

  if (!kmEquipment || !dailyEquipment || !hourlyEquipment) {
    throw new Error('Not enough equipment with different pricing types found');
  }

  console.log(`✅ Found equipment:`);
  console.log(`   KM: ${kmEquipment.name}`);
  console.log(`   Daily: ${dailyEquipment.name}`);
  console.log(`   Hourly: ${hourlyEquipment.name}\n`);

  const now = new Date();
  const renterEmail = renter.email || `${renter.phone}@test.com`;

  // Test 1: Daily booking ending in 30 seconds (should trigger warning)
  const warningBooking = {
    referenceNumber: `TEST-WARNING-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renterEmail,
    supplierId: dailyEquipment.supplierId,
    bookingItems: [
      {
        equipmentId: dailyEquipment._id,
        equipmentName: dailyEquipment.name,
        pricingType: 'daily',
        rate: dailyEquipment.pricing.dailyRate,
        usage: 1,
        usageUnit: 'days',
        subtotal: dailyEquipment.pricing.dailyRate,
      }
    ],
    totalPrice: dailyEquipment.pricing.dailyRate,
    grandTotal: dailyEquipment.pricing.dailyRate,
    status: 'pending',
    startDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 30 * 1000), // 30 seconds from now
    renterMessage: 'Test warning booking',
    createdAt: now,
    updatedAt: now,
  };

  // Test 2: KM booking - 3 days old (should be cancelled if pending)
  const kmBooking = {
    referenceNumber: `TEST-KM-${Date.now()}`,
    renterId: renter._id,
    renterEmail: renterEmail,
    supplierId: kmEquipment.supplierId,
    bookingItems: [
      {
        equipmentId: kmEquipment._id,
        equipmentName: kmEquipment.name,
        pricingType: 'per_km',
        rate: kmEquipment.pricing.kmRate,
        usage: 500,
        usageUnit: 'km',
        subtotal: kmEquipment.pricing.kmRate * 500,
      }
    ],
    totalPrice: kmEquipment.pricing.kmRate * 500,
    grandTotal: kmEquipment.pricing.kmRate * 500,
    status: 'pending',
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    renterMessage: 'Test booking for KM rate',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  };

  // Test 2: Daily booking - endDate 1 day ago (should be cancelled if pending)
  const dailyBooking = {
    referenceNumber: `TEST-DAILY-${Date.now() + 1}`,
    renterId: renter._id,
    renterEmail: renterEmail,
    supplierId: dailyEquipment.supplierId,
    bookingItems: [
      {
        equipmentId: dailyEquipment._id,
        equipmentName: dailyEquipment.name,
        pricingType: 'daily',
        rate: dailyEquipment.pricing.dailyRate,
        usage: 2,
        usageUnit: 'days',
        subtotal: dailyEquipment.pricing.dailyRate * 2,
      }
    ],
    totalPrice: dailyEquipment.pricing.dailyRate * 2,
    grandTotal: dailyEquipment.pricing.dailyRate * 2,
    status: 'pending',
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    renterMessage: 'Test booking for daily rate',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  };

  // Test 3: Hourly booking - endDate 1 hour ago (should be cancelled if pending)
  const hourlyBooking = {
    referenceNumber: `TEST-HOURLY-${Date.now() + 2}`,
    renterId: renter._id,
    renterEmail: renterEmail,
    supplierId: hourlyEquipment.supplierId,
    bookingItems: [
      {
        equipmentId: hourlyEquipment._id,
        equipmentName: hourlyEquipment.name,
        pricingType: 'hourly',
        rate: hourlyEquipment.pricing.hourlyRate,
        usage: 8,
        usageUnit: 'hours',
        subtotal: hourlyEquipment.pricing.hourlyRate * 8,
      }
    ],
    totalPrice: hourlyEquipment.pricing.hourlyRate * 8,
    grandTotal: hourlyEquipment.pricing.hourlyRate * 8,
    status: 'pending',
    startDate: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    renterMessage: 'Test booking for hourly rate',
    createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
  };

  // Test 4: KM booking - Paid (should be completed)
  const kmPaidBooking = {
    referenceNumber: `TEST-KM-PAID-${Date.now() + 3}`,
    renterId: renter._id,
    renterEmail: renterEmail,
    supplierId: kmEquipment.supplierId,
    bookingItems: [
      {
        equipmentId: kmEquipment._id,
        equipmentName: kmEquipment.name,
        pricingType: 'per_km',
        rate: kmEquipment.pricing.kmRate,
        usage: 300,
        usageUnit: 'km',
        subtotal: kmEquipment.pricing.kmRate * 300,
      }
    ],
    totalPrice: kmEquipment.pricing.kmRate * 300,
    grandTotal: kmEquipment.pricing.kmRate * 300,
    status: 'paid',
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    renterMessage: 'Test paid KM booking',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  };

  const result = await db.collection('bookings').insertMany([
    warningBooking,
    kmBooking,
    dailyBooking,
    hourlyBooking,
    kmPaidBooking,
  ]);

  console.log('✅ Created 5 test bookings:');
  console.log(`  1. Warning (Pending) - ${warningBooking.referenceNumber} - ends in 30s`);
  console.log(`  2. KM (Pending) - ${kmBooking.referenceNumber}`);
  console.log(`  3. Daily (Pending) - ${dailyBooking.referenceNumber}`);
  console.log(`  4. Hourly (Pending) - ${hourlyBooking.referenceNumber}`);
  console.log(`  5. KM (Paid) - ${kmPaidBooking.referenceNumber}\n`);
  console.log('📋 Check your admin dashboard - bookings are now visible!');
  console.log('⏳ Waiting 90 seconds before checking auto-complete results...\n');

  return { insertedIds: result.insertedIds, equipmentIds: [kmEquipment._id, dailyEquipment._id, hourlyEquipment._id] };
}

async function runAutoComplete(db) {
  console.log('🔄 Calling backend auto-complete API...\n');

  try {
    // Call the actual backend API endpoint
    const response = await fetch('http://localhost:3000/api/cron/auto-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Auto-complete API executed successfully:');
      console.log(`   Bookings Cancelled: ${result.result?.bookings?.cancelled || 0}`);
      console.log(`   Bookings Completed: ${result.result?.bookings?.completed || 0}`);
      console.log(`   Booking Reminders: ${result.result?.bookings?.reminders || 0}`);
      console.log(`   Sales Cancelled: ${result.result?.sales?.cancelled || 0}`);
      console.log(`   Sale Reminders: ${result.result?.sales?.reminders || 0}\n`);
    } else {
      console.log('❌ Auto-complete API failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error calling auto-complete API:', error.message);
    return { success: false, result: { bookings: { cancelled: 0, completed: 0, reminders: 0 }, sales: { cancelled: 0, reminders: 0 } } };
  }
}

async function checkResults(db, data) {
  console.log('\n📊 Checking Results After 90 Seconds:\n');
  const bookings = await db.collection('bookings').find({
    _id: { $in: Object.values(data.insertedIds) }
  }).toArray();

  bookings.forEach((booking, index) => {
    const item = booking.bookingItems[0];
    console.log(`  ${index + 1}. ${booking.referenceNumber}`);
    console.log(`     Type: ${item.pricingType}`);
    console.log(`     Status: ${booking.status.toUpperCase()}`);
    if (booking.completedAt) {
      console.log(`     Completed: ${booking.completedAt.toISOString()}`);
    }
    console.log('');
  });

  console.log('\n📧 Email Status:');
  console.log('   - Emails are sent by backend API, not this script');
  console.log('   - Check your admin email for notifications\n');

  console.log('🔧 Equipment Availability:');
  console.log('   - Equipment availability is checked dynamically');
  console.log('   - Bookings don\'t mark equipment as unavailable');
  console.log('   - Backend checks for conflicting bookings when creating new ones\n');
}

async function cleanup(db, data) {
  const answer = await askQuestion('\n🗑️  Delete test bookings? (yes/no): ');
  if (answer === 'yes' || answer === 'y') {
    await db.collection('bookings').deleteMany({
      _id: { $in: Object.values(data.insertedIds) },
    });
    console.log('✅ Test bookings deleted\n');
  } else {
    console.log('\n📝 Test bookings kept in database');
    console.log('   View them in admin dashboard');
    console.log('   Delete manually or run script again\n');
  }
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function main() {
  let client;
  try {
    console.log('🚀 Starting booking auto-complete test...\n');
    console.log(`MongoDB: ${MONGODB_URI}\n`);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('construction_rental');

    // Check connection
    await db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    // Create test bookings
    const data = await createTestBookings(db);

    // Wait 30 seconds then call auto-complete (should send warning email)
    console.log('⏳ Waiting 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    console.log('\n📧 Calling auto-complete (should send warning email)...\n');
    await runAutoComplete(db);

    // Wait another 90 seconds then call auto-complete again (should cancel)
    console.log('\n⏳ Waiting 90 more seconds...');
    await new Promise(resolve => setTimeout(resolve, 90000));
    console.log('\n❌ Calling auto-complete (should cancel unpaid bookings)...\n');
    await runAutoComplete(db);

    // Check final results
    await checkResults(db, data);

    // Ask about cleanup
    await cleanup(db, data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

main();
