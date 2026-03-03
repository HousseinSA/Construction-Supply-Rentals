import { create } from "zustand"
import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { EquipmentStatus } from "@/src/lib/types"
import { showToast } from "@/src/lib/toast"

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  equipmentMap: Map<string, number>
  loading: boolean
  lastFetch: number | null
  updating: string | null
  navigating: string | null
  isSupplier: boolean
  convertToLocalized: ((city: string) => string) | null
  onPricingReview: ((item: EquipmentWithSupplier) => void) | null
  setEquipment: (equipment: EquipmentWithSupplier[]) => void
  setLoading: (loading: boolean) => void
  setUpdating: (id: string | null) => void
  setNavigating: (id: string | null) => void
  setIsSupplier: (isSupplier: boolean) => void
  setConvertToLocalized: (fn: (city: string) => string) => void
  setOnPricingReview: (fn: (item: EquipmentWithSupplier) => void) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void

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
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 2 * 60 * 1000
export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  equipmentMap: new Map(),
  loading: false,
  lastFetch: null,
  updating: null,
  navigating: null,
  isSupplier: false,
  convertToLocalized: null,
  onPricingReview: null,
  setEquipment: (equipment) => {
    const map = new Map(
      equipment.map((item, idx) => [item._id?.toString() || "", idx]),
    )
    set({ equipment, equipmentMap: map, lastFetch: Date.now() })
  },
  setLoading: (loading) => set({ loading }),
  setUpdating: (id) => set({ updating: id }),
  setNavigating: (id) => set({ navigating: id }),
  setIsSupplier: (isSupplier) => set({ isSupplier }),
  setConvertToLocalized: (fn) => set({ convertToLocalized: fn }),
  setOnPricingReview: (fn) => set({ onPricingReview: fn }),
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

  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },

  invalidateCache: () => set({ lastFetch: null }),
}))
