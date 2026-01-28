import { createHeader, createAlert, sendEmail } from "../templates/base"
import { createUnifiedSection, buildSaleDetailsSection } from "../templates/sections"
import { formatDateTime } from "../../format"
import { DASHBOARD_URL } from "../config"
import type { SaleEmailDetails, SaleCancellationDetails } from "../types"

export async function sendSalePendingReminderEmail(adminEmail: string, details: SaleEmailDetails) {
  const content = `
    ${createHeader("Rappel: Vente en attente", details.referenceNumber, `Date de création: ${formatDateTime(details.createdAt)}`)}
    ${createAlert({ message: "⚠️ Cette vente est en attente depuis 6 jours. Veuillez mettre à jour son statut avant qu'elle ne soit automatiquement annulée dans 24 heures", color: "yellow" })}
    ${createUnifiedSection("Détails", buildSaleDetailsSection(details))}`

  await sendEmail(
    adminEmail,
    `Rappel: Vente en attente - Référence #${details.referenceNumber}`,
    content,
    { text: "Mettre à jour", url: `${DASHBOARD_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}` }
  )
}

export async function sendSaleCancellationEmail(adminEmail: string, details: SaleCancellationDetails) {
  const content = `
    ${createHeader("Annulation de Vente", details.referenceNumber, `Date de création: ${formatDateTime(details.createdAt)}`)}
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date d'annulation: ${formatDateTime(details.cancellationDate)}</p>
    ${createAlert({ message: "⚠️ Cette vente a été annulée automatiquement car elle est restée en attente pendant plus de 7 jours", color: "red" })}
    ${createUnifiedSection("Détails", buildSaleDetailsSection(details))}`

  await sendEmail(
    adminEmail,
    `Annulation de vente - Référence #${details.referenceNumber}`,
    content,
    { text: "Voir les détails", url: `${DASHBOARD_URL}/fr/dashboard/sales?highlight=${details.referenceNumber}` }
  )
}