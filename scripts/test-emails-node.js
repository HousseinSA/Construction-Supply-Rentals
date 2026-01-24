/**
 * Email Test Script - Node.js Compatible
 * Run: node scripts/test-emails-node.js
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// Load .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...val] = line.split('=');
    if (key) process.env[key.trim()] = val.join('=').trim();
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const RENTER_EMAIL = 'nejihoussein1@gmail.com';

async function testEmails() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 TESTING ALL 11 EMAIL TYPES');
  console.log('='.repeat(60) + '\n');
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Renter Email: ${RENTER_EMAIL}\n`);

  // Import from Next.js build
  const emailLib = await import('../.next/server/app/api/test-emails/route.js').catch(async () => {
    // Fallback: try to import directly (requires Next.js dev server running)
    console.log('⚠️  Next.js build not found. Attempting direct import...\n');
    return await import('file://' + join(__dirname, '..', 'src', 'lib', 'email.ts').replace(/\\/g, '/'));
  });

  const results = [];

  // Test all 11 emails
  const tests = [
    {
      name: '1️⃣  Password Reset (to RENTER)',
      fn: () => emailLib.sendPasswordResetEmail(RENTER_EMAIL, 'test-token-123', 'fr'),
      recipient: 'Renter'
    },
    {
      name: '2️⃣  New Booking (to ADMIN)',
      fn: () => emailLib.sendNewBookingEmail(ADMIN_EMAIL, {
        referenceNumber: 'TEST-001',
        equipmentName: 'Excavatrice CAT 320',
        totalPrice: 50000,
        commission: 5000,
        renterName: 'Test Renter',
        renterPhone: '22345678',
        supplierName: 'Test Supplier',
        supplierPhone: '33445566',
        usage: 5,
        usageUnit: 'days',
        rate: 10000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        bookingDate: new Date()
      }),
      recipient: 'Admin'
    },
    {
      name: '3️⃣  New Sale (to ADMIN)',
      fn: () => emailLib.sendNewSaleEmail(ADMIN_EMAIL, {
        referenceNumber: 'SALE-001',
        equipmentName: 'Bulldozer D6',
        salePrice: 500000,
        commission: 25000,
        buyerName: 'Test Buyer',
        buyerPhone: '22345678',
        supplierName: 'Test Supplier',
        supplierPhone: '44556677',
        saleDate: new Date()
      }),
      recipient: 'Admin'
    },
    {
      name: '4️⃣  New Equipment (to ADMIN)',
      fn: () => emailLib.sendNewEquipmentEmail(ADMIN_EMAIL, {
        equipmentName: 'Grue Mobile 50T',
        supplierName: 'Test Supplier',
        supplierPhone: '55667788',
        location: 'Nouakchott',
        category: 'Levage',
        listingType: 'Location',
        pricing: '15,000 MRU/jour',
        dateSubmitted: new Date()
      }),
      recipient: 'Admin'
    },
    {
      name: '5️⃣  Equipment Approval (to RENTER)',
      fn: () => emailLib.sendEquipmentApprovalEmail(RENTER_EMAIL, {
        equipmentName: 'Grue Mobile 50T',
        supplierName: 'Test Supplier'
      }),
      recipient: 'Renter'
    },
    {
      name: '6️⃣  Booking Cancellation (to ADMIN)',
      fn: () => emailLib.sendBookingCancellationEmail(ADMIN_EMAIL, {
        referenceNumber: 'TEST-002',
        equipmentNames: ['Excavatrice CAT 320', 'Compacteur'],
        totalPrice: 75000,
        renterName: 'Test Renter',
        renterPhone: '22345678',
        renterLocation: 'Nouakchott',
        cancellationDate: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        suppliers: [{ name: 'Supplier 1', phone: '33445566', equipment: 'Excavatrice', duration: '5 jours' }]
      }),
      recipient: 'Admin'
    },
    {
      name: '7️⃣  Booking Pending Reminder (to ADMIN)',
      fn: () => emailLib.sendBookingPendingReminderEmail(ADMIN_EMAIL, {
        referenceNumber: 'TEST-003',
        equipmentNames: ['Chargeuse'],
        endDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        totalPrice: 30000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }),
      recipient: 'Admin'
    },
    {
      name: '8️⃣  Booking Start Reminder (to ADMIN)',
      fn: () => emailLib.sendBookingStartReminderEmail(ADMIN_EMAIL, {
        referenceNumber: 'TEST-004',
        equipmentNames: ['Camion Benne 20T'],
        startDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalPrice: 45000,
        status: 'paid',
        renterName: 'Test Renter',
        renterPhone: '22345678'
      }),
      recipient: 'Admin'
    },
    {
      name: '9️⃣  Sale Pending Reminder (to ADMIN)',
      fn: () => emailLib.sendSalePendingReminderEmail(ADMIN_EMAIL, {
        referenceNumber: 'SALE-002',
        equipmentName: 'Pelle Hydraulique',
        salePrice: 350000,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }),
      recipient: 'Admin'
    },
    {
      name: '🔟 Sale Cancellation (to ADMIN)',
      fn: () => emailLib.sendSaleCancellationEmail(ADMIN_EMAIL, {
        referenceNumber: 'SALE-003',
        equipmentName: 'Niveleuse',
        salePrice: 450000,
        buyerName: 'Test Buyer',
        buyerPhone: '22345678',
        cancellationDate: new Date(),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }),
      recipient: 'Admin'
    },
    {
      name: '1️⃣1️⃣  Pricing Update Request (to ADMIN)',
      fn: () => emailLib.sendPricingUpdateRequestEmail(ADMIN_EMAIL, {
        equipmentName: 'Compacteur Vibrant',
        equipmentReference: 'EQ-2024-001',
        supplierName: 'Test Supplier',
        supplierPhone: '55667788',
        currentPricing: '8,000 MRU/jour',
        requestedPricing: '10,000 MRU/jour',
        requestDate: new Date()
      }),
      recipient: 'Admin'
    }
  ];

  for (const test of tests) {
    try {
      console.log(test.name + '...');
      await test.fn();
      results.push(`✅ ${test.name.replace(/[0-9️⃣]/g, '').trim()} → ${test.recipient}`);
      console.log(`   ✅ Sent to ${test.recipient.toLowerCase()}\n`);
    } catch (err) {
      results.push(`❌ ${test.name.replace(/[0-9️⃣]/g, '').trim()}: ${err.message}`);
      console.log(`   ❌ ${err.message}\n`);
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60) + '\n');
  results.forEach((r, i) => console.log(`${i + 1}. ${r}`));
  const success = results.filter(r => r.includes('✅')).length;
  console.log(`\n✅ Success: ${success}/11`);
  console.log(`❌ Failed: ${11 - success}/11\n`);
  console.log(`📧 Check inboxes:`);
  console.log(`   Admin: ${ADMIN_EMAIL}`);
  console.log(`   Renter: ${RENTER_EMAIL}\n`);
}

testEmails().catch(err => {
  console.error('\n❌ Fatal Error:', err.message);
  console.log('\n💡 Make sure your .env.local has EMAIL credentials configured:\n');
  console.log('   EMAIL_HOST=smtp.gmail.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASSWORD=your-app-password\n');
  process.exit(1);
});
