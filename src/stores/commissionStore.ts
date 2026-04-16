import { create } from 'zustand'

export interface CommissionData {
  overview: {
    totalCommission: number
    bookingCommission: number
    saleCommission: number
    totalTransactions: number
    totalBookings: number
    totalSales: number
  }
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    bookingAmount: number
    saleAmount: number
    totalCommission: number
  }>
}

interface CommissionStore {
  commission: Record<string, CommissionData | null>
  loading: Record<string, boolean>
  lastFetch: Record<string, number>
  setCommission: (dateFilter: string, data: CommissionData) => void
  setLoading: (dateFilter: string, loading: boolean) => void
  shouldRefetch: (dateFilter: string) => boolean
  invalidateCache: (dateFilter?: string) => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useCommissionStore = create<CommissionStore>((set, get) => ({
  commission: {},
  loading: {},
  lastFetch: {},
  
  setCommission: (dateFilter, data) =>
    set((state) => ({
      commission: { ...state.commission, [dateFilter]: data },
      lastFetch: { ...state.lastFetch, [dateFilter]: Date.now() },
    })),
  
  setLoading: (dateFilter, loading) =>
    set((state) => ({
      loading: { ...state.loading, [dateFilter]: loading },
    })),
  
  shouldRefetch: (dateFilter) => {
    const { lastFetch } = get()
    const lastFetchTime = lastFetch[dateFilter]
    return !lastFetchTime || Date.now() - lastFetchTime > CACHE_DURATION
  },
  
  invalidateCache: (dateFilter) => {
    if (dateFilter) {
      set((state) => ({
        lastFetch: { ...state.lastFetch, [dateFilter]: 0 },
      }))
    } else {
      set({ lastFetch: {} })
    }
  },
}))
