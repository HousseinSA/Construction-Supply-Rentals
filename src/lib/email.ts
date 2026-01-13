import nodemailer from 'nodemailer';
import { formatPhoneNumber } from './format';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Kriliy Engin'
const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL || process.env.EMAIL_USER
const MAIL_FROM = `${FROM_NAME} <${FROM_ADDRESS}>`

function createEmailTemplate(title: string, content: string, buttonText?: string, buttonUrl?: string): string {
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

function createSection(title: string, rows: Array<{label: string, value: string}>): string {
  return `
    <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #f97316; font-weight: 600;">${title}</h3>
      <table style="width: 100%; table-layout: fixed;">
        ${rows.map(r => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 35%; vertical-align: top;">${r.label}</td><td style="padding: 6px 0; font-size: 13px; font-weight: 500; word-break: break-word; overflow-wrap: break-word;">${r.value}</td></tr>`).join('')}
      </table>
    </div>`;
}

export async function sendPasswordResetEmail(to: string, resetToken: string, locale: string = 'en') {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset-password/confirm?token=${resetToken}`;
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #111;">Réinitialisation du mot de passe</h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Réinitialiser le mot de passe</a>
    </div>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`;
  
  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: 'Réinitialisation du mot de passe - Kriliy Engin',
    html: createEmailTemplate('Réinitialisation du mot de passe', content),
  });
}

export async function sendNewBookingEmail(adminEmail: string, details: { 
  referenceNumber: string; equipmentName: string; totalPrice: number; commission: number;
  renterName: string; renterPhone: string; supplierName: string; supplierPhone: string;
  usage: number; usageUnit: string; rate: number; startDate?: Date; endDate?: Date; bookingDate: Date;
}) {
  const rentalPeriod = details.startDate && details.endDate
    ? `${new Date(details.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(details.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    : details.startDate ? new Date(details.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

  const unitTranslations: Record<string, string> = { 'hours': 'heure', 'hour': 'heure', 'days': 'jour', 'day': 'jour', 'km': 'km', 'months': 'mois', 'month': 'mois' };
  const unit = unitTranslations[details.usageUnit.toLowerCase()] || details.usageUnit;
  const supplierDisplay = details.supplierName === 'admin' || !details.supplierName ? 'Administration' : details.supplierName;
  const supplierPhone = details.supplierName === 'admin' || !details.supplierName ? '-' : formatPhoneNumber(details.supplierPhone);

  const bookingDateTime = new Date(details.bookingDate);
  const dateStr = bookingDateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = bookingDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: true });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande de location</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${dateStr} à ${timeStr}</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">Total: ${details.totalPrice.toLocaleString()} MRU</p>
    </div>
    ${createSection('Équipement', [
      {label: 'Matériel', value: details.equipmentName},
      {label: 'Période de location', value: rentalPeriod},
      {label: 'Usage', value: `${details.usage} ${unit} (${details.rate.toLocaleString()} MRU/${unit})`},
      {label: 'Commission', value: `<span style="color: #16a34a;">${details.commission.toLocaleString()} MRU</span>`}
    ])}
    ${createSection('Client', [
      {label: 'Nom', value: details.renterName},
      {label: 'Téléphone', value: formatPhoneNumber(details.renterPhone)}
    ])}
    ${createSection('Fournisseur', [
      {label: 'Nom', value: supplierDisplay},
      {label: 'Téléphone', value: supplierPhone}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: 'Nouvelle demande de location - Kriliy Engin',
    html: createEmailTemplate('Nouvelle demande de location', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}`),
  });
}

export async function sendNewSaleEmail(adminEmail: string, details: { 
  referenceNumber: string; equipmentName: string; salePrice: number; commission: number;
  buyerName: string; buyerPhone: string; supplierName: string; supplierPhone: string; saleDate: Date;
}) {
  const supplierDisplay = details.supplierName === 'admin' || !details.supplierName ? 'Administration' : details.supplierName;
  const supplierPhone = details.supplierName === 'admin' || !details.supplierName ? '-' : formatPhoneNumber(details.supplierPhone);

  const saleDateTime = new Date(details.saleDate);
  const dateStr = saleDateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = saleDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: true });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande d'achat</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${dateStr} à ${timeStr}</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">Prix: ${details.salePrice.toLocaleString()} MRU</p>
    </div>
    ${createSection('Équipement', [
      {label: 'Matériel', value: details.equipmentName},
      {label: 'Commission', value: `<span style="color: #16a34a;">${details.commission.toLocaleString()} MRU</span>`}
    ])}
    ${createSection('Acheteur', [
      {label: 'Nom', value: details.buyerName},
      {label: 'Téléphone', value: formatPhoneNumber(details.buyerPhone)}
    ])}
    ${createSection('Fournisseur', [
      {label: 'Nom', value: supplierDisplay},
      {label: 'Téléphone', value: supplierPhone}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: "Nouvelle demande d'achat - Kriliy Engin",
    html: createEmailTemplate("Nouvelle demande d'achat", content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}`),
  });
}

export async function sendNewEquipmentEmail(adminEmail: string, details: { 
  equipmentName: string; supplierName: string; supplierPhone: string; location: string;
  category?: string; listingType: string; pricing: string; dateSubmitted: Date;
}) {
  const rows = [
    {label: 'Matériel', value: details.equipmentName},
    ...(details.category ? [{label: 'Catégorie', value: details.category}] : []),
    {label: 'Type', value: details.listingType},
    {label: 'Prix', value: details.pricing},
    {label: 'Localisation', value: details.location}
  ];

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouveau matériel à approuver</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Un partenaire a ajouté un nouveau matériel</p>
    ${createSection('Équipement', rows)}
    ${createSection('Partenaire', [
      {label: 'Nom', value: details.supplierName},
      {label: 'Téléphone', value: formatPhoneNumber(details.supplierPhone)}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: 'Nouveau matériel à approuver - Kriliy Engin',
    html: createEmailTemplate('Nouveau matériel à approuver', content, 'Voir et approuver', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment`),
  });
}

export async function sendEquipmentApprovalEmail(supplierEmail: string, details: { equipmentName: string; supplierName: string; }) {
  const content = `
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; color: #16a34a;">Matériel Approuvé</h2>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Bonjour ${details.supplierName},</p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Votre matériel <strong>${details.equipmentName}</strong> a été approuvé et est maintenant visible sur la plateforme.</p>`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: supplierEmail,
    subject: 'Matériel approuvé - Kriliy Engin',
    html: createEmailTemplate('Matériel approuvé', content, 'Voir mon matériel', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment`),
  });
}

export async function sendBookingCancellationEmail(adminEmail: string, details: { 
  referenceNumber: string; equipmentNames: string[]; totalPrice: number;
  renterName: string; renterPhone: string; renterLocation?: string; cancellationDate: Date; createdAt: Date;
  suppliers: Array<{name: string; phone: string; equipment: string; duration: string}>;
}) {
  const equipmentList = details.equipmentNames.join(', ');
  const createdDateStr = new Date(details.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const suppliersList = details.suppliers.map(s => 
    `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">${s.equipment}</td><td style="padding: 6px 0; font-size: 13px;">${s.name}</td><td style="padding: 6px 0; font-size: 13px;">${formatPhoneNumber(s.phone)}</td></tr>`
  ).join('');

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Annulation de Réservation</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Date de création: ${createdDateStr}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date d'annulation: ${new Date(details.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">⚠️ Cette réservation a été annulée automatiquement car elle est restée en attente après sa date de fin</p>
    </div>
    ${createSection('Équipement', [{label: 'Matériel', value: equipmentList}, {label: 'Total', value: `${details.totalPrice.toLocaleString()} MRU`}])}
    ${createSection('Client', [
      {label: 'Nom', value: details.renterName},
      {label: 'Téléphone', value: formatPhoneNumber(details.renterPhone)},
      ...(details.renterLocation ? [{label: 'Ville', value: details.renterLocation}] : [])
    ])}
    ${details.suppliers.length > 0 ? `<div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #f97316; font-weight: 600;">Fournisseurs</h3>
      <table style="width: 100%;">
        <tr><th style="text-align: left; padding: 6px 0; color: #6b7280; font-size: 13px;">Équipement</th><th style="text-align: left; padding: 6px 0; color: #6b7280; font-size: 13px;">Nom</th><th style="text-align: left; padding: 6px 0; color: #6b7280; font-size: 13px;">Téléphone</th></tr>
        ${suppliersList}
      </table>
    </div>` : ''}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Annulation de réservation - Référence #${details.referenceNumber}`,
    html: createEmailTemplate('Annulation de Réservation', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}`),
  });
}

export async function sendBookingPendingReminderEmail(adminEmail: string, details: {
  referenceNumber: string; equipmentNames: string[]; endDate: Date; totalPrice: number; createdAt: Date;
}) {
  const equipmentList = details.equipmentNames.join(', ');
  const createdDateStr = new Date(details.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const endDateStr = new Date(details.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Rappel: Réservation en attente</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date de création: ${createdDateStr}</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">⚠️ Cette réservation se termine dans moins de 24 heures et est toujours en attente. Veuillez mettre à jour son statut avant qu'elle ne soit automatiquement annulée</p>
    </div>
    ${createSection('Détails', [
      {label: 'Équipement', value: equipmentList},
      {label: 'Fin prévue', value: endDateStr},
      {label: 'Montant', value: `${details.totalPrice.toLocaleString()} MRU`}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Rappel: Réservation en attente - Référence #${details.referenceNumber}`,
    html: createEmailTemplate('Rappel: Réservation en attente', content, 'Mettre à jour', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}`),
  });
}

export async function sendSalePendingReminderEmail(adminEmail: string, details: {
  referenceNumber: string; equipmentName: string; salePrice: number; createdAt: Date;
}) {
  const createdDateStr = new Date(details.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Rappel: Vente en attente</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date de création: ${createdDateStr}</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">⚠️ Cette vente est en attente depuis 6 jours. Veuillez mettre à jour son statut avant qu'elle ne soit automatiquement annulée dans 24 heures</p>
    </div>
    ${createSection('Détails', [
      {label: 'Équipement', value: details.equipmentName},
      {label: 'Prix', value: `${details.salePrice.toLocaleString()} MRU`}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Rappel: Vente en attente - Référence #${details.referenceNumber}`,
    html: createEmailTemplate('Rappel: Vente en attente', content, 'Mettre à jour', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}`),
  });
}

export async function sendSaleCancellationEmail(adminEmail: string, details: {
  referenceNumber: string; equipmentName: string; salePrice: number;
  buyerName: string; buyerPhone: string; cancellationDate: Date; createdAt: Date;
}) {
  const createdDateStr = new Date(details.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Annulation de Vente</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Date de création: ${createdDateStr}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date d'annulation: ${new Date(details.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">⚠️ Cette vente a été annulée automatiquement car elle est restée en attente pendant plus de 7 jours</p>
    </div>
    ${createSection('Équipement', [
      {label: 'Matériel', value: details.equipmentName},
      {label: 'Prix', value: `${details.salePrice.toLocaleString()} MRU`}
    ])}
    ${createSection('Acheteur', [
      {label: 'Nom', value: details.buyerName},
      {label: 'Téléphone', value: formatPhoneNumber(details.buyerPhone)}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Annulation de vente - Référence #${details.referenceNumber}`,
    html: createEmailTemplate('Annulation de Vente', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}`),
  });
}

export async function sendPricingUpdateRequestEmail(adminEmail: string, details: {
  equipmentName: string; equipmentReference: string; supplierName: string; supplierPhone: string;
  currentPricing: string; requestedPricing: string; requestDate: Date;
}) {
  const dateStr = new Date(details.requestDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = new Date(details.requestDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: true });

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Demande de mise à jour tarifaire</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.equipmentReference}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${dateStr} à ${timeStr}</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">Un partenaire souhaite modifier ses tarifs</p>
    </div>
    ${createSection('Équipement', [
      {label: 'Matériel', value: details.equipmentName}
    ])}
    ${createSection('Partenaire', [
      {label: 'Nom', value: details.supplierName},
      {label: 'Téléphone', value: formatPhoneNumber(details.supplierPhone)}
    ])}
    ${createSection('Tarification actuelle', [
      {label: 'Prix', value: details.currentPricing}
    ])}
    ${createSection('Tarification demandée', [
      {label: 'Nouveau prix', value: `<span style="color: #f97316; font-weight: 600;">${details.requestedPricing}</span>`}
    ])}
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 4px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e40af; font-weight: 600;">📋 Comment trouver cet équipement :</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Allez dans <strong>Gestion des équipements</strong></li>
        <li style="margin-bottom: 8px;">Recherchez par référence : <strong>#${details.equipmentReference}</strong></li>
        <li style="margin-bottom: 0;">Ou filtrez par statut : <strong>Mise à jour tarifaire</strong></li>
      </ul>
    </div>`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Demande de mise à jour tarifaire - Référence #${details.equipmentReference}`,
    html: createEmailTemplate('Demande de mise à jour tarifaire', content, 'Examiner la demande', `${process.env.NEXTAUTH_URL}/fr/dashboard/equipment?status=pendingPricing`),
  });
}
