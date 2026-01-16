#!/usr/bin/env node

/**
 * Standalone Email Testing Script
 * Tests all email types without importing the email module
 * 
 * Run with: node scripts/test-emails-standalone.js
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const TEST_RENTER_EMAIL = 'nejihoussein1@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Kriliy Engin';
const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
const MAIL_FROM = `${FROM_NAME} <${FROM_ADDRESS}>`;

function formatPhoneNumber(phone) {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

function createEmailTemplate(title, content, buttonText, buttonUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 10px; font-family: Arial, sans-serif; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #f97316; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 20px;">KriliyEngin</h1>
          </div>
          <div style="padding: 20px;">
            ${content}
            ${buttonText && buttonUrl ? `<div style="text-align: center; margin-top: 30px;">
              <a href="${buttonUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; word-break: break-word;">${buttonText}</a>
            </div>` : ''}
          </div>
        </div>
      </body>
    </html>`;
}

function createSection(title, rows) {
  return `
    <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #f97316; font-weight: 600;">${title}</h3>
      <table style="width: 100%; table-layout: fixed;">
        ${rows.map(r => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 35%; vertical-align: top;">${r.label}</td><td style="padding: 6px 0; font-size: 13px; font-weight: 500; word-break: break-word; overflow-wrap: break-word;">${r.value}</td></tr>`).join('')}
      </table>
    </div>`;
}

async function testAllEmails() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 TESTING ALL EMAIL TYPES');
  console.log('='.repeat(60) + '\n');
  console.log(`Renter Email: ${TEST_RENTER_EMAIL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Email User: ${process.env.EMAIL_USER}\n`);

  const results = [];

  // 1. Password Reset Email
  try {
    console.log('1️⃣  Testing Password Reset Email...');
    const resetUrl = `${process.env.NEXTAUTH_URL}/fr/auth/reset-password/confirm?token=test-token-123`;
    const content = `
      <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #111;">Réinitialisation du mot de passe</h2>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Réinitialiser le mot de passe</a>
      </div>
      <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: TEST_RENTER_EMAIL,
      subject: 'Réinitialisation du mot de passe - Kriliy Engin',
      html: createEmailTemplate('Réinitialisation du mot de passe', content),
    });
    results.push({ type: 'Password Reset', status: '✅ Sent', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent to renter\n');
  } catch (err) {
    results.push({ type: 'Password Reset', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 2. New Booking Email
  try {
    console.log('2️⃣  Testing New Booking Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande de location</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-BOOK-001</p>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">Total: 50,000 MRU</p>
      </div>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Excavatrice CAT 320'},
        {label: 'Usage', value: '5 jours (10,000 MRU/jour)'},
        {label: 'Commission', value: '<span style="color: #16a34a;">5,000 MRU</span>'}
      ])}
      ${createSection('Client', [
        {label: 'Nom', value: 'Neji Houssein'},
        {label: 'Téléphone', value: formatPhoneNumber('22345678')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Nouvelle demande de location - Kriliy Engin',
      html: createEmailTemplate('Nouvelle demande de location', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings`),
    });
    results.push({ type: 'New Booking', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Booking', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 3. Equipment Approval Email (to Renter as Supplier)
  try {
    console.log('3️⃣  Testing Equipment Approval Email...');
    const content = `
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px; color: #16a34a;">Matériel Approuvé</h2>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Bonjour Neji Houssein,</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Votre matériel <strong>Grue Mobile 50T</strong> a été approuvé et est maintenant visible sur la plateforme.</p>`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: TEST_RENTER_EMAIL,
      subject: 'Matériel approuvé - Kriliy Engin',
      html: createEmailTemplate('Matériel approuvé', content, 'Voir mon matériel', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment`),
    });
    results.push({ type: 'Equipment Approval', status: '✅ Sent', recipient: TEST_RENTER_EMAIL });
    console.log('   ✅ Sent to renter (as supplier)\n');
  } catch (err) {
    results.push({ type: 'Equipment Approval', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 4. New Sale Email
  try {
    console.log('4️⃣  Testing New Sale Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande d'achat</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-SALE-001</p>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">Prix: 500,000 MRU</p>
      </div>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Bulldozer D6'},
        {label: 'Commission', value: '<span style="color: #16a34a;">25,000 MRU</span>'}
      ])}
      ${createSection('Acheteur', [
        {label: 'Nom', value: 'Neji Houssein'},
        {label: 'Téléphone', value: formatPhoneNumber('22345678')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: "Nouvelle demande d'achat - Kriliy Engin",
      html: createEmailTemplate("Nouvelle demande d'achat", content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales`),
    });
    results.push({ type: 'New Sale', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Sale', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 5. New Equipment Email
  try {
    console.log('5️⃣  Testing New Equipment Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouveau matériel à approuver</h2>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Un partenaire a ajouté un nouveau matériel</p>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Compacteur Vibrant'},
        {label: 'Catégorie', value: 'Nivellement et Compactage'},
        {label: 'Type', value: 'Location'},
        {label: 'Prix', value: '8,000 MRU/jour'},
        {label: 'Localisation', value: 'Nouakchott'}
      ])}
      ${createSection('Partenaire', [
        {label: 'Nom', value: 'Hassan Supplier'},
        {label: 'Téléphone', value: formatPhoneNumber('55667788')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Nouveau matériel à approuver - Kriliy Engin',
      html: createEmailTemplate('Nouveau matériel à approuver', content, 'Voir et approuver', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment`),
    });
    results.push({ type: 'New Equipment', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'New Equipment', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 6. Booking Cancellation Email
  try {
    console.log('6️⃣  Testing Booking Cancellation Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Annulation de Réservation</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-BOOK-002</p>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date d'annulation: ${new Date().toLocaleDateString('fr-FR')}</p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">⚠️ Cette réservation a été annulée automatiquement</p>
      </div>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Excavatrice CAT 320'},
        {label: 'Total', value: '75,000 MRU'}
      ])}
      ${createSection('Client', [
        {label: 'Nom', value: 'Neji Houssein'},
        {label: 'Téléphone', value: formatPhoneNumber('22345678')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Annulation de réservation - Référence #TEST-BOOK-002',
      html: createEmailTemplate('Annulation de Réservation', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings`),
    });
    results.push({ type: 'Booking Cancellation', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Cancellation', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 7. Booking Pending Reminder Email
  try {
    console.log('7️⃣  Testing Booking Pending Reminder Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Rappel: Réservation en attente</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-BOOK-003</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">⚠️ Cette réservation se termine bientôt</p>
      </div>
      ${createSection('Détails', [
        {label: 'Équipement', value: 'Chargeuse Caterpillar'},
        {label: 'Montant', value: '30,000 MRU'}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Rappel: Réservation en attente - Référence #TEST-BOOK-003',
      html: createEmailTemplate('Rappel: Réservation en attente', content, 'Mettre à jour', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings`),
    });
    results.push({ type: 'Booking Pending Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Pending Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 8. Booking Start Reminder Email
  try {
    console.log('8️⃣  Testing Booking Start Reminder Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Rappel: Location commence demain</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-BOOK-004</p>
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">📅 Cette location commence bientôt</p>
      </div>
      ${createSection('Détails', [
        {label: 'Équipement', value: 'Camion Benne 20T'},
        {label: 'Montant', value: '45,000 MRU'}
      ])}
      ${createSection('Client', [
        {label: 'Nom', value: 'Neji Houssein'},
        {label: 'Téléphone', value: formatPhoneNumber('22345678')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Rappel: Location commence demain - Référence #TEST-BOOK-004',
      html: createEmailTemplate('Rappel: Location commence demain', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings`),
    });
    results.push({ type: 'Booking Start Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Booking Start Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 9. Sale Pending Reminder Email
  try {
    console.log('9️⃣  Testing Sale Pending Reminder Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Rappel: Vente en attente</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-SALE-002</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">⚠️ Cette vente est en attente depuis 6 jours</p>
      </div>
      ${createSection('Détails', [
        {label: 'Équipement', value: 'Pelle Hydraulique'},
        {label: 'Prix', value: '350,000 MRU'}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Rappel: Vente en attente - Référence #TEST-SALE-002',
      html: createEmailTemplate('Rappel: Vente en attente', content, 'Mettre à jour', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales`),
    });
    results.push({ type: 'Sale Pending Reminder', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Sale Pending Reminder', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 10. Sale Cancellation Email
  try {
    console.log('🔟 Testing Sale Cancellation Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Annulation de Vente</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #TEST-SALE-003</p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">⚠️ Cette vente a été annulée automatiquement</p>
      </div>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Niveleuse Caterpillar'},
        {label: 'Prix', value: '450,000 MRU'}
      ])}
      ${createSection('Acheteur', [
        {label: 'Nom', value: 'Neji Houssein'},
        {label: 'Téléphone', value: formatPhoneNumber('22345678')}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Annulation de vente - Référence #TEST-SALE-003',
      html: createEmailTemplate('Annulation de Vente', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales`),
    });
    results.push({ type: 'Sale Cancellation', status: '✅ Sent', recipient: ADMIN_EMAIL });
    console.log('   ✅ Sent to admin\n');
  } catch (err) {
    results.push({ type: 'Sale Cancellation', status: '❌ Failed', error: err.message });
    console.log(`   ❌ Failed: ${err.message}\n`);
  }

  // 11. Pricing Update Request Email
  try {
    console.log('1️⃣1️⃣  Testing Pricing Update Request Email...');
    const content = `
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Demande de mise à jour tarifaire</h2>
      <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #EQ-2024-001</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">Un partenaire souhaite modifier ses tarifs</p>
      </div>
      ${createSection('Équipement', [
        {label: 'Matériel', value: 'Compacteur Vibrant'}
      ])}
      ${createSection('Tarification actuelle', [
        {label: 'Prix', value: '8,000 MRU/jour'}
      ])}
      ${createSection('Tarification demandée', [
        {label: 'Nouveau prix', value: '<span style="color: #f97316; font-weight: 600;">10,000 MRU/jour</span>'}
      ])}`;
    
    await transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: 'Demande de mise à jour tarifaire - Référence #EQ-2024-001',
      html: createEmailTemplate('Demande de mise à jour tarifaire', content, 'Examiner la demande', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment`),
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
