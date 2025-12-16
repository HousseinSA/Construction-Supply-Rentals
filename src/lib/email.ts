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

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  locale: string = 'en'
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset-password/confirm?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
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
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
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
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
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
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
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

export async function sendSaleCancellationEmail(
  adminEmail: string,
  cancellationDetails: { 
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
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: 'Annulation d\'achat - Kriliy Engin',
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
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 0 0 20px 0;">
              <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 4px 0; color: #dc2626;">Annulation d'achat</h1>
              <p style="margin: 0; font-size: 13px; color: #991b1b;">Un client a annulé sa demande d'achat</p>
            </div>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #565959;">Référence: ${cancellationDetails.referenceNumber}</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Informations acheteur</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Nom</td><td style="padding: 4px 0;">${cancellationDetails.buyerName}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td style="padding: 4px 0;">${cancellationDetails.buyerPhone}</td></tr>
                ${cancellationDetails.buyerLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td style="padding: 4px 0;">${cancellationDetails.buyerLocation}</td></tr>` : ''}
                <tr><td style="padding: 4px 0; color: #565959;">Date d'annulation</td><td style="padding: 4px 0;">${new Date(cancellationDetails.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
              </table>
            </div>

            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Équipement annulé</h3>
              <p style="margin: 0 0 8px 0; font-size: 13px;">${cancellationDetails.equipmentName}</p>
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #dc2626;">${cancellationDetails.salePrice.toLocaleString('fr-FR')} MRU</p>
            </div>

            ${cancellationDetails.supplierName ? `<div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Fournisseur concerné</h3>
              <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${cancellationDetails.supplierName === 'admin' ? 'Administrateur' : cancellationDetails.supplierName}</strong></p>
              ${cancellationDetails.supplierName !== 'admin' && cancellationDetails.supplierPhone ? `<p style="margin: 0; font-size: 13px; color: #565959;">${cancellationDetails.supplierPhone}</p>` : ''}
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

export async function sendBookingCancellationEmail(
  adminEmail: string,
  cancellationDetails: { 
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
  const equipmentList = cancellationDetails.equipmentNames.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('');
  const suppliersList = cancellationDetails.suppliers.map(s => 
    `<div style="border-top: 1px solid #e7e7e7; padding: 12px 0; font-size: 13px;">
      <p style="margin: 0 0 4px 0;"><strong>${s.name === 'admin' ? 'Fournisseur: Administrateur' : s.name}</strong></p>
      ${s.name !== 'admin' ? `<p style="margin: 0 0 4px 0; color: #565959;">${s.phone}</p>` : ''}
      <p style="margin: 0 0 4px 0;">${s.equipment}</p>
      <p style="margin: 0; color: #565959;">${s.duration}</p>
    </div>`
  ).join('');
  
  await transporter.sendMail({
    from: `"Kriliy Engin" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: 'Annulation de location - Kriliy Engin',
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
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 0 0 20px 0;">
              <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 4px 0; color: #dc2626;">Annulation de location</h1>
              <p style="margin: 0; font-size: 13px; color: #991b1b;">Un client a annulé sa demande de location</p>
            </div>
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #565959;">Référence: ${cancellationDetails.referenceNumber}</p>
            
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Informations client</h3>
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #565959;">Nom</td><td style="padding: 4px 0;">${cancellationDetails.renterName}</td></tr>
                <tr><td style="padding: 4px 0; color: #565959;">Téléphone</td><td style="padding: 4px 0;">${cancellationDetails.renterPhone}</td></tr>
                ${cancellationDetails.renterLocation ? `<tr><td style="padding: 4px 0; color: #565959;">Localisation</td><td style="padding: 4px 0;">${cancellationDetails.renterLocation}</td></tr>` : ''}
                <tr><td style="padding: 4px 0; color: #565959;">Date d'annulation</td><td style="padding: 4px 0;">${new Date(cancellationDetails.cancellationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
              </table>
            </div>

            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Équipements annulés</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px;">${equipmentList}</ul>
              <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #dc2626;">Montant annulé: ${cancellationDetails.totalPrice.toLocaleString('fr-FR')} MRU</p>
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
