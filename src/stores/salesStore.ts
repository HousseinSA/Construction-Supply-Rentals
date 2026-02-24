import { create } from 'zustand'
import { SaleOrder } from '@/src/lib/models'

// Extended interface for frontend with additional fields from API joins
export interface SaleWithDetails extends Omit<SaleOrder, '_id' | 'buyerId' | 'equipmentId' | 'supplierId' | 'adminHandledBy'> {
  _id?: string
  buyerId: string
  equipmentId: string
  supplierId?: string | null
  buyerInfo?: any[]
  supplierInfo?: any[]
  equipmentInfo?: any[]
  isAdminOwned?: boolean
  adminHandledBy?: string
  paidAt?: Date
}

interface SalesStore {
  sales: SaleWithDetails[]
  loading: boolean
  lastFetch: number | null
  setSales: (sales: SaleWithDetails[]) => void
  setLoading: (loading: boolean) => void
  updateSale: (id: string, updates: Partial<SaleWithDetails>) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  loading: false,
  lastFetch: null,
  setSales: (sales) => set({ sales, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  updateSale: (id, updates) =>
    set((state) => ({
      sales: state.sales.map((sale) =>
        sale._id?.toString() === id ? { ...sale, ...updates } : sale,
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
