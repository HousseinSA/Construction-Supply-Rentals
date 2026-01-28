import { createHeader, createAlert, createStatusBadge, sendEmail } from "../templates/base"
import { createUnifiedSection, buildBookingDetailsSection, createPersonSection } from "../templates/sections"
import { formatDateTime } from "../../format"
import { DASHBOARD_URL } from "../config"
import type { BookingStartReminderDetails, BookingEmailDetails, BookingCancellationDetails } from "../types"

export async function sendBookingStartReminderEmail(adminEmail: string, details: BookingStartReminderDetails) {
  const content = `
    ${createHeader("Rappel: Location commence demain", details.referenceNumber)}
    ${createStatusBadge(details.status)}
    ${createAlert({ message: "📅 Cette location commence dans moins de 24 heures. Assurez-vous que tout est prêt!", color: "blue" })}
    ${createUnifiedSection("Détails", buildBookingDetailsSection(details))}`

  await sendEmail(
    adminEmail,
    `Rappel: Location commence demain - Référence #${details.referenceNumber}`,
    content,
    { text: "Voir les détails", url: `${DASHBOARD_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}` }
  )
}

export async function sendBookingPendingReminderEmail(adminEmail: string, details: BookingEmailDetails & { endDate: Date }) {
  const content = `
    ${createHeader("Rappel: Réservation en attente", details.referenceNumber, `Date de création: ${formatDateTime(details.createdAt)}`)}
    ${createAlert({ message: "⚠️ Cette réservation se termine dans moins de 24 heures et est toujours en attente. Veuillez mettre à jour son statut avant qu'elle ne soit automatiquement annulée", color: "yellow" })}
    ${createUnifiedSection("Détails", buildBookingDetailsSection(details))}`

  await sendEmail(
    adminEmail,
    `Rappel: Réservation en attente - Référence #${details.referenceNumber}`,
    content,
    { text: "Mettre à jour", url: `${DASHBOARD_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}` }
  )
}

export async function sendBookingCancellationEmail(adminEmail: string, details: BookingCancellationDetails) {
  const uniqueSuppliers = Array.from(new Map(details.suppliers.map(s => [s.name + s.phone, s])).values())
  
  const equipmentDisplay = details.equipmentNames.map((name, i) => {
    const ref = details.equipmentReferences?.[i]
    return ref ? `${name} (#${ref})` : name
  }).join("<br>")
  
  const sections = [
    {
      title: "Équipement",
      rows: [
        { label: "Matériel", value: equipmentDisplay },
        { label: "Total", value: `${details.totalPrice.toLocaleString()} MRU` }
      ]
    },
    {
      title: "Client", 
      rows: [
        { label: "Nom", value: details.renterName },
        { label: "Téléphone", value: details.renterPhone },
        ...(details.renterLocation ? [{ label: "Ville", value: details.renterLocation }] : [])
      ]
    },
    ...uniqueSuppliers.map(s => createPersonSection("Fournisseur", s.name, s.phone))
  ]

  const content = `
    ${createHeader("Annulation de Réservation", details.referenceNumber, `Date de création: ${formatDateTime(details.createdAt)}`)}
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Date d'annulation: ${formatDateTime(details.cancellationDate)}</p>
    ${createAlert({ message: "⚠️ Cette réservation a été annulée automatiquement car elle est restée en attente après sa date de fin", color: "red" })}
    ${createUnifiedSection("Détails", sections)}`

  await sendEmail(
    adminEmail,
    `Annulation de réservation - Référence #${details.referenceNumber}`,
    content,
    { text: "Voir les détails", url: `${DASHBOARD_URL}/fr/dashboard/bookings?highlight=${details.referenceNumber}` }
  )
}