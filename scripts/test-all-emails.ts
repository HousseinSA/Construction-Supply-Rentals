/**
 * Comprehensive Email Testing Script
 * Tests all email types in the system
 * 
 * Run with: node scripts/test-all-emails.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import * as emailLib from '../src/lib/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

loadEnv();

const TEST_RENTER_EMAIL = 'nejihoussein1@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';

async function testAllEmails() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 TESTING ALL EMAIL TYPES');
  console.log('='.repeat(60) + '\n');
  console.log(`Renter Email: ${TEST_RENTER_EMAIL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}\n`);

  const results = [];

  // 1. Password Reset Email
  try {
    console.log('1️⃣  Testing Password Reset Email...');
    await emailLib.sendPasswordResetEmail(TEST_RENTER_EMAIL, 'test-token-123', 'fr');
    results.push({ type: 'Password Reset', status: '✅ Sent', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent to renter\n');
  } catch (err) {
    results.push({ type: 'Password Reset', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 2. New Booking Email (to Admin)
  try {
    console.log('2️⃣  Testing New Booking Email...');
    await emailLib.sendNewBookingEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-001',
      equipmentName: 'Excavatrice CAT 320',
      totalPrice: 50000,
      commission: 5000,
      renterName: 'Neji Houssein',
      renterPhone: '22345678',
      supplierName: 'Mohamed Supplier',
      supplierPhone: '33445566',
      usage: 5,
      usageUnit: 'days',
      rate: 10000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      bookingDate: new Date()
    });
    results.push({ type: 'New Booking', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Booking', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 3. New Sale Email (to Admin)
  try {
    console.log('3️⃣  Testing New Sale Email...');
    await emailLib.sendNewSaleEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-001',
      equipmentName: 'Bulldozer D6',
      salePrice: 500000,
      commission: 25000,
      buyerName: 'Neji Houssein',
      buyerPhone: '22345678',
      supplierName: 'Ahmed Supplier',
      supplierPhone: '44556677',
      saleDate: new Date()
    });
    results.push({ type: 'New Sale', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Sale', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 4. New Equipment Email (to Admin)
  try {
    console.log('4️⃣  Testing New Equipment Email...');
    await emailLib.sendNewEquipmentEmail(ADMIN_EMAIL, {
      equipmentName: 'Grue Mobile 50T',
      supplierName: 'Hassan Supplier',
      supplierPhone: '55667788',
      location: 'Nouakchott',
      category: 'Levage et Manutention',
      listingType: 'Location',
      pricing: '15,000 MRU/jour',
      dateSubmitted: new Date()
    });
    results.push({ type: 'New Equipment', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Equipment', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 5. Equipment Approval Email (to Supplier - using renter email for test)
  try {
    console.log('5️⃣  Testing Equipment Approval Email...');
    await emailLib.sendEquipmentApprovalEmail(TEST_RENTER_EMAIL, {
      equipmentName: 'Grue Mobile 50T',
      supplierName: 'Neji Houssein'
    });
    results.push({ type: 'Equipment Approval', status: '✅ Sent', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent to renter (as supplier)\n');
  } catch (err) {
    results.push({ type: 'Equipment Approval', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 6. Booking Cancellation Email (to Admin)
  try {
    console.log('6️⃣  Testing Booking Cancellation Email...');
    await emailLib.sendBookingCancellationEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-002',
      equipmentNames: ['Excavatrice CAT 320', 'Compacteur Bomag'],
      totalPrice: 75000,
      renterName: 'Neji Houssein',
      renterPhone: '22345678',
      renterLocation: 'Nouakchott',
      cancellationDate: new Date(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      suppliers: [
        { name: 'Mohamed Supplier', phone: '33445566', equipment: 'Excavatrice CAT 320', duration: '5 jours' },
        { name: 'Ahmed Supplier', phone: '44556677', equipment: 'Compacteur Bomag', duration: '3 jours' }
      ]
    });
    results.push({ type: 'Booking Cancellation', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Cancellation', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 7. Booking Pending Reminder Email (to Admin)
  try {
    console.log('7️⃣  Testing Booking Pending Reminder Email...');
    await emailLib.sendBookingPendingReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-003',
      equipmentNames: ['Chargeuse Caterpillar'],
      endDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      totalPrice: 30000,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    results.push({ type: 'Booking Pending Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Pending Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 8. Booking Start Reminder Email (to Admin)
  try {
    console.log('8️⃣  Testing Booking Start Reminder Email...');
    await emailLib.sendBookingStartReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-004',
      equipmentNames: ['Camion Benne 20T'],
      startDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      totalPrice: 45000,
      status: 'paid',
      renterName: 'Neji Houssein',
      renterPhone: '22345678'
    });
    results.push({ type: 'Booking Start Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Start Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 9. Sale Pending Reminder Email (to Admin)
  try {
    console.log('9️⃣  Testing Sale Pending Reminder Email...');
    await emailLib.sendSalePendingReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-002',
      equipmentName: 'Pelle Hydraulique',
      salePrice: 350000,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    });
    results.push({ type: 'Sale Pending Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Sale Pending Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 10. Sale Cancellation Email (to Admin)
  try {
    console.log('🔟 Testing Sale Cancellation Email...');
    await emailLib.sendSaleCancellationEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-003',
      equipmentName: 'Niveleuse Caterpillar',
      salePrice: 450000,
      buyerName: 'Neji Houssein',
      buyerPhone: '22345678',
      cancellationDate: new Date(),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });
    results.push({ type: 'Sale Cancellation', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Sale Cancellation', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 11. Pricing Update Request Email (to Admin)
  try {
    console.log('1️⃣1️⃣  Testing Pricing Update Request Email...');
    await emailLib.sendPricingUpdateRequestEmail(ADMIN_EMAIL, {
      equipmentName: 'Compacteur Vibrant',
      equipmentReference: 'EQ-2024-001',
      supplierName: 'Hassan Supplier',
      supplierPhone: '55667788',
      currentPricing: '8,000 MRU/jour',
      requestedPricing: '10,000 MRU/jour',
      requestDate: new Date()
    });
    results.push({ type: 'Pricing Update Request', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Pricing Update Request', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 EMAIL TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.type}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Recipient: ${result.recipient || 'N/A'}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    console.log('');
  });

  const successCount = results.filter(r => r.status.includes('✅')).length;
  const failCount = results.filter(r => r.status.includes('❌')).length;

  console.log(`Total: ${results.length} emails`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}\n`);

  console.log('📧 Check these inboxes:');
  console.log(`   - Renter: ${TEST_RENTER_EMAIL}`);
  console.log(`   - Admin: ${ADMIN_EMAIL}\n`);
}

testAllEmails().catch(console.error);
