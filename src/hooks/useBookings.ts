import { useBookingsStore, BookingWithDetails } from '@/src/stores/bookingsStore'
import { useServerTableData } from './useServerTableData'

export function useBookings() {
  const { setBookings, updateBooking, invalidateCache } = useBookingsStore()

  const {
    data: bookings,
    loading,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    refetch,
  } = useServerTableData<BookingWithDetails>({
    endpoint: '/api/bookings',
    itemsPerPage: 10,
    transformResponse: (data) => {
      setBookings(data)
      return data
    },
  })

  const updateBookingStatus = async (bookingId: string, status: string, adminId?: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status, adminId, adminNotes })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.booking) {
          updateBooking(bookingId, data.booking)
        } else {
          invalidateCache()
        }
        return { success: true, message: data.message }
      }
      return { success: false, error: data.error || 'Failed to update booking status' }
    } catch (error) {
      console.error('Failed to update booking:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  return {
    bookings,
    loading,
    error: null,
    fetchBookings: refetch,
    updateBookingStatus,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
  }
}
