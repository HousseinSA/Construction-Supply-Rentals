import { create } from "zustand"
import { Equipment, EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { CACHE_DURATION } from "@/src/lib/equipment-query-params"

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  equipmentMap: Map<string, number>
  itemTimestamps: Map<string, number>
  loading: boolean
  lastFetch: number | null
  lastQuery: string | null
  updating: string | null
  navigating: string | null
  publicEquipment: EquipmentWithSupplier[]
  publicHasMore: boolean
  setEquipment: (equipment: EquipmentWithSupplier[], query?: string) => void
  setPublicEquipment: (equipment: EquipmentWithSupplier[], query: string, hasMore: boolean) => void
  getPublicEquipment: (query: string) => { equipment: EquipmentWithSupplier[], hasMore: boolean }
  setLoading: (loading: boolean) => void
  setUpdating: (id: string | null) => void
  setNavigating: (id: string | null) => void
  updateEquipment: (id: string, updates: Partial<Equipment>, timestamp?: number) => void
  addEquipment: (equipment: EquipmentWithSupplier) => void
  getEquipmentById: (id: string) => EquipmentWithSupplier | null
  navigateToEquipment: (url: string, id: string, router: any) => void
  resetNavigating: () => void
  shouldRefetch: (query?: string) => boolean
  invalidateCache: (selective?: boolean) => void
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  equipmentMap: new Map(),
  itemTimestamps: new Map(),
  loading: true,
  lastFetch: null,
  lastQuery: null,
  updating: null,
  navigating: null,
  publicEquipment: [],
  publicHasMore: false,
  setEquipment: (equipment, query) => {
    const state = get()
    const now = Date.now()
    const merged = equipment.map(item => {
      const id = item._id?.toString()
      if (!id) return item
      const localTime = state.itemTimestamps.get(id) || 0
      const itemTime = item.updatedAt ? new Date(item.updatedAt).getTime() : now
      if (itemTime > localTime) {
        state.itemTimestamps.set(id, itemTime)
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

  setPublicEquipment: (equipment, query, hasMore) => {
    set({ 
      publicEquipment: equipment,
      publicHasMore: hasMore,
      lastFetch: Date.now(),
      lastQuery: query
    })
  },

  getPublicEquipment: (query) => {
    const { publicEquipment, lastQuery, publicHasMore } = get()
    if (query === lastQuery) {
      return { equipment: publicEquipment, hasMore: publicHasMore }
    }
    return { equipment: [], hasMore: false }
  },
}))
