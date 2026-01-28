import { createHeader, createPriceBadge, sendEmail } from "../templates/base"
import { createSection, createUnifiedSection, createPersonSection, createSupplierSection } from "../templates/sections"
import { formatDate, formatTime, formatPhoneNumber } from "../../format"
import { DASHBOARD_URL } from "../config"
import type { NewBookingDetails, NewSaleDetails, NewEquipmentDetails, PricingUpdateDetails } from "../types"

export async function sendNewBookingEmail(adminEmail: string, details: NewBookingDetails) {
  const rentalPeriod = details.startDate && details.endDate 
    ? `${formatDate(details.startDate)} - ${formatDate(details.endDate)}`
    : details.startDate ? formatDate(details.startDate) : "-"
  
  const unitTranslations: Record<string, string> = { hours: "heure", hour: "heure", days: "jour", day: "jour", km: "km", months: "mois", month: "mois" }
  const unit = unitTranslations[details.usageUnit.toLowerCase()] || details.usageUnit

  const content = `
    ${createHeader("Nouvelle demande de location", details.referenceNumber, `Date: ${formatDate(details.bookingDate)} à ${formatTime(details.bookingDate)}`)}
    ${createPriceBadge(details.totalPrice)}
    ${createUnifiedSection("Détails", [
      {
        title: "Équipement",
        rows: [
          { label: "Matériel", value: details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName },
          { label: "Période de location", value: rentalPeriod },
          { label: "Usage", value: `${details.usage} ${unit} (${details.rate.toLocaleString()} MRU/${unit})` },
          { label: "Commission", value: `<span style="color: #16a34a;">${details.commission.toLocaleString()} MRU</span>` }
        ]
      },
      createPersonSection("Client", details.renterName, details.renterPhone),
      createSupplierSection(details.supplierName, details.supplierPhone)
    ])}`

  await sendEmail(
    adminEmail,
    "Nouvelle demande de location - Kriliy Engin",
    content,
    { text: "Voir les détails", url: `${DASHBOARD_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}` }
  )
}

export async function sendNewSaleEmail(adminEmail: string, details: NewSaleDetails) {
  const content = `
    ${createHeader("Nouvelle demande d'achat", details.referenceNumber, `Date: ${formatDate(details.saleDate)} à ${formatTime(details.saleDate)}`)}
    ${createPriceBadge(details.salePrice, "Prix")}
    ${createUnifiedSection("Détails", [
      {
        title: "Équipement",
        rows: [
          { label: "Matériel", value: details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName },
          { label: "Commission", value: `<span style="color: #16a34a;">${details.commission.toLocaleString()} MRU</span>` }
        ]
      },
      createPersonSection("Acheteur", details.buyerName, details.buyerPhone),
      createSupplierSection(details.supplierName, details.supplierPhone)
    ])}`

  await sendEmail(
    adminEmail,
    "Nouvelle demande d'achat - Kriliy Engin",
    content,
    { text: "Voir les détails", url: `${DASHBOARD_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}` }
  )
}

export async function sendNewEquipmentEmail(adminEmail: string, details: NewEquipmentDetails & { equipmentReference?: string }) {
  const equipmentDisplay = details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">Nouveau matériel à approuver</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Un partenaire a ajouté un nouveau matériel</p>
    ${createUnifiedSection("Détails", [
      {
        title: "Équipement",
        rows: [
          { label: "Matériel", value: equipmentDisplay },
          ...(details.category ? [{ label: "Catégorie", value: details.category }] : []),
          { label: "Type", value: details.listingType },
          { label: "Prix", value: details.pricing },
          { label: "Localisation", value: details.location }
        ]
      },
      createPersonSection("Partenaire", details.supplierName, details.supplierPhone)
    ])}`

  await sendEmail(
    adminEmail,
    "Nouveau matériel à approuver - Kriliy Engin",
    content,
    { text: "Voir et approuver", url: `${DASHBOARD_URL}/fr/dashboard/equipment` }
  )
}

export async function sendEquipmentApprovalEmail(supplierEmail: string, details: { equipmentName: string; equipmentReference?: string; supplierName: string }) {
  const equipmentDisplay = details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName
  const content = `
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; color: #16a34a;">Matériel Approuvé</h2>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Bonjour ${details.supplierName},</p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Votre matériel <strong>${equipmentDisplay}</strong> a été approuvé et est maintenant visible sur la plateforme.</p>`

  await sendEmail(
    supplierEmail,
    "Matériel approuvé - Kriliy Engin",
    content,
    { text: "Voir mon matériel", url: `${DASHBOARD_URL}/fr/dashboard/equipment` }
  )
}

