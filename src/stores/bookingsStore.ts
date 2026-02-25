import { create } from "zustand"
import { Booking } from "@/src/lib/models/booking"
import { User } from "@/src/lib/models/user"

export interface BookingWithDetails extends Booking {
  renterInfo?: User[]
  supplierInfo?: User[]
}

interface BookingsStore {
  bookings: BookingWithDetails[]
  loading: boolean
  lastFetch: number | null
  setBookings: (bookings: BookingWithDetails[]) => void
  setLoading: (loading: boolean) => void
  updateBooking: (id: string, updates: Partial<BookingWithDetails>) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useBookingsStore = create<BookingsStore>((set, get) => ({
  bookings: [],
  loading: false,
  lastFetch: null,
  setBookings: (bookings) => set({ bookings, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking._id?.toString() === id ? { ...booking, ...updates } : booking,
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
