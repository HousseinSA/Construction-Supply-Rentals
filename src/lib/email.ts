import nodemailer from 'nodemailer';

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

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  locale: string = 'en'
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset-password/confirm?token=${resetToken}`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: 'Mot de passe - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">Réinitialisation du mot de passe</h1>
            <p style="margin: 0 0 16px 0; font-size: 14px;">Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
            <div style="margin: 24px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 13px;">Réinitialiser le mot de passe</a>
            </div>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #565959;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendNewBookingEmail(
  adminEmail: string,
  bookingDetails: { 
    referenceNumber: string;
    equipmentNames: string[]; 
    totalPrice: number; 
    renterName: string; 
    renterPhone: string;
    renterLocation?: string;
    bookingDate: Date;
    suppliers: Array<{ name: string; phone: string; equipment: string; duration: string }>;
  }
) {
  const equipmentList = bookingDetails.equipmentNames.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('');
  const suppliersList = bookingDetails.suppliers.map(s => 
    `<div style="border-top: 1px solid #e7e7e7; padding: 12px 0; font-size: 13px;">
      <p style="margin: 0 0 4px 0;"><strong>${s.name === 'admin' ? 'Fournisseur: Administrateur' : s.name}</strong></p>
      ${s.name !== 'admin' ? `<p style="margin: 0 0 4px 0; color: #565959;">${s.phone}</p>` : ''}
      <p style="margin: 0 0 4px 0;">${s.equipment}</p>
      <p style="margin: 0; color: #565959;">${s.duration}</p>
    </div>`
  ).join('');
  
  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: 'Nouvelle demande de location - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">Nouvelle demande de location</h1>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #565959;">Référence: ${bookingDetails.referenceNumber}</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Informations client</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Nom</td><td style="padding: 4px 0;">${bookingDetails.renterName}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td style="padding: 4px 0;">${bookingDetails.renterPhone}</td></tr>
                ${bookingDetails.renterLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td style="padding: 4px 0;">${bookingDetails.renterLocation}</td></tr>` : ''}
                <tr><td style="padding: 4px 0; color: #565959;">Date</td><td style="padding: 4px 0;">${new Date(bookingDetails.bookingDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
              </table>
            </div>

            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Équipements demandés</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px;">${equipmentList}</ul>
              <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #1e40af;">Total: ${bookingDetails.totalPrice.toLocaleString('fr-FR')} MRU</p>
            </div>

            ${suppliersList ? `<div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Fournisseurs concernés</h3>
              ${suppliersList}
            </div>` : ''}

            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/bookings" style="background: #f97316; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 13px;">Voir les détails</a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendNewSaleEmail(
  adminEmail: string,
  saleDetails: { 
    referenceNumber: string;
    equipmentName: string; 
    salePrice: number; 
    buyerName: string; 
    buyerPhone: string;
    buyerLocation?: string;
    saleDate: Date;
    supplierName?: string;
    supplierPhone?: string;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: 'Nouvelle demande d\'achat - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">Nouvelle demande d'achat</h1>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #565959;">Référence: ${saleDetails.referenceNumber}</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Informations acheteur</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Nom</td><td style="padding: 4px 0;">${saleDetails.buyerName}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td style="padding: 4px 0;">${saleDetails.buyerPhone}</td></tr>
                ${saleDetails.buyerLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td style="padding: 4px 0;">${saleDetails.buyerLocation}</td></tr>` : ''}
                <tr><td style="padding: 4px 0; color: #565959;">Date</td><td style="padding: 4px 0;">${new Date(saleDetails.saleDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
              </table>
            </div>

            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Équipement</h3>
              <p style="margin: 0 0 8px 0; font-size: 13px;">${saleDetails.equipmentName}</p>
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e40af;">${saleDetails.salePrice.toLocaleString('fr-FR')} MRU</p>
            </div>

            ${saleDetails.supplierName ? `<div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Fournisseur</h3>
              <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${saleDetails.supplierName === 'admin' ? 'Administrateur' : saleDetails.supplierName}</strong></p>
              ${saleDetails.supplierName !== 'admin' && saleDetails.supplierPhone ? `<p style="margin: 0; font-size: 13px; color: #565959;">${saleDetails.supplierPhone}</p>` : ''}
            </div>` : ''}

            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/sales" style="background: #f97316; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 13px;">Voir les détails</a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendNewEquipmentEmail(
  adminEmail: string,
  equipmentDetails: { 
    equipmentName: string; 
    supplierName: string; 
    supplierPhone: string; 
    location: string;
    category?: string;
    listingType: string;
    pricing: string;
    dateSubmitted: Date;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: 'Nouveau matériel à approuver - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">Nouveau matériel à approuver</h1>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #565959;">Un partenaire a ajouté un nouveau matériel</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Partenaire</h3>
              <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${equipmentDetails.supplierName}</strong></p>
              <p style="margin: 0; font-size: 13px; color: #565959;">${equipmentDetails.supplierPhone}</p>
            </div>

            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Détails du matériel</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Matériel</td><td style="padding: 4px 0;">${equipmentDetails.equipmentName}</td></tr>
                ${equipmentDetails.category ? `<tr><td style="padding: 4px 0; color: #565959;">Catégorie</td><td style="padding: 4px 0;">${equipmentDetails.category}</td></tr>` : ''}
                <tr><td style="padding: 4px 0; color: #565959;">Type</td><td style="padding: 4px 0;">${equipmentDetails.listingType}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Prix</td><td style="padding: 4px 0;">${equipmentDetails.pricing}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td style="padding: 4px 0;">${equipmentDetails.location}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Date</td><td style="padding: 4px 0;">${new Date(equipmentDetails.dateSubmitted).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
              </table>
            </div>

            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/equipment" style="background: #f97316; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 13px;">Voir et approuver</a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPricingApprovalEmail(
  supplierEmail: string,
  details: {
    equipmentName: string;
    supplierName: string;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: supplierEmail,
    subject: 'Tarification approuvée - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #16a34a;">✓ Tarification Approuvée</h2>
          </div>
          <p>Bonjour ${details.supplierName},</p>
          <p>Votre demande de modification de tarification pour <strong>${details.equipmentName}</strong> a été approuvée.</p>
        </body>
      </html>
    `,
  });
}

export async function sendPricingRejectionEmail(
  supplierEmail: string,
  details: {
    equipmentName: string;
    supplierName: string;
    rejectionReason: string;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: supplierEmail,
    subject: 'Tarification refusée - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #dc2626;">Tarification Refusée</h2>
          </div>
          <p>Bonjour ${details.supplierName},</p>
          <p>Votre demande de modification de tarification pour <strong>${details.equipmentName}</strong> a été refusée.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Raison:</strong><br>
            ${details.rejectionReason}
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendEquipmentApprovalEmail(
  supplierEmail: string,
  details: {
    equipmentName: string;
    supplierName: string;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: supplierEmail,
    subject: 'Matériel approuvé - Kriliy Engin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #16a34a;">✓ Matériel Approuvé</h2>
          </div>
          <p>Bonjour ${details.supplierName},</p>
          <p>Votre matériel <strong>${details.equipmentName}</strong> a été approuvé et est maintenant visible sur la plateforme.</p>
        </body>
      </html>
    `,
  });
}

export async function sendBookingCancellationEmail(
  adminEmail: string,
  details: {
    referenceNumber: string;
    equipmentNames: string[];
    totalPrice: number;
    renterName: string;
    renterPhone: string;
    renterLocation?: string;
    cancellationDate: Date;
    suppliers: Array<{ name: string; phone: string; equipment: string; duration: string }>;
  }
) {
  const equipmentList = details.equipmentNames.join(', ');
  const suppliersHtml = details.suppliers.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.equipment}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.duration}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.phone}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Annulation de réservation - Référence #${details.referenceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">Annulation de Réservation</h1>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">Référence: <strong>#${details.referenceNumber}</strong></p>
            </div>
            
            <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Détails du Client</h3>
            <table style="width: 100%; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #565959; width: 40%;">Locataire</td><td>${details.renterName}</td></tr>
              <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td>${details.renterPhone}</td></tr>
              ${details.renterLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td>${details.renterLocation}</td></tr>` : ''}
              <tr><td style="padding: 4px 0; color: #565959;">Date d'annulation</td><td>${new Date(details.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
            </table>

            <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Matériel</h3>
            <p style="margin: 0 0 8px 0; font-size: 13px;">${equipmentList}</p>
            <p style="margin: 0; font-size: 13px; color: #565959;"><strong>Prix Total:</strong> ${details.totalPrice.toFixed(2)} DZD</p>

            ${details.suppliers.length > 0 ? `
              <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Partenaires Affectés</h3>
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Matériel</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Durée</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Partenaire</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Téléphone</th>
                  </tr>
                </thead>
                <tbody>
                  ${suppliersHtml}
                </tbody>
              </table>
            ` : ''}
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendSaleCancellationEmail(
  adminEmail: string,
  details: {
    referenceNumber: string;
    equipmentName: string;
    salePrice: number;
    buyerName: string;
    buyerPhone: string;
    buyerLocation?: string;
    cancellationDate: Date;
    supplierName?: string;
    supplierPhone?: string;
  }
) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `Annulation de vente - Référence #${details.referenceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">Annulation de Vente</h1>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">Référence: <strong>#${details.referenceNumber}</strong></p>
            </div>
            
            <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Détails de l'Acheteur</h3>
            <table style="width: 100%; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #565959; width: 40%;">Acheteur</td><td>${details.buyerName}</td></tr>
              <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td>${details.buyerPhone}</td></tr>
              ${details.buyerLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td>${details.buyerLocation}</td></tr>` : ''}
              <tr><td style="padding: 4px 0; color: #565959;">Date d'annulation</td><td>${new Date(details.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
            </table>

            <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Détails du Matériel</h3>
            <table style="width: 100%; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #565959; width: 40%;">Matériel</td><td>${details.equipmentName}</td></tr>
              <tr><td style="padding: 4px 0; color: #565959;">Prix</td><td>${details.salePrice.toFixed(2)} DZD</td></tr>
            </table>

            ${details.supplierName ? `
              <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">Partenaire Affecté</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Fournisseur</td><td>${details.supplierName}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td>${details.supplierPhone || 'N/A'}</td></tr>
              </table>
            ` : ''}
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendBookingPendingReminderEmail(
  adminEmail: string,
  details: {
    referenceNumber: string;
    equipmentNames: string[];
    endDate: Date;
    totalPrice: number;
  }
) {
  const equipmentList = details.equipmentNames.join(', ');
  const endDateStr = new Date(details.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  await transporter.sendMail({
    from: MAIL_FROM,
    to: adminEmail,
    subject: `URGENT: Booking ${details.referenceNumber} - Status PENDING - Ends ${endDateStr}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="padding: 20px 0; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Kriliy Engin</h2>
          </div>
          <div style="padding: 24px 0;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #d97706;">⚠ URGENT: Booking Status PENDING</h1>
            </div>
            
            <p style="margin: 0 0 16px 0; font-size: 14px;">La réservation suivante se termine demain mais le statut est toujours en attente.</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Détails de la réservation</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Référence</td><td style="padding: 4px 0; font-weight: 600;">${details.referenceNumber}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Équipement</td><td style="padding: 4px 0;">${equipmentList}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Fin de période</td><td style="padding: 4px 0; font-weight: 600;">${endDateStr}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Prix total</td><td style="padding: 4px 0; font-weight: 600;">${details.totalPrice.toLocaleString('fr-FR')} MRU</td></tr>
              </table>
            </div>

            <div style="background: #f0f0f0; padding: 12px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px;">
                <strong>Actions requises avant demain:</strong><br>
                - Marquer comme "PAID" si le paiement a été reçu<br>
                - Marquer comme "CANCELLED" si le paiement n'a pas été reçu
              </p>
            </div>

            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/bookings" style="background: #f97316; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 13px;">Mettre à jour la réservation</a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
