export const BOOKING_COMMISSION_RATE = 0.10
export const SALE_COMMISSION_RATE = 0.05

export const TOP_EQUIPMENT_LIMIT = 10

export const DATE_FILTER_OPTIONS = [
  'today',
  'last7days',
  'last30days',
  'thisMonth',
  'lastMonth',
  'last3months',
  'last6months',
  'thisYear',
  'allTime'
] as const

export type DateFilterOption = typeof DATE_FILTER_OPTIONS[number]

export const COMMISSION_COLORS = {
  total: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-50 text-yellow-600'
  },
  booking: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600'
  },
  sale: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: 'text-green-600',
    badge: 'bg-green-50 text-green-600'
  }
} as const

export const CATEGORY_CHART_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500'
] as const
