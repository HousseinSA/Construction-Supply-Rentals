export function formatPhoneNumber(phone: string): string {
  if (!phone || phone === '-') return phone
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

export function formatBookingId(id: string): string {
  if (!id) return ''
  const last6 = id.slice(-6).toUpperCase()
  return last6.replace(/(.{3})(.{3})/, '$1-$2')
}

export const formatDateTime = (date: Date) => {
  const d = new Date(date)
  const dateStr = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
  })
  const timeStr = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace('AM', ' AM').replace('PM', ' PM')
  return `${dateStr} à ${timeStr}`
}

export const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

export const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace('AM', ' AM').replace('PM', ' PM')
