import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST
config({ path: resolve(process.cwd(), '.env.local') });

import * as emailLib from '../src/lib/email';

const TEST_RENTER_EMAIL = 'nejihoussein1@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';

async function testAllEmails() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 TESTING ALL EMAIL TYPES');
  console.log('='.repeat(60) + '\n');
  console.log(`Renter Email: ${TEST_RENTER_EMAIL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}\n`);

  const results = [];

  // 1. Password Reset
  try {
    console.log('1️⃣  Password Reset Email...');
    await emailLib.sendPasswordResetEmail(TEST_RENTER_EMAIL, 'test-token-123', 'fr');
    results.push({ type: 'Password Reset', status: '✅', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Password Reset', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 2. New Booking
  try {
    console.log('2️⃣  New Booking Email...');
    await emailLib.sendNewBookingEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-001',
      equipmentName: 'Excavatrice CAT 320',
      equipmentReference: 'EQ-2024-001',
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
    results.push({ type: 'New Booking', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'New Booking', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 3. New Sale
  try {
    console.log('3️⃣  New Sale Email...');
    await emailLib.sendNewSaleEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-001',
      equipmentName: 'Bulldozer D6',
      equipmentReference: 'EQ-2024-002',
      salePrice: 500000,
      commission: 25000,
      buyerName: 'Neji Houssein',
      buyerPhone: '22345678',
      supplierName: 'Ahmed Supplier',
      supplierPhone: '44556677',
      saleDate: new Date()
    });
    results.push({ type: 'New Sale', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'New Sale', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 4. New Equipment
  try {
    console.log('4️⃣  New Equipment Email...');
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
    results.push({ type: 'New Equipment', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'New Equipment', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 5. Equipment Approval
  try {
    console.log('5️⃣  Equipment Approval Email...');
    await emailLib.sendEquipmentApprovalEmail(TEST_RENTER_EMAIL, {
      equipmentName: 'Grue Mobile 50T',
      supplierName: 'Neji Houssein'
    });
    results.push({ type: 'Equipment Approval', status: '✅', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Equipment Approval', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 6. Booking Cancellation
  try {
    console.log('6️⃣  Booking Cancellation Email...');
    await emailLib.sendBookingCancellationEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-002',
      equipmentNames: ['Excavatrice CAT 320', 'Compacteur Bomag'],
      equipmentReferences: ['EQ-2024-003', 'EQ-2024-004'],
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
    results.push({ type: 'Booking Cancellation', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Booking Cancellation', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 7. Booking Pending Reminder
  try {
    console.log('7️⃣  Booking Pending Reminder Email...');
    await emailLib.sendBookingPendingReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-003',
      equipmentNames: ['Chargeuse Caterpillar'],
      equipmentReferences: ['EQ-2024-005'],
      endDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      totalPrice: 30000,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      renterName: 'Neji Houssein',
      renterPhone: '22345678',
      suppliers: [{ name: 'Hassan Supplier', phone: '55667788' }]
    });
    results.push({ type: 'Booking Pending Reminder', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Booking Pending Reminder', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 8. Booking Start Reminder
  try {
    console.log('8️⃣  Booking Start Reminder Email...');
    await emailLib.sendBookingStartReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-BOOK-004',
      equipmentNames: ['Camion Benne 20T'],
      equipmentReferences: ['EQ-2024-006'],
      startDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      totalPrice: 45000,
      status: 'paid',
      renterName: 'Neji Houssein',
      renterPhone: '22345678',
      createdAt: new Date(),
      suppliers: [{ name: 'Mohamed Supplier', phone: '33445566' }]
    });
    results.push({ type: 'Booking Start Reminder', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Booking Start Reminder', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 9. Sale Pending Reminder
  try {
    console.log('9️⃣  Sale Pending Reminder Email...');
    await emailLib.sendSalePendingReminderEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-002',
      equipmentName: 'Pelle Hydraulique',
      equipmentReference: 'EQ-2024-007',
      salePrice: 350000,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      buyerName: 'Neji Houssein',
      buyerPhone: '22345678',
      supplierName: 'Ahmed Supplier',
      supplierPhone: '44556677'
    });
    results.push({ type: 'Sale Pending Reminder', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Sale Pending Reminder', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 10. Sale Cancellation
  try {
    console.log('🔟 Sale Cancellation Email...');
    await emailLib.sendSaleCancellationEmail(ADMIN_EMAIL, {
      referenceNumber: 'TEST-SALE-003',
      equipmentName: 'Niveleuse Caterpillar',
      equipmentReference: 'EQ-2024-008',
      salePrice: 450000,
      buyerName: 'Neji Houssein',
      buyerPhone: '22345678',
      supplierName: 'Hassan Supplier',
      supplierPhone: '55667788',
      cancellationDate: new Date(),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });
    results.push({ type: 'Sale Cancellation', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Sale Cancellation', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // 11. Pricing Update Request
  try {
    console.log('1️⃣1️⃣  Pricing Update Request Email...');
    await emailLib.sendPricingUpdateRequestEmail(ADMIN_EMAIL, {
      equipmentName: 'Compacteur Vibrant',
      equipmentReference: 'EQ-2024-001',
      supplierName: 'Hassan Supplier',
      supplierPhone: '55667788',
      currentPricing: '8,000 MRU/jour',
      requestedPricing: '10,000 MRU/jour',
      requestDate: new Date()
    });
    results.push({ type: 'Pricing Update Request', status: '✅', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent\n');
  } catch (err: any) {
    results.push({ type: 'Pricing Update Request', status: '❌', error: err.message });
    console.log(`   ❌ ${err.message}\n`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const successCount = results.filter(r => r.status === '✅').length;
  const failCount = results.filter(r => r.status === '❌').length;

  console.log(`Total: ${results.length} | ✅ ${successCount} | ❌ ${failCount}\n`);
  console.log(`📧 Check: ${TEST_RENTER_EMAIL} & ${ADMIN_EMAIL}\n`);
}

testAllEmails().catch(console.error);
