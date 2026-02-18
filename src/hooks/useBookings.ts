import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useBookingsStore, BookingWithDetails } from '@/src/stores/bookingsStore'
import { usePolling } from './usePolling'

export function useBookings() {
  const { data: session } = useSession()
  const { bookings, loading, setBookings, setLoading, updateBooking, shouldRefetch, invalidateCache } = useBookingsStore()
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/bookings')
      const data = await response.json()
      if (data.success) {
        setBookings(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [setBookings, setLoading, session?.user?.userType, session?.user?.id])

  const updateBookingStatus = async (bookingId: string, status: string, adminId?: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status, adminId, adminNotes })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.booking) {
          updateBooking(bookingId, data.booking)
        } else {
          invalidateCache()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update booking:', error)
      return false
    }
  }

  usePolling(fetchBookings, { interval: 30000 })

  useEffect(() => {
    if (shouldRefetch()) {
      fetchBookings()
    }
  }, [fetchBookings, shouldRefetch])

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
  }
}
