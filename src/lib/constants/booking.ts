import { BookingStatus } from '../types'

export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  'pending': ['paid', 'cancelled'],
  'paid': ['completed'],
  'completed': [],
  'cancelled': []
}

export const STATUS_ORDER: BookingStatus[] = ['pending', 'paid', 'completed', 'cancelled']
