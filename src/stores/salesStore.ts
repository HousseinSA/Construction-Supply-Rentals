import { create } from 'zustand'

export interface SaleWithDetails {
  _id?: string
  referenceNumber: string
  buyerId: string
  equipmentId: string
  supplierId?: string | null
  equipmentName: string
  salePrice: number
  commission: number
  grandTotal: number
  status: string
  buyerMessage?: string
  createdAt: Date
  updatedAt: Date
  buyerInfo?: any[]
  supplierInfo?: any[]
  equipmentInfo?: any[]
  isAdminOwned?: boolean
  adminHandledBy?: string
  adminHandledAt?: Date
  adminNotes?: string
  paidAt?: Date
  completedAt?: Date
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

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  loading: false,
  lastFetch: null,
  setSales: (sales) => set({ sales, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  updateSale: (id, updates) =>
    set((state) => ({
      sales: state.sales.map((sale) =>
        sale._id?.toString() === id ? { ...sale, ...updates } : sale
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
