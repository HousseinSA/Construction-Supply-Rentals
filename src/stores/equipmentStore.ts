import { create } from 'zustand'
import { Equipment, EquipmentWithSupplier } from '@/src/lib/models/equipment'

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  loading: boolean
  lastFetch: number | null
  setEquipment: (equipment: EquipmentWithSupplier[]) => void
  setLoading: (loading: boolean) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 2 * 60 * 1000 
export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  loading: false,
  lastFetch: null,
  setEquipment: (equipment) => set({ equipment, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  updateEquipment: (id, updates) =>
    set((state) => ({
      equipment: state.equipment.map((item) =>
        item._id?.toString() === id ? { ...item, ...updates } : item
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
