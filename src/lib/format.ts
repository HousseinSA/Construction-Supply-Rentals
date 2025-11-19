export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\s/g, '')
  return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned
}
export function formatBookingId(id: string): string {
  if (!id) return ''
  const last6 = id.slice(-6).toUpperCase()
  return last6.replace(/(.{3})(.{3})/, '$1-$2')
}
