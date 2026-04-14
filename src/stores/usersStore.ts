import { create } from 'zustand'
import { User } from '@/src/lib/types'

interface UsersStore {
  users: User[]
  stats: any | null
  lastFetch: number | null
  setUsers: (users: User[]) => void
  setStats: (stats: any) => void
  updateUser: (id: string, updates: Partial<User>) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 1 * 60 * 1000 

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  stats: null,
  lastFetch: null,
  setUsers: (users) => set({ users, lastFetch: Date.now() }),
  setStats: (stats) => set({ stats }),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id?.toString() === id ? { ...user, ...updates } : user
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
