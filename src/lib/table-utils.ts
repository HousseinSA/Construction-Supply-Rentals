export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`
}

export function getTranslatedUnit(unit: string, tCommon: (key: string) => string): string {
  const unitMap: Record<string, string> = {
    'hours': tCommon('hour'),
    'days': tCommon('day'),
    'months': tCommon('month'),
    'km': tCommon('km'),
    'tons': tCommon('ton')
  }
  return unitMap[unit] || unit
}

export function getDateFilterMatch(itemDate: string | Date, filterValue: string): boolean {
  const date = new Date(itemDate)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (filterValue === "today") return daysDiff === 0
  if (filterValue === "week") return daysDiff <= 7
  if (filterValue === "month") return daysDiff <= 30
  return true
}
