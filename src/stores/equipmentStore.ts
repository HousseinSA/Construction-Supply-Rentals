import { create } from "zustand"
import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { EquipmentStatus } from "@/src/lib/types"
import { showToast } from "@/src/lib/toast"

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  equipmentMap: Map<string, number>
  individualEquipment: Map<string, EquipmentWithSupplier>
  loading: boolean
  lastFetch: number | null
  lastQuery: string | null
  updating: string | null
  navigating: string | null
  isSupplier: boolean
  convertToLocalized: ((city: string) => string) | null
  onPricingReview: ((item: EquipmentWithSupplier) => void) | null
  currentPage: number
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
  setIndividualEquipment: (equipment: EquipmentWithSupplier) => void
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
}

const CACHE_DURATION = 5 * 60 * 1000
export const useEquipmentStore = create<EquipmentStore>((set, get) => {
  return {
  equipment: [],
  equipmentMap: new Map(),
  individualEquipment: new Map(),
  loading: true,
  lastFetch: null,
  lastQuery: null,
  updating: null,
  navigating: null,
  isSupplier: false,
  convertToLocalized: null,
  onPricingReview: null,
  currentPage: 1,
  setEquipment: (equipment, query) => {
    const map = new Map(
      equipment.map((item, idx) => [item._id?.toString() || "", idx]),
    )
    const individualMap = new Map(get().individualEquipment)
    equipment.forEach(item => {
      if (item._id) {
        individualMap.set(item._id.toString(), item)
      }
    })
    set({ 
      equipment, 
      equipmentMap: map, 
      individualEquipment: individualMap,
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
    return state.individualEquipment.get(id) || null
  },
  setIndividualEquipment: (equipment) => {
    if (!equipment._id) return
    const individualMap = new Map(get().individualEquipment)
    individualMap.set(equipment._id.toString(), equipment)
    set({ individualEquipment: individualMap })
  },
  updateEquipment: (id, updates) =>
    set((state) => {
      const idx = state.equipmentMap.get(id)
      const newEquipment = [...state.equipment]
      const individualMap = new Map(state.individualEquipment)
      
      if (idx !== undefined) {
        newEquipment[idx] = { ...newEquipment[idx], ...updates }
      }
      
      const existing = individualMap.get(id)
      if (existing) {
        individualMap.set(id, { ...existing, ...updates })
      }
      
      return { equipment: newEquipment, individualEquipment: individualMap }
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
}})
