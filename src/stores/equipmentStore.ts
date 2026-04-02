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
  itemTimestamps: Map<string, number>
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
  setEquipment: (equipment: EquipmentWithSupplier[], query?: string, source?: 'api' | 'sse') => void
  setLoading: (loading: boolean) => void
  setUpdating: (id: string | null) => void
  setNavigating: (id: string | null) => void
  setIsSupplier: (isSupplier: boolean) => void
  setConvertToLocalized: (fn: (city: string) => string) => void
  setOnPricingReview: (fn: (item: EquipmentWithSupplier) => void) => void
  setCurrentPage: (page: number) => void
  forceUpdate: () => void
  updateEquipment: (id: string, updates: Partial<Equipment>, timestamp?: number) => void
  addEquipment: (equipment: EquipmentWithSupplier) => void
  getEquipmentById: (id: string) => EquipmentWithSupplier | null
  updatePublicCache: (id: string, updates: Partial<Equipment>) => void
  addToPublicCache: (equipment: Equipment) => void
  removeFromPublicCache: (id: string) => void
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
  setPublicEquipment: (query: string, equipment: Equipment[], source?: 'api' | 'sse') => void
  setPublicLoading: (loading: boolean) => void
  shouldRefetchPublic: (query: string) => boolean
  invalidatePublicCache: (query?: string) => void
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => {
  return {
  equipment: [],
  equipmentMap: new Map(),
  itemTimestamps: new Map(),
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
  setEquipment: (equipment, query, source = 'api') => {
    const state = get()
    const now = Date.now()
    
    const merged = equipment.map(item => {
      const id = item._id?.toString()
      if (!id) return item
      
      const localTime = state.itemTimestamps.get(id) || 0
      const itemTime = item.updatedAt ? new Date(item.updatedAt).getTime() : now
      
      if (source === 'sse' || itemTime > localTime) {
        state.itemTimestamps.set(id, source === 'sse' ? now : itemTime)
        return item
      }
      
      const existing = state.equipment.find(e => e._id?.toString() === id)
      return existing || item
    })
    
    const map = new Map()
    for (let i = 0; i < merged.length; i++) {
      const id = merged[i]._id?.toString()
      if (id) map.set(id, i)
    }
    
    set({ 
      equipment: merged, 
      equipmentMap: map,
      lastFetch: now,
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
  updateEquipment: (id, updates, timestamp) => {
    const state = get()
    const idx = state.equipmentMap.get(id)
    
    if (idx === undefined) return
    
    const now = timestamp || Date.now()
    const localTime = state.itemTimestamps.get(id) || 0
    const itemTime = updates.updatedAt ? new Date(updates.updatedAt).getTime() : now
    
    if (timestamp || itemTime > localTime) {
      state.equipment[idx] = { ...state.equipment[idx], ...updates }
      state.itemTimestamps.set(id, timestamp || itemTime)
      set({ lastFetch: Date.now() })
    }
  },
  addEquipment: (equipment) => {
    const state = get()
    const id = equipment._id?.toString()
    
    if (!id || state.equipmentMap.has(id)) return
    
    state.equipment.unshift(equipment)
    
    const newMap = new Map()
    newMap.set(id, 0)
    state.equipmentMap.forEach((idx, key) => {
      newMap.set(key, idx + 1)
    })
    
    set({ 
      equipmentMap: newMap,
      lastFetch: Date.now() 
    })
  },
  forceUpdate: () => {
    set({ lastFetch: Date.now() })
  },
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
    const state = get()
    const original = state.getEquipmentById(id)
    
    set({ updating: id })
    state.updateEquipment(id, { isAvailable })
    
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })
      if (response.ok) {
        showToast.success(t("availabilityUpdated"))
        return true
      }
      if (original) {
        state.updateEquipment(id, { isAvailable: original.isAvailable })
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } catch (error) {
      if (original) {
        state.updateEquipment(id, { isAvailable: original.isAvailable })
      }
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
    const state = get()
    const cached = state.publicCache.get(query)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
    if (isExpired) {
      state.publicCache.delete(query)
      set({ lastFetch: Date.now() })
      return null
    }
    
    return cached.equipment
  },

  setPublicEquipment: (query, equipment, source = 'api') => {
    const state = get()
    const now = Date.now()
    
    const existingCache = state.publicCache.get(query)
    let merged = equipment
    
    if (existingCache && source === 'api') {
      merged = equipment.map(item => {
        const id = item._id?.toString()
        if (!id) return item
        
        const existing = existingCache.equipment.find(e => e._id?.toString() === id)
        if (!existing) return item
        
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
        const itemTime = item.updatedAt ? new Date(item.updatedAt).getTime() : now
        
        return itemTime > existingTime ? item : existing
      })
    }
    
    if (state.publicCache.size >= MAX_CACHE_ENTRIES && !state.publicCache.has(query)) {
      const firstKey = state.publicCache.keys().next().value
      if (firstKey) state.publicCache.delete(firstKey)
    }
    
    state.publicCache.set(query, {
      equipment: merged,
      timestamp: now
    })
    
    set({ lastFetch: now })
  },

  setPublicLoading: (loading) => set({ publicLoading: loading }),

  shouldRefetchPublic: (query) => {
    const cached = get().publicCache.get(query)
    if (!cached) return true
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
    return isExpired
  },

  invalidatePublicCache: (query) => {
    const state = get()
    if (query) {
      state.publicCache.delete(query)
      set({ lastFetch: Date.now() })
    } else {
      state.publicCache.clear()
      set({ lastFetch: Date.now() })
    }
  },
  updatePublicCache: (id, updates) => {
    const state = get()
    const now = Date.now()
    const updateTime = updates.updatedAt ? new Date(updates.updatedAt).getTime() : now
    let updated = false
    
    state.publicCache.forEach((cacheEntry, query) => {
      const equipmentIndex = cacheEntry.equipment.findIndex(
        (eq) => eq._id?.toString() === id
      )
      
      if (equipmentIndex !== -1) {
        const existing = cacheEntry.equipment[equipmentIndex]
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
        
        if (updateTime > existingTime) {
          cacheEntry.equipment[equipmentIndex] = {
            ...cacheEntry.equipment[equipmentIndex],
            ...updates
          }
          cacheEntry.timestamp = now
          updated = true
        }
      }
    })
    
    if (updated) {
      set({ lastFetch: now })
    }
  },
  addToPublicCache: (equipment) => {
    const state = get()
    const id = equipment._id?.toString()
    if (!id) return
    
    let updated = false
    state.publicCache.forEach((cacheEntry) => {
      const exists = cacheEntry.equipment.some(
        (eq) => eq._id?.toString() === id
      )
      
      if (!exists) {
        cacheEntry.equipment.unshift(equipment)
        cacheEntry.timestamp = Date.now()
        updated = true
      }
    })
    
    if (updated) {
      set({ lastFetch: Date.now() })
    }
  },
  removeFromPublicCache: (id) => {
    const state = get()
    let updated = false
    
    state.publicCache.forEach((cacheEntry) => {
      const idx = cacheEntry.equipment.findIndex(
        (eq) => eq._id?.toString() === id
      )
      
      if (idx !== -1) {
        cacheEntry.equipment.splice(idx, 1)
        cacheEntry.timestamp = Date.now()
        updated = true
      }
    })
    
    if (updated) {
      set({ lastFetch: Date.now() })
    }
  },
}})
