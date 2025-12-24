import { create } from 'zustand'
import { Equipment } from '@/src/lib/models/equipment'
import { User } from '@/src/lib/models/user'

export interface EquipmentWithSupplier extends Equipment {
  supplier?: User
}

interface EquipmentStore {
  equipment: EquipmentWithSupplier[]
  loading: boolean
  lastFetch: number | null
  setEquipment: (equipment: EquipmentWithSupplier[]) => void
  setLoading: (loading: boolean) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  shouldRefetch: () => boolean
}

const CACHE_DURATION = 5 * 60 * 1000 
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
}))
