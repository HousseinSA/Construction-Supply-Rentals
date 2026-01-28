import { formatPhoneNumber } from "../../format"
import type { EmailSection, PersonInfo, BookingEmailDetails, SaleEmailDetails } from "../types"

export const createSection = (title: string, rows: Array<{ label: string; value: string }>) => `
  <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
    <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #f97316; font-weight: 600;">${title}</h3>
    <table style="width: 100%; table-layout: fixed;">
      ${rows.map(r => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 35%; vertical-align: top;">${r.label}</td><td style="padding: 6px 0; font-size: 13px; font-weight: 500; word-break: break-word; overflow-wrap: break-word;">${r.value}</td></tr>`).join("")}
    </table>
  </div>`

export const createUnifiedSection = (title: string, subsections: EmailSection[]) => `
  <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
    <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #f97316; font-weight: 600;">${title}</h3>
    ${subsections.map(sub => `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #f97316; font-weight: 600;">${sub.title}</h4>
        <table style="width: 100%; table-layout: fixed;">
          ${sub.rows.map(r => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 35%; vertical-align: top;">${r.label}</td><td style="padding: 6px 0; font-size: 13px; font-weight: 500; word-break: break-word; overflow-wrap: break-word;">${r.value}</td></tr>`).join("")}
        </table>
      </div>
    `).join("")}
  </div>`

// Reusable section builders
export const createPersonSection = (title: string, name: string, phone: string): EmailSection => ({
  title,
  rows: [
    { label: "Nom", value: name },
    { label: "Téléphone", value: formatPhoneNumber(phone) }
  ]
})

export const createSupplierSection = (name: string, phone: string): EmailSection => {
  const display = name === "admin" || !name ? "Administration" : name
  const phoneDisplay = name === "admin" || !name ? "-" : formatPhoneNumber(phone)
  return {
    title: "Fournisseur",
    rows: [
      { label: "Nom", value: display },
      { label: "Téléphone", value: phoneDisplay }
    ]
  }
}

export const createEquipmentSection = (name: string, reference?: string, extras: Array<{ label: string; value: string }> = []): EmailSection => ({
  title: "Équipement",
  rows: [
    { label: "Matériel", value: reference ? `${name} (#${reference})` : name },
    ...extras
  ]
})

// Complex section builders
export const buildBookingDetailsSection = (details: BookingEmailDetails & { endDate?: Date; startDate?: Date }): EmailSection[] => {
  const sections: EmailSection[] = []
  
  // Equipment/Booking section
  const equipmentDisplay = details.equipmentNames.map((name, i) => {
    const ref = details.equipmentReferences?.[i]
    return ref ? `${name} (#${ref})` : name
  }).join("<br>")
  
  const formatDateOnly = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  
  const equipmentRows: Array<{ label: string; value: string }> = [
    { label: "Équipement", value: equipmentDisplay }
  ]
  
  // Add rental period if both dates exist
  if (details.startDate && details.endDate) {
    equipmentRows.push({ label: "Période de location", value: `${formatDateOnly(details.startDate)} - ${formatDateOnly(details.endDate)}` })
  } else if (details.endDate) {
    equipmentRows.push({ label: "Fin prévue", value: formatDateOnly(details.endDate) })
  }
  
  equipmentRows.push({ label: "Montant", value: `${details.totalPrice.toLocaleString()} MRU` })
  
  sections.push({
    title: details.startDate ? "Location" : "Réservation",
    rows: equipmentRows
  })
  
  // Client section
  sections.push(createPersonSection("Client", details.renterName, details.renterPhone))
  
  // Supplier sections
  details.suppliers.forEach(supplier => {
    sections.push(createPersonSection("Fournisseur", supplier.name, supplier.phone))
  })
  
  return sections
}

export const buildSaleDetailsSection = (details: SaleEmailDetails): EmailSection[] => [
  {
    title: "Vente",
    rows: [
      { label: "Équipement", value: details.equipmentReference ? `${details.equipmentName} (#${details.equipmentReference})` : details.equipmentName },
      { label: "Prix", value: `${details.salePrice.toLocaleString()} MRU` }
    ]
  },
  createPersonSection("Acheteur", details.buyerName, details.buyerPhone),
  createSupplierSection(details.supplierName, details.supplierPhone)
]