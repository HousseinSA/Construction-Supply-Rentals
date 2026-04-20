import { useState } from 'react'
import { useBookings } from './useBookings'
import { calculateCommission } from '@/src/lib/utils/commission-utils'
import { BOOKING_COMMISSION_RATE } from '@/src/lib/constants/commission'
import { showToast } from '@/src/lib/toast'
import { useTranslations } from 'next-intl'

export function useBookingDetails(booking: any, onStatusUpdate: () => void, onClose: () => void) {
  const { updateBookingStatus } = useBookings()
  const t = useTranslations('dashboard.bookings')
  const [status, setStatus] = useState(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '')
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (userId?: string) => {
    setLoading(true)
    try {
      const result = await updateBookingStatus(booking._id, status, userId, adminNotes)
      if (result.success) {
        showToast.success( t('statusUpdated'))
        onStatusUpdate()
        onClose()
      } else {
        showToast.error(t('statusUpdateFailed') )
      }
    }  finally {
      setLoading(false)
    }
  }

  const calculateItemCommission = (subtotal: number) => {
    return calculateCommission(subtotal, BOOKING_COMMISSION_RATE)
  }
  
  const totalCommission = booking.bookingItems.reduce(
    (sum: number, item: any) => sum + calculateCommission(item.subtotal, BOOKING_COMMISSION_RATE),
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
