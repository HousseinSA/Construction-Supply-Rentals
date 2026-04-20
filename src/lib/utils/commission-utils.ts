import { BOOKING_COMMISSION_RATE, SALE_COMMISSION_RATE, DateFilterOption } from '../constants/commission'
import { CategoryCommission, CategoryBreakdownItem, CategoryDocument } from '../types'

const MS_PER_DAY = 86400000

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function daysAgo(days: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - days * MS_PER_DAY)
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0)
}

export function getDateRange(filter: DateFilterOption): { start: Date; end: Date } {
  const now = new Date()
  let end = endOfDay(now)
  let start: Date

  switch (filter) {
    case 'today':
      start = startOfDay(now)
      break
    case 'last7days':
      start = startOfDay(daysAgo(7, now))
      break
    case 'last30days':
      start = startOfDay(daysAgo(30, now))
      break
    case 'thisMonth':
      start = startOfMonth(now)
      break
    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break
    }
    case 'last3months':
      start = startOfDay(daysAgo(90, now))
      break
    case 'last6months':
      start = startOfDay(daysAgo(180, now))
      break
    case 'thisYear':
      start = startOfYear(now)
      break
    case 'allTime':
      start = new Date(0)
      break
    default:
      start = startOfDay(daysAgo(30, now))
  }

  return { start, end }
}

export function calculateCategoryCommissions(
  bookingBreakdown: CategoryBreakdownItem[],
  saleBreakdown: CategoryBreakdownItem[],
  categories: CategoryDocument[]
): CategoryCommission[] {
  const categoryMap = new Map<string, CategoryCommission>()

  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      categoryId: cat._id.toString(),
      categoryName: cat.name,
      bookingAmount: 0,
      saleAmount: 0,
      totalCommission: 0
    })
  })

  bookingBreakdown.forEach(item => {
    if (item.categoryId) {
      const key = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId.toString()
      const cat = categoryMap.get(key)
      if (cat) {
        const commission = item.amount * BOOKING_COMMISSION_RATE
        cat.bookingAmount += item.amount
        cat.totalCommission += commission
      }
    }
  })

  saleBreakdown.forEach(item => {
    if (item.categoryId) {
      const key = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId.toString()
      const cat = categoryMap.get(key)
      if (cat) {
        const commission = item.amount * SALE_COMMISSION_RATE
        cat.saleAmount += item.amount
        cat.totalCommission += commission
      }
    }
  })

  return Array.from(categoryMap.values())
    .filter(cat => cat.totalCommission > 0)
    .sort((a, b) => b.totalCommission - a.totalCommission)
}

export function calculateCommission(amount: number, rate: number): number {
  return amount * rate
}