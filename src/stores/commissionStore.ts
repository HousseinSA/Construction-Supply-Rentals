import { create } from 'zustand'
import { CategoryCommission, TopEquipment } from '../lib/types'

export interface CommissionData {
  overview: {
    totalCommission: number
    bookingCommission: number
    saleCommission: number
    totalTransactions: number
    totalBookings: number
    totalSales: number
  }
  categoryBreakdown: CategoryCommission[]
  topBookedEquipment: TopEquipment[]
  topSoldEquipment: TopEquipment[]
}

interface CommissionStore {
  commission: CommissionData | null
  loading: boolean
  error: string | null
  lastFetch: number | null
  currentFilter: string | null
  setCommission: (data: CommissionData, filter: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  shouldRefetch: (filter: string) => boolean
  invalidateCache: () => void
}

export const CACHE_DURATION = 5 * 60 * 1000

export const useCommissionStore = create<CommissionStore>((set, get) => ({
  commission: null,
  loading: false,
  error: null,
  lastFetch: null,
  currentFilter: null,
  
  setCommission: (data, filter) =>
    set({
      commission: data,
      currentFilter: filter,
      lastFetch: Date.now(),
      error: null,
    }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  shouldRefetch: (filter) => {
    const { lastFetch, currentFilter } = get()
    
    if (currentFilter !== filter) return true
    
    if (!lastFetch || Date.now() - lastFetch > CACHE_DURATION) return true
    
    return false
  },
  
  invalidateCache: () => set({ lastFetch: null }),
}))
