import { useState } from 'react'
import { useBookings } from './useBookings'
import { calculateCommission } from '@/src/lib/commission'

export function useBookingDetails(booking: any, onStatusUpdate: () => void, onClose: () => void) {
  const { updateBookingStatus } = useBookings()
  const [status, setStatus] = useState(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '')
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (userId?: string) => {
    setLoading(true)
    try {
      const success = await updateBookingStatus(booking._id, status, userId, adminNotes)
      if (success) {
        onStatusUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to update booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateItemCommission = (subtotal: number, usage: number, pricingType?: string) => {
    return calculateCommission(subtotal, usage, pricingType)
  }

  const totalCommission = booking.bookingItems.reduce(
    (sum: number, item: any) => sum + calculateCommission(item.subtotal, item.usage, item.pricingType),
    0
  )

  return {
    status,
    setStatus,
    adminNotes,
    setAdminNotes,
    loading,
    handleStatusUpdate,
    calculateCommission: calculateItemCommission,
    totalCommission,
    originalStatus: booking.status,
  }
}
