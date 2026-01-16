import { create } from 'zustand'

export interface AnalyticsData {
  overview: {
    totalUsers: number
    totalEquipment: number
    activeEquipment: number
    newUsersThisMonth: number
  }
  usersByRole: Record<string, number>
  equipmentByCity: Array<{ city: string; count: number }>
  topSuppliers: Array<{
    name: string
    companyName?: string
    email: string
    equipmentCount: number
  }>
}

interface AnalyticsStore {
  analytics: AnalyticsData | null
  loading: boolean
  lastFetch: number | null
  setAnalytics: (analytics: AnalyticsData) => void
  setLoading: (loading: boolean) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  analytics: null,
  loading: false,
  lastFetch: null,
  setAnalytics: (analytics) => set({ analytics, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
