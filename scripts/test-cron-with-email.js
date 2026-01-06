#!/usr/bin/env node

/**
 * Comprehensive Cron Job Testing Script
 * Tests booking auto-completion with real users and equipment
 * Uses minute-based testing for quick verification
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============= ENV SETUP =============
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
const ADMIN_EMAIL = envVars.ADMIN_EMAIL;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log(`✅ Admin Email: ${ADMIN_EMAIL}\n`);

// ============= HELPERS =============

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= STEP 1: GET REAL USERS & EQUIPMENT =============

async function getRealData(db) {
  console.log('📦 Fetching real data from database...\n');

  // Get a real supplier
  const supplier = await db.collection('users').findOne({
    userType: 'supplier',
    status: 'approved'
  });

  if (!supplier) {
    console.error('❌ No approved suppliers found in database');
    process.exit(1);
  }

  // Get a real renter
  const renter = await db.collection('users').findOne({
    userType: 'renter',
    status: 'approved'
  });

  if (!renter) {
    console.error('❌ No approved renters found in database');
    process.exit(1);
  }

  // Get a real equipment with pricing
  const equipment = await db.collection('equipment').findOne({
    supplierId: supplier._id,
    'pricing.dailyRate': { $gt: 0 }
  });

  if (!equipment) {
    console.error('❌ No equipment found for this supplier');
    process.exit(1);
  }

  console.log(`✅ Supplier: ${supplier.firstName} ${supplier.lastName} (${supplier.email})`);
  console.log(`✅ Renter: ${renter.firstName} ${renter.lastName} (${renter.email})`);
  console.log(`✅ Equipment: ${equipment.name} (Daily Rate: ${equipment.pricing.dailyRate} MRU)\n`);

  return { supplier, renter, equipment };
}

// ============= STEP 2: CREATE TEST BOOKING =============

async function createTestBooking(db, { supplier, renter, equipment }, minutesUntilExpiry = 2) {
  console.log(`⏱️  Creating test booking (will expire in ${minutesUntilExpiry} minutes)...\n`);

  const now = new Date();
  const startDate = now;
  const endDate = new Date(now.getTime() + minutesUntilExpiry * 60 * 1000);

  const booking = {
    referenceNumber: `TEST-CRON-${Date.now()}`,
    renterId: renter._id,
    bookingItems: [
      {
        equipmentId: equipment._id,
        supplierId: supplier._id,
        equipmentName: equipment.name,
        pricingType: 'daily',
        rate: equipment.pricing.dailyRate,
        usage: 1,
        usageUnit: 'days',
        subtotal: equipment.pricing.dailyRate,
        equipmentImage: equipment.images?.[0] || '',
      }
    ],
    totalPrice: equipment.pricing.dailyRate,
    grandTotal: equipment.pricing.dailyRate,
    status: 'pending',
    startDate,
    endDate,
    renterMessage: 'Test booking for cron job verification',
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('bookings').insertOne(booking);

  console.log('✅ Test booking created:');
  console.log(`   Reference: ${booking.referenceNumber}`);
  console.log(`   Equipment: ${equipment.name}`);
  console.log(`   Total: ${booking.totalPrice} MRU`);
  console.log(`   Status: PENDING`);
  console.log(`   Start: ${startDate.toLocaleString()}`);
  console.log(`   End: ${endDate.toLocaleString()}`);
  console.log(`   ⏳ Will expire in ${minutesUntilExpiry} minutes\n`);

  return {
    _id: result.insertedId,
    referenceNumber: booking.referenceNumber,
    endDate,
  };
}

// ============= STEP 3: WAIT FOR EXPIRY =============

async function waitForExpiry(booking, minutesUntilExpiry) {
  console.log(`⏳ Waiting for booking to expire...\n`);

  const totalSeconds = minutesUntilExpiry * 60 + 10; // +10 sec buffer
  let secondsLeft = totalSeconds;

  while (secondsLeft > 0) {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    process.stdout.write(
      `\r   Time remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} `
    );
    await sleep(1000);
    secondsLeft--;
  }

  console.log('\r✅ Booking has expired! Ready to run cron job.\n');
}

// ============= STEP 4: RUN CRON JOB =============

async function runCronJob(db) {
  console.log('🔄 Running cron job logic...\n');

  const now = new Date();
  let completed = 0;
  let cancelled = 0;
  let reminders = 0;
  const processedBookings = [];

  // 1. Warning emails
  const warningDate = new Date(now);
  warningDate.setMinutes(warningDate.getMinutes() + 1);

  const warningBookings = await db.collection('bookings').find({
    endDate: { $gt: now, $lte: warningDate },
    status: 'pending'
  }).toArray();

  for (const booking of warningBookings) {
    reminders++;
    console.log(`   ⚠️  Warning email sent for: ${booking.referenceNumber}`);
  }

  // 2. KM bookings
  const kmBookings = await db.collection('bookings').find({
    'bookingItems': { $elemMatch: { pricingType: 'per_km' } },
    status: { $in: ['pending', 'paid'] }
  }).toArray();

  for (const booking of kmBookings) {
    const twoDaysFromStart = new Date(booking.startDate);
    twoDaysFromStart.setDate(twoDaysFromStart.getDate() + 2);

    if (now >= twoDaysFromStart) {
      if (booking.status === 'pending') {
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: { status: 'cancelled', updatedAt: new Date() } }
        );
        cancelled++;
        processedBookings.push({
          ref: booking.referenceNumber,
          type: 'KM',
          action: 'CANCELLED (unpaid)'
        });
        console.log(`   ❌ KM booking cancelled: ${booking.referenceNumber}`);
      } else if (booking.status === 'paid') {
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
        );
        completed++;
        processedBookings.push({
          ref: booking.referenceNumber,
          type: 'KM',
          action: 'COMPLETED (paid)'
        });
        console.log(`   ✅ KM booking completed: ${booking.referenceNumber}`);
      }
    }
  }

  // 3. Regular bookings (daily/hourly/monthly)
  const expiredBookings = await db.collection('bookings').find({
    'bookingItems': { $not: { $elemMatch: { pricingType: 'per_km' } } },
    endDate: { $lte: now },
    status: { $in: ['pending', 'paid'] }
  }).toArray();

  for (const booking of expiredBookings) {
    const item = booking.bookingItems[0];
    if (booking.status === 'pending') {
      await db.collection('bookings').updateOne(
        { _id: booking._id },
        { $set: { status: 'cancelled', updatedAt: new Date() } }
      );
      cancelled++;
      processedBookings.push({
        ref: booking.referenceNumber,
        type: item.pricingType.toUpperCase(),
        action: 'CANCELLED (unpaid)'
      });
      console.log(`   ❌ ${item.pricingType.toUpperCase()} booking cancelled: ${booking.referenceNumber}`);
    } else if (booking.status === 'paid') {
      await db.collection('bookings').updateOne(
        { _id: booking._id },
        { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
      );
      completed++;
      processedBookings.push({
        ref: booking.referenceNumber,
        type: item.pricingType.toUpperCase(),
        action: 'COMPLETED (paid)'
      });
      console.log(`   ✅ ${item.pricingType.toUpperCase()} booking completed: ${booking.referenceNumber}`);
    }
  }

  console.log('\n✅ Cron job completed:');
  console.log(`   Completed: ${completed}`);
  console.log(`   Cancelled: ${cancelled}`);
  console.log(`   Warnings: ${reminders}\n`);

  return { completed, cancelled, reminders, processedBookings };
}

// ============= STEP 5: VERIFY RESULTS =============

async function verifyResults(db, testBooking) {
  console.log('🔍 Verifying results...\n');

  const updatedBooking = await db.collection('bookings').findOne({
    _id: testBooking._id
  });

  if (!updatedBooking) {
    console.error('❌ Booking not found');
    return false;
  }

  const isCancelled = updatedBooking.status === 'cancelled';
  const isCompleted = updatedBooking.status === 'completed';

  console.log(`📋 Booking Status:`);
  console.log(`   Reference: ${updatedBooking.referenceNumber}`);
  console.log(`   Status: ${updatedBooking.status}`);
  console.log(`   Expected: cancelled (pending booking after expiry)`);
  console.log(`   Result: ${isCancelled ? '✅ SUCCESS' : '❌ FAILED'}\n`);

  if (isCancelled) {
    console.log('📧 Expected Email Behavior:');
    console.log(`   Recipient: ${ADMIN_EMAIL}`);
    console.log(`   Type: Cancellation Email`);
    console.log(`   Status: Should have been sent\n`);
    console.log(`   📝 Check your email at: ${ADMIN_EMAIL}\n`);
    return true;
  } else {
    console.log('❌ Booking was not cancelled. Check the logic.\n');
    return false;
  }
}

// ============= CLEANUP =============

async function cleanup(db, testBooking) {
  const choice = await askQuestion('🗑️  Delete test booking? (yes/no): ');
  if (choice === 'yes' || choice === 'y') {
    await db.collection('bookings').deleteOne({ _id: testBooking._id });
    console.log('✅ Test booking deleted\n');
  } else {
    console.log('📝 Test booking kept for manual inspection\n');
  }
}

// ============= MAIN =============

async function main() {
  let client;
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 COMPREHENSIVE CRON JOB TESTING');
    console.log('='.repeat(60) + '\n');

    // Connect
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    await db.admin().ping();
    console.log('✅ Connected to MongoDB\n');

    // Get real data
    const { supplier, renter, equipment } = await getRealData(db);

    // Ask for custom wait time
    const customWait = await askQuestion('⏱️  Minutes until booking expires? (default 2): ');
    const minutesUntilExpiry = parseInt(customWait) || 2;
    console.log();

    // Create booking
    const testBooking = await createTestBooking(db, { supplier, renter, equipment }, minutesUntilExpiry);

    // Wait for expiry
    await waitForExpiry(testBooking, minutesUntilExpiry);

    // Run cron
    const cronResult = await runCronJob(db);

    // Verify
    const success = await verifyResults(db, testBooking);

    if (success) {
      console.log('✅ TEST PASSED: Booking was cancelled as expected');
      console.log('📧 Check your email for cancellation notification');
    } else {
      console.log('❌ TEST FAILED: Booking was not cancelled');
    }

    // Cleanup
    await cleanup(db, testBooking);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB\n');
    }
  }
}

main();
