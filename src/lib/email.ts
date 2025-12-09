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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Mot de passe oublié</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Cliquez sur le bouton pour créer un nouveau mot de passe.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Changer mon mot de passe</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Ce lien expire dans 1 heure.</p>
            <p style="font-size: 14px; color: #666;">Si ce n'est pas vous, ignorez cet email.</p>
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
    `<div style="background: #f3f4f6; padding: 10px; border-radius: 5px; margin: 10px 0;">
      <p style="margin: 5px 0;"><strong>Fournisseur:</strong> ${s.name}</p>
      <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${s.phone}</p>
      <p style="margin: 5px 0;"><strong>Équipement:</strong> ${s.equipment}</p>
      <p style="margin: 5px 0;"><strong>Durée:</strong> ${s.duration}</p>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Nouvelle demande de location</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Une nouvelle demande de location a été reçue.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Référence:</strong> ${bookingDetails.referenceNumber}</p>
              <p style="margin: 10px 0;"><strong>Date de réservation:</strong> ${new Date(bookingDetails.bookingDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}, ${new Date(bookingDetails.bookingDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
              <p style="margin: 10px 0;"><strong>Client:</strong> ${bookingDetails.renterName}</p>
              <p style="margin: 10px 0;"><strong>Téléphone:</strong> ${bookingDetails.renterPhone}</p>
              ${bookingDetails.renterLocation ? `<p style="margin: 10px 0;"><strong>Localisation:</strong> ${bookingDetails.renterLocation}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Équipements:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">${equipmentList}</ul>
              <p style="margin: 10px 0;"><strong>Total:</strong> ${bookingDetails.totalPrice.toFixed(2)} MRU</p>
            </div>
            ${suppliersList ? `<div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0 15px 0;"><strong>Détails des fournisseurs:</strong></p>
              ${suppliersList}
            </div>` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/bookings" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Voir les détails</a>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Nouvelle demande d'achat</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Une nouvelle demande d'achat a été reçue.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Référence:</strong> ${saleDetails.referenceNumber}</p>
              <p style="margin: 10px 0;"><strong>Date de demande:</strong> ${new Date(saleDetails.saleDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}, ${new Date(saleDetails.saleDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
              <p style="margin: 10px 0;"><strong>Client:</strong> ${saleDetails.buyerName}</p>
              <p style="margin: 10px 0;"><strong>Téléphone:</strong> ${saleDetails.buyerPhone}</p>
              ${saleDetails.buyerLocation ? `<p style="margin: 10px 0;"><strong>Localisation:</strong> ${saleDetails.buyerLocation}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Équipement:</strong> ${saleDetails.equipmentName}</p>
              <p style="margin: 10px 0;"><strong>Prix:</strong> ${saleDetails.salePrice.toFixed(2)} MRU</p>
            </div>
            ${saleDetails.supplierName ? `<div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0 15px 0;"><strong>Détails du fournisseur:</strong></p>
              <div style="background: #f3f4f6; padding: 10px; border-radius: 5px;">
                <p style="margin: 5px 0;"><strong>Fournisseur:</strong> ${saleDetails.supplierName}</p>
                ${saleDetails.supplierPhone ? `<p style="margin: 5px 0;"><strong>Téléphone:</strong> ${saleDetails.supplierPhone}</p>` : ''}
              </div>
            </div>` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/sales" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Voir les détails</a>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Nouveau matériel ajouté</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Un partenaire a ajouté un nouveau matériel qui nécessite votre approbation.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Partenaire:</strong> ${equipmentDetails.supplierName}</p>
              <p style="margin: 10px 0;"><strong>Téléphone:</strong> ${equipmentDetails.supplierPhone}</p>
              <p style="margin: 10px 0;"><strong>Matériel:</strong> ${equipmentDetails.equipmentName}</p>
              ${equipmentDetails.category ? `<p style="margin: 10px 0;"><strong>Catégorie:</strong> ${equipmentDetails.category}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Type d'annonce:</strong> ${equipmentDetails.listingType}</p>
              <p style="margin: 10px 0;"><strong>Prix:</strong> ${equipmentDetails.pricing}</p>
              <p style="margin: 10px 0;"><strong>Localisation:</strong> ${equipmentDetails.location}</p>
              <p style="margin: 10px 0;"><strong>Date de soumission:</strong> ${new Date(equipmentDetails.dateSubmitted).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}, ${new Date(equipmentDetails.dateSubmitted).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/fr/dashboard/equipment" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Voir et approuver</a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