export async function sendPricingUpdateRequestEmail(adminEmail: string, details: PricingUpdateDetails) {
  const content = `
    ${createHeader("Demande de mise à jour tarifaire", details.equipmentReference)}
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">Un partenaire souhaite modifier ses tarifs</p>
    </div>
    ${createUnifiedSection("Détails", [
      { title: "Équipement", rows: [{ label: "Matériel", value: `${details.equipmentName} (#${details.equipmentReference})` }] },
      createPersonSection("Partenaire", details.supplierName, details.supplierPhone),
      { title: "Tarification actuelle", rows: [{ label: "Prix", value: details.currentPricing }] },
      { title: "Tarification demandée", rows: [{ label: "Nouveau prix", value: `<span style="color: #f97316; font-weight: 600;">${details.requestedPricing}</span>` }] }
    ])}
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 4px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e40af; font-weight: 600;">📋 Comment trouver cet équipement :</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Allez dans <strong>Gestion des équipements</strong></li>
        <li style="margin-bottom: 8px;">Recherchez par référence : <strong>#${details.equipmentReference}</strong></li>
        <li style="margin-bottom: 0;">Ou filtrez par statut : <strong>Mise à jour tarifaire</strong></li>
      </ul>
    </div>`

  await sendEmail(
    adminEmail,
    `Demande de mise à jour tarifaire - Référence #${details.equipmentReference}`,
    content,
    { text: "Examiner la demande", url: `${DASHBOARD_URL}/fr/dashboard/equipment?status=pendingPricing` }
  )
}

export async function sendPasswordResetEmail(to: string, resetToken: string, locale: string = "en") {
  const resetUrl = `${DASHBOARD_URL}/${locale}/auth/reset-password/confirm?token=${resetToken}`
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #111;">Réinitialisation du mot de passe</h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Réinitialiser le mot de passe</a>
    </div>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`

  await sendEmail(to, "Réinitialisation du mot de passe - Kriliy Engin", content)
}

export async function sendPricingApprovalEmail(supplierEmail: string, details: { equipmentName: string; equipmentReference?: string; supplierName: string }) {
  const equipmentDisplay = details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName
  const content = `
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; color: #16a34a;">Tarification Approuvée</h2>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Bonjour ${details.supplierName},</p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">Votre demande de mise à jour tarifaire pour <strong>${equipmentDisplay}</strong> a été approuvée.</p>`

  await sendEmail(
    supplierEmail,
    "Tarification approuvée - Kriliy Engin",
    content,
    { text: "Voir mon matériel", url: `${DASHBOARD_URL}/fr/dashboard/equipment` }
  )
}

export async function sendPricingRejectionEmail(supplierEmail: string, details: { equipmentName: string; equipmentReference?: string; supplierName: string; rejectionReason: string }) {
  const equipmentDisplay = details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName
  const content = `
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; color: #dc2626;">Tarification Refusée</h2>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Bonjour ${details.supplierName},</p>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">Votre demande de mise à jour tarifaire pour <strong>${equipmentDisplay}</strong> a été refusée.</p>
    <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin: 16px 0; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #f97316; font-weight: 600;">Raison du refus:</h3>
      <p style="margin: 0; font-size: 13px; color: #374151;">${details.rejectionReason}</p>
    </div>`

  await sendEmail(
    supplierEmail,
    "Tarification refusée - Kriliy Engin",
    content,
    { text: "Voir mon matériel", url: `${DASHBOARD_URL}/fr/dashboard/equipment` }
  )
}