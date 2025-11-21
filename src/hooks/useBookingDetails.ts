import { useState } from 'react'
import { useBookings } from './useBookings'

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

  const calculateCommission = (subtotal: number, usage: number) => {
    let rate = 0.10
    if (usage >= 1000) rate = 0.08
    else if (usage >= 500) rate = 0.09
    return subtotal * rate
  }

  const totalCommission = booking.bookingItems.reduce(
    (sum: number, item: any) => sum + calculateCommission(item.subtotal, item.usage),
    0
  )

  return {
    status,
    setStatus,
    adminNotes,
    setAdminNotes,
    loading,
    handleStatusUpdate,
    calculateCommission,
    totalCommission,
    originalStatus: booking.status,
  }
}
