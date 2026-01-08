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
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #f97316; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 20px;">Kriliy Engin</h1>
          </div>
          <div style="padding: 30px;">
            ${content}
            ${buttonText && buttonUrl ? `<div style="text-align: center; margin-top: 30px;">
              <a href="${buttonUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">${buttonText}</a>
            </div>` : ''}
          </div>
        </div>
      </body>
    </html>`;
}

function createSection(title: string, rows: Array<{label: string, value: string}>): string {
  return `
    <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f97316; font-weight: 600;">${title}</h3>
      <table style="width: 100%;">
        ${rows.map(r => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 140px;">${r.label}</td><td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${r.value}</td></tr>`).join('')}
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

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande de location</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${new Date(details.bookingDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
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

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouvelle demande d'achat</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${new Date(details.saleDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
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
  referenceNumber: string; equipmentName: string; renterName: string; renterPhone: string; cancellationDate: Date;
}) {
  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Annulation de Réservation</h2>
    <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${details.referenceNumber}</p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date: ${new Date(details.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">Cette réservation a été annulée</p>
    </div>
    <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f97316; font-weight: 600;">Équipement</h3>
      <p style="margin: 0; font-size: 14px; font-weight: 500;">${details.equipmentName}</p>
    </div>
    ${createSection('Client', [
      {label: 'Nom', value: details.renterName},
      {label: 'Téléphone', value: formatPhoneNumber(details.renterPhone)}
    ])}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Annulation de réservation - Référence #${details.referenceNumber}`,
    html: createEmailTemplate('Annulation de Réservation', content, 'Voir les détails', `${process.env.NEXTAUTH_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}`),
  });
}
