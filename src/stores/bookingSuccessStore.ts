import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Equipment } from '@/src/lib/models'

interface BookingSuccessStore {
  equipment: Equipment | null
  setEquipment: (equipment: Equipment | null) => void
  clearEquipment: () => void
}

export const useBookingSuccessStore = create<BookingSuccessStore>()(
  persist(
    (set) => ({
      equipment: null,
      setEquipment: (equipment) => set({ equipment }),
      clearEquipment: () => set({ equipment: null }),
    }),
    {
      name: 'booking-success-storage',
    }
  )
)
