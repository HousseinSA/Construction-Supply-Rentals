import { create } from "zustand"
import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { EquipmentStatus } from "@/src/lib/types"
import { showToast } from "@/src/lib/toast"
import { CACHE_DURATION, MAX_CACHE_ENTRIES } from "@/src/lib/equipment-query-params"

interface PublicEquipmentCache {
  equipment: Equipment[]
  timestamp: number
}

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  equipmentMap: Map<string, number>
  loading: boolean
  lastFetch: number | null
  lastQuery: string | null
  updating: string | null
  navigating: string | null
  isSupplier: boolean
  convertToLocalized: ((city: string) => string) | null
  onPricingReview: ((item: EquipmentWithSupplier) => void) | null
  currentPage: number
  publicCache: Map<string, PublicEquipmentCache>
  publicLoading: boolean
  setEquipment: (equipment: EquipmentWithSupplier[], query?: string) => void
  setLoading: (loading: boolean) => void
  setUpdating: (id: string | null) => void
  setNavigating: (id: string | null) => void
  setIsSupplier: (isSupplier: boolean) => void
  setConvertToLocalized: (fn: (city: string) => string) => void
  setOnPricingReview: (fn: (item: EquipmentWithSupplier) => void) => void
  setCurrentPage: (page: number) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  getEquipmentById: (id: string) => EquipmentWithSupplier | null
  updateEquipmentStatus: (
    id: string,
    status: EquipmentStatus,
    reason?: string,
    t?: any,
  ) => Promise<boolean>
  updateEquipmentAvailability: (
    id: string,
    isAvailable: boolean,
    t?: any,
  ) => Promise<boolean>
  navigateToEquipment: (url: string, id: string, router: any) => void
  resetNavigating: () => void
  shouldRefetch: (query?: string) => boolean
  invalidateCache: (selective?: boolean) => void
  getPublicEquipment: (query: string) => Equipment[] | null
  setPublicEquipment: (query: string, equipment: Equipment[]) => void
  setPublicLoading: (loading: boolean) => void
  shouldRefetchPublic: (query: string) => boolean
  invalidatePublicCache: (query?: string) => void
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => {
  return {
  equipment: [],
  equipmentMap: new Map(),
  loading: true,
  lastFetch: null,
  lastQuery: null,
  updating: null,
  navigating: null,
  isSupplier: false,
  convertToLocalized: null,
  onPricingReview: null,
  currentPage: 1,
  publicCache: new Map(),
  publicLoading: true,
  setEquipment: (equipment, query) => {
    const map = new Map(
      equipment.map((item, idx) => [item._id?.toString() || "", idx]),
    )
    set({ 
      equipment, 
      equipmentMap: map,
      lastFetch: Date.now(),
      lastQuery: query || null
    })
  },
  setLoading: (loading) => set({ loading }),
  setUpdating: (id) => set({ updating: id }),
  setNavigating: (id) => set({ navigating: id }),
  setIsSupplier: (isSupplier) => set({ isSupplier }),
  setConvertToLocalized: (fn) => set({ convertToLocalized: fn }),
  setOnPricingReview: (fn) => set({ onPricingReview: fn }),
  setCurrentPage: (page) => set({ currentPage: page }),
  getEquipmentById: (id) => {
    const state = get()
    const idx = state.equipmentMap.get(id)
    return idx !== undefined ? state.equipment[idx] : null
  },
  updateEquipment: (id, updates) =>
    set((state) => {
      const idx = state.equipmentMap.get(id)
      if (idx === undefined) return state
      
      const newEquipment = [...state.equipment]
      newEquipment[idx] = { ...newEquipment[idx], ...updates }
      
      return { equipment: newEquipment }
    }),
  updateEquipmentStatus: async (id, status, reason, t) => {
    set({ updating: id })
    try {
      const body: any = { status }
      if (status === "rejected" && reason) {
        body.rejectionReason = reason
      }
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        get().updateEquipment(id, {
          status,
          ...(reason && { rejectionReason: reason }),
        })
        showToast.success(
          t(status === "approved" ? "equipmentApproved" : "equipmentRejected"),
        )
        return true
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } finally {
      set({ updating: null })
    }
  },

  updateEquipmentAvailability: async (id, isAvailable, t) => {
    set({ updating: id })
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })
      if (response.ok) {
        get().updateEquipment(id, { isAvailable })
        showToast.success(t("availabilityUpdated"))
        return true
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } finally {
      set({ updating: null })
    }
  },

  navigateToEquipment: (url, id, router) => {
    set({ navigating: id })
    router.push(url)
  },

  resetNavigating: () => set({ navigating: null }),

  shouldRefetch: (query) => {
    const { lastFetch, lastQuery } = get()
    const queryChanged = query && query !== lastQuery
    const cacheExpired = !lastFetch || Date.now() - lastFetch > CACHE_DURATION
    return queryChanged || cacheExpired
  },

  invalidateCache: (selective = false) => {
    if (selective) {
      set({ lastFetch: null })
    } else {
      set({ lastFetch: null, lastQuery: null })
    }
  },

  getPublicEquipment: (query) => {
    const cached = get().publicCache.get(query)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
    if (isExpired) {
      const newCache = new Map(get().publicCache)
      newCache.delete(query)
      set({ publicCache: newCache })
      return null
    }
    
    return cached.equipment
  },

  setPublicEquipment: (query, equipment) => {
    const newCache = new Map(get().publicCache)
    
    if (newCache.size >= MAX_CACHE_ENTRIES && !newCache.has(query)) {
      const firstKey = newCache.keys().next().value
      if (firstKey) newCache.delete(firstKey)
    }
    
    newCache.set(query, {
      equipment,
      timestamp: Date.now()
    })
    set({ publicCache: newCache })
  },

  setPublicLoading: (loading) => set({ publicLoading: loading }),

  shouldRefetchPublic: (query) => {
    const cached = get().publicCache.get(query)
    if (!cached) return true
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
    return isExpired
  },

  invalidatePublicCache: (query) => {
    if (query) {
      const newCache = new Map(get().publicCache)
      newCache.delete(query)
      set({ publicCache: newCache })
    } else {
      set({ publicCache: new Map() })
    }
  },
}})
